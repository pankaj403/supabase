"use client"

import { Suspense } from "react"
import { notFound } from "next/navigation"
import dynamic from "next/dynamic"
import { useCampaign } from "@/hooks/use-campaign"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

const CampaignClient = dynamic(
  () => import("@/components/campaigns/campaign-client").then(mod => mod.CampaignClient),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

interface CampaignPageProps {
  params: {
    id: string
    campaignId: string
  }
}

export default function CampaignPage({ params }: CampaignPageProps) {
  const { campaign, isLoading } = useCampaign(params.id, params.campaignId)

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!campaign) {
    return notFound()
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CampaignClient params={params} campaign={campaign} />
    </Suspense>
  )
}