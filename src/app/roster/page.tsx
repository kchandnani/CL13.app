'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/layout/page-header'
import { RosterEditor } from '@/components/roster/RosterEditor'
import { 
  crossCheckInjuries,
  formatInjuryStatus,
  type InjuryData
} from '@/utils/sleeper'
import { useCurrentRoster, useUserData } from '@/hooks/useUserData'
import { Edit, Eye } from 'lucide-react'

export default function RosterPage() {
  const [injuries, setInjuries] = useState<InjuryData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { currentLeague } = useUserData()
  const { roster, teamName, leagueName, source } = useCurrentRoster()
  
  const isManualRoster = currentLeague?.source === 'manual'

  const loadRosterData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get all roster players
      const allPlayers: string[] = []
      Object.values(roster).forEach(positionPlayers => {
        allPlayers.push(...positionPlayers)
      })
      
      if (allPlayers.length > 0) {
        const rosterInjuries = await crossCheckInjuries(allPlayers)
        setInjuries(rosterInjuries)
      }
    } catch (err) {
      console.error('Failed to load roster data:', err)
      setError('Failed to load injury data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [roster])

  useEffect(() => {
    loadRosterData()
  }, [loadRosterData])

  const getPositionIcon = (position: string) => {
    const icons = {
      QB: '🏈',
      RB: '🏃',
      WR: '🙌',
      TE: '💪',
      K: '🦵',
      DEF: '🛡️'
    }
    return icons[position as keyof typeof icons] || '👤'
  }

  const getPositionStats = () => {
    const stats = Object.entries(roster).map(([position, players]) => ({
      position,
      count: players.length,
             injured: injuries.filter(injury => 
         players.some((player: string) => player.toLowerCase() === injury.name.toLowerCase())
       ).length
    }))
    
    const totalPlayers = stats.reduce((sum, stat) => sum + stat.count, 0)
    const totalInjured = stats.reduce((sum, stat) => sum + stat.injured, 0)
    
    return { stats, totalPlayers, totalInjured }
  }

  const { stats, totalPlayers, totalInjured } = getPositionStats()

  if (error) {
    return (
      <div className="container max-w-screen-2xl px-6 py-10">
        <PageHeader title="My Roster" description="Manage your fantasy football team" />
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Show setup message if no roster is configured
  if (totalPlayers === 0) {
    return (
      <div className="container max-w-screen-2xl px-6 py-10">
        <PageHeader
          title="My Roster" 
          description="Manage your fantasy football team"
        />
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">👥 No Roster Found</CardTitle>
            <CardDescription>
              Set up your roster to start managing your team
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Import your Sleeper league or create a manual roster to view and manage your players here.
            </p>
            <div className="text-sm text-muted-foreground">
              Use the <strong>Add League</strong> button in the navigation to get started.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-screen-2xl px-6 py-10" key={currentLeague?.id || 'no-league'}>
      <PageHeader
        title="My Roster"
        description={`Manage your ${teamName} roster in ${leagueName}`}
        actions={
          <div className="flex items-center space-x-3">
            <Badge variant={source === 'sleeper' ? 'outline' : 'secondary'}>
              {source === 'sleeper' ? '📱 Sleeper' : '✏️ Manual'}
            </Badge>
            <Button onClick={loadRosterData} disabled={loading} variant="outline">
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        }
      />

      {/* Main Content */}
      <Tabs defaultValue="view" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="view" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            View Roster
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center gap-2" disabled={!isManualRoster}>
            <Edit className="h-4 w-4" />
            Edit Roster {!isManualRoster && '(Manual only)'}
          </TabsTrigger>
        </TabsList>

        {/* View Tab */}
        <TabsContent value="view" className="space-y-6">
          {/* Roster Summary */}
          <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPlayers}</div>
            <p className="text-xs text-muted-foreground">Across all positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Injured</CardTitle>
            <span className="text-2xl">🏥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{totalInjured}</div>
            <p className="text-xs text-muted-foreground">Players with injury status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Rate</CardTitle>
            <span className="text-2xl">💪</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {totalPlayers > 0 ? Math.round(((totalPlayers - totalInjured) / totalPlayers) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Healthy players</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Source</CardTitle>
            <span className="text-2xl">{source === 'sleeper' ? '⬇️' : '✏️'}</span>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold capitalize">{source}</div>
            <p className="text-xs text-muted-foreground">
              {source === 'sleeper' ? 'From Sleeper API' : 'Manual entry'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Roster by Position */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ position, count, injured }) => (
          <Card key={position}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getPositionIcon(position)}</span>
                  <span>{position}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{count} players</Badge>
                  {injured > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {injured} injured
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {roster[position as keyof typeof roster].length > 0 ? (
                <div className="space-y-2">
                  {roster[position as keyof typeof roster].map((player: string) => {
                    const playerInjury = injuries.find(
                      injury => injury.name.toLowerCase() === player.toLowerCase()
                    )
                    
                    return (
                      <div 
                        key={player} 
                        className={`flex items-center justify-between p-3 border rounded-lg ${
                          playerInjury ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' : ''
                        }`}
                      >
                        <div>
                          <div className="font-medium">{player}</div>
                          {playerInjury && (
                            <div className="text-xs text-red-600 dark:text-red-400">
                              {playerInjury.injury_notes || 'Injury reported'}
                            </div>
                          )}
                        </div>
                        {playerInjury && (
                          <Badge variant="destructive" className="text-xs">
                            {formatInjuryStatus(playerInjury.injury_status)}
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-2xl mb-2">➕</div>
                  <p className="text-sm">No players at {position}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Roster Actions */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>⚙️ Roster Actions</CardTitle>
            <CardDescription>Manage your roster and get insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button 
                variant="outline" 
                onClick={loadRosterData}
                disabled={loading}
                className="h-16 flex-col space-y-1"
              >
                <span className="text-xl">🔄</span>
                <span className="text-sm">{loading ? 'Refreshing...' : 'Refresh Injuries'}</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-16 flex-col space-y-1"
                disabled={true}
              >
                <span className="text-xl">✏️</span>
                <span className="text-sm">Edit Roster</span>
                <span className="text-xs text-muted-foreground">Coming Soon</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-16 flex-col space-y-1"
                disabled={true}
              >
                <span className="text-xl">📊</span>
                <span className="text-sm">Export Data</span>
                <span className="text-xs text-muted-foreground">Coming Soon</span>
              </Button>
            </div>
          </CardContent>
          </Card>
        </div>
        </TabsContent>

        {/* Edit Tab */}
        <TabsContent value="edit">
          <RosterEditor />
        </TabsContent>
      </Tabs>
    </div>
  )
} 