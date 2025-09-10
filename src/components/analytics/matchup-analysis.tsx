'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Shield, Star, AlertTriangle } from 'lucide-react'
import { searchPlayers, SearchablePlayer, NFL_TEAMS } from '@/utils/playerDatabase'
import { useCurrentRoster } from '@/hooks/useUserData'
import { getAllRosterPlayers } from '@/utils/sleeper'
import { getHoverStyles } from '@/lib/design-system'

interface MatchupData {
  player: SearchablePlayer
  opponent: string
  difficulty: 'easy' | 'medium' | 'hard'
  projectedPoints: number
  confidence: number
  recommendation: 'start' | 'sit' | 'flex'
  notes: string[]
}

const generateMatchupData = (player: SearchablePlayer, opponent: string): MatchupData => {
  const difficulties = ['easy', 'medium', 'hard'] as const
  const recommendations = ['start', 'sit', 'flex'] as const
  
  const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)]
  const basePoints = player.position === 'QB' ? 18 : player.position === 'RB' ? 12 : player.position === 'WR' ? 10 : 8
  
  let projectedPoints = basePoints
  let confidence = 75
  let recommendation: 'start' | 'sit' | 'flex' = 'start'
  const notes: string[] = []

  switch (difficulty) {
    case 'easy':
      projectedPoints = basePoints * (1.2 + Math.random() * 0.3)
      confidence = 85 + Math.random() * 10
      recommendation = 'start'
      notes.push(`${opponent} allows high fantasy points to ${player.position}s`)
      break
    case 'medium':
      projectedPoints = basePoints * (0.9 + Math.random() * 0.2)
      confidence = 65 + Math.random() * 20
      recommendation = Math.random() > 0.5 ? 'start' : 'flex'
      notes.push(`${opponent} has average defense against ${player.position}s`)
      break
    case 'hard':
      projectedPoints = basePoints * (0.6 + Math.random() * 0.3)
      confidence = 45 + Math.random() * 20
      recommendation = Math.random() > 0.7 ? 'flex' : 'sit'
      notes.push(`${opponent} has strong defense against ${player.position}s`)
      break
  }

  if (player.injury_status && player.injury_status !== 'Healthy') {
    projectedPoints *= 0.8
    confidence -= 15
    notes.push(`Player dealing with ${player.injury_status}`)
  }

  return {
    player,
    opponent,
    difficulty,
    projectedPoints: Math.round(projectedPoints * 10) / 10,
    confidence: Math.round(confidence),
    recommendation,
    notes
  }
}

export function MatchupAnalysis() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchablePlayer[]>([])
  const [selectedOpponent, setSelectedOpponent] = useState<string>('')
  const [matchups, setMatchups] = useState<MatchupData[]>([])
  const [showRosterOnly, setShowRosterOnly] = useState(true)
  const [searching, setSearching] = useState(false)

  const { roster } = useCurrentRoster()
  const rosterPlayers = getAllRosterPlayers(roster)

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim() || showRosterOnly) {
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
  }, [showRosterOnly])

  const analyzePlayer = async (player: SearchablePlayer) => {
    if (!selectedOpponent) return

    const matchupData = generateMatchupData(player, selectedOpponent)
    setMatchups(prev => {
      const filtered = prev.filter(m => m.player.player_id !== player.player_id)
      return [...filtered, matchupData]
    })
  }

  const analyzeRoster = async () => {
    if (!selectedOpponent || rosterPlayers.length === 0) return

    const rosterMatchups: MatchupData[] = []
    
    for (const playerName of rosterPlayers) {
      try {
        const results = await searchPlayers({
          query: playerName,
          maxResults: 1
        })
        
        if (results.length > 0) {
          const matchupData = generateMatchupData(results[0], selectedOpponent)
          rosterMatchups.push(matchupData)
        }
      } catch (error) {
        console.error(`Error analyzing ${playerName}:`, error)
      }
    }

    setMatchups(rosterMatchups)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'start': return 'bg-green-500'
      case 'flex': return 'bg-yellow-500'
      case 'sit': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, showRosterOnly, handleSearch])

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Opponent Team</label>
            <Select value={selectedOpponent} onValueChange={setSelectedOpponent}>
              <SelectTrigger>
                <SelectValue placeholder="Select opponent..." />
              </SelectTrigger>
              <SelectContent>
                {NFL_TEAMS.map(team => (
                  <SelectItem key={team} value={team}>{team}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button 
              onClick={analyzeRoster}
              disabled={!selectedOpponent || rosterPlayers.length === 0}
              className="w-full"
            >
              Analyze My Roster
            </Button>
          </div>
        </div>

        {!showRosterOnly && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for specific players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            variant={showRosterOnly ? 'default' : 'outline'}
            onClick={() => setShowRosterOnly(true)}
          >
            My Roster
          </Button>
          <Button
            variant={!showRosterOnly ? 'default' : 'outline'}
            onClick={() => setShowRosterOnly(false)}
          >
            Search Players
          </Button>
        </div>

        {/* Search Results */}
        {!showRosterOnly && searchQuery && searchResults.length > 0 && (
          <Card className="max-h-40 overflow-y-auto">
            <CardContent className="p-2">
              <div className="space-y-1">
                {searchResults.map((player) => (
                  <div
                    key={player.player_id}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer ${getHoverStyles('subtle')}`}
                    onClick={() => analyzePlayer(player)}
                  >
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{player.position}</Badge>
                      <div>
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm text-gray-500">{player.team}</div>
                      </div>
                    </div>
                    <Button size="sm" disabled={!selectedOpponent}>
                      Analyze
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Matchup Results */}
      {matchups.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Matchup Analysis vs {selectedOpponent}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchups
              .sort((a, b) => b.projectedPoints - a.projectedPoints)
              .map((matchup) => (
                <Card key={matchup.player.player_id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{matchup.player.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{matchup.player.position}</Badge>
                          <Badge variant="secondary">{matchup.player.team}</Badge>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${getRecommendationColor(matchup.recommendation)}`} />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Projected Points</span>
                      <span className="font-bold text-lg">{matchup.projectedPoints}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Confidence</span>
                      <span className="font-semibold">{matchup.confidence}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Difficulty</span>
                      <Badge className={getDifficultyColor(matchup.difficulty)}>
                        {matchup.difficulty}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Recommendation</span>
                      <Badge variant="outline" className="capitalize">
                        {matchup.recommendation}
                      </Badge>
                    </div>

                    {matchup.notes.length > 0 && (
                      <div className="pt-2 border-t">
                        <div className="text-xs text-gray-600 space-y-1">
                          {matchup.notes.map((note, i) => (
                            <div key={i} className="flex items-start space-x-1">
                              <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <span>{note}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {matchups.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No matchup analysis yet</p>
              <p className="text-sm">Select an opponent and analyze your roster or search for players</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 