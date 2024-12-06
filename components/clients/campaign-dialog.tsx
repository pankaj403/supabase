"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { createCampaign } from "@/lib/airtable"
import { CAMPAIGN_STATUS } from "@/lib/airtable/field-mappings"
import { Campaign } from "@/types"

interface CampaignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
}

interface CampaignForm {
  name: string
  description: string
  type: string
  goal: string
  status: typeof CAMPAIGN_STATUS[keyof typeof CAMPAIGN_STATUS]
}

const initialForm: CampaignForm = {
  name: "",
  description: "",
  type: "cold-calling",
  goal: "leads",
  status: CAMPAIGN_STATUS.active
}

export function CampaignDialog({
  open,
  onOpenChange,
  clientId,
}: CampaignDialogProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<CampaignForm>(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const campaignData: Omit<Campaign, 'id'> = {
        name: formData.name,
        clientId: [clientId],
        status: formData.status,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        goals: formData.goal || '',
        results: '',
        notes: formData.description || '',
        dailyCallLimit: 50,
        callWindowStart: '09:00',
        callWindowEnd: '17:00',
        timeZone: 'Australia/Brisbane',
        voicemailDetection: false,
        maxAttempts: 3,
        callInterval: 24,
        calls: 0,
        successRate: 0,
        totalCallsSent: 0,
        callsThisMonth: 0,
        totalCost: 0,
        callsPickedUp: 0,
        voiceMailsLeft: 0,
        averageCallTime: 0
      }

      console.log('Submitting campaign data:', campaignData)
      const response = await createCampaign(campaignData)

      if (response.success && response.data) {
        toast.success('Campaign created successfully!')
        router.push(`/clients/${clientId}/campaigns/${response.data.id}`)
        onOpenChange(false)
        setFormData(initialForm)
      } else {
        console.error('Failed to create campaign:', response.error)
        toast.error(response.error || 'Failed to create campaign')
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
      toast.error('An error occurred while creating the campaign')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Set up a new calling campaign for your client
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Database Reactivation Campaign"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Campaign objectives and notes"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Campaign Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select campaign type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cold-calling">Cold Calling</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="nurture">Lead Nurturing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="goal">Campaign Goal</Label>
              <Select
                value={formData.goal}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, goal: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select campaign goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leads">Lead Generation</SelectItem>
                  <SelectItem value="sales">Direct Sales</SelectItem>
                  <SelectItem value="appointments">Book Appointments</SelectItem>
                  <SelectItem value="feedback">Gather Feedback</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Campaign Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: Object.keys(CAMPAIGN_STATUS).find(
                      key => CAMPAIGN_STATUS[key as keyof typeof CAMPAIGN_STATUS] === value
                    ) as keyof typeof CAMPAIGN_STATUS
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select campaign status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(CAMPAIGN_STATUS).map((status) => (
                    <SelectItem 
                      key={status} 
                      value={CAMPAIGN_STATUS[status as keyof typeof CAMPAIGN_STATUS]}
                    >
                      {CAMPAIGN_STATUS[status as keyof typeof CAMPAIGN_STATUS]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Campaign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}