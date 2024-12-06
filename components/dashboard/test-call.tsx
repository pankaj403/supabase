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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Phone } from "lucide-react"
import { useCall } from "@/hooks/use-call"
import { validateAustralianPhone } from "@/lib/utils"
import { toast } from "sonner"

export function TestCall() {
  const [open, setOpen] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  
  const { isLoading, startCall } = useCall({
    onCallStart: (callId) => {
      toast.success("Call initiated successfully", {
        description: `Call ID: ${callId}`,
      })
      setOpen(false)
      setPhoneNumber("")
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsValidating(true)

    try {
      // Check environment variables
      const token = process.env.NEXT_PUBLIC_VAPI_TOKEN
      const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID
      const phoneNumberId = process.env.NEXT_PUBLIC_VAPI_PHONE_NUMBER_ID

      if (!token) {
        throw new Error("Missing VAPI_TOKEN environment variable")
      }

      if (!assistantId) {
        throw new Error("Missing VAPI_ASSISTANT_ID environment variable")
      }

      if (!phoneNumberId) {
        throw new Error("Missing VAPI_PHONE_NUMBER_ID environment variable")
      }
    
      if (!validateAustralianPhone(phoneNumber)) {
        throw new Error("Please enter a valid Australian phone number (+61 or 0 followed by 9 digits)")
      }

      await startCall(phoneNumber)
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : "Failed to initiate call"
      
      toast.error(message)
    } finally {
      setIsValidating(false)
    }
  }

  const handlePhoneChange = (value: string) => {
    // Allow only numbers and basic formatting characters
    const cleaned = value.replace(/[^\d\s+()-]/g, "")
    setPhoneNumber(cleaned)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="relative overflow-hidden bg-primary/10 backdrop-blur-sm border border-primary/20 shadow-[0_0_15px_rgba(255,100,0,0.15)] hover:shadow-[0_0_25px_rgba(255,100,0,0.25)] hover:bg-primary/20 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent animate-pulse" />
          <Phone className="mr-2 h-4 w-4" />
          Test Call
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass-effect">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Make Test Call</DialogTitle>
            <DialogDescription>
              Enter an Australian phone number to test the calling system
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+61 XXX XXX XXX"
                required
                disabled={isLoading || isValidating}
                className="enhanced-input"
              />
              <p className="text-xs text-muted-foreground">
                Format: +61 or 0 followed by 9 digits (e.g., +61412345678 or 0412345678)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isLoading || isValidating || !phoneNumber.trim()}
              className="button-glow"
            >
              {isLoading || isValidating ? (
                <>
                  <Phone className="mr-2 h-4 w-4 animate-pulse" />
                  {isValidating ? "Validating..." : "Calling..."}
                </>
              ) : (
                <>
                  <Phone className="mr-2 h-4 w-4" />
                  Start Call
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}