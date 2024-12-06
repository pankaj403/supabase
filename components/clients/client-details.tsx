"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, History, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface ClientDetailsProps {
  name: string
  history: string[]
  lastContact?: string
  notes?: string
  onDeleteNote?: (index: number) => void
  onEditNote?: (index: number, newText: string) => void
}

export function ClientDetails({ 
  name, 
  history, 
  lastContact, 
  notes,
  onDeleteNote,
  onEditNote 
}: ClientDetailsProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editText, setEditText] = useState("")

  const handleEdit = (index: number, text: string) => {
    setEditingIndex(index)
    setEditText(text.split("] ")[1]) // Remove timestamp
  }

  const handleSaveEdit = (index: number) => {
    if (onEditNote) {
      onEditNote(index, editText)
      toast.success("Note updated")
    }
    setEditingIndex(null)
    setEditText("")
  }

  const handleDelete = (index: number) => {
    if (onDeleteNote) {
      onDeleteNote(index)
      toast.success("Note deleted")
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <h3 className="text-base font-semibold">Client History</h3>
        </div>
        {lastContact && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Last Contact: {lastContact}</span>
          </div>
        )}
      </div>

      <div className="space-y-3 rounded-lg border border-primary/20 bg-black/20 p-3">
        {notes && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Previous Notes</h4>
            <p className="text-sm text-muted-foreground">{notes}</p>
            <div className="h-px bg-primary/10 my-3" />
          </div>
        )}

        {history.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Interactions</h4>
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-3">
                {history.map((entry, index) => (
                  <div key={index} className="text-sm space-y-2">
                    {editingIndex === index ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="text-xs min-h-[60px] bg-black/40 border-primary/20"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingIndex(null)}
                            className="border border-primary/20 hover:bg-primary/20"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(index)}
                            className="border border-primary/20 bg-primary/20 hover:bg-primary/30"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="group rounded-lg border border-primary/10 bg-black/20 p-3">
                        <div className="flex items-start justify-between">
                          <p className="text-muted-foreground flex-1">{entry}</p>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 hover:bg-primary/20"
                              onClick={() => handleEdit(index, entry)}
                            >
                              <Pencil className="h-3 w-3 text-muted-foreground hover:text-primary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 hover:bg-red-500/20"
                              onClick={() => handleDelete(index)}
                            >
                              <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {!notes && history.length === 0 && (
          <p className="text-sm text-muted-foreground italic text-center py-4">
            No previous interactions recorded
          </p>
        )}
      </div>
    </div>
  )
}