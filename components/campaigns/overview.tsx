"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Users, Phone, CheckCircle2, Clock } from "lucide-react"
import { Campaign } from "@/types"
import { useClientStore } from "@/lib/data"

interface CampaignOverviewProps {
  campaign: Campaign
}

export function CampaignOverview({ campaign }: CampaignOverviewProps) {
  const { clients } = useClientStore()
  const client = clients.find(c => c.id === campaign.clientId)
  
  const successRate = Math.round((campaign.calls / (campaign.calls || 1)) * 100) || 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{campaign.calls}</div>
          <Progress value={successRate} className="mt-2" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Calls Made</CardTitle>
          <Phone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{campaign.calls}</div>
          <Progress value={successRate} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {successRate}% of calls made
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{campaign.successRate}%</div>
          <Progress value={campaign.successRate} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round(campaign.calls * (campaign.successRate / 100))} successful calls
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Call Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {client?.averageCallDuration || "0:00"}
          </div>
          <Progress value={75} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Target: 6 minutes
          </p>
        </CardContent>
      </Card>
    </div>
  )
}