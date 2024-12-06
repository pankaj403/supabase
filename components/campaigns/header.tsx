import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, Play, Pause, Settings, ChevronLeft } from "lucide-react"
import Link from "next/link"

interface CampaignHeaderProps {
  heading: string
  description?: string
  onOpenSettings: () => void
  clientId: string
  isPaused?: boolean
  onTogglePause?: () => void
}

export function CampaignHeader({ 
  heading, 
  description, 
  onOpenSettings,
  clientId,
  isPaused = false,
  onTogglePause
}: CampaignHeaderProps) {
  return (
    <>
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-2 hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-300"
          asChild
        >
          <Link 
            href={`/clients/${clientId}`} 
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Client
          </Link>
        </Button>
      </div>
      <div className="flex items-center justify-between px-2">
        <div className="grid gap-1">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent relative">
              {heading}
              <div className="absolute inset-0 blur-lg bg-primary/20 -z-10" />
            </h1>
            <Badge 
              variant="default" 
              className="bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm shadow-[0_0_15px_rgba(255,100,0,0.15)]"
            >
              Active
            </Badge>
          </div>
          {description && (
            <p className="text-lg text-muted-foreground/80 tracking-wide">
              {description}
            </p>
          )}
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full animate-pulse mt-2" />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="relative overflow-hidden bg-primary/10 backdrop-blur-sm border border-primary/20 shadow-[0_0_15px_rgba(255,100,0,0.15)] hover:shadow-[0_0_25px_rgba(255,100,0,0.25)] hover:bg-primary/20 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent animate-pulse" />
            <Upload className="mr-2 h-4 w-4" />
            Import Leads
          </Button>
          <Button 
            variant="outline"
            onClick={onOpenSettings}
            className="relative overflow-hidden bg-primary/10 backdrop-blur-sm border border-primary/20 shadow-[0_0_15px_rgba(255,100,0,0.15)] hover:shadow-[0_0_25px_rgba(255,100,0,0.25)] hover:bg-primary/20 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent animate-pulse" />
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button 
            onClick={onTogglePause}
            className="relative overflow-hidden bg-primary/10 backdrop-blur-sm border border-primary/20 shadow-[0_0_15px_rgba(255,100,0,0.15)] hover:shadow-[0_0_25px_rgba(255,100,0,0.25)] hover:bg-primary/20 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent animate-pulse" />
            {isPaused ? (
              <Play className="mr-2 h-4 w-4" />
            ) : (
              <Pause className="mr-2 h-4 w-4" />
            )}
            {isPaused ? "Resume Campaign" : "Pause Campaign"}
          </Button>
        </div>
      </div>
    </>
  )
}