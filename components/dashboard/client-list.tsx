"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Phone } from "lucide-react"
import Link from "next/link"
import { ClientDialog } from "./client-dialog"
import { TestCall } from "./test-call"
import { toast } from "sonner"
import { Client } from '@/types'
import { useClientStore } from "@/lib/data"
import { formatDuration } from "@/lib/utils"

export function ClientList() {
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [testCallOpen, setTestCallOpen] = useState(false)
  const { clients, addClient, refreshData } = useClientStore()

  useEffect(() => {
    async function loadData() {
      try {
        await refreshData()
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Failed to load clients')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [refreshData])

  const handleCreateClient = async (name: string) => {
    try {
      const newClient = await addClient(name)
      toast.success('Client created successfully')
      setDialogOpen(false)
    } catch (error) {
      console.error('Error creating client:', error)
      toast.error('Failed to create client')
    }
  }

  if (isLoading) {
    return (
      <Card className="enhanced-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-glow">Active Clients</CardTitle>
              <CardDescription>
                Monitor client performance and campaign metrics
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <TestCall />
              <Button 
                disabled
                className="relative overflow-hidden bg-primary/10 backdrop-blur-sm border border-primary/20"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-primary/5 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="enhanced-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-glow">Active Clients</CardTitle>
              <CardDescription>
                Monitor client performance and campaign metrics
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <TestCall />
              <Button 
                onClick={() => setDialogOpen(true)}
                className="relative overflow-hidden bg-primary/10 backdrop-blur-sm border border-primary/20 shadow-[0_0_15px_rgba(255,100,0,0.15)] hover:shadow-[0_0_25px_rgba(255,100,0,0.25)] hover:bg-primary/20 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent animate-pulse" />
                <UserPlus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="enhanced-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active Campaigns</TableHead>
                  <TableHead>Calls This Month</TableHead>
                  <TableHead>Total Calls</TableHead>
                  <TableHead>Connected Calls</TableHead>
                  <TableHead>Voicemails</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Avg Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <Link 
                        href={`/clients/${client.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {client.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={client.status === 'active' ? 'default' : 'secondary'}
                        className="bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(255,100,0,0.1)]"
                      >
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="enhanced-badge">
                        {client.activeCampaigns}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="enhanced-badge">
                        {client.callsThisMonth}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="enhanced-badge">
                        {client.totalCalls}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="enhanced-badge">
                        {client.connectedCalls}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="enhanced-badge">
                        {client.voicemails}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-black/20 overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${client.successRate}%` }}
                          />
                        </div>
                        <span>{client.successRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="enhanced-badge">
                        {client.averageCallDuration}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {clients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No clients found. Add your first client to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleCreateClient}
      />
    </>
  )
}