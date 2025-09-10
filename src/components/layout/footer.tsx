import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur-sm mt-20">
      <div className="fntz-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Brand */}
          <div className="md:col-span-2 space-y-4">
            <Image
              src="/logos/logo_full.webp" 
              alt="FNTZ AI - Fantasy Intelligence" 
              width={200}
              height={48}
              className="h-12 object-contain"
            />
            <p className="text-sm text-muted-foreground max-w-md">
              Your intelligent fantasy football companion. Real-time insights, 
              player analysis, and AI-powered recommendations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Link href="/roster" className="block text-muted-foreground hover:text-foreground transition-colors">
                My Roster
              </Link>
              <Link href="/analytics" className="block text-muted-foreground hover:text-foreground transition-colors">
                Analytics
              </Link>
              <Link href="/ai" className="block text-muted-foreground hover:text-foreground transition-colors">
                AI Chat
              </Link>
              <Link href="/sleeper" className="block text-muted-foreground hover:text-foreground transition-colors">
                Sleeper Data
              </Link>
            </div>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-semibold mb-3">Info</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>© 2024 FNTZ AI</p>
              <p>Fantasy Intelligence</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 