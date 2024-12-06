import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Brain } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <Brain className="h-16 w-16 text-primary mb-4 animate-float" />
      <h1 className="text-4xl font-bold mb-2">404 - Not Found</h1>
      <p className="text-muted-foreground mb-6">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild>
        <Link href="/">Return to Dashboard</Link>
      </Button>
    </div>
  )
}