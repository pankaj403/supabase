"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CampaignTable } from "./campaign-table"
import { Campaign } from "@/types"
import { toast } from "sonner"
import { updateCampaign } from "@/lib/airtable"

interface CampaignListProps {
  clientId: string
  campaigns: Campaign[]
  onEditCampaign: (campaignId: string) => void
}

export function CampaignList({ clientId, campaigns, onEditCampaign }: CampaignListProps) {
  const handleStatusToggle = async (campaignId: string) => {
    try {
      const campaign = campaigns.find(c => c.id === campaignId)
      if (!campaign) return

      const newStatus = campaign.status === "active" ? "paused" : "active"
      
      const response = await updateCampaign(campaignId, {
        status: newStatus
      })

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update campaign')
      }

      toast.success(
        `Campaign ${newStatus === "active" ? "resumed" : "paused"}`
      )
    } catch (error) {
      console.error('Error updating campaign:', error)
      toast.error('Failed to update campaign status')
    }
  }

  return (
    <Card className="enhanced-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-glow">Campaigns</CardTitle>
        <CardDescription>
          View and manage active campaigns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CampaignTable
          campaigns={campaigns}
          clientId={clientId}
          onStatusToggle={handleStatusToggle}
          onEdit={onEditCampaign}
        />
      </CardContent>
    </Card>
  )
}