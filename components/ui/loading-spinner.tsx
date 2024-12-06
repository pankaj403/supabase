export function LoadingSpinner() {
  return (
    <div className="flex min-h-screen flex-col gap-8">
      <div className="flex-1 space-y-4 pt-4 relative z-10">
        <div className="container mx-auto px-4">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="h-12 w-48 bg-primary/5 animate-pulse rounded-lg" />
              <div className="h-6 w-96 bg-primary/5 animate-pulse rounded-lg" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-primary/5 animate-pulse rounded-lg" />
              ))}
            </div>
            <div className="h-96 bg-primary/5 animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
