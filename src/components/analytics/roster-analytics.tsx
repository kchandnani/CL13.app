'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BarChart3, TrendingUp, Users, Activity } from 'lucide-react'
import { useCurrentRoster } from '@/hooks/useUserData'
import { getAllRosterPlayers } from '@/utils/sleeper'

interface PositionStrength {
  position: string
  players: number
  avgScore: number
  strength: 'weak' | 'average' | 'strong'
  trend: 'up' | 'down' | 'stable'
}

export function RosterAnalytics() {
  const [positionAnalysis, setPositionAnalysis] = useState<PositionStrength[]>([])
  const [overallScore, setOverallScore] = useState(0)
  const [loading, setLoading] = useState(true)

  const { roster, teamName, leagueName } = useCurrentRoster()
  const rosterPlayers = getAllRosterPlayers(roster)

  useEffect(() => {
    // Mock analytics data
    const mockAnalysis: PositionStrength[] = [
      { position: 'QB', players: roster.QB.length, avgScore: 18.5, strength: 'strong', trend: 'up' },
      { position: 'RB', players: roster.RB.length, avgScore: 12.3, strength: 'average', trend: 'stable' },
      { position: 'WR', players: roster.WR.length, avgScore: 11.8, strength: 'strong', trend: 'up' },
      { position: 'TE', players: roster.TE.length, avgScore: 8.2, strength: 'weak', trend: 'down' },
      { position: 'K', players: roster.K.length, avgScore: 7.1, strength: 'average', trend: 'stable' },
      { position: 'DEF', players: roster.DEF.length, avgScore: 9.5, strength: 'strong', trend: 'up' }
    ]

    const totalScore = mockAnalysis.reduce((acc, pos) => acc + pos.avgScore * pos.players, 0) / rosterPlayers.length || 0

    setPositionAnalysis(mockAnalysis)
    setOverallScore(Math.round(totalScore * 10) / 10)
    setLoading(false)
  }, [roster, rosterPlayers.length])

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'bg-green-500'
      case 'average': return 'bg-yellow-500'
      case 'weak': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStrengthScore = (strength: string) => {
    switch (strength) {
      case 'strong': return 85
      case 'average': return 65
      case 'weak': return 35
      default: return 50
    }
  }

  if (rosterPlayers.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No roster to analyze</p>
            <p className="text-sm">Add players to your roster to see detailed analytics</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Overall Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{overallScore}</div>
            <p className="text-xs text-gray-500">Average points per player</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Roster Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{rosterPlayers.length}</div>
            <p className="text-xs text-gray-500">Total players</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold truncate">{teamName || 'My Team'}</div>
            <p className="text-xs text-gray-500">{leagueName || 'League'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Position Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Position Strength Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {positionAnalysis.map((position) => (
            <div key={position.position} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">{position.position}</Badge>
                  <span className="font-medium">{position.players} players</span>
                  <span className="text-sm text-gray-500">Avg: {position.avgScore} pts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={`${getStrengthColor(position.strength)} text-white capitalize`}>
                    {position.strength}
                  </Badge>
                  {position.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                  {position.trend === 'down' && <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />}
                  {position.trend === 'stable' && <Activity className="h-4 w-4 text-gray-400" />}
                </div>
              </div>
              <Progress value={getStrengthScore(position.strength)} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Roster Optimization Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {positionAnalysis
            .filter(pos => pos.strength === 'weak')
            .map(pos => (
              <div key={pos.position} className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-800">Strengthen {pos.position} Position</p>
                    <p className="text-sm text-red-600">
                      Your {pos.position} players are averaging {pos.avgScore} points. 
                      Consider targeting higher-scoring players at this position.
                    </p>
                  </div>
                </div>
              </div>
            ))}

          {positionAnalysis.every(pos => pos.strength !== 'weak') && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800">Strong Roster Balance</p>
                  <p className="text-sm text-green-600">
                    Your roster shows good balance across all positions. Focus on depth and matchup optimization.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-800">Monitor Trends</p>
                <p className="text-sm text-blue-600">
                  Keep an eye on players with declining trends and consider waiver wire options.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 