import Link from 'next/link'

export function Navigation() {
  return (
    <header className="fixed top-0 z-[100] w-full border-b border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="https://website.com" className="flex items-center gap-1 group ml-8">
          <span className="font-bold text-lg bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent animate-glow">
            Command Centre
          </span>
        </Link>
      </div>
    </header>
  )
}