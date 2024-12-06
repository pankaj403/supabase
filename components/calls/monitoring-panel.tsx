"use client"

import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Mic, Signal, Clock, Activity, Volume2, AlertCircle, CheckCircle } from "lucide-react"
import { useCallMonitoring } from "@/hooks/use-call-monitoring"
import { format } from 'date-fns-tz'

interface MonitoringPanelProps {
  callId: string
  onCallComplete?: () => void
  onTranscriptUpdate?: (messages: string[]) => void
  isComplete?: boolean
  isCalling?: boolean
}

export function MonitoringPanel({ 
  callId, 
  onCallComplete,
  onTranscriptUpdate,
  isComplete = false,
  isCalling = false
}: MonitoringPanelProps) {
  const { isConnected, stats, transcript, audioLevel } = useCallMonitoring(callId)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastTranscriptLength = useRef(0)

  // Filter out system messages
  const filteredTranscript = transcript.filter(msg => 
    !msg.content.toLowerCase().includes("you are matt") &&
    !msg.content.toLowerCase().includes("you are ben")
  )

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [filteredTranscript])

  useEffect(() => {
    if (filteredTranscript.length > lastTranscriptLength.current) {
      lastTranscriptLength.current = filteredTranscript.length
      onTranscriptUpdate?.(filteredTranscript.map(msg => `${msg.role}: ${msg.content}`))
      
      if (filteredTranscript.length >= 2 && 
          filteredTranscript[filteredTranscript.length - 1].role === 'agent') {
        onCallComplete?.()
      }
    }
  }, [filteredTranscript, onCallComplete, onTranscriptUpdate])

  const getStatusBadgeVariant = () => {
    if (isComplete || stats.status === "ended") return "secondary"
    if (isCalling) return "secondary"
    return isConnected ? "default" : "destructive"
  }

  const getStatusBadgeStyle = () => {
    if (isComplete || stats.status === "ended") return "border-green-500 bg-green-500/10 text-green-500"
    if (isCalling) return "border-yellow-500 bg-yellow-500/10 text-yellow-500"
    return isConnected ? "" : ""
  }

  const getStatusText = () => {
    if (isComplete) return "Call Complete"
    if (isCalling) return "Calling..."
    if (stats.status === "ended") return "Call Ended"
    return isConnected ? "Connected" : "Disconnected"
  }

  const formatAESTTime = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
    if (isNaN(date.getTime())) return ''
    return format(date, 'h:mm:ss a', { timeZone: 'Australia/Sydney' })
  }

  const getCallDuration = () => {
    if (isComplete || stats.status === "ended") return "41s"
    return `${stats.duration}s`
  }

  return (
    <Tabs defaultValue="transcript" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="transcript">Live Transcript</TabsTrigger>
        <TabsTrigger value="metrics">Call Metrics</TabsTrigger>
      </TabsList>

      <TabsContent value="transcript" className="mt-4 space-y-4">
        <div className="flex items-center justify-between px-2">
          <Badge 
            variant={getStatusBadgeVariant()}
            className={cn(
              "flex items-center gap-2",
              getStatusBadgeStyle(),
              !isComplete && !isCalling && stats.status !== "ended" && "animate-pulse"
            )}
          >
            {stats.status === "ended" || isComplete ? (
              <>
                <CheckCircle className="h-4 w-4" />
                {getStatusText()}
              </>
            ) : (
              getStatusText()
            )}
          </Badge>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatAESTTime(new Date())}</span>
            {!isComplete && stats.status !== "ended" && (
              <>
                <span>•</span>
                <span className="font-mono">{getCallDuration()}</span>
              </>
            )}
          </div>
        </div>

        <Card className="border-primary/10 bg-gradient-to-b from-background to-primary/5">
          <CardContent className="p-4">
            <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
              <div className="space-y-4">
                {filteredTranscript.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-2",
                      index % 2 === 0 ? "justify-start" : "justify-end"
                    )}
                  >
                    <div className="flex items-start gap-2 max-w-[80%]">
                      <Badge variant="outline" className="shrink-0 glass-effect text-xs">
                        {formatAESTTime(message.timestamp)}
                      </Badge>
                      <div
                        className={cn(
                          "rounded-lg px-3 py-2 glass-effect",
                          index % 2 === 0
                            ? "bg-muted/50"
                            : "bg-primary/20 text-primary-foreground"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {audioLevel > 0 && !isComplete && stats.status !== "ended" && (
                  <div className="flex items-center gap-2 justify-center py-2">
                    <Activity className="h-4 w-4 animate-pulse text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Audio detected...
                    </span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="metrics" className="mt-4">
        <div className="grid gap-4">
          <Card className="border-primary/10 bg-gradient-to-b from-background to-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Call Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Signal className="h-4 w-4 text-primary animate-pulse" />
                      <span>Connection Quality</span>
                    </div>
                    <span>{stats.quality}%</span>
                  </div>
                  <Progress 
                    value={stats.quality} 
                    className="h-2 bg-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-primary animate-pulse" />
                      <span>Audio Level</span>
                    </div>
                    <span>{audioLevel}%</span>
                  </div>
                  <Progress 
                    value={audioLevel} 
                    className="h-2 bg-primary/20"
                  />
                </div>

                {stats.quality < 70 && (
                  <div className="flex items-center gap-2 text-sm text-yellow-500 dark:text-yellow-400 animate-pulse">
                    <AlertCircle className="h-4 w-4" />
                    <span>Poor connection detected</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-gradient-to-b from-background to-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Call Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="text-lg font-mono font-semibold">
                      {stats.duration}s
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant="outline" className="glass-effect">
                      {stats.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Packet Loss</p>
                    <p className="text-lg font-mono font-semibold">
                      {stats.packetLoss}%
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Latency</p>
                    <p className="text-lg font-mono font-semibold">
                      {stats.latency}ms
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Call Events</p>
                  <ScrollArea className="h-[100px]">
                    <div className="space-y-2">
                      {stats.events.map((event, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-muted-foreground font-mono">
                            {event.timestamp}
                          </span>
                          <Badge variant="outline" className="glass-effect">
                            {event.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}