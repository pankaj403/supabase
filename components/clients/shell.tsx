interface ClientShellProps {
  children: React.ReactNode
}

export function ClientShell({ children }: ClientShellProps) {
  return (
    <div className="flex min-h-screen flex-col gap-8">
      <div className="flex-1 space-y-4 pt-4 relative z-10">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </div>
    </div>
  )
}