"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/design-system"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LeagueSwitcher } from '@/components/league/LeagueSwitcher'

const navigation = [
  { name: 'Home', href: '/', icon: '🏠' },
  { name: 'AI Chat', href: '/ai', icon: '🤖' },
  { name: 'My Roster', href: '/roster', icon: '👥' },
  { name: 'Analytics', href: '/analytics', icon: '📊', badge: 'NEW' },
  { name: 'Sleeper Data', href: '/sleeper', icon: '📱' },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <div className="fntz-container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="flex items-center space-x-2">
                <Image
                  src="/logos/logo_icon_64x64.png" 
                  alt="FNTZ AI" 
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                />
                <div className="hidden sm:block">
                  <span className="fntz-heading-4 fntz-text-gradient">
                    FNTZ AI
                  </span>
                  <p className="text-xs text-muted-foreground -mt-1">
                    Fantasy Intelligence
                  </p>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-primary/10 text-primary border border-primary/20" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.name}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs h-5 px-2">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* League Switcher */}
            <div className="hidden sm:block">
              <LeagueSwitcher />
            </div>

            {/* Mobile Menu Toggle - Could add later if needed */}
            <div className="sm:hidden">
              <LeagueSwitcher />
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-border/40 bg-surface-1/50">
          <nav className="flex items-center justify-between p-2 space-x-1 overflow-x-auto scrollbar-hide">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center space-y-1 px-3 py-2 rounded-md text-xs font-medium min-w-fit transition-all duration-200",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <div className="relative">
                    <span className="text-lg">{item.icon}</span>
                    {item.badge && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
} 