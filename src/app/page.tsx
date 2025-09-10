'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FntzCard, FntzCardHeader, FntzCardTitle, FntzCardDescription, FntzCardContent, FntzMetricCard, FntzPlayerCard } from '@/components/ui/fntz-card'
import { FntzBrandedLoader } from '@/components/ui/fntz-loading'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PageHeader } from '@/components/layout/page-header'
import { cn, getPositionStyles, getInjuryStatusStyles, ANIMATION_CLASSES } from '@/lib/design-system'
import { 
  crossCheckInjuries, 
  getTrendingAdds, 
  getAllRosterPlayers,
  formatInjuryStatus,
  type InjuryData, 
  type TrendingPlayer
} from '@/utils/sleeper'
import { useCurrentRoster } from '@/hooks/useUserData'
import { Activity, TrendingUp, Users, AlertTriangle, BarChart3, Search, Target } from 'lucide-react'

export default function HomePage() {
  const [injuries, setInjuries] = useState<InjuryData[]>([])
  const [trendingPlayers, setTrendingPlayers] = useState<TrendingPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { roster, teamName, leagueName } = useCurrentRoster()
  const totalPlayers = getAllRosterPlayers(roster).length

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const [rosterInjuries, trending] = await Promise.all([
          crossCheckInjuries(getAllRosterPlayers(roster)),
          getTrendingAdds(5)
        ])
        
        setInjuries(rosterInjuries)
        setTrendingPlayers(trending)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
        setError('Failed to load fantasy data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    // Only load data if we have players in the roster
    if (totalPlayers > 0) {
      loadDashboardData()
    } else {
      setLoading(false)
    }
  }, [roster, totalPlayers])

  if (error) {
    return (
      <div className="fntz-container py-10">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Show setup message if no roster is configured
  if (totalPlayers === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
        <PageHeader
          title="Welcome to FNTZ AI"
          description="Your intelligent fantasy football command center"
          size="lg"
        />
        
        <div className="fntz-container fntz-section">
          <div className="max-w-4xl mx-auto fntz-spacing-lg">
            {/* Hero Section */}
            <div className="text-center fntz-spacing-md">
              <div className="mx-auto mb-8">
                <Image
                  src="/logos/logo_full.webp" 
                  alt="FNTZ AI - Fantasy Intelligence" 
                  width={400}
                  height={100}
                  priority
                  className="h-16 md:h-20 lg:h-24 object-contain mx-auto drop-shadow-2xl"
                />
              </div>
              <h2 className="fntz-heading-2 mb-4">Get Started with FNTZ AI</h2>
              <p className="fntz-body text-muted-foreground max-w-2xl mx-auto">
                Import your real Sleeper league or create a manual roster to unlock personalized injury tracking, AI insights, and advanced analytics.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <FntzCard variant="glass" className="text-center p-6">
                <div className="w-12 h-12 rounded-lg fntz-info mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
                <FntzCardTitle level={4}>Import Sleeper Leagues</FntzCardTitle>
                <FntzCardDescription className="mt-2">
                  Connect your existing Sleeper leagues instantly with just your username
                </FntzCardDescription>
              </FntzCard>

              <FntzCard variant="glass" className="text-center p-6">
                <div className="w-12 h-12 rounded-lg fntz-warning mx-auto mb-4 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <FntzCardTitle level={4}>Advanced Analytics</FntzCardTitle>
                <FntzCardDescription className="mt-2">
                  Player comparisons, matchup analysis, and roster optimization tools
                </FntzCardDescription>
              </FntzCard>

              <FntzCard variant="glass" className="text-center p-6">
                <div className="w-12 h-12 rounded-lg fntz-success mx-auto mb-4 flex items-center justify-center">
                  <Activity className="h-6 w-6" />
                </div>
                <FntzCardTitle level={4}>Real-time Updates</FntzCardTitle>
                <FntzCardDescription className="mt-2">
                  Live injury tracking, trending players, and waiver wire intelligence
                </FntzCardDescription>
              </FntzCard>
            </div>

            {/* CTA Section */}
            <FntzCard variant="elevated" className="text-center p-8">
              <FntzCardHeader>
                <FntzCardTitle level={3}>Ready to Start?</FntzCardTitle>
                <FntzCardDescription className="text-lg">
                  Use the <strong className="text-primary">Add League</strong> button in the top-right corner to get started.
                </FntzCardDescription>
              </FntzCardHeader>
              <FntzCardContent>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button asChild size="lg">
                    <Link href="/roster">Create Manual Roster</Link>
                  </Button>
                  <Button variant="outline" asChild size="lg">
                    <Link href="/analytics">Explore Analytics</Link>
                  </Button>
                </div>
              </FntzCardContent>
            </FntzCard>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <PageHeader
        title={`Welcome back${teamName ? `, ${teamName}` : ''}!`}
        description="Your fantasy football command center"
        actions={
          <div className="flex items-center space-x-3">
            <Button variant="outline" asChild>
              <Link href="/analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Link>
            </Button>
            <Button asChild>
              <Link href="/roster">
                <Users className="h-4 w-4 mr-2" />
                My Roster
              </Link>
            </Button>
          </div>
        }
      />

      <div className="fntz-container fntz-section">
        <div className="fntz-spacing-lg">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <FntzMetricCard
              title="Total Players"
              value={totalPlayers}
              subtitle={leagueName || 'My League'}
            />
            <FntzMetricCard
              title="Injuries"
              value={loading ? '...' : injuries.length}
              subtitle="Players affected"
              trend={injuries.length > 0 ? 'down' : 'stable'}
            />
            <FntzMetricCard
              title="Trending"
              value={loading ? '...' : trendingPlayers.length}
              subtitle="Hot pickups"
              trend="up"
            />
            <FntzMetricCard
              title="League"
              value={teamName ? '✓' : '○'}
              subtitle="Status"
              trend={teamName ? 'up' : 'stable'}
            />
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Injury Alerts */}
            <FntzCard variant="default">
              <FntzCardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg fntz-danger flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <FntzCardTitle>Injury Alerts</FntzCardTitle>
                  </div>
                  {injuries.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {injuries.length} Alert{injuries.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </FntzCardHeader>
              <FntzCardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : injuries.length === 0 ? (
                  <div className="fntz-empty-state">
                    <div className="w-12 h-12 rounded-lg fntz-success mx-auto mb-4 flex items-center justify-center">
                      <Activity className="h-6 w-6" />
                    </div>
                    <p className="font-medium text-success mb-2">All Clear!</p>
                    <p className="text-sm">No injury concerns in your roster</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {injuries.slice(0, 4).map((injury) => (
                      <div key={injury.player_id} className="flex items-center justify-between p-3 fntz-surface-1 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium",
                            getPositionStyles(injury.position)
                          )}>
                            {injury.position}
                          </div>
                          <div>
                            <p className="font-medium">{injury.name}</p>
                            <p className="text-sm text-muted-foreground">{injury.team}</p>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            getInjuryStatusStyles(injury.injury_status)
                          )}
                        >
                          {formatInjuryStatus(injury.injury_status)}
                        </Badge>
                      </div>
                    ))}
                    {injuries.length > 4 && (
                      <Button variant="ghost" className="w-full" asChild>
                        <Link href="/roster">
                          View all {injuries.length} injuries →
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </FntzCardContent>
            </FntzCard>

            {/* Trending Players */}
            <FntzCard variant="default">
              <FntzCardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg fntz-success flex items-center justify-center">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <FntzCardTitle>Trending Players</FntzCardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Live Data
                  </Badge>
                </div>
              </FntzCardHeader>
              <FntzCardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Skeleton className="w-8 h-8 rounded-lg" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-12" />
                      </div>
                    ))}
                  </div>
                ) : trendingPlayers.length === 0 ? (
                  <div className="fntz-empty-state">
                    <div className="w-12 h-12 rounded-lg fntz-info mx-auto mb-4 flex items-center justify-center">
                      <Search className="h-6 w-6" />
                    </div>
                    <p className="font-medium mb-2">No Trending Data</p>
                    <p className="text-sm">Check back later for trending players</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trendingPlayers.map((player, index) => (
                      <div key={player.player_id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-muted-foreground w-4">
                              #{index + 1}
                            </span>
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium",
                              getPositionStyles(player.position)
                            )}>
                              {player.position}
                            </div>
                          </div>
                          <div>
                            <p className="font-medium">{player.name}</p>
                            <p className="text-sm text-muted-foreground">{player.team}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-success">+{player.count}</p>
                          <p className="text-xs text-muted-foreground">adds</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </FntzCardContent>
            </FntzCard>
          </div>

          {/* Quick Actions */}
          <FntzCard variant="glass" className="mt-8">
            <FntzCardHeader>
              <FntzCardTitle>Quick Actions</FntzCardTitle>
              <FntzCardDescription>
                Jump to the tools you need most
              </FntzCardDescription>
            </FntzCardHeader>
            <FntzCardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" asChild className="h-auto p-4 flex-col space-y-2">
                  <Link href="/analytics">
                    <Search className="h-6 w-6" />
                    <span className="text-sm">Compare Players</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto p-4 flex-col space-y-2">
                  <Link href="/analytics">
                    <Target className="h-6 w-6" />
                    <span className="text-sm">Matchup Analysis</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto p-4 flex-col space-y-2">
                  <Link href="/roster">
                    <Users className="h-6 w-6" />
                    <span className="text-sm">Edit Roster</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto p-4 flex-col space-y-2">
                  <Link href="/ai">
                    <Activity className="h-6 w-6" />
                    <span className="text-sm">AI Assistant</span>
                  </Link>
                </Button>
              </div>
            </FntzCardContent>
          </FntzCard>
        </div>
      </div>
    </div>
  )
} 