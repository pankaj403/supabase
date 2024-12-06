"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { getCallLogs } from "@/lib/airtable"
import { AirtableCallLog } from "@/types/airtable"
import { toast } from "sonner"

interface CallHistoryProps {
  phoneNumber?: string
  clientId?: string
  limit?: number
}

const statusColors = {
  "completed": "secondary",
  "missed": "destructive",
} as const

const statusStyles = {
  "completed": "border-green-500 bg-green-500/10 text-green-500 hover:bg-green-500/20",
  "missed": "hover:bg-destructive/90",
} as const

export function CallHistory({ clientId, limit = 10 }: CallHistoryProps) {
  const [calls, setCalls] = useState<AirtableCallLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCalls() {
      try {
        const response = await getCallLogs(clientId)
        
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to fetch calls')
        }

        // Sort by date and limit the number of records
        const sortedCalls = response.data
          .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
          .slice(0, limit)

        setCalls(sortedCalls)
      } catch (error) {
        console.error("Failed to fetch calls:", error)
        toast.error("Failed to load call history")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCalls()
  }, [clientId, limit])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Call History</CardTitle>
          <CardDescription>Loading call records...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-primary/5 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call History</CardTitle>
        <CardDescription>
          {clientId 
            ? `Recent calls for this client`
            : "Recent call records"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls.map((call) => (
                <TableRow key={call.id}>
                  <TableCell>
                    {formatDistanceToNow(new Date(call.dateTime), { 
                      addSuffix: true 
                    })}
                  </TableCell>
                  <TableCell>
                    {formatDuration(call.duration)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={statusColors[call.callStatus]}
                      className={statusStyles[call.callStatus]}
                    >
                      {call.callStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {call.callType}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <p className="truncate" title={call.callNotes}>
                      {call.callNotes || "-"}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
              {calls.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No call history available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}