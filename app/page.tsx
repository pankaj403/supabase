"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { ClientList } from "@/components/dashboard/client-list"
import { DashboardStats } from "@/components/dashboard/stats"
import { ParticleBackground } from "@/components/particle-background"

export default function DashboardPage() {
  return (
    <>
      <ParticleBackground />
      <DashboardShell>
        <DashboardHeader
          heading="Command Centre"
          description="Real-time campaign monitoring and client management"
        />
        <div className="grid gap-6">
          <DashboardStats />
          <div className="grid gap-6 md:grid-cols-1">
            <ClientList />
          </div>
        </div>
      </DashboardShell>
    </>
  )
}