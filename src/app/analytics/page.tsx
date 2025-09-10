'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { FntzCard, FntzCardHeader, FntzCardTitle, FntzCardDescription, FntzCardContent, FntzMetricCard } from '@/components/ui/fntz-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/design-system'
import { PlayerComparison } from '@/components/analytics/player-comparison'
import { MatchupAnalysis } from '@/components/analytics/matchup-analysis'
import { RosterAnalytics } from '@/components/analytics/roster-analytics'
import { WaiverIntelligence } from '@/components/analytics/waiver-intelligence'
import { useUserData } from '@/hooks/useUserData'
import { BarChart3, Users, Search, TrendingUp, Target, Award } from 'lucide-react'

type AnalyticsSection = 'overview' | 'comparison' | 'matchups' | 'roster' | 'waivers'

const analyticsTools = [
  {
    id: 'comparison' as const,
    name: 'Player Comparison',
    description: 'Compare players side-by-side with advanced metrics',
    icon: Search,
    color: 'fntz-info',
    popular: true
  },
  {
    id: 'matchups' as const,
    name: 'Matchup Analysis', 
    description: 'Start/sit decisions based on opponent strength',
    icon: Target,
    color: 'fntz-warning',
    popular: true
  },
  {
    id: 'roster' as const,
    name: 'Roster Analytics',
    description: 'Deep dive into your team strengths and weaknesses',
    icon: BarChart3,
    color: 'fntz-success',
    popular: false
  },
  {
    id: 'waivers' as const,
    name: 'Waiver Intelligence',
    description: 'Trending pickups and drop candidates',
    icon: TrendingUp,
    color: 'fntz-danger',
    popular: true
  }
]

export default function AnalyticsPage() {
  const [activeSection, setActiveSection] = useState<AnalyticsSection>('overview')
  const { currentLeague } = useUserData()
  const leagueKey = currentLeague?.id || 'no-league'

  const renderOverview = () => (
    <div className="fntz-spacing-lg">
      {/* Hero Section */}
      <div className="text-center fntz-spacing-md">
        <div className="mx-auto w-16 h-16 rounded-2xl fntz-gradient flex items-center justify-center mb-6 shadow-lg">
          <BarChart3 className="h-8 w-8 text-black" />
        </div>
        <h2 className="fntz-heading-2 mb-4">Fantasy Intelligence Hub</h2>
        <p className="fntz-body text-muted-foreground max-w-2xl mx-auto">
          Make smarter fantasy decisions with data-driven insights. Compare players, analyze matchups, optimize your roster, and discover waiver gems.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <FntzMetricCard
          title="Tools Available"
          value="4"
          subtitle="Analytics Tools"
        />
        <FntzMetricCard
          title="Data Sources"
          value="2"
          subtitle="APIs Connected"
        />
        <FntzMetricCard
          title="Player Database"
          value="2000+"
          subtitle="NFL Players"
        />
        <FntzMetricCard
          title="Live Updates"
          value="Real-time"
          subtitle="Injury & Trends"
        />
      </div>

      {/* Main Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analyticsTools.map((tool) => (
          <FntzCard 
            key={tool.id}
            variant="interactive" 
            className="group cursor-pointer"
            onClick={() => setActiveSection(tool.id)}
          >
            <FntzCardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      tool.color
                    )}>
                      <tool.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <FntzCardTitle className="group-hover:text-primary transition-colors">
                        {tool.name}
                      </FntzCardTitle>
                      {tool.popular && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          Popular
                        </Badge>
                      )}
                    </div>
                  </div>
                  <FntzCardDescription>
                    {tool.description}
                  </FntzCardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Open →
                </Button>
              </div>
            </FntzCardHeader>
          </FntzCard>
        ))}
      </div>

      {/* Quick Access Section */}
      <FntzCard variant="glass" className="mt-8">
        <FntzCardHeader>
          <FntzCardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-primary" />
            <span>Pro Tips</span>
          </FntzCardTitle>
        </FntzCardHeader>
        <FntzCardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="fntz-info p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Start with Player Comparison</h4>
            <p className="text-sm">Compare your key players before making start/sit decisions.</p>
          </div>
          <div className="fntz-warning p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Check Weekly Matchups</h4>
            <p className="text-sm">Analyze opponent defenses to optimize your lineup.</p>
          </div>
          <div className="fntz-success p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Monitor Waiver Wire</h4>
            <p className="text-sm">Stay ahead with trending players and drop candidates.</p>
          </div>
        </FntzCardContent>
      </FntzCard>
    </div>
  )

  const renderToolSection = () => {
    const currentTool = analyticsTools.find(tool => tool.id === activeSection)
    
    return (
      <div className="fntz-spacing-md">
        {/* Tool Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => setActiveSection('overview')}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Back to Overview
            </Button>
            <div className="flex items-center space-x-3">
              {currentTool && (
                <>
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    currentTool.color
                  )}>
                    <currentTool.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="fntz-heading-3">{currentTool.name}</h2>
                    <p className="fntz-body-small">{currentTool.description}</p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {analyticsTools.map((tool) => (
              <Button
                key={tool.id}
                variant={activeSection === tool.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSection(tool.id)}
                className="hidden md:flex"
              >
                <tool.icon className="h-4 w-4 mr-2" />
                {tool.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Tool Content */}
        <div>
          {activeSection === 'comparison' && <PlayerComparison key={`comparison-${leagueKey}`} />}
          {activeSection === 'matchups' && <MatchupAnalysis key={`matchups-${leagueKey}`} />}
          {activeSection === 'roster' && <RosterAnalytics key={`roster-${leagueKey}`} />}
          {activeSection === 'waivers' && <WaiverIntelligence key={`waivers-${leagueKey}`} />}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <PageHeader
        title="Analytics"
        description="Advanced fantasy football intelligence and insights"
        size="lg"
        actions={
          activeSection !== 'overview' && (
            <Button 
              variant="outline" 
              onClick={() => setActiveSection('overview')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </Button>
          )
        }
      />

      <div className="fntz-container fntz-section">
        {activeSection === 'overview' ? renderOverview() : renderToolSection()}
      </div>
    </div>
  )
} 