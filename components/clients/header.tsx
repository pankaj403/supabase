import { Button } from "@/components/ui/button"
import { PlusCircle, ChevronLeft } from "lucide-react"
import { useState } from "react"
import { CampaignDialog } from "./campaign-dialog"
import Link from "next/link"

interface ClientHeaderProps {
  heading: string
  description?: string
  clientId: string
}

export function ClientHeader({ heading, description, clientId }: ClientHeaderProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-2 hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-300"
          asChild
        >
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      <div className="flex items-center justify-between px-2">
        <div className="grid gap-1">
          <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent relative">
            {heading}
            <div className="absolute inset-0 blur-lg bg-primary/20 -z-10" />
          </h1>
          {description && (
            <p className="text-lg text-muted-foreground/80 tracking-wide">
              {description}
            </p>
          )}
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full animate-pulse mt-2" />
        </div>
        <Button 
          onClick={() => setDialogOpen(true)}
          className="relative overflow-hidden bg-primary/10 backdrop-blur-sm border border-primary/20 shadow-[0_0_15px_rgba(255,100,0,0.15)] hover:shadow-[0_0_25px_rgba(255,100,0,0.25)] hover:bg-primary/20 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent animate-pulse" />
          <PlusCircle className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      <CampaignDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        clientId={clientId}
      />
    </>
  )
}