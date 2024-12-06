"use client"

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Phone, Users, VoicemailIcon, PhoneCall, History } from "lucide-react"
import { useClientStore } from '@/lib/data'
import { formatDuration } from '@/lib/utils'

export function DashboardStats() {
  const { clients, refreshData } = useClientStore()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalClients: 0,
    callsThisMonth: 0,
    totalCalls: 0,
    connectedCalls: 0,
    voicemails: 0,
  })

  useEffect(() => {
    async function loadData() {
      try {
        await refreshData()
        
        // Calculate total stats from all clients
        const totals = clients.reduce((acc, client) => ({
          totalClients: acc.totalClients + 1,
          callsThisMonth: acc.callsThisMonth + client.callsThisMonth,
          totalCalls: acc.totalCalls + client.totalCalls,
          connectedCalls: acc.connectedCalls + client.connectedCalls,
          voicemails: acc.voicemails + client.voicemails,
        }), {
          totalClients: 0,
          callsThisMonth: 0,
          totalCalls: 0,
          connectedCalls: 0,
          voicemails: 0,
        })

        setStats(totals)
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [clients, refreshData])

  const statCards = [
    {
      title: "Total Clients",
      value: stats.totalClients.toString(),
      icon: Users,
    },
    {
      title: "Calls This Month",
      value: stats.callsThisMonth.toString(),
      icon: Phone,
    },
    {
      title: "All Time Calls",
      value: stats.totalCalls.toString(),
      icon: History,
    },
    {
      title: "Connected Calls",
      value: stats.connectedCalls.toString(),
      icon: PhoneCall,
    },
    {
      title: "Voicemails",
      value: stats.voicemails.toString(),
      icon: VoicemailIcon,
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
          </CardContent>
        </Card>
      ))}
    </div>
  )
}