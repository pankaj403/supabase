"use client"

import { ClientPage } from "@/components/clients/client-page"
import { notFound } from "next/navigation"
import { useEffect, useState } from "react"
import { getClients } from "@/lib/airtable"
import { Client } from "@/types"
import { toast } from "sonner"

interface ClientPageProps {
  params: {
    id: string
  }
}

export default function Page({ params }: ClientPageProps) {
  const [client, setClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchClient() {
      try {
        const response = await getClients()
        
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to fetch client')
        }

        const foundClient = response.data.find(c => c.id === params.id)
        
        if (!foundClient) {
          notFound()
          return
        }

        setClient(foundClient)
      } catch (error) {
        console.error('Error fetching client:', error)
        toast.error('Failed to load client data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchClient()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col gap-8">
        <div className="flex-1 space-y-4 pt-4 relative z-10">
          <div className="container mx-auto px-4">
            <div className="space-y-8">
              {/* Loading skeleton */}
              <div className="space-y-4">
                <div className="h-12 w-48 bg-primary/5 animate-pulse rounded-lg" />
                <div className="h-6 w-96 bg-primary/5 animate-pulse rounded-lg" />
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-primary/5 animate-pulse rounded-lg" />
                ))}
              </div>
              <div className="h-96 bg-primary/5 animate-pulse rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!client) {
    notFound()
  }

  return <ClientPage client={client} />
}