import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Navigation } from '@/components/navigation'
import { Toaster } from '@/components/ui/sonner'
import { ParticleBackground } from '@/components/particle-background'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Intelligent Call Center',
  description: 'Advanced AI-powered CRM system for managing cold-calling campaigns',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <ParticleBackground />
          <div className="relative min-h-screen bg-background/80 backdrop-blur-sm">
            <Navigation />
            <main className="container mx-auto p-4 pt-20 md:p-8 md:pt-24">
              {children}
            </main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}