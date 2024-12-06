"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Phone, Clock, Save, DollarSign } from "lucide-react"
import { cn, formatPhoneNumber } from "@/lib/utils"
import { Customer } from "@/types"
import { useCall } from "@/hooks/use-call"
import { ClientDetails } from "@/components/clients/client-details"
import { logCall } from "@/lib/call-logger"
import { toast } from "sonner"

interface CallDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead: Customer
  onUpdateLead: (lead: Partial<Customer>) => void
  clientId: string
  campaignId?: string
}

export function CallDialog({
  open,
  onOpenChange,
  lead,
  onUpdateLead,
  clientId,
  campaignId
}: CallDialogProps) {
  const [notes, setNotes] = useState("")
  const [clientHistory, setClientHistory] = useState<string[]>([])
  const [transcript, setTranscript] = useState<string[]>([])
  const [callCost, setCallCost] = useState<number | null>(null)

  const {
    isLoading,
    currentCallId,
    callStatus,
    startCall,
    stopCall,
  } = useCall({
    onCallStart: (callId) => {
      setTranscript([])
      setCallCost(null)
      toast.success("Call initiated")
    },
    onCallEnd: async (callData) => {
      if (!callData) return

      try {
        // Extract transcript from call data
        const messages = callData.artifact?.messages || []
        const newTranscript = messages
          .filter(msg => msg.role !== 'system')
          .map(msg => {
            const role = msg.role === 'assistant' ? 'AI' : 'Customer'
            return `${role}: ${msg.message}`
          })
        
        setTranscript(newTranscript)

        // Set call cost
        if (callData.cost) {
          setCallCost(callData.cost)
        }

        // Log call details
        await logCall(
          clientId,
          campaignId,
          callData,
          newTranscript,
          notes
        )

        // Save notes to history
        if (notes.trim()) {
          const timestamp = new Date().toLocaleString()
          setClientHistory(prev => [...prev, `[${timestamp}] ${notes.trim()}`])
          setNotes("")
        }

        // Update lead status
        onUpdateLead({
          status: "contacted",
          lastContact: new Date().toISOString().split("T")[0],
          notes: notes,
        })

        toast.success("Call completed successfully")
      } catch (error) {
        console.error('Error processing call end:', error)
        toast.error("Failed to save call details")
      }
    },
    clientHistory,
  })

  const handleStartCall = async () => {
    try {
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
      }
    } catch (error) {
      console.error('Failed to end call:', error)
      toast.error('Failed to end call. Please try again.')
    }
  }

  const saveNotes = () => {
    if (notes.trim()) {
      const timestamp = new Date().toLocaleString()
      setClientHistory(prev => [...prev, `[${timestamp}] ${notes.trim()}`])
      toast.success('Notes saved to client history')
      setNotes("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-6xl h-[90vh] flex flex-col p-0 gap-0 enhanced-card overflow-hidden"
        aria-describedby="call-dialog-description"
      >
        <DialogHeader className="flex-shrink-0 p-6 border-b border-primary/20 bg-black/40 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-primary/20 rounded-lg blur-sm" />
                <div className="relative bg-black/60 backdrop-blur-xl rounded-lg p-3 border border-primary/20">
                  <DialogTitle className="text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                    {lead.name}
                  </DialogTitle>
                  <p 
                    id="call-dialog-description" 
                    className="text-sm text-primary/80 mt-1"
                  >
                    Call dialog for {lead.name} at {formatPhoneNumber(lead.phone)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={callStatus === "ended" ? "default" : callStatus ? "secondary" : "outline"}
                  className={cn(
                    "h-8 px-4 text-base border shadow-lg backdrop-blur-sm",
                    callStatus === "ended" ? "border-green-500 bg-green-500/10 text-green-500" : "border-primary/20"
                  )}
                >
                  {callStatus === "ended" ? "Call Complete" : callStatus || "Ready"}
                </Badge>
                {/* Temporarily hidden call cost badge
                {callCost !== null && (
                  <Badge 
                    variant="outline" 
                    className="h-8 px-4 text-base border border-primary/20 shadow-lg backdrop-blur-sm"
                  >
                    <DollarSign className="h-4 w-4 mr-1" />
                    {callCost.toFixed(2)}
                  </Badge>
                )}
                */}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentCallId ? (
                <Button
                  variant={callStatus === "ended" ? "secondary" : "destructive"}
                  onClick={handleEndCall}
                  disabled={isLoading || callStatus === "ended"}
                  className={cn(
                    "relative overflow-hidden backdrop-blur-xl",
                    callStatus === "ended"
                      ? "border-green-500 bg-green-500/10 text-green-500 hover:bg-green-500/20"
                      : "hover:bg-destructive/90"
                  )}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  {callStatus === "ended" ? "Call Complete" : "End Call"}
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={handleStartCall}
                  disabled={isLoading}
                  className="relative overflow-hidden bg-primary/10 backdrop-blur-xl border border-primary/20 hover:bg-primary/20"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Start Call
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-3 gap-6 p-6">
          {/* Transcript Panel */}
          <div className="col-span-2 overflow-auto rounded-xl border border-primary/20 bg-black/40 backdrop-blur-xl p-4">
            <ScrollArea className="h-full pr-4">
              {transcript.length > 0 ? (
                <div className="space-y-4">
                  {transcript.map((message, index) => {
                    const [role, content] = message.split(': ')
                    return (
                      <div
                        key={index}
                        className={cn(
                          "flex gap-2",
                          role === "AI" ? "justify-start" : "justify-end"
                        )}
                      >
                        <div className="flex items-start gap-2 max-w-[80%]">
                          <Badge variant="outline" className="shrink-0 glass-effect text-xs">
                            {role}
                          </Badge>
                          <div
                            className={cn(
                              "rounded-lg px-3 py-2 glass-effect",
                              role === "AI"
                                ? "bg-muted/50"
                                : "bg-primary/20 text-primary-foreground"
                            )}
                          >
                            <p className="text-sm">{content}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Badge variant="secondary" className="text-lg py-2">
                    {callStatus === "ended" 
                      ? "No transcript available" 
                      : currentCallId 
                        ? "Call in progress..." 
                        : "Start call to begin"}
                  </Badge>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Notes Panel */}
          <div className="space-y-6 overflow-auto rounded-xl border border-primary/20 bg-black/40 backdrop-blur-xl p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="notes">Call Notes</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={saveNotes}
                  disabled={!notes.trim()}
                  className="border border-primary/20 hover:bg-primary/20"
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
                className="h-[150px] resize-none bg-black/40 border-primary/20"
              />
            </div>

            <ClientDetails
              name={lead.name}
              history={clientHistory}
              lastContact={lead.lastContact}
              notes={lead.notes}
            />

            {currentCallId && callStatus !== "ended" && (
              <div className="flex items-center justify-center">
                <Badge variant="default" className="animate-pulse">
                  <Clock className="h-4 w-4 mr-2" />
                  Call duration: {callStatus === "ended" ? "Complete" : "In progress"}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}