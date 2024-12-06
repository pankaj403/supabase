import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Phone, VolumeX, Volume2, Clock, History, Save } from "lucide-react"
import { cn, formatPhoneNumber } from "@/lib/utils"
import { Lead } from "@/types"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useCall } from "@/hooks/use-call"
import { MonitoringPanel } from "@/components/calls/monitoring-panel"
import { ClientDetails } from "@/components/clients/client-details"
import { toast } from "sonner"

interface CallDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead: Lead
  onUpdateLead: (lead: Partial<Lead>) => void
}

export function CallDialog({
  open,
  onOpenChange,
  lead,
  onUpdateLead,
}: CallDialogProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [notes, setNotes] = useState("")
  const [clientHistory, setClientHistory] = useState<string[]>([])

  const {
    isLoading,
    currentCallId,
    callStatus,
    startCall,
    stopCall,
  } = useCall({
    onCallStart: (callId) => {
      console.log('Call started with ID:', callId)
    },
    onCallEnd: () => {
      console.log('Call ended')
      saveNotes()
      onUpdateLead({
        status: "contacted",
        lastContact: new Date().toISOString().split("T")[0],
        notes: notes,
      })
    },
  })

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setNotes("")
      setIsMuted(false)
    }
  }, [open])

  const handleStartCall = async () => {
    try {
      console.log('Attempting to call:', lead.phone)
      await startCall(lead.phone)
    } catch (error) {
      console.error('Failed to start call:', error)
      toast.error('Failed to initiate call. Please try again.')
    }
  }

  const handleEndCall = async () => {
    try {
      if (currentCallId) {
        await stopCall()
        toast.success('Call ended successfully')
      }
    } catch (error) {
      console.error('Failed to end call:', error)
      toast.error('Failed to end call. Please try again.')
    }
  }

  const saveNotes = () => {
    if (notes.trim()) {
      const timestamp = new Date().toLocaleString()
      const entry = `[${timestamp}] ${notes.trim()}`
      setClientHistory(prev => [...prev, entry])
      toast.success('Notes saved to client history')
      setNotes("")
    }
  }

  const handleDeleteNote = (index: number) => {
    setClientHistory(prev => prev.filter((_, i) => i !== index))
  }

  const handleEditNote = (index: number, newText: string) => {
    setClientHistory(prev => prev.map((note, i) => 
      i === index ? `[${note.split("]")[0]}] ${newText}` : note
    ))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <DialogTitle>Call with {lead.name}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatPhoneNumber(lead.phone)}
                </p>
              </div>
              <Badge variant={callStatus ? "default" : "secondary"}>
                {callStatus || "Ready"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                disabled={!currentCallId}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              {currentCallId ? (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleEndCall}
                  disabled={isLoading}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="icon"
                  onClick={handleStartCall}
                  disabled={isLoading}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-3 gap-4 mt-4">
          {/* Left Panel: Call Monitor */}
          <div className="col-span-2 overflow-auto">
            {currentCallId ? (
              <MonitoringPanel 
                callId={currentCallId} 
                onCallComplete={handleEndCall}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <Badge variant="secondary" className="text-lg py-2">
                  <MicOff className="h-4 w-4 mr-2" />
                  Ready to start call
                </Badge>
              </div>
            )}
          </div>

          {/* Right Panel: Notes & History */}
          <div className="space-y-4 overflow-auto">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="notes">Call Notes</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={saveNotes}
                  disabled={!notes.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Notes
                </Button>
              </div>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter call notes..."
                className="h-[150px] resize-none"
              />
            </div>

            <ClientDetails
              name={lead.name}
              history={clientHistory}
              lastContact={lead.lastContact}
              notes={lead.notes}
              onDeleteNote={handleDeleteNote}
              onEditNote={handleEditNote}
            />

            {currentCallId && (
              <div className="flex items-center justify-center">
                <Badge variant="default" className="animate-pulse">
                  <Mic className="h-4 w-4 mr-2" />
                  Call in progress
                </Badge>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}