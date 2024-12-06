"use client"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col gap-8">
      <div className="flex-1 space-y-4 pt-4">{children}</div>
    </div>
  )
}