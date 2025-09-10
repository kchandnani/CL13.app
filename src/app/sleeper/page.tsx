'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PageHeader } from '@/components/layout/page-header'
import { 
  getInjuries, 
  getTrendingAdds, 
  crossCheckInjuries,
  getAllRosterPlayers,
  formatInjuryStatus,
  type InjuryData, 
  type TrendingPlayer
} from '@/utils/sleeper'
import { useCurrentRoster } from '@/hooks/useUserData'

export default function SleeperPage() {
  const [allInjuries, setAllInjuries] = useState<InjuryData[]>([])
  const [rosterInjuries, setRosterInjuries] = useState<InjuryData[]>([])
  const [trendingPlayers, setTrendingPlayers] = useState<TrendingPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { roster, teamName, leagueName } = useCurrentRoster()

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [injuries, trending, myInjuries] = await Promise.all([
        getInjuries(),
        getTrendingAdds(25),
        crossCheckInjuries(getAllRosterPlayers(roster))
      ])
      
      setAllInjuries(injuries)
      setTrendingPlayers(trending)
      setRosterInjuries(myInjuries)
    } catch (err) {
      console.error('Failed to load Sleeper data:', err)
      setError('Failed to load data from Sleeper API. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [roster])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredInjuries = allInjuries.filter(injury =>
    (injury.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (injury.team?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (injury.position?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  if (error) {
    return (
      <div className="container max-w-screen-2xl px-6 py-10">
        <PageHeader title="Sleeper Data" description="Real-time NFL fantasy football insights" />
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container max-w-screen-2xl px-6 py-10" key={`${teamName}-${leagueName}`}>
      <PageHeader
        title="Sleeper Data"
        description={`Real-time NFL insights for ${teamName} in ${leagueName}`}
      />

      <Tabs defaultValue="my-roster" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-roster">My Roster Injuries</TabsTrigger>
          <TabsTrigger value="all-injuries">All NFL Injuries</TabsTrigger>
          <TabsTrigger value="trending">Trending Adds</TabsTrigger>
        </TabsList>

        {/* My Roster Injuries Tab */}
        <TabsContent value="my-roster">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                ⚠️ Your Roster Injuries
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadData}
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </CardTitle>
              <CardDescription>
                Injury status for players on your {teamName} roster
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : rosterInjuries.length > 0 ? (
                <div className="space-y-3">
                  {rosterInjuries.map((injury) => (
                    <div key={injury.player_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-lg">{injury.name}</div>
                        <div className="text-sm text-muted-foreground">{injury.position} • {injury.team}</div>
                        {injury.injury_notes && (
                          <div className="text-sm text-orange-600 mt-1">{injury.injury_notes}</div>
                        )}
                      </div>
                      <Badge variant="destructive">
                        {formatInjuryStatus(injury.injury_status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-xl font-medium mb-2">No Injuries!</h3>
                  <p className="text-muted-foreground">
                    All players on your roster are currently healthy
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rest of the component remains the same... */}
        <TabsContent value="all-injuries">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                🏥 All NFL Injuries
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadData}
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </CardTitle>
              <CardDescription>
                Current injury reports for all NFL players
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Search by player name, team, or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(10)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Player</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Team</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInjuries.slice(0, 50).map((injury) => (
                          <TableRow key={injury.player_id}>
                            <TableCell className="font-medium">{injury.name}</TableCell>
                            <TableCell>{injury.position}</TableCell>
                            <TableCell>{injury.team}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {formatInjuryStatus(injury.injury_status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {injury.injury_notes || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {filteredInjuries.length > 50 && (
                      <div className="p-4 text-center text-sm text-muted-foreground border-t">
                        Showing first 50 of {filteredInjuries.length} injured players
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                🔥 Trending Adds
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadData}
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </CardTitle>
              <CardDescription>
                Most added players across fantasy leagues in the last 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Skeleton className="h-8 w-8 rounded" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {trendingPlayers.map((player, index) => (
                    <div key={player.player_id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="w-8 h-8 text-xs justify-center">
                          #{index + 1}
                        </Badge>
                        <div>
                          <div className="font-medium">{player.name}</div>
                          <div className="text-sm text-muted-foreground">{player.position} • {player.team}</div>
                        </div>
                      </div>
                      <Badge className="fntz-gradient text-black">
                        {player.count} adds
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 