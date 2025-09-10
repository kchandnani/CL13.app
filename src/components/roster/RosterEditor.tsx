'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  UserX, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Trash2,
  Search,
  Target
} from 'lucide-react'
import { PlayerSearch } from './PlayerSearch'
import { useUserData } from '@/hooks/useUserData'
import { RosterByPosition } from '@/utils/sleeper'
import { 
  validateRoster, 
  getRosterStats, 
  DEFAULT_ROSTER_LIMITS, 
  FANTASY_POSITIONS,
  getSuggestedRosterComposition 
} from '@/utils/playerDatabase'
import { formatInjuryStatus, crossCheckInjuries, type InjuryData } from '@/utils/sleeper'

interface RosterEditorProps {
  className?: string;
}

export function RosterEditor({ className }: RosterEditorProps) {
  const {
    currentLeague,
    addPlayerToRoster,
    removePlayerFromRoster,
    refreshData,
    error: hookError
  } = useUserData()

  const [localError, setLocalError] = useState<string | null>(null)
  const [removingPlayer, setRemovingPlayer] = useState<string | null>(null)
  const [injuries, setInjuries] = useState<InjuryData[]>([])
  const [loadingInjuries, setLoadingInjuries] = useState(false)
  const [activeTab, setActiveTab] = useState("current")

  const isManualRoster = currentLeague?.source === 'manual'
  
  // Memoize roster to prevent unnecessary re-renders
  const roster = useMemo(() => {
    return currentLeague?.roster || {
      QB: [], RB: [], WR: [], TE: [], K: [], DEF: []
    }
  }, [currentLeague?.roster])

  // Roster statistics and validation
  const rosterStats = useMemo(() => getRosterStats(roster), [roster])
  const rosterValidation = useMemo(() => validateRoster(roster), [roster])
  const suggestedComposition = useMemo(() => getSuggestedRosterComposition(), [])

  // Load injuries when component mounts or roster changes
  useEffect(() => {
    const checkRosterInjuries = async () => {
      if (rosterStats.totalPlayers === 0) {
        setInjuries([])
        return
      }

      try {
        setLoadingInjuries(true)
        const allPlayers = Object.values(roster).flat()
        const rosterInjuries = await crossCheckInjuries(allPlayers)
        setInjuries(rosterInjuries)
      } catch (error) {
        console.error('Failed to check injuries:', error)
      } finally {
        setLoadingInjuries(false)
      }
    }

    checkRosterInjuries()
  }, [roster, rosterStats.totalPlayers])

  const handleRemovePlayer = async (playerName: string) => {
    if (!isManualRoster || removingPlayer) return

    setRemovingPlayer(playerName)
    setLocalError(null)

    try {
      const result = removePlayerFromRoster(playerName)
      if (!result.success) {
        setLocalError(result.error || 'Failed to remove player')
      } else {
        // Refresh injury data after successful removal
        // checkRosterInjuries() // This line is removed as per the edit hint
      }
    } catch (error) {
      setLocalError('Failed to remove player from roster')
    } finally {
      setRemovingPlayer(null)
    }
  }

  const handleAddPlayer = (playerName: string, position: keyof RosterByPosition) => {
    setLocalError(null)
    const result = addPlayerToRoster(playerName, position)
    
    if (result.success) {
      // Refresh injury data after successful addition
      // checkRosterInjuries() // This line is removed as per the edit hint
    }
    
    return result
  }

  const getPositionIcon = (position: string) => {
    const icons = {
      QB: '🏈', RB: '🏃', WR: '🙌', TE: '💪', K: '🦵', DEF: '🛡️'
    }
    return icons[position as keyof typeof icons] || '👤'
  }

  const getPositionProgress = (position: keyof RosterByPosition) => {
    const current = roster[position].length
    const suggested = suggestedComposition[position]
    const limit = DEFAULT_ROSTER_LIMITS[position]
    
    return {
      current,
      suggested,
      min: limit.min,
      max: limit.max,
      percentage: Math.min((current / suggested) * 100, 100)
    }
  }

  const error = hookError || localError

  if (!currentLeague) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>No Roster Selected</CardTitle>
          <CardDescription>
            Please select a roster to edit or create a new manual roster
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!isManualRoster) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Roster Editing Not Available</CardTitle>
          <CardDescription>
            Roster editing is only available for manual rosters. 
            Current roster: {currentLeague.name} (imported from {currentLeague.source})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            To edit your roster, create a new manual roster or switch to an existing manual roster.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Roster Validation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Roster Status
          </CardTitle>
          <CardDescription>
            {currentLeague.team_name} - {currentLeague.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Status */}
          <div className="flex items-center gap-2">
            {rosterValidation.valid ? (
              <Badge className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <CheckCircle className="h-3 w-3" />
                Valid Roster
              </Badge>
            ) : (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Invalid Roster
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {rosterStats.totalPlayers}/{DEFAULT_ROSTER_LIMITS.totalMax} players
            </span>
          </div>

          {/* Validation Messages */}
          {rosterValidation.errors.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-destructive">Issues to Fix:</h4>
              {rosterValidation.errors.map((error, index) => (
                <p key={index} className="text-sm text-destructive">• {error}</p>
              ))}
            </div>
          )}

          {rosterValidation.warnings.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-yellow-600">Suggestions:</h4>
              {rosterValidation.warnings.map((warning, index) => (
                <p key={index} className="text-sm text-yellow-600">• {warning}</p>
              ))}
            </div>
          )}

          {/* Position Progress */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {FANTASY_POSITIONS.map(position => {
              const progress = getPositionProgress(position as keyof RosterByPosition)
              return (
                <div key={position} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {getPositionIcon(position)} {position}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {progress.current}/{progress.suggested}
                    </span>
                  </div>
                  <Progress 
                    value={progress.percentage} 
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground">
                    Min: {progress.min}, Max: {progress.max}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Editor Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Current Roster ({rosterStats.totalPlayers})
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Add Players
          </TabsTrigger>
        </TabsList>

        {/* Current Roster Tab */}
        <TabsContent value="current" className="space-y-4">
          {rosterStats.totalPlayers === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <UserX className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Empty Roster</h3>
                  <p className="text-muted-foreground mb-4">
                    Start building your roster by adding players
                  </p>
                  <Button onClick={() => setActiveTab("search")}>
                    <Search className="h-4 w-4 mr-2" />
                    Search Players
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {FANTASY_POSITIONS.map(position => {
                const positionPlayers = roster[position as keyof RosterByPosition]
                const positionInjuries = injuries.filter(injury =>
                  positionPlayers.some(player => 
                    player.toLowerCase() === injury.name.toLowerCase()
                  )
                )

                return (
                  <Card key={position}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          {getPositionIcon(position)} {position}
                          <Badge variant="outline">{positionPlayers.length}</Badge>
                        </span>
                        {positionInjuries.length > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {positionInjuries.length} injured
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {positionPlayers.length > 0 ? (
                        <div className="space-y-2">
                          {positionPlayers.map(player => {
                            const playerInjury = injuries.find(injury =>
                              injury.name.toLowerCase() === player.toLowerCase()
                            )
                            const isRemoving = removingPlayer === player

                            return (
                              <div
                                key={player}
                                className={`flex items-center justify-between p-3 border rounded-lg ${
                                  playerInjury ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' : ''
                                }`}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{player}</span>
                                    {playerInjury && (
                                      <Badge variant="destructive" className="text-xs">
                                        {formatInjuryStatus(playerInjury.injury_status)}
                                      </Badge>
                                    )}
                                  </div>
                                  {playerInjury?.injury_notes && (
                                    <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                                      {playerInjury.injury_notes}
                                    </div>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemovePlayer(player)}
                                  disabled={isRemoving}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <div className="text-2xl mb-2">➕</div>
                          <p className="text-sm">No players at {position}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Player Search Tab */}
        <TabsContent value="search">
          <PlayerSearch
            onAddPlayer={handleAddPlayer}
            currentRoster={roster}
            disabled={false}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
} 