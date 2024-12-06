"use client"

import { ClientHeader } from "./header"
import { ClientShell } from "./shell"
import { CampaignList } from "./campaign-list"
import { ClientStats } from "./stats"
import { ParticleBackground } from "@/components/particle-background"
import { Client } from "@/types"

interface ClientPageProps {
  client: Client
}

export function ClientPage({ client }: ClientPageProps) {
  return (
    <>
      <ParticleBackground />
      <div className="relative">
        <ClientShell>
          <ClientHeader
            heading={client.name}
            description="Manage campaigns and track performance"
            clientId={client.id}
          />
          <div className="grid gap-4 md:gap-8">
            <ClientStats clientId={client.id} />
            <CampaignList clientId={client.id} />
          </div>
        </ClientShell>
      </div>
    </>
  )
}