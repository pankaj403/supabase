"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { Clock, MessageSquare, StickyNote, Calendar } from "lucide-react"
import { AirtableCustomerInteraction } from "@/types/airtable"

interface CallDetailsDialogProps {
  activity: AirtableCustomerInteraction | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CallDetailsDialog({
  activity,
  open,
  onOpenChange,
}: CallDetailsDialogProps) {
  if (!activity) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Interaction Details</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4">
          {/* Overview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Type</span>
                  <Badge variant="default">
                    {activity.interactionType}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Agent ID</span>
                  <span>{activity.agentId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Time</span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDistanceToNow(new Date(activity.dateTime), { addSuffix: true })}</span>
                  </div>
                </div>
                {activity.followUpRequired && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Follow-up Date</span>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDistanceToNow(new Date(activity.followUpDate!), { addSuffix: true })}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transcript */}
          {activity.callTranscript && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <CardTitle className="text-sm">Call Transcript</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-2">
                    <div className="text-sm whitespace-pre-wrap">
                      {activity.callTranscript}
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {activity.notes && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <StickyNote className="h-4 w-4" />
                  <CardTitle className="text-sm">Notes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{activity.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}