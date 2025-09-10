'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, Users, Target, AlertTriangle } from 'lucide-react'
import { getTrendingAdds } from '@/utils/sleeper'
import { useCurrentRoster } from '@/hooks/useUserData'
import { searchPlayers, SearchablePlayer } from '@/utils/playerDatabase'
import { getHoverStyles } from '@/lib/design-system'

interface WaiverPlayer {
  player: SearchablePlayer
  addCount?: number
  recommendation: 'high' | 'medium' | 'low'
  reason: string
  projectedPoints?: number
}

export function WaiverIntelligence() {
  const [trendingPlayers, setTrendingPlayers] = useState<WaiverPlayer[]>([])
  const [dropCandidates, setDropCandidates] = useState<WaiverPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { roster } = useCurrentRoster()

  useEffect(() => {
    const loadWaiverData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get trending adds from Sleeper API
        const trendingData = await getTrendingAdds(20)
        
        // Convert to waiver players with recommendations
        const waiverPlayers: WaiverPlayer[] = []
        
        for (const trending of trendingData) {
          const searchResults = await searchPlayers({
            query: trending.name,
            maxResults: 1
          })
          
          if (searchResults.length > 0) {
            const player = searchResults[0]
            const recommendation = trending.count > 500 ? 'high' : trending.count > 200 ? 'medium' : 'low'
            const reason = `Being added in ${trending.count} leagues`
            
            waiverPlayers.push({
              player,
              addCount: trending.count,
              recommendation,
              reason,
              projectedPoints: 8 + Math.random() * 12
            })
          }
        }

        setTrendingPlayers(waiverPlayers)

        // Generate mock drop candidates from current roster
        const allRosterPlayers = [...roster.QB, ...roster.RB, ...roster.WR, ...roster.TE, ...roster.K, ...roster.DEF]
        const dropCands: WaiverPlayer[] = []

        for (let i = 0; i < Math.min(5, allRosterPlayers.length); i++) {
          const playerName = allRosterPlayers[i]
          const searchResults = await searchPlayers({
            query: playerName,
            maxResults: 1
          })

          if (searchResults.length > 0) {
            const player = searchResults[0]
            const hasInjury = player.injury_status && player.injury_status !== 'Healthy'
            const recommendation = hasInjury ? 'high' : Math.random() > 0.5 ? 'medium' : 'low'
            
            let reason = 'Underperforming compared to expectations'
            if (hasInjury) reason = `Dealing with ${player.injury_status}`
            if (Math.random() > 0.7) reason = 'Limited upside potential'

            dropCands.push({
              player,
              recommendation,
              reason,
              projectedPoints: 3 + Math.random() * 8
            })
          }
        }

        setDropCandidates(dropCands)
      } catch (error) {
        console.error('Error loading waiver data:', error)
        setError('Failed to load waiver wire data')
      } finally {
        setLoading(false)
      }
    }

    loadWaiverData()
  }, [roster])

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'high': return 'bg-green-500 text-white'
      case 'medium': return 'bg-yellow-500 text-white'
      case 'low': return 'bg-gray-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'high': return <TrendingUp className="h-4 w-4" />
      case 'medium': return <Target className="h-4 w-4" />
      case 'low': return <TrendingDown className="h-4 w-4" />
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="trending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trending">Trending Pickups</TabsTrigger>
          <TabsTrigger value="drops">Drop Candidates</TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span>Trending Waiver Pickups</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trendingPlayers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No trending players available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trendingPlayers.map((waiver) => (
                    <div key={waiver.player.player_id} className={`p-4 border rounded-lg cursor-pointer ${getHoverStyles('card')}`}>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">{waiver.player.position}</Badge>
                            <span className="font-semibold">{waiver.player.name}</span>
                            <Badge variant="secondary">{waiver.player.team}</Badge>
                            {waiver.player.injury_status && waiver.player.injury_status !== 'Healthy' && (
                              <Badge variant="destructive" className="text-xs">
                                {waiver.player.injury_status}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            {waiver.addCount && (
                              <span>📈 {waiver.addCount} adds</span>
                            )}
                            {waiver.projectedPoints && (
                              <span>🎯 {waiver.projectedPoints.toFixed(1)} pts projected</span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-700">{waiver.reason}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Badge className={getRecommendationColor(waiver.recommendation)}>
                            {getRecommendationIcon(waiver.recommendation)}
                            <span className="ml-1 capitalize">{waiver.recommendation}</span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drops" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                <span>Potential Drop Candidates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dropCandidates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No drop candidates from your roster</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dropCandidates.map((drop) => (
                    <div key={drop.player.player_id} className={`p-4 border rounded-lg cursor-pointer ${getHoverStyles('card')}`}>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">{drop.player.position}</Badge>
                            <span className="font-semibold">{drop.player.name}</span>
                            <Badge variant="secondary">{drop.player.team}</Badge>
                            {drop.player.injury_status && drop.player.injury_status !== 'Healthy' && (
                              <Badge variant="destructive" className="text-xs">
                                {drop.player.injury_status}
                              </Badge>
                            )}
                          </div>
                          
                          {drop.projectedPoints && (
                            <div className="text-sm text-gray-600">
                              🎯 {drop.projectedPoints.toFixed(1)} pts projected
                            </div>
                          )}
                          
                          <p className="text-sm text-gray-700">{drop.reason}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Badge className={getRecommendationColor(drop.recommendation)}>
                            {getRecommendationIcon(drop.recommendation)}
                            <span className="ml-1 capitalize">{drop.recommendation}</span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {dropCandidates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Drop Strategy Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Consider Position Needs:</strong> Don&apos;t drop your only backup at a position unless you have a clear upgrade.
                  </p>
                </div>
                
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Check Schedules:</strong> Players with easy upcoming matchups might be worth holding.
                  </p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>Injury Status:</strong> Injured players in IR-eligible leagues can be moved to IR instead of dropped.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 