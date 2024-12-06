"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Phone } from "lucide-react"
import { CallDialog } from "@/components/calls/call-dialog"
import { Customer } from "@/types"

interface CallButtonProps {
  customer: Customer
  clientId: string
  campaignId?: string
}

export function CallButton({ customer, clientId, campaignId }: CallButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setDialogOpen(true)}
      >
        <Phone className="h-4 w-4" />
      </Button>

      <CallDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lead={customer}
        onUpdateLead={async (updates) => {
          // Handle lead updates if needed
        }}
        clientId={clientId}
        campaignId={campaignId}
      />
    </>
  )
}