"use client"

import { useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

interface CampaignSettings {
  name: string
  callsPerDay: number
  startTime: string
  endTime: string
  timezone: string
  voicemailDetection: boolean
  maxAttempts: number
  callInterval: number
}

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: CampaignSettings
  onSave: (settings: CampaignSettings) => void
}

export function SettingsDialog({
  open,
  onOpenChange,
  settings,
  onSave,
}: SettingsDialogProps) {
  const [formData, setFormData] = useState<CampaignSettings>(settings)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Campaign Settings</DialogTitle>
          <DialogDescription>
            Configure campaign behavior and scheduling
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
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Calls Per Day</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[formData.callsPerDay]}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, callsPerDay: value[0] }))
                  }
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="w-12 text-right">{formData.callsPerDay}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, startTime: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, endTime: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, timezone: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Australia/Sydney">Sydney</SelectItem>
                  <SelectItem value="Australia/Melbourne">Melbourne</SelectItem>
                  <SelectItem value="Australia/Brisbane">Brisbane</SelectItem>
                  <SelectItem value="Australia/Perth">Perth</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="voicemail">Voicemail Detection</Label>
              <Switch
                id="voicemail"
                checked={formData.voicemailDetection}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, voicemailDetection: checked }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>Maximum Call Attempts</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[formData.maxAttempts]}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, maxAttempts: value[0] }))
                  }
                  max={5}
                  step={1}
                  className="flex-1"
                />
                <span className="w-12 text-right">{formData.maxAttempts}</span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Minimum Call Interval (hours)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[formData.callInterval]}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, callInterval: value[0] }))
                  }
                  max={72}
                  step={1}
                  className="flex-1"
                />
                <span className="w-12 text-right">{formData.callInterval}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Settings</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}