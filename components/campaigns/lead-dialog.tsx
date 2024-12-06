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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Customer } from "@/types"
import { validateAustralianPhone, formatPhoneNumber } from "@/lib/utils"
import { toast } from "sonner"

interface LeadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead?: Customer
  onSave: (customer: Partial<Customer>) => void
}

export function LeadDialog({ open, onOpenChange, lead, onSave }: LeadDialogProps) {
  const [formData, setFormData] = useState<Partial<Customer>>(
    lead ?? {
      name: "",
      phone: "",
      status: "pending",
      notes: "",
      importTime: new Date().toISOString().split('T')[0],
      lastContact: new Date().toISOString().split('T')[0],
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateAustralianPhone(formData.phone || "")) {
      toast.error("Please enter a valid Australian phone number")
      return
    }

    if (!formData.name?.trim()) {
      toast.error("Please enter a name")
      return
    }

    const formattedData = {
      ...formData,
      phone: formatPhoneNumber(formData.phone || ""),
      importTime: formData.importTime || new Date().toISOString().split('T')[0],
      lastContact: formData.lastContact || new Date().toISOString().split('T')[0],
    }
    
    onSave(formattedData)
    onOpenChange(false)
  }

  const handlePhoneChange = (value: string) => {
    // Allow only numbers and basic formatting characters
    const cleaned = value.replace(/[^\d\s+()-]/g, "")
    setFormData((prev) => ({ ...prev, phone: cleaned }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{lead ? "Edit Contact" : "Add Contact"}</DialogTitle>
          <DialogDescription>
            {lead ? "Update contact information" : "Add a new contact to the campaign"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="John Smith"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone (Australian)</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+61 XXX XXX XXX"
                required
              />
              <p className="text-xs text-muted-foreground">
                Format: +61 or 0 followed by 9 digits
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: value as Customer["status"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Add any relevant notes about the contact..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}