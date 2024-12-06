"use client"

import { useState, useEffect } from "react"
import { Campaign } from "@/types"
import { getCampaigns } from "@/lib/airtable"
import { toast } from "sonner"

export function useCampaign(clientId: string, campaignId: string) {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCampaign() {
      try {
        // Reset previous states
        setCampaign(null)
        setError(null)
        setIsLoading(true)

        const response = await getCampaigns()
        
        if (!response.success || !response.data) {
          const errorMsg = response.error || 'Failed to fetch campaigns'
          setError(errorMsg)
          toast.error(errorMsg)
          return
        }

        // Detailed logging for debugging
        console.log('All Campaigns:', response.data)
        console.log('Filtering for Client ID:', clientId)
        console.log('Looking for Campaign ID:', campaignId)

        // More flexible campaign matching
        const matchedCampaign = response.data.find(c => 
          c.id === campaignId || 
          (c.clientId === clientId && c.name.includes(campaignId))
        )

        if (!matchedCampaign) {
          const errorMsg = 'Campaign not found. Check client ID and campaign details.'
          setError(errorMsg)
          toast.error(errorMsg)
          return
        }

        setCampaign(matchedCampaign)
      } catch (error) {
        const errorMsg = error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred while fetching the campaign'
        
        console.error('Detailed Campaign Fetch Error:', error)
        setError(errorMsg)
        toast.error(errorMsg)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCampaign()
  }, [clientId, campaignId])

  return { campaign, isLoading, error }
}
