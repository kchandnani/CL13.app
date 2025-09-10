const SLEEPER_BASE_URL = 'https://api.sleeper.app/v1';

/*
 * SLEEPER API ARCHITECTURE NOTES:
 * 
 * 🏈 SEASON-SPECIFIC ENDPOINTS (require season in URL):
 *   - GET /user/<user_id>/leagues/nfl/<season> → user's leagues for specific season
 *   - League-related endpoints need explicit season (2025)
 * 
 * ⚡ LIVE DATA ENDPOINTS (always current, no season needed):
 *   - GET /players/nfl → all active NFL players (current season)
 *   - GET /players/nfl/trending/add → real-time trending adds
 *   - GET /league/<league_id>/rosters → current league rosters
 *   - Player injuries, stats, and transactions are automatically current
 * 
 * 🔄 NO SEASON TRANSITION EVENT:
 *   Sleeper automatically rolls forward to current NFL season (2025)
 *   No authentication needed for public data
 */

export interface SleeperPlayer {
  player_id: string;
  first_name: string;
  last_name: string;
  position: string;
  team: string;
  injury_status?: string;
  injury_notes?: string;
  injury_start_date?: string;
  status: string;
  age?: number;
  depth_chart_order?: number;
  fantasy_positions?: string[];
}

export interface InjuryData {
  player_id: string;
  name: string;
  position: string;
  team: string;
  injury_status: string;
  injury_notes?: string;
  injury_start_date?: string;
}

export interface TrendingPlayer {
  player_id: string;
  name: string;
  position: string;
  team: string;
  count: number; // Number of leagues adding this player
}

export interface RosterByPosition {
  QB: string[];
  RB: string[];
  WR: string[];
  TE: string[];
  K: string[];
  DEF: string[];
}

// New interfaces for league integration
export interface SleeperUser {
  user_id: string;
  username: string;
  display_name: string;
  avatar?: string;
}

export interface SleeperLeague {
  league_id: string;
  name: string;
  avatar?: string;
  total_rosters: number;
  status: string; // 'pre_draft', 'drafting', 'in_season', 'complete'
  season: string;
  season_type: string;
  sport: string;
  settings: {
    num_teams: number;
    playoff_teams: number;
    playoff_week_start: number;
    // Add more settings as needed
  };
  scoring_settings: {
    [key: string]: number; // Dynamic scoring settings
  };
  roster_positions: string[];
}

export interface SleeperRoster {
  roster_id: number;
  owner_id: string;
  players: string[]; // Array of player IDs
  starters: string[]; // Array of starter player IDs
  league_id: string;
  settings: {
    wins: number;
    losses: number;
    ties: number;
    fpts: number;
    fpts_decimal: number;
    fpts_against: number;
    fpts_against_decimal: number;
  };
}

export interface SleeperLeagueUser {
  user_id: string;
  username: string;
  display_name: string;
  avatar?: string;
  metadata?: {
    team_name?: string;
  };
}

export interface ProcessedLeague {
  league_id: string;
  name: string;
  team_name: string;
  roster: RosterByPosition;
  settings: SleeperLeague['settings'];
  scoring_settings: SleeperLeague['scoring_settings'];
  season: string;
  total_teams: number;
  user_roster_id: number;
}

/**
 * Fetch all NFL players from Sleeper API
 * ⚡ LIVE DATA: Always returns current season players (2025)
 * GET https://api.sleeper.app/v1/players/nfl
 */
export async function getAllPlayers(): Promise<{ [key: string]: SleeperPlayer }> {
  try {
    const response = await fetch(`${SLEEPER_BASE_URL}/players/nfl`);
    if (!response.ok) {
      throw new Error(`Failed to fetch players: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching NFL players:', error);
    throw error;
  }
}

// Keep backward compatibility
export const getAllNFLPlayers = getAllPlayers;

/**
 * Get all current NFL injuries from Sleeper API
 * ⚡ LIVE DATA: Always returns current season injury data (2025)
 * Note: Sleeper doesn't have a dedicated injuries endpoint, so we parse from players data
 */
export async function getInjuries(): Promise<InjuryData[]> {
  try {
    const players = await getAllPlayers();
    const injuries: InjuryData[] = [];

    Object.entries(players).forEach(([playerId, player]) => {
      if (player.injury_status && player.injury_status !== 'Healthy') {
        injuries.push({
          player_id: playerId,
          name: `${player.first_name} ${player.last_name}`,
          position: player.position,
          team: player.team || 'N/A',
          injury_status: player.injury_status,
          injury_notes: player.injury_notes,
          injury_start_date: player.injury_start_date,
        });
      }
    });

    return injuries;
  } catch (error) {
    console.error('Error fetching NFL injuries:', error);
    throw error;
  }
}

// Keep backward compatibility
export const getNFLInjuries = getInjuries;

/**
 * Get trending players being added across leagues
 * ⚡ LIVE DATA: Real-time trending data from current season (2025)
 * GET https://api.sleeper.app/v1/players/nfl/trending/add?limit=...
 */
export async function getTrendingAdds(limit: number = 10): Promise<TrendingPlayer[]> {
  try {
    const response = await fetch(`${SLEEPER_BASE_URL}/players/nfl/trending/add?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch trending adds: ${response.statusText}`);
    }
    
    const trendingData = await response.json();
    const allPlayers = await getAllPlayers();
    
    return trendingData.map((item: { player_id: string; count: number }) => {
      const player = allPlayers[item.player_id];
      return {
        player_id: item.player_id,
        name: player ? `${player.first_name} ${player.last_name}` : 'Unknown Player',
        position: player?.position || 'N/A',
        team: player?.team || 'N/A',
        count: item.count,
      };
    });
  } catch (error) {
    console.error('Error fetching trending adds:', error);
    throw error;
  }
}

/**
 * Cross-check injuries against a roster array of player names
 * Accepts an array of player names and returns who is currently injured
 */
export async function crossCheckInjuries(roster: string[]): Promise<InjuryData[]> {
  try {
    const allInjuries = await getInjuries();
    const rosterNamesLower = new Set(roster.map(name => name.toLowerCase()));
    
    return allInjuries.filter(injury => 
      rosterNamesLower.has(injury.name.toLowerCase())
    );
  } catch (error) {
    console.error('Error cross-checking injuries:', error);
    throw error;
  }
}

/**
 * Legacy function - Get injuries for specific roster players using player IDs
 */
export async function getRosterInjuries(roster: { player_id: string; name: string }[]): Promise<InjuryData[]> {
  try {
    const allInjuries = await getInjuries();
    const rosterPlayerIds = new Set(roster.map(p => p.player_id));
    const rosterPlayerNames = new Set(roster.map(p => p.name.toLowerCase()));
    
    return allInjuries.filter(injury => 
      rosterPlayerIds.has(injury.player_id) || 
      rosterPlayerNames.has(injury.name.toLowerCase())
    );
  } catch (error) {
    console.error('Error fetching roster injuries:', error);
    throw error;
  }
}

/**
 * Legacy function - Get trending players (now replaced by getTrendingAdds)
 */
export async function getTrendingPlayers(): Promise<SleeperPlayer[]> {
  // Deprecated: Use getTrendingAdds instead
  return [];
}

/**
 * Helper function to get all players from position-based roster structure
 */
export function getAllRosterPlayers(roster: RosterByPosition): string[] {
  const allPlayers: string[] = [];
  const positionKeys = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'] as const;
  
  positionKeys.forEach(position => {
    if (roster[position] && Array.isArray(roster[position])) {
      allPlayers.push(...roster[position]);
    }
  });
  
  return allPlayers;
}

/**
 * Format injury status for display
 */
export function formatInjuryStatus(status: string): string {
  const statusMap: { [key: string]: string } = {
    'Questionable': '🟡 Questionable',
    'Doubtful': '🟠 Doubtful',
    'Out': '🔴 Out',
    'IR': '⚫ IR',
    'PUP': '⚫ PUP',
    'Suspended': '🚫 Suspended',
  };
  
  return statusMap[status] || `⚪ ${status}`;
} 

/**
 * Get Sleeper user by username
 * GET https://api.sleeper.app/v1/user/<username>
 */
export async function getUserByUsername(username: string): Promise<SleeperUser> {
  try {
    const response = await fetch(`${SLEEPER_BASE_URL}/user/${username}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Username "${username}" not found on Sleeper`);
      }
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching Sleeper user:', error);
    throw error;
  }
}

/**
 * Get the current active NFL season
 * Set to 2025 for the upcoming fantasy season
 */
export function getCurrentNFLSeason(): string {
  return '2025';
}

/**
 * Get the next NFL season year
 */
export function getNextNFLSeason(): string {
  return '2026';
}

/**
 * Check if we're in the transition period where both seasons might be relevant
 * Returns { current: string, isTransition: boolean, upcoming?: string }
 */
export function getSeasonTransitionInfo() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentSeason = getCurrentNFLSeason();
  
  // Transition periods where both seasons might have active data:
  // 1. Late July - Early August: Previous season ending, new season starting drafts
  // 2. Late January - February: Previous season playoffs, new season prep
  
  const isTransition = (
    (currentMonth === 7) || // July: draft season starting
    (currentMonth === 8) || // August: overlapping period
    (currentMonth === 1) || // January: playoffs + new season prep
    (currentMonth === 2)    // February: late playoffs + off-season
  );
  
  return {
    current: currentSeason,
    isTransition,
    upcoming: isTransition ? getNextNFLSeason() : undefined
  };
}

/**
 * Get all leagues for a user in a specific season
 * 🏈 SEASON-SPECIFIC: Requires explicit season parameter (defaults to 2025)
 * GET https://api.sleeper.app/v1/user/<user_id>/leagues/nfl/<season>
 */
export async function getUserLeagues(userId: string, season?: string): Promise<SleeperLeague[]> {
  const targetSeason = season || getCurrentNFLSeason();
  try {
    const response = await fetch(`${SLEEPER_BASE_URL}/user/${userId}/leagues/nfl/${targetSeason}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user leagues: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user leagues:', error);
    throw error;
  }
}

/**
 * Get all rosters in a league
 * ⚡ LIVE DATA: Always returns current rosters for the league
 * GET https://api.sleeper.app/v1/league/<league_id>/rosters
 */
export async function getLeagueRosters(leagueId: string): Promise<SleeperRoster[]> {
  try {
    const response = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/rosters`);
    if (!response.ok) {
      throw new Error(`Failed to fetch league rosters: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching league rosters:', error);
    throw error;
  }
}

/**
 * Get all users in a league
 * GET https://api.sleeper.app/v1/league/<league_id>/users
 */
export async function getLeagueUsers(leagueId: string): Promise<SleeperLeagueUser[]> {
  try {
    const response = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/users`);
    if (!response.ok) {
      throw new Error(`Failed to fetch league users: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching league users:', error);
    throw error;
  }
}

/**
 * Get specific league details
 * GET https://api.sleeper.app/v1/league/<league_id>
 */
export async function getLeague(leagueId: string): Promise<SleeperLeague> {
  try {
    const response = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch league details: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching league details:', error);
    throw error;
  }
}

/**
 * Convert Sleeper player IDs to player names using the players database
 */
export async function convertPlayerIdsToNames(playerIds: string[]): Promise<string[]> {
  try {
    const allPlayers = await getAllPlayers();
    return playerIds.map(playerId => {
      const player = allPlayers[playerId];
      if (!player) {
        // Handle defense teams (they have team abbreviations as IDs)
        if (playerId.length <= 4 && playerId === playerId.toUpperCase()) {
          return `${playerId} Defense`;
        }
        return `Unknown Player (${playerId})`;
      }
      return `${player.first_name} ${player.last_name}`;
    }).filter(name => name !== null);
  } catch (error) {
    console.error('Error converting player IDs to names:', error);
    return playerIds.map(id => `Player ${id}`);
  }
}

/**
 * Convert Sleeper roster to our position-based format
 */
export async function convertSleeperRosterToPositions(
  playerIds: string[], 
  rosterPositions: string[]
): Promise<RosterByPosition> {
  try {
    const allPlayers = await getAllPlayers();
    const roster: RosterByPosition = {
      QB: [],
      RB: [],
      WR: [],
      TE: [],
      K: [],
      DEF: []
    };

    playerIds.forEach(playerId => {
      const player = allPlayers[playerId];
      
      if (!player) {
        // Handle defense teams
        if (playerId.length <= 4 && playerId === playerId.toUpperCase()) {
          roster.DEF.push(`${playerId} Defense`);
        }
        return;
      }

      const playerName = `${player.first_name} ${player.last_name}`;
      const position = player.position;

      // Map positions to our roster structure
      switch (position) {
        case 'QB':
          roster.QB.push(playerName);
          break;
        case 'RB':
          roster.RB.push(playerName);
          break;
        case 'WR':
          roster.WR.push(playerName);
          break;
        case 'TE':
          roster.TE.push(playerName);
          break;
        case 'K':
          roster.K.push(playerName);
          break;
        case 'DEF':
          roster.DEF.push(playerName);
          break;
        default:
          // For flex positions or unknown, try to categorize
          if (player.fantasy_positions?.includes('RB')) {
            roster.RB.push(playerName);
          } else if (player.fantasy_positions?.includes('WR')) {
            roster.WR.push(playerName);
          } else if (player.fantasy_positions?.includes('TE')) {
            roster.TE.push(playerName);
          }
          break;
      }
    });

    return roster;
  } catch (error) {
    console.error('Error converting Sleeper roster:', error);
    throw error;
  }
}

/**
 * Import user's leagues and process them into our format
 */
export async function importUserLeagues(username: string, season?: string): Promise<ProcessedLeague[]> {
  try {
    // Get user info first
    const user = await getUserByUsername(username);
    if (!user) throw new Error('User not found');
    
    const targetSeason = season || getCurrentNFLSeason();
    const leagues = await getUserLeagues(user.user_id, targetSeason);
    
    // Process each league
    const processedLeagues: ProcessedLeague[] = [];
    
    for (const league of leagues) {
      try {
        // Get league rosters and users
        const [rosters, users] = await Promise.all([
          getLeagueRosters(league.league_id),
          getLeagueUsers(league.league_id)
        ]);
        
        // Find user's roster
        const userRoster = rosters.find(roster => roster.owner_id === user.user_id);
        if (!userRoster) {
          console.warn(`User not found in league ${league.name}`);
          continue;
        }
        
        // Find user's team name
        const userInfo = users.find(u => u.user_id === user.user_id);
        const teamName = userInfo?.metadata?.team_name || userInfo?.display_name || username;
        
        // Convert roster to our format
        const rosterByPosition = await convertSleeperRosterToPositions(
          userRoster.players || [],
          league.roster_positions
        );
        
        processedLeagues.push({
          league_id: league.league_id,
          name: league.name,
          team_name: teamName,
          roster: rosterByPosition,
          settings: league.settings,
          scoring_settings: league.scoring_settings,
          season: league.season,
          total_teams: league.total_rosters,
          user_roster_id: userRoster.roster_id
        });
        
      } catch (error) {
        console.error(`Error processing league ${league.name}:`, error);
        // Continue with other leagues
      }
    }
    
    return processedLeagues;
    
  } catch (error) {
    console.error('Error importing user leagues:', error);
    throw error;
  }
} 