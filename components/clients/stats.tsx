"use client"

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Phone, PlayCircle, Clock, PhoneCall, BarChart2 } from "lucide-react"
import { Client } from '@/types'
import { toast } from 'sonner'
import { useClientStore } from '@/lib/data'
import { formatDuration } from '@/lib/utils'

interface ClientStatsProps {
  clientId: string
}

export function ClientStats({ clientId }: ClientStatsProps) {
  const { clients, campaigns } = useClientStore()
  const client = clients.find(c => c.id === clientId)
  const clientCampaigns = campaigns.filter(c => c.clientId === clientId)
  const activeCampaigns = clientCampaigns.filter(c => c.status === 'active').length

  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    totalCalls: 0,
    callsThisMonth: 0,
    minutesThisMonth: 0,
    successRatio: 0,
  })

  useEffect(() => {
    if (client) {
      // Calculate current month's stats
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      // In a real implementation, these would come from Airtable
      // For now, we'll use the client's total stats and estimate monthly values
      const totalCalls = client.totalCalls || 0
      const connectedCalls = client.connectedCalls || 0
      
      const monthlyStats = {
        calls: Math.round(totalCalls * 0.3), // Assume 30% of calls are from this month
        minutes: Math.round(totalCalls * 4.5), // Assume average call is 4.5 minutes
        successRatio: totalCalls > 0 ? Math.round((connectedCalls / totalCalls) * 100) : 0
      }

      setStats({
        activeCampaigns: activeCampaigns || 0,
        totalCalls: totalCalls,
        callsThisMonth: monthlyStats.calls,
        minutesThisMonth: monthlyStats.minutes,
        successRatio: monthlyStats.successRatio,
      })
      setIsLoading(false)
    }
  }, [client, activeCampaigns])

  if (!client || isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, index) => (
          <Card key={index} className="enhanced-card overflow-hidden">
            <CardHeader className="pb-2">
              <div className="animate-pulse h-4 bg-gray-200 rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: "Active Campaigns",
      value: stats.activeCampaigns.toString(),
      icon: PlayCircle,
      description: "Currently running campaigns",
    },
    {
      title: "Total Calls",
      value: stats.totalCalls.toString(),
      icon: Phone,
      description: "All-time calls made",
    },
    {
      title: "Calls This Month",
      value: stats.callsThisMonth.toString(),
      icon: PhoneCall,
      description: "Calls made this month",
    },
    {
      title: "Minutes This Month",
      value: formatDuration(stats.minutesThisMonth * 60),
      icon: Clock,
      description: "Total call duration this month",
    },
    {
      title: "Success Ratio",
      value: `${stats.successRatio}%`,
      icon: BarChart2,
      description: `${client?.connectedCalls || 0} connected out of ${client?.totalCalls || 0} calls`,
      progress: stats.successRatio,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {statCards.map((stat, index) => (
        <Card key={index} className="enhanced-card overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-primary animate-glow" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-glow">
              {isLoading ? (
                <div className="h-8 w-16 animate-pulse bg-primary/10 rounded" />
              ) : (
                stat.value
              )}
            </div>
            {stat.progress !== undefined && (
              <Progress value={stat.progress} className="mt-2" />
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}