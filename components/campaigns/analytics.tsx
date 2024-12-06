"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { formatDate } from "@/lib/utils"
import { getCampaignAnalytics } from "@/lib/airtable/campaign-analytics"
import type { CampaignAnalytics } from "@/lib/airtable/campaign-analytics"
import { Campaign } from "@/types"
import { toast } from "sonner"

interface CampaignAnalyticsProps {
  campaign?: Campaign
}

export function CampaignAnalytics({ campaign }: CampaignAnalyticsProps) {
  const [data, setData] = useState<CampaignAnalytics[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadAnalytics() {
      if (!campaign?.id) {
        setIsLoading(false)
        return
      }

      try {
        const response = await getCampaignAnalytics(campaign.id)
        
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to load analytics')
        }

        setData(response.data.map(item => ({
          ...item,
          date: formatDate(item.date),
          duration: Math.round(item.duration / 60), // Convert to minutes
        })))
      } catch (error) {
        console.error('Error loading analytics:', error)
        toast.error('Failed to load campaign analytics')
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()
  }, [campaign?.id])

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-sm font-medium">
              Total Calls: {payload[0].value}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-sm font-medium">
              Connected: {payload[1].value}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium">
              Avg Duration: {payload[2].value} min
            </span>
          </div>
        </div>
      </div>
    )
  }

  const axisStyle = {
    fontSize: 12,
    fontFamily: 'inherit',
    color: 'hsl(var(--muted-foreground))',
  }

  if (!campaign) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Analytics</CardTitle>
          <CardDescription>
            Call performance metrics over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] mt-4 flex items-center justify-center">
            <p className="text-muted-foreground">No campaign data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Analytics</CardTitle>
        <CardDescription>
          Call performance metrics over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mt-4">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="h-32 w-32 rounded-lg bg-primary/5 animate-pulse" />
            </div>
          ) : data.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center">
              <p className="text-muted-foreground">No analytics data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  className="stroke-muted" 
                />
                <XAxis
                  dataKey="date"
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="calls"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="connected"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="duration"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}