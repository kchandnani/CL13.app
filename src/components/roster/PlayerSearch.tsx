'use client'

import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Plus, AlertCircle, Trophy, Clock } from 'lucide-react'
import { 
  searchPlayers, 
  SearchablePlayer, 
  PlayerSearchOptions,
  FANTASY_POSITIONS, 
  NFL_TEAMS 
} from '@/utils/playerDatabase'
import { formatInjuryStatus } from '@/utils/sleeper'
import { RosterByPosition } from '@/utils/sleeper'

interface PlayerSearchProps {
  onAddPlayer: (playerName: string, position: keyof RosterByPosition) => { success: boolean; error?: string };
  currentRoster: RosterByPosition;
  disabled?: boolean;
}

export function PlayerSearch({ onAddPlayer, currentRoster, disabled = false }: PlayerSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPosition, setSelectedPosition] = useState<string>('all')
  const [selectedTeam, setSelectedTeam] = useState<string>('all')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [injuredOnly, setInjuredOnly] = useState(false)
  const [players, setPlayers] = useState<SearchablePlayer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addingPlayer, setAddingPlayer] = useState<string | null>(null)

  // Get all current roster players for duplicate checking
  const currentRosterPlayers = useMemo(() => {
    return Object.values(currentRoster).flat()
  }, [currentRoster])

  // Search options
  const searchOptions: PlayerSearchOptions = useMemo(() => {
    const options: PlayerSearchOptions = {
      query: searchQuery.trim() || undefined,
      maxResults: 50
    }

    if (selectedPosition !== 'all') {
      options.positions = [selectedPosition]
    }

    if (selectedTeam !== 'all') {
      options.teams = [selectedTeam]
    }

    if (availableOnly) {
      options.availableOnly = true
    }

    if (injuredOnly) {
      options.injuredOnly = true
    }

    return options
  }, [searchQuery, selectedPosition, selectedTeam, availableOnly, injuredOnly])

  // Perform search
  useEffect(() => {
    const performSearch = async () => {
      try {
        setLoading(true)
        setError(null)

        const results = await searchPlayers(searchOptions)
        setPlayers(results)
      } catch (err) {
        console.error('Player search error:', err)
        setError('Failed to search players. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    // Debounce search
    const timeoutId = setTimeout(performSearch, 300)
    return () => clearTimeout(timeoutId)
  }, [searchOptions])

  const handleAddPlayer = async (player: SearchablePlayer) => {
    if (disabled || addingPlayer) return

    setAddingPlayer(player.player_id)
    setError(null)

    try {
      const result = onAddPlayer(player.name, player.position as keyof RosterByPosition)
      
      if (!result.success) {
        setError(result.error || 'Failed to add player')
      }
    } catch (err) {
      setError('Failed to add player to roster')
    } finally {
      setAddingPlayer(null)
    }
  }

  const isPlayerOnRoster = (playerName: string) => {
    return currentRosterPlayers.some(name => 
      name.toLowerCase() === playerName.toLowerCase()
    )
  }

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

  const getPositionColor = (position: string) => {
    const colors = {
      QB: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      RB: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      WR: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      TE: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      K: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      DEF: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
    return colors[position as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Player Search
        </CardTitle>
        <CardDescription>
          Search for NFL players to add to your roster
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search Controls */}
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search players by name, team, or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              disabled={disabled}
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="position-filter">Position</Label>
              <Select value={selectedPosition} onValueChange={setSelectedPosition} disabled={disabled}>
                <SelectTrigger>
                  <SelectValue placeholder="All positions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {FANTASY_POSITIONS.map(position => (
                    <SelectItem key={position} value={position}>
                      {getPositionIcon(position)} {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="team-filter">Team</Label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam} disabled={disabled}>
                <SelectTrigger>
                  <SelectValue placeholder="All teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {NFL_TEAMS.map(team => (
                    <SelectItem key={team} value={team}>{team}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="available-only"
                checked={availableOnly}
                onCheckedChange={(checked) => setAvailableOnly(checked === true)}
                disabled={disabled}
              />
              <Label htmlFor="available-only" className="text-sm">
                Available only
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="injured-only"
                checked={injuredOnly}
                onCheckedChange={(checked) => setInjuredOnly(checked === true)}
                disabled={disabled}
              />
              <Label htmlFor="injured-only" className="text-sm">
                Injured only
              </Label>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              Search Results {!loading && `(${players.length})`}
            </h4>
            {searchQuery || selectedPosition !== 'all' || selectedTeam !== 'all' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedPosition('all')
                  setSelectedTeam('all')
                  setAvailableOnly(false)
                  setInjuredOnly(false)
                }}
                disabled={disabled}
              >
                Clear Filters
              </Button>
            ) : null}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          )}

          {/* Player Results */}
          {!loading && players.length > 0 && (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {players.map((player) => {
                const onRoster = isPlayerOnRoster(player.name)
                const isAdding = addingPlayer === player.player_id
                
                return (
                  <div
                    key={player.player_id}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                      onRoster 
                        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-lg">
                        {getPositionIcon(player.position)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{player.name}</span>
                          {player.injury_status && player.injury_status !== 'Healthy' && (
                            <Badge variant="destructive" className="text-xs">
                              {formatInjuryStatus(player.injury_status)}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge className={getPositionColor(player.position)}>
                            {player.position}
                          </Badge>
                          <span>{player.team}</span>
                          {player.age && <span>Age {player.age}</span>}
                        </div>
                        
                        {player.injury_notes && (
                          <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {player.injury_notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {onRoster ? (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          On Roster
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleAddPlayer(player)}
                          disabled={disabled || isAdding}
                          className="flex items-center gap-1"
                        >
                          {isAdding ? (
                            <>
                              <Clock className="h-3 w-3 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3" />
                              Add
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* No Results */}
          {!loading && players.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No players found matching your search criteria</p>
              <p className="text-sm">Try adjusting your filters or search term</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 