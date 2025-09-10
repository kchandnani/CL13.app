import { ProcessedLeague, RosterByPosition } from './sleeper';
import { 
  addPlayerToRoster as addPlayerToRosterUtil, 
  removePlayerFromRoster as removePlayerFromRosterUtil,
  validateRoster,
  DEFAULT_ROSTER_LIMITS,
  RosterLimits
} from './playerDatabase';

// Data structure for localStorage
export interface UserData {
  version: string;
  lastUpdated: string;
  currentLeagueId?: string;
  sleeperUsername?: string;
  leagues: ProcessedLeague[];
  manualRosters: ManualRoster[];
}

export interface ManualRoster {
  id: string;
  name: string;
  team_name: string;
  roster: RosterByPosition;
  created_at: string;
  updated_at: string;
  source: 'manual';
}

// Current league data (either imported or manual)
export interface CurrentLeague {
  id: string;
  name: string;
  team_name: string;
  roster: RosterByPosition;
  source: 'sleeper' | 'manual';
  settings?: ProcessedLeague['settings'];
  scoring_settings?: ProcessedLeague['scoring_settings'];
}

const STORAGE_KEY = 'fntz-user-data';
const CURRENT_VERSION = '1.0';

// Default data structure
const getDefaultUserData = (): UserData => ({
  version: CURRENT_VERSION,
  lastUpdated: new Date().toISOString(),
  leagues: [],
  manualRosters: [],
});

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * Load user data from localStorage
 */
export function loadUserData(): UserData {
  if (!isBrowser()) {
    return getDefaultUserData();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getDefaultUserData();
    }

    const data = JSON.parse(stored) as UserData;
    
    // Version check and migration if needed
    if (data.version !== CURRENT_VERSION) {
      console.log('Migrating user data to new version');
      return migrateUserData(data);
    }

    return data;
  } catch (error) {
    console.error('Error loading user data:', error);
    return getDefaultUserData();
  }
}

/**
 * Save user data to localStorage
 */
export function saveUserData(data: UserData): void {
  if (!isBrowser()) {
    console.warn('Cannot save user data: not in browser environment');
    return;
  }

  try {
    data.lastUpdated = new Date().toISOString();
    data.version = CURRENT_VERSION;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving user data:', error);
    throw new Error('Failed to save data to browser storage');
  }
}

/**
 * Migrate user data from older versions
 */
function migrateUserData(oldData: any): UserData {
  const newData = getDefaultUserData();
  
  try {
    // Handle migration from legacy roster.json format
    if (oldData.QB && oldData.RB) {
      // Convert old static roster to manual roster
      newData.manualRosters.push({
        id: 'legacy-roster',
        name: 'Imported Roster',
        team_name: oldData.team_name || 'My Team',
        roster: {
          QB: oldData.QB || [],
          RB: oldData.RB || [],
          WR: oldData.WR || [],
          TE: oldData.TE || [],
          K: oldData.K || [],
          DEF: oldData.DEF || []
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source: 'manual'
      });
      newData.currentLeagueId = 'legacy-roster';
    }

    // Preserve any existing leagues if they exist
    if (oldData.leagues && Array.isArray(oldData.leagues)) {
      newData.leagues = oldData.leagues;
    }
    
    if (oldData.sleeperUsername) {
      newData.sleeperUsername = oldData.sleeperUsername;
    }

  } catch (error) {
    console.error('Error during migration:', error);
  }

  return newData;
}

/**
 * Add or update Sleeper leagues
 */
export function saveSleeperLeagues(leagues: ProcessedLeague[], username: string): void {
  const userData = loadUserData();
  
  // Remove existing Sleeper leagues for this user
  userData.leagues = userData.leagues.filter(league => 
    league.league_id !== league.league_id // Remove all with same IDs
  );
  
  // Add new leagues
  userData.leagues.push(...leagues);
  userData.sleeperUsername = username;
  
  // Set first league as current if no current league
  if (!userData.currentLeagueId && leagues.length > 0) {
    userData.currentLeagueId = leagues[0].league_id;
  }
  
  saveUserData(userData);
}

/**
 * Add or update a manual roster
 */
export function saveManualRoster(roster: Omit<ManualRoster, 'created_at' | 'updated_at'>): void {
  const userData = loadUserData();
  const now = new Date().toISOString();
  
  const existingIndex = userData.manualRosters.findIndex(r => r.id === roster.id);
  
  if (existingIndex >= 0) {
    // Update existing
    userData.manualRosters[existingIndex] = {
      ...roster,
      created_at: userData.manualRosters[existingIndex].created_at,
      updated_at: now
    };
  } else {
    // Add new
    userData.manualRosters.push({
      ...roster,
      created_at: now,
      updated_at: now
    });
  }
  
  // Set as current if no current league
  if (!userData.currentLeagueId) {
    userData.currentLeagueId = roster.id;
  }
  
  saveUserData(userData);
}

/**
 * Get current selected league/roster
 */
export function getCurrentLeague(): CurrentLeague | null {
  const userData = loadUserData();
  
  if (!userData.currentLeagueId) {
    return null;
  }
  
  // Check Sleeper leagues first
  const sleeperLeague = userData.leagues.find(l => l.league_id === userData.currentLeagueId);
  if (sleeperLeague) {
    return {
      id: sleeperLeague.league_id,
      name: sleeperLeague.name,
      team_name: sleeperLeague.team_name,
      roster: sleeperLeague.roster,
      source: 'sleeper',
      settings: sleeperLeague.settings,
      scoring_settings: sleeperLeague.scoring_settings
    };
  }
  
  // Check manual rosters
  const manualRoster = userData.manualRosters.find(r => r.id === userData.currentLeagueId);
  if (manualRoster) {
    return {
      id: manualRoster.id,
      name: manualRoster.name,
      team_name: manualRoster.team_name,
      roster: manualRoster.roster,
      source: 'manual'
    };
  }
  
  return null;
}

/**
 * Set the current active league
 */
export function setCurrentLeague(leagueId: string): void {
  const userData = loadUserData();
  userData.currentLeagueId = leagueId;
  saveUserData(userData);
}

/**
 * Get all available leagues/rosters for switching
 */
export function getAllAvailableLeagues(): CurrentLeague[] {
  const userData = loadUserData();
  const leagues: CurrentLeague[] = [];
  
  // Add Sleeper leagues
  userData.leagues.forEach(league => {
    leagues.push({
      id: league.league_id,
      name: league.name,
      team_name: league.team_name,
      roster: league.roster,
      source: 'sleeper',
      settings: league.settings,
      scoring_settings: league.scoring_settings
    });
  });
  
  // Add manual rosters
  userData.manualRosters.forEach(roster => {
    leagues.push({
      id: roster.id,
      name: roster.name,
      team_name: roster.team_name,
      roster: roster.roster,
      source: 'manual'
    });
  });
  
  return leagues;
}

/**
 * Delete a league/roster
 */
export function deleteLeague(leagueId: string): void {
  const userData = loadUserData();
  
  // Remove from both arrays
  userData.leagues = userData.leagues.filter(l => l.league_id !== leagueId);
  userData.manualRosters = userData.manualRosters.filter(r => r.id !== leagueId);
  
  // If this was the current league, clear it
  if (userData.currentLeagueId === leagueId) {
    userData.currentLeagueId = undefined;
    
    // Set to first available league if any exist
    const remaining = getAllAvailableLeagues();
    if (remaining.length > 0) {
      userData.currentLeagueId = remaining[0].id;
    }
  }
  
  saveUserData(userData);
}

/**
 * Clear all user data
 */
export function clearAllData(): void {
  if (!isBrowser()) {
    console.warn('Cannot clear user data: not in browser environment');
    return;
  }
  
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if user has any leagues/rosters configured
 */
export function hasAnyLeagues(): boolean {
  const userData = loadUserData();
  return userData.leagues.length > 0 || userData.manualRosters.length > 0;
}

/**
 * Add player to current manual roster
 */
export function addPlayerToCurrentRoster(
  playerName: string, 
  position: keyof RosterByPosition,
  limits: RosterLimits = DEFAULT_ROSTER_LIMITS
): { success: boolean; error?: string } {
  try {
    const userData = loadUserData();
    const currentLeague = getCurrentLeague();
    
    if (!currentLeague || currentLeague.source !== 'manual') {
      return {
        success: false,
        error: 'No manual roster selected. Please select a manual roster to add players.'
      };
    }
    
    const manualRosterIndex = userData.manualRosters.findIndex(r => r.id === currentLeague.id);
    if (manualRosterIndex === -1) {
      return {
        success: false,
        error: 'Manual roster not found'
      };
    }
    
    const result = addPlayerToRosterUtil(
      userData.manualRosters[manualRosterIndex].roster, 
      playerName, 
      position,
      limits
    );
    
    if (result.success) {
      userData.manualRosters[manualRosterIndex].roster = result.roster;
      userData.manualRosters[manualRosterIndex].updated_at = new Date().toISOString();
      saveUserData(userData);
    }
    
    return {
      success: result.success,
      error: result.error
    };
  } catch (error) {
    console.error('Error adding player to roster:', error);
    return {
      success: false,
      error: 'Failed to add player to roster'
    };
  }
}

/**
 * Remove player from current manual roster
 */
export function removePlayerFromCurrentRoster(
  playerName: string,
  limits: RosterLimits = DEFAULT_ROSTER_LIMITS
): { success: boolean; error?: string } {
  try {
    const userData = loadUserData();
    const currentLeague = getCurrentLeague();
    
    if (!currentLeague || currentLeague.source !== 'manual') {
      return {
        success: false,
        error: 'No manual roster selected. Please select a manual roster to remove players.'
      };
    }
    
    const manualRosterIndex = userData.manualRosters.findIndex(r => r.id === currentLeague.id);
    if (manualRosterIndex === -1) {
      return {
        success: false,
        error: 'Manual roster not found'
      };
    }
    
    const result = removePlayerFromRosterUtil(
      userData.manualRosters[manualRosterIndex].roster, 
      playerName,
      limits
    );
    
    if (result.success) {
      userData.manualRosters[manualRosterIndex].roster = result.roster;
      userData.manualRosters[manualRosterIndex].updated_at = new Date().toISOString();
      saveUserData(userData);
    }
    
    return {
      success: result.success,
      error: result.error
    };
  } catch (error) {
    console.error('Error removing player from roster:', error);
    return {
      success: false,
      error: 'Failed to remove player from roster'
    };
  }
}

/**
 * Update entire manual roster
 */
export function updateManualRoster(
  rosterId: string,
  newRoster: RosterByPosition,
  limits: RosterLimits = DEFAULT_ROSTER_LIMITS
): { success: boolean; error?: string; validation?: ReturnType<typeof validateRoster> } {
  try {
    const userData = loadUserData();
    const manualRosterIndex = userData.manualRosters.findIndex(r => r.id === rosterId);
    
    if (manualRosterIndex === -1) {
      return {
        success: false,
        error: 'Manual roster not found'
      };
    }
    
    // Validate the new roster
    const validation = validateRoster(newRoster, limits);
    
    if (!validation.valid) {
      return {
        success: false,
        error: `Roster validation failed: ${validation.errors.join(', ')}`,
        validation
      };
    }
    
    userData.manualRosters[manualRosterIndex].roster = newRoster;
    userData.manualRosters[manualRosterIndex].updated_at = new Date().toISOString();
    saveUserData(userData);
    
    return {
      success: true,
      validation
    };
  } catch (error) {
    console.error('Error updating manual roster:', error);
    return {
      success: false,
      error: 'Failed to update roster'
    };
  }
}

/**
 * Get validation status for current roster
 */
export function validateCurrentRoster(
  limits: RosterLimits = DEFAULT_ROSTER_LIMITS
): ReturnType<typeof validateRoster> | null {
  try {
    const currentLeague = getCurrentLeague();
    if (!currentLeague) {
      return null;
    }
    
    return validateRoster(currentLeague.roster, limits);
  } catch (error) {
    console.error('Error validating current roster:', error);
    return null;
  }
} 