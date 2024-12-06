"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CallHistory } from "@/components/calls/call-history"
import { formatPhoneNumber } from "@/lib/utils"

interface CallHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  phoneNumber: string
}

export function CallHistoryDialog({
  open,
  onOpenChange,
  phoneNumber,
}: CallHistoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Call History for {formatPhoneNumber(phoneNumber)}</DialogTitle>
        </DialogHeader>
        <CallHistory phoneNumber={phoneNumber} limit={20} />
      </DialogContent>
    </Dialog>
  )
}