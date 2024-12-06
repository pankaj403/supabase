"use client"

import { useState } from "react"
import { CampaignHeader } from "./header"
import { CampaignShell } from "./shell"
import { CampaignOverview } from "./overview"
import { CampaignAnalytics } from "./analytics"
import { LeadManagement } from "./lead-management"
import { SettingsDialog } from "./settings-dialog"
import { ParticleBackground } from "@/components/particle-background"
import { Campaign } from "@/types"

interface CampaignClientProps {
  params: {
    id: string
    campaignId: string
  }
  campaign: Campaign
}

const defaultSettings = {
  name: "Q2 Outreach",
  callsPerDay: 50,
  startTime: "09:00",
  endTime: "17:00",
  timezone: "Australia/Sydney",
  voicemailDetection: true,
  maxAttempts: 3,
  callInterval: 24,
}

export function CampaignClient({ params, campaign }: CampaignClientProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState({
    ...defaultSettings,
    name: campaign.name,
  })
  const [isPaused, setIsPaused] = useState(false)

  const handleTogglePause = () => {
    setIsPaused(!isPaused)
  }

  return (
    <>
      <ParticleBackground />
      <div className="relative">
        <CampaignShell>
          <CampaignHeader
            heading={settings.name}
            description="Campaign details and lead management"
            onOpenSettings={() => setSettingsOpen(true)}
            clientId={params.id}
            isPaused={isPaused}
            onTogglePause={handleTogglePause}
          />
          <div className="grid gap-4 md:gap-8">
            <CampaignOverview campaign={campaign} />
            <CampaignAnalytics />
            <LeadManagement 
              campaignId={params.campaignId} 
              clientId={params.id}
            />
          </div>
          <SettingsDialog
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
            settings={settings}
            onSave={setSettings}
          />
        </CampaignShell>
      </div>
    </>
  )
}