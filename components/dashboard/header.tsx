"use client"

import { Brain } from "lucide-react"

interface DashboardHeaderProps {
  heading: string
  description?: string
  children?: React.ReactNode
}

export function DashboardHeader({
  heading,
  description,
  children
}: DashboardHeaderProps) {
  return (
    <div className="relative px-2 pt-2 pb-6">
      {/* Content */}
      <div className="relative flex flex-col items-center justify-center text-center space-y-4">
        <h1 className="font-heading text-6xl font-bold tracking-tight bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent relative z-[200] leading-tight">
          Command Centre
        </h1>
        
        <div className="h-1 w-48 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full animate-pulse z-10" />
        
        <p className="text-lg text-muted-foreground max-w-2xl">
          {description || "Real-time campaign monitoring and client management"}
        </p>

        {children}

        <Brain className="h-12 w-12 text-primary animate-float mt-4 mb-2" />
      </div>

      {/* Animated Border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-border-glow" />
    </div>
  )
}