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
  status: keyof typeof CAMPAIGN_STATUS
  startDate: string
  endDate: string
  goals: string
  notes: string
  dailyCallLimit: number
  callWindow: {
    start: string
    end: string
  }
  timezone: string
}

const initialForm: CampaignForm = {
  name: "",
  status: "active",
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  goals: "",
  notes: "",
  dailyCallLimit: 50,
  callWindow: {
    start: "09:00",
    end: "17:00"
  },
  timezone: "America/New_York"
}

export function CampaignDialog({
  open,
  onOpenChange,
  clientId
}: CampaignDialogProps) {
  const router = useRouter()
  const [form, setForm] = useState<CampaignForm>(initialForm)
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      setIsLoading(true)
      
      const campaignData: Omit<Campaign, "id"> = {
        name: form.name,
        clientId: clientId,
        status: form.status,
        startDate: form.startDate,
        endDate: form.endDate,
        goals: form.goals,
        notes: form.notes,
        dailyCallLimit: form.dailyCallLimit,
        callWindowStart: form.callWindow.start,
        callWindowEnd: form.callWindow.end,
        timeZone: form.timezone,
        voicemailDetection: false,
        maxAttempts: 3,
        callInterval: 24,
        calls: 0,
        successRate: 0,
        results: "",
        totalCallsSent: 0,
        callsThisMonth: 0,
        totalCost: 0,
        callsPickedUp: 0,
        voiceMailsLeft: 0,
        averageCallTime: 0
      }

      const response = await createCampaign(campaignData)

      if (!response.success) {
        throw new Error(response.error || "Failed to create campaign")
      }

      toast.success("Campaign created successfully")
      router.refresh()
      onOpenChange(false)
      setForm(initialForm)
    } catch (error) {
      console.error("Error creating campaign:", error)
      toast.error("Failed to create campaign")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
          <DialogDescription>
            Create a new campaign to start making calls.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="campaign-name">Name</Label>
            <Input
              id="campaign-name"
              name="name"
              autoComplete="off"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="campaign-status">Status</Label>
            <Select
              name="status"
              value={form.status}
              onValueChange={(value: keyof typeof CAMPAIGN_STATUS) =>
                setForm({ ...form, status: value })
              }
            >
              <SelectTrigger id="campaign-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(CAMPAIGN_STATUS).map((status) => (
                  <SelectItem key={status} value={status}>
                    {CAMPAIGN_STATUS[status as keyof typeof CAMPAIGN_STATUS]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="campaign-start-date">Start Date</Label>
            <Input
              id="campaign-start-date"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="campaign-end-date">End Date</Label>
            <Input
              id="campaign-end-date"
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="campaign-daily-limit">Daily Call Limit</Label>
            <Input
              id="campaign-daily-limit"
              name="dailyCallLimit"
              type="number"
              min="1"
              max="1000"
              value={form.dailyCallLimit}
              onChange={(e) => setForm({ ...form, dailyCallLimit: parseInt(e.target.value) })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label>Call Window</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="campaign-window-start" className="sr-only">Start Time</Label>
                <Input
                  id="campaign-window-start"
                  name="callWindowStart"
                  type="time"
                  value={form.callWindow.start}
                  onChange={(e) => setForm({
                    ...form,
                    callWindow: { ...form.callWindow, start: e.target.value }
                  })}
                  required
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="campaign-window-end" className="sr-only">End Time</Label>
                <Input
                  id="campaign-window-end"
                  name="callWindowEnd"
                  type="time"
                  value={form.callWindow.end}
                  onChange={(e) => setForm({
                    ...form,
                    callWindow: { ...form.callWindow, end: e.target.value }
                  })}
                  required
                />
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="campaign-timezone">Timezone</Label>
            <Select
              name="timezone"
              value={form.timezone}
              onValueChange={(value) => setForm({ ...form, timezone: value })}
            >
              <SelectTrigger id="campaign-timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="campaign-goals">Goals</Label>
            <Textarea
              id="campaign-goals"
              name="goals"
              value={form.goals}
              onChange={(e) => setForm({ ...form, goals: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="campaign-notes">Notes</Label>
            <Textarea
              id="campaign-notes"
              name="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Campaign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}