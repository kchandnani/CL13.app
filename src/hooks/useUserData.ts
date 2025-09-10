import { useState, useEffect, useCallback } from 'react';
import { 
  getCurrentLeague, 
  getAllAvailableLeagues, 
  setCurrentLeague as setStorageCurrentLeague,
  saveSleeperLeagues,
  saveManualRoster,
  deleteLeague,
  hasAnyLeagues,
  clearAllData,
  loadUserData,
  addPlayerToCurrentRoster,
  removePlayerFromCurrentRoster,
  validateCurrentRoster,
  CurrentLeague,
  ManualRoster
} from '@/utils/localStorage';
import { importUserLeagues, ProcessedLeague, RosterByPosition } from '@/utils/sleeper';

interface UseUserDataReturn {
  // Current state
  currentLeague: CurrentLeague | null;
  allLeagues: CurrentLeague[];
  hasLeagues: boolean;
  loading: boolean;
  switchingLeague: boolean;
  error: string | null;
  
  // Actions
  importFromSleeper: (username: string, season?: string) => Promise<void>;
  createManualRoster: (name: string, teamName: string) => void;
  switchLeague: (leagueId: string) => void;
  removeLeague: (leagueId: string) => void;
  refreshData: () => void;
  clearAllUserData: () => void;
  
  // Roster editing (only for manual rosters)
  addPlayerToRoster: (playerName: string, position: keyof RosterByPosition) => { success: boolean; error?: string };
  removePlayerFromRoster: (playerName: string) => { success: boolean; error?: string };
  getRosterValidation: () => ReturnType<typeof validateCurrentRoster>;
}

export function useUserData(): UseUserDataReturn {
  const [currentLeague, setCurrentLeague] = useState<CurrentLeague | null>(null);
  const [allLeagues, setAllLeagues] = useState<CurrentLeague[]>([]);
  const [loading, setLoading] = useState(false);
  const [switchingLeague, setSwitchingLeague] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load initial data
  const refreshData = useCallback(() => {
    // Only load data on client side
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const current = getCurrentLeague();
      const all = getAllAvailableLeagues();
      
      setCurrentLeague(current);
      setAllLeagues(all);
      setError(null);
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load user data');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // Load data on mount and when refresh key changes
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Force refresh function
  const forceRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Import leagues from Sleeper
  const importFromSleeper = useCallback(async (username: string, season: string = '2024') => {
    setLoading(true);
    setError(null);
    
    try {
      const leagues = await importUserLeagues(username, season);
      
      if (leagues.length === 0) {
        throw new Error(`No leagues found for username "${username}" in ${season} season`);
      }
      
      saveSleeperLeagues(leagues, username);
      forceRefresh();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import leagues from Sleeper';
      setError(errorMessage);
      throw err; // Re-throw so UI can handle it
    } finally {
      setLoading(false);
    }
  }, [forceRefresh]);

  // Create a new manual roster
  const createManualRoster = useCallback((name: string, teamName: string) => {
    try {
      const newRoster: Omit<ManualRoster, 'created_at' | 'updated_at'> = {
        id: `manual-${Date.now()}`,
        name,
        team_name: teamName,
        roster: {
          QB: [],
          RB: [],
          WR: [],
          TE: [],
          K: [],
          DEF: []
        },
        source: 'manual'
      };
      
      saveManualRoster(newRoster);
      forceRefresh();
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create manual roster';
      setError(errorMessage);
    }
  }, [forceRefresh]);

  // Switch to a different league
  const switchLeague = useCallback((leagueId: string) => {
    setSwitchingLeague(true);
    try {
      setStorageCurrentLeague(leagueId);
      // Force immediate refresh with new data
      forceRefresh();
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to switch league';
      setError(errorMessage);
    } finally {
      // Small delay to ensure state has updated
      setTimeout(() => {
        setSwitchingLeague(false);
      }, 300);
    }
  }, [forceRefresh]);

  // Remove a league/roster
  const removeLeague = useCallback((leagueId: string) => {
    try {
      deleteLeague(leagueId);
      forceRefresh();
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove league';
      setError(errorMessage);
    }
  }, [forceRefresh]);

  // Clear all user data
  const clearAllUserData = useCallback(() => {
    try {
      clearAllData();
      forceRefresh();
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear user data';
      setError(errorMessage);
    }
  }, [forceRefresh]);

  // Add player to current manual roster
  const addPlayerToRoster = useCallback((playerName: string, position: keyof RosterByPosition) => {
    try {
      const result = addPlayerToCurrentRoster(playerName, position);
      if (result.success) {
        forceRefresh();
        setError(null);
      } else {
        setError(result.error || 'Failed to add player');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add player to roster';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [forceRefresh]);

  // Remove player from current manual roster
  const removePlayerFromRoster = useCallback((playerName: string) => {
    try {
      const result = removePlayerFromCurrentRoster(playerName);
      if (result.success) {
        forceRefresh();
        setError(null);
      } else {
        setError(result.error || 'Failed to remove player');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove player from roster';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [forceRefresh]);

  // Get roster validation status
  const getRosterValidation = useCallback(() => {
    try {
      return validateCurrentRoster();
    } catch (err) {
      console.error('Error getting roster validation:', err);
      return null;
    }
  }, []);

  return {
    currentLeague,
    allLeagues,
    hasLeagues: typeof window !== 'undefined' ? hasAnyLeagues() : false,
    loading,
    switchingLeague,
    error,
    importFromSleeper,
    createManualRoster,
    switchLeague,
    removeLeague,
    refreshData: forceRefresh,
    clearAllUserData,
    addPlayerToRoster,
    removePlayerFromRoster,
    getRosterValidation
  };
}

// Hook specifically for getting current roster data (for backward compatibility)
export function useCurrentRoster() {
  const { currentLeague } = useUserData();
  
  return {
    roster: currentLeague?.roster || {
      QB: [],
      RB: [],
      WR: [],
      TE: [],
      K: [],
      DEF: []
    },
    teamName: currentLeague?.team_name || 'My Team',
    leagueName: currentLeague?.name || 'No League Selected',
    source: currentLeague?.source || 'manual'
  };
} 