'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { X, Search, TrendingUp, TrendingDown, Target } from 'lucide-react'
import { searchPlayers, SearchablePlayer } from '@/utils/playerDatabase'
import { formatInjuryStatus } from '@/utils/sleeper'
import { getHoverStyles } from '@/lib/design-system'

interface PlayerComparison {
  player: SearchablePlayer
  fantasyScore?: number
  targetShare?: number
  redZoneTargets?: number
  snapsPercentage?: number
  trend?: 'up' | 'down' | 'stable'
}

const generateMockStats = (player: SearchablePlayer): Omit<PlayerComparison, 'player'> => {
  // Generate realistic mock stats based on position
  const base = Math.random() * 100
  
  switch (player.position) {
    case 'QB':
      return {
        fantasyScore: 15 + Math.random() * 10,
        targetShare: 0, // QBs don't have target share
        redZoneTargets: Math.floor(Math.random() * 5),
        snapsPercentage: 85 + Math.random() * 15,
        trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable'
      }
    case 'RB':
      return {
        fantasyScore: 8 + Math.random() * 12,
        targetShare: 5 + Math.random() * 15,
        redZoneTargets: Math.floor(Math.random() * 8),
        snapsPercentage: 40 + Math.random() * 40,
        trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable'
      }
    case 'WR':
      return {
        fantasyScore: 6 + Math.random() * 14,
        targetShare: 10 + Math.random() * 20,
        redZoneTargets: Math.floor(Math.random() * 6),
        snapsPercentage: 60 + Math.random() * 30,
        trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable'
      }
    case 'TE':
      return {
        fantasyScore: 5 + Math.random() * 10,
        targetShare: 8 + Math.random() * 12,
        redZoneTargets: Math.floor(Math.random() * 4),
        snapsPercentage: 50 + Math.random() * 35,
        trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable'
      }
    default:
      return {
        fantasyScore: 5 + Math.random() * 8,
        targetShare: 0,
        redZoneTargets: 0,
        snapsPercentage: 100,
        trend: 'stable'
      }
  }
}

export function PlayerComparison() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchablePlayer[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<PlayerComparison[]>([])
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const results = await searchPlayers({
        query: query.trim(),
        maxResults: 10
      })
      setSearchResults(results)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const addPlayer = (player: SearchablePlayer) => {
    if (selectedPlayers.length >= 4) return
    if (selectedPlayers.some(p => p.player.player_id === player.player_id)) return

    const playerWithStats: PlayerComparison = {
      player,
      ...generateMockStats(player)
    }

    setSelectedPlayers(prev => [...prev, playerWithStats])
    setSearchQuery('')
    setSearchResults([])
  }

  const removePlayer = (playerId: string) => {
    setSelectedPlayers(prev => prev.filter(p => p.player.player_id !== playerId))
  }

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Target className="h-4 w-4 text-gray-400" />
    }
  }

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return '-'
    return num.toFixed(1)
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search for players to compare..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            disabled={selectedPlayers.length >= 4}
          />
        </div>

        {/* Search Results */}
        {searchQuery && (
          <Card className="max-h-60 overflow-y-auto">
            <CardContent className="p-2">
              {searching ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((player) => (
                    <div
                      key={player.player_id}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer ${getHoverStyles('subtle')}`}
                      onClick={() => addPlayer(player)}
                    >
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{player.position}</Badge>
                        <div>
                          <div className="font-medium">{player.name}</div>
                          <div className="text-sm text-gray-500">{player.team}</div>
                        </div>
                      </div>
                      {player.injury_status && player.injury_status !== 'Healthy' && (
                        <Badge variant="destructive" className="text-xs">
                          {formatInjuryStatus(player.injury_status)}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No players found
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {selectedPlayers.length >= 4 && (
          <Alert>
            <AlertDescription>
              Maximum of 4 players can be compared at once.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Comparison Grid */}
      {selectedPlayers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {selectedPlayers.map((comparison) => (
            <Card key={comparison.player.player_id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{comparison.player.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{comparison.player.position}</Badge>
                      <Badge variant="secondary">{comparison.player.team}</Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePlayer(comparison.player.player_id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {comparison.player.injury_status && comparison.player.injury_status !== 'Healthy' && (
                  <Badge variant="destructive" className="w-fit">
                    {formatInjuryStatus(comparison.player.injury_status)}
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Fantasy Score */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Avg Points</Label>
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold">{formatNumber(comparison.fantasyScore)}</span>
                    {getTrendIcon(comparison.trend)}
                  </div>
                </div>

                {/* Position-specific metrics */}
                {comparison.player.position !== 'QB' && comparison.player.position !== 'K' && comparison.player.position !== 'DEF' && (
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Target Share</Label>
                    <span className="font-semibold">{formatNumber(comparison.targetShare)}%</span>
                  </div>
                )}

                {(comparison.player.position === 'RB' || comparison.player.position === 'WR' || comparison.player.position === 'TE') && (
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">RZ Targets</Label>
                    <span className="font-semibold">{comparison.redZoneTargets}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Snap %</Label>
                  <span className="font-semibold">{formatNumber(comparison.snapsPercentage)}%</span>
                </div>

                {/* Depth Chart Position */}
                {comparison.player.depth_chart_order && (
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Depth Chart</Label>
                    <span className="font-semibold">#{comparison.player.depth_chart_order}</span>
                  </div>
                )}

                {/* Age */}
                {comparison.player.age && (
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Age</Label>
                    <span className="font-semibold">{comparison.player.age}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedPlayers.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No players selected</p>
              <p className="text-sm">Search and select players above to start comparing</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 