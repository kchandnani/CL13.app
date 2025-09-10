import { getAllPlayers, SleeperPlayer, RosterByPosition } from './sleeper';

export interface SearchablePlayer {
  player_id: string;
  name: string;
  first_name: string;
  last_name: string;
  position: string;
  team: string;
  injury_status?: string;
  injury_notes?: string;
  status: string;
  age?: number;
  fantasy_positions?: string[];
  depth_chart_order?: number;
}

export interface PlayerSearchOptions {
  query?: string;
  positions?: string[];
  teams?: string[];
  availableOnly?: boolean;
  injuredOnly?: boolean;
  maxResults?: number;
}

export interface RosterLimits {
  QB: { min: 1, max: 4 };
  RB: { min: 2, max: 8 };
  WR: { min: 2, max: 8 };
  TE: { min: 1, max: 4 };
  K: { min: 1, max: 2 };
  DEF: { min: 1, max: 2 };
  totalMax: 16;
}

export const DEFAULT_ROSTER_LIMITS: RosterLimits = {
  QB: { min: 1, max: 4 },
  RB: { min: 2, max: 8 },
  WR: { min: 2, max: 8 },
  TE: { min: 1, max: 4 },
  K: { min: 1, max: 2 },
  DEF: { min: 1, max: 2 },
  totalMax: 16
};

export const NFL_TEAMS = [
  'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE', 'DAL', 'DEN',
  'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC', 'LV', 'LAC', 'LAR', 'MIA',
  'MIN', 'NE', 'NO', 'NYG', 'NYJ', 'PHI', 'PIT', 'SF', 'SEA', 'TB',
  'TEN', 'WAS'
];

export const FANTASY_POSITIONS = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

/**
 * Get all players formatted for searching and display
 */
export async function getSearchablePlayers(): Promise<SearchablePlayer[]> {
  try {
    const allPlayers = await getAllPlayers();
    const searchablePlayers: SearchablePlayer[] = [];

    Object.entries(allPlayers).forEach(([playerId, player]) => {
      // Only include active players with valid positions
      if (player.status === 'Active' && player.position && FANTASY_POSITIONS.includes(player.position)) {
        searchablePlayers.push({
          player_id: playerId,
          name: `${player.first_name} ${player.last_name}`,
          first_name: player.first_name,
          last_name: player.last_name,
          position: player.position,
          team: player.team || 'FA',
          injury_status: player.injury_status,
          injury_notes: player.injury_notes,
          status: player.status,
          age: player.age,
          fantasy_positions: player.fantasy_positions,
          depth_chart_order: player.depth_chart_order
        });
      }
    });

    // Add defense teams
    NFL_TEAMS.forEach(team => {
      searchablePlayers.push({
        player_id: team,
        name: `${team} Defense`,
        first_name: team,
        last_name: 'Defense',
        position: 'DEF',
        team: team,
        status: 'Active',
        fantasy_positions: ['DEF']
      });
    });

    // Sort by name for consistent ordering
    return searchablePlayers.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error getting searchable players:', error);
    throw error;
  }
}

/**
 * Search players based on various criteria
 */
export async function searchPlayers(options: PlayerSearchOptions = {}): Promise<SearchablePlayer[]> {
  try {
    const allPlayers = await getSearchablePlayers();
    let filtered = allPlayers;

    // Filter by search query (name, team, position)
    if (options.query) {
      const query = options.query.toLowerCase();
      filtered = filtered.filter(player => 
        player.name.toLowerCase().includes(query) ||
        player.team.toLowerCase().includes(query) ||
        player.position.toLowerCase().includes(query)
      );
    }

    // Filter by positions
    if (options.positions && options.positions.length > 0) {
      filtered = filtered.filter(player => 
        options.positions!.includes(player.position)
      );
    }

    // Filter by teams
    if (options.teams && options.teams.length > 0) {
      filtered = filtered.filter(player => 
        options.teams!.includes(player.team)
      );
    }

    // Filter by availability (non-injured)
    if (options.availableOnly) {
      filtered = filtered.filter(player => 
        !player.injury_status || player.injury_status === 'Healthy'
      );
    }

    // Filter by injured only
    if (options.injuredOnly) {
      filtered = filtered.filter(player => 
        player.injury_status && player.injury_status !== 'Healthy'
      );
    }

    // Limit results
    if (options.maxResults && options.maxResults > 0) {
      filtered = filtered.slice(0, options.maxResults);
    }

    return filtered;
  } catch (error) {
    console.error('Error searching players:', error);
    throw error;
  }
}

/**
 * Get player by exact name match
 */
export async function getPlayerByName(name: string): Promise<SearchablePlayer | null> {
  try {
    const players = await getSearchablePlayers();
    return players.find(player => player.name.toLowerCase() === name.toLowerCase()) || null;
  } catch (error) {
    console.error('Error getting player by name:', error);
    return null;
  }
}

/**
 * Add player to roster at specific position
 */
export function addPlayerToRoster(
  roster: RosterByPosition, 
  playerName: string, 
  position: keyof RosterByPosition,
  limits: RosterLimits = DEFAULT_ROSTER_LIMITS
): { success: boolean; error?: string; roster: RosterByPosition } {
  const newRoster = { ...roster };
  
  // Check if player already exists in roster
  const allCurrentPlayers = Object.values(roster).flat();
  if (allCurrentPlayers.includes(playerName)) {
    return {
      success: false,
      error: `${playerName} is already on your roster`,
      roster: newRoster
    };
  }

  // Check position limits
  const currentPositionCount = roster[position].length;
  const positionLimit = limits[position];
  
  if (currentPositionCount >= positionLimit.max) {
    return {
      success: false,
      error: `Cannot add more ${position}s. Maximum allowed: ${positionLimit.max}`,
      roster: newRoster
    };
  }

  // Check total roster size
  const totalPlayers = allCurrentPlayers.length;
  if (totalPlayers >= limits.totalMax) {
    return {
      success: false,
      error: `Roster is full. Maximum players allowed: ${limits.totalMax}`,
      roster: newRoster
    };
  }

  // Add player to position
  newRoster[position] = [...newRoster[position], playerName];

  return {
    success: true,
    roster: newRoster
  };
}

/**
 * Remove player from roster
 */
export function removePlayerFromRoster(
  roster: RosterByPosition, 
  playerName: string,
  limits: RosterLimits = DEFAULT_ROSTER_LIMITS
): { success: boolean; error?: string; roster: RosterByPosition } {
  const newRoster = { ...roster };
  let found = false;
  let removedFromPosition: keyof RosterByPosition | null = null;

  // Find and remove player from appropriate position
  for (const position of FANTASY_POSITIONS as (keyof RosterByPosition)[]) {
    const playerIndex = roster[position].indexOf(playerName);
    if (playerIndex !== -1) {
      newRoster[position] = roster[position].filter(p => p !== playerName);
      found = true;
      removedFromPosition = position;
      break;
    }
  }

  if (!found) {
    return {
      success: false,
      error: `${playerName} not found on roster`,
      roster: newRoster
    };
  }

  // Check minimum position requirements
  if (removedFromPosition) {
    const positionLimit = limits[removedFromPosition];
    const newPositionCount = newRoster[removedFromPosition].length;
    
    if (newPositionCount < positionLimit.min) {
      return {
        success: false,
        error: `Cannot remove ${playerName}. Minimum ${removedFromPosition}s required: ${positionLimit.min}`,
        roster: newRoster
      };
    }
  }

  return {
    success: true,
    roster: newRoster
  };
}

/**
 * Validate roster composition
 */
export function validateRoster(
  roster: RosterByPosition, 
  limits: RosterLimits = DEFAULT_ROSTER_LIMITS
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check each position
  for (const position of FANTASY_POSITIONS as (keyof RosterByPosition)[]) {
    const count = roster[position].length;
    const limit = limits[position];

    if (count < limit.min) {
      errors.push(`Not enough ${position}s: ${count}/${limit.min} minimum`);
    } else if (count > limit.max) {
      errors.push(`Too many ${position}s: ${count}/${limit.max} maximum`);
    }

    if (count === limit.min) {
      warnings.push(`Consider adding more ${position}s for depth`);
    }
  }

  // Check total roster size
  const totalPlayers = Object.values(roster).flat().length;
  if (totalPlayers > limits.totalMax) {
    errors.push(`Roster too large: ${totalPlayers}/${limits.totalMax} maximum`);
  } else if (totalPlayers < 10) {
    warnings.push(`Consider filling out your roster (${totalPlayers}/${limits.totalMax})`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get roster statistics
 */
export function getRosterStats(roster: RosterByPosition): {
  totalPlayers: number;
  positionCounts: Record<string, number>;
  hasInjuries: boolean;
  isEmpty: boolean;
} {
  const positionCounts: Record<string, number> = {};
  let totalPlayers = 0;

  FANTASY_POSITIONS.forEach(position => {
    const count = roster[position as keyof RosterByPosition].length;
    positionCounts[position] = count;
    totalPlayers += count;
  });

  return {
    totalPlayers,
    positionCounts,
    hasInjuries: false, // Will be updated when injury checking is integrated
    isEmpty: totalPlayers === 0
  };
}

/**
 * Get suggested roster composition for new users
 */
export function getSuggestedRosterComposition(): Record<keyof RosterByPosition, number> {
  return {
    QB: 2,   // Starter + backup
    RB: 4,   // 2 starters + depth
    WR: 4,   // 2 starters + depth
    TE: 2,   // Starter + backup
    K: 1,    // One kicker
    DEF: 1   // One defense
  };
} 