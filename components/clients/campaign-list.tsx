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
import { Play, Pause, Pencil } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCampaigns, updateCampaign } from "@/lib/airtable"
import { Campaign } from "@/types"

interface CampaignListProps {
  clientId: string
}

export function CampaignList({ clientId }: CampaignListProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)
  const [newName, setNewName] = useState("")

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const response = await getCampaigns()
        
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to fetch campaigns')
        }

        // Filter campaigns by clientId after fetching
        const clientCampaigns = response.data.filter(c => c.clientId === clientId)
        setCampaigns(clientCampaigns)
      } catch (error) {
        console.error('Error fetching campaigns:', error)
        toast.error('Failed to load campaigns')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCampaigns()
  }, [clientId])

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

      // Create a new array with the updated campaign
      setCampaigns(prev => 
        prev.map(c => {
          if (c.id === campaignId && response.data) {
            return response.data
          }
          return c
        })
      )

      toast.success(
        `Campaign ${newStatus === "active" ? "resumed" : "paused"}`
      )
    } catch (error) {
      console.error('Error updating campaign:', error)
      toast.error('Failed to update campaign status')
    }
  }

  const handleRename = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId)
    if (!campaign) return

    setSelectedCampaign(campaignId)
    setNewName(campaign.name)
    setRenameDialogOpen(true)
  }

  const handleSaveRename = async () => {
    if (!selectedCampaign || !newName.trim()) return

    try {
      const response = await updateCampaign(selectedCampaign, {
        name: newName.trim()
      })

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to rename campaign')
      }

      // Create a new array with the updated campaign
      setCampaigns(prev => 
        prev.map(campaign => {
          if (campaign.id === selectedCampaign && response.data) {
            return response.data
          }
          return campaign
        })
      )

      toast.success("Campaign renamed successfully")
      setRenameDialogOpen(false)
      setSelectedCampaign(null)
      setNewName("")
    } catch (error) {
      console.error('Error renaming campaign:', error)
      toast.error('Failed to rename campaign')
    }
  }

  if (isLoading) {
    return (
      <Card className="enhanced-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-glow">Campaigns</CardTitle>
          <CardDescription>
            View and manage active campaigns
          </CardDescription>
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
          <CardTitle className="text-lg font-semibold text-glow">Campaigns</CardTitle>
          <CardDescription>
            View and manage active campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="enhanced-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Calls Made</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">
                      <Link 
                        href={`/clients/${clientId}/campaigns/${campaign.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {campaign.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={campaign.status === "active" ? "default" : "secondary"}
                        className="enhanced-badge"
                      >
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{campaign.calls}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-black/20 overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${campaign.successRate}%` }}
                          />
                        </div>
                        <span>{campaign.successRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStatusToggle(campaign.id)}
                          className={campaign.status === "active" ? "text-primary hover:text-primary/80" : ""}
                        >
                          {campaign.status === "active" ? (
                            <Pause className="h-4 w-4 animate-pulse" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRename(campaign.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {campaigns.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No campaigns found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="glass-effect">
          <DialogHeader>
            <DialogTitle className="text-glow">Rename Campaign</DialogTitle>
            <DialogDescription>
              Enter a new name for the campaign
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter new name"
                className="enhanced-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveRename} className="button-glow">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}