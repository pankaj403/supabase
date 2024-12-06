"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, CheckCircle2, XCircle, VoicemailIcon, Clock, MessageSquare } from "lucide-react"
import { CallDetailsDialog } from "./call-details-dialog"
import { getCustomerInteractions } from "@/lib/airtable/customer-interactions"
import { AirtableCustomerInteraction } from "@/types/airtable"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

const activityIcons = {
  "Incoming": Phone,
  "Outgoing": Phone,
  "Voicemail": VoicemailIcon,
  "Success": CheckCircle2,
  "Failed": XCircle,
} as const

const activityColors = {
  "Incoming": "default",
  "Outgoing": "secondary",
  "Voicemail": "outline",
  "Success": "default",
  "Failed": "destructive",
} as const

export function ActivityFeed() {
  const [selectedActivity, setSelectedActivity] = useState<AirtableCustomerInteraction | null>(null)
  const [activities, setActivities] = useState<AirtableCustomerInteraction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchActivities() {
      try {
        const response = await getCustomerInteractions()
        
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to fetch activities')
        }

        setActivities(response.data)
      } catch (error) {
        console.error('Error fetching activities:', error)
        toast.error('Failed to load activity feed')
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-primary/5 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {activities.map((activity) => {
                const Icon = activityIcons[activity.interactionType as keyof typeof activityIcons] || MessageSquare
                
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedActivity(activity)}
                  >
                    <div className="rounded-full bg-background p-2 shadow-sm">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {activity.interactionType} Interaction
                        </p>
                        <Badge variant={activityColors[activity.interactionType as keyof typeof activityColors] || "default"}>
                          {activity.followUpRequired ? "Follow-up Required" : activity.interactionType}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {activity.notes}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(activity.dateTime), { addSuffix: true })}
                        </span>
                        {activity.followUpDate && (
                          <>
                            <span>•</span>
                            <span>Follow-up: {formatDistanceToNow(new Date(activity.followUpDate), { addSuffix: true })}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {activities.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No recent activity to display
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <CallDetailsDialog
        activity={selectedActivity}
        open={!!selectedActivity}
        onOpenChange={() => setSelectedActivity(null)}
      />
    </>
  )
}