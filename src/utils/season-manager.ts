/**
 * Season Transition Management System
 * Handles the complex UX of transitioning users from old seasons to new ones
 */

export interface SeasonData {
  year: string
  status: 'archived' | 'active' | 'upcoming'
  displayName: string
  leagues?: any[]
  lastUpdated?: Date
}

export interface UserSeasonPreference {
  userId: string
  preferredSeason: string
  hasSeenMigrationPrompt: boolean
  autoArchiveOldSeasons: boolean
  lastActiveDate: Date
}

/**
 * Get current system season (what the API should use)
 */
export function getCurrentSystemSeason(): string {
  return '2025'
}

/**
 * Get all available seasons for a user
 */
export function getAvailableSeasons(): SeasonData[] {
  return [
    {
      year: '2024',
      status: 'archived',
      displayName: '2024 Season (Archived)',
    },
    {
      year: '2025', 
      status: 'active',
      displayName: '2025 Season (Current)',
    },
    {
      year: '2026',
      status: 'upcoming', 
      displayName: '2026 Season (Upcoming)',
    }
  ]
}

/**
 * Check if user needs season migration prompt
 */
export function shouldShowMigrationPrompt(userPrefs?: UserSeasonPreference): boolean {
  if (!userPrefs) return true // New user, show onboarding
  
  const currentSeason = getCurrentSystemSeason()
  const userSeason = userPrefs.preferredSeason
  
  // Show if user is on old season and hasn't seen prompt
  return userSeason !== currentSeason && !userPrefs.hasSeenMigrationPrompt
}

/**
 * Check if user's data appears to be from an old season
 */
export function isUsingOldSeasonData(lastActiveDate?: Date): boolean {
  if (!lastActiveDate) return false
  
  const now = new Date()
  const monthsSinceActive = (now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  
  // If last active more than 4 months ago, likely old season
  return monthsSinceActive > 4
}

/**
 * Generate season transition messages for users
 */
export function getSeasonTransitionMessage(scenario: 'new_season' | 'old_data' | 'draft_detected'): {
  title: string
  message: string
  action: string
  urgency: 'low' | 'medium' | 'high'
} {
  switch (scenario) {
    case 'new_season':
      return {
        title: '🏈 Welcome to the 2025 Season!',
        message: 'A new fantasy season has started. Your 2024 data has been archived and you can now set up your 2025 leagues.',
        action: 'Set Up 2025 Season',
        urgency: 'medium'
      }
    
    case 'old_data':
      return {
        title: '📅 Update Required',
        message: 'You\'re viewing 2024 season data, but the 2025 season is now active. Update to get current player info and league data.',
        action: 'Switch to 2025 Season',
        urgency: 'high'
      }
    
    case 'draft_detected':
      return {
        title: '🎯 Draft Activity Detected!',
        message: 'We noticed league activity in your 2025 season. Ready to start using current season data?',
        action: 'Yes, Switch to 2025',
        urgency: 'medium'
      }
  }
}

/**
 * Migration strategies for different user types
 */
export interface MigrationStrategy {
  type: 'auto' | 'prompt' | 'manual'
  reason: string
  actions: string[]
}

export function determineMigrationStrategy(userActivity: {
  hasCurrentSeasonLeagues: boolean
  hasOldSeasonData: boolean
  daysSinceLastActive: number
  hasDraftActivity: boolean
}): MigrationStrategy {
  const { hasCurrentSeasonLeagues, hasOldSeasonData, daysSinceLastActive, hasDraftActivity } = userActivity
  
  // Auto-migrate if clear current season activity
  if (hasCurrentSeasonLeagues && hasDraftActivity) {
    return {
      type: 'auto',
      reason: 'Active current season leagues detected',
      actions: [
        'Archive 2024 season data',
        'Set 2025 as active season',
        'Sync current league data',
        'Update player database'
      ]
    }
  }
  
  // Prompt if mixed situation
  if (hasOldSeasonData && hasCurrentSeasonLeagues) {
    return {
      type: 'prompt',
      reason: 'Both old and new season data present',
      actions: [
        'Choose primary season',
        'Archive old data (optional)',
        'Sync active season data'
      ]
    }
  }
  
  // Manual if inactive user
  if (daysSinceLastActive > 90) {
    return {
      type: 'manual',
      reason: 'Inactive user - manual setup recommended',
      actions: [
        'Review available seasons',
        'Choose active season',
        'Set up leagues manually'
      ]
    }
  }
  
  // Default prompt
  return {
    type: 'prompt',
    reason: 'Standard season transition',
    actions: [
      'Update to current season',
      'Preserve historical data'
    ]
  }
}

/**
 * Archive old season data
 */
export function archiveSeasonData(season: string): {
  archived: boolean
  archivedData: any
  message: string
} {
  try {
    // In real implementation, this would:
    // 1. Move localStorage data to archived section
    // 2. Clear active season data
    // 3. Create archive metadata
    
    const archivedData = {
      season,
      archivedAt: new Date(),
      dataSize: '2.4 MB', // Mock size
      leagues: [], // Would contain actual league data
      rosters: [], // Would contain actual roster data
    }
    
    return {
      archived: true,
      archivedData,
      message: `${season} season data archived successfully. You can restore it anytime from Settings.`
    }
  } catch (error) {
    return {
      archived: false,
      archivedData: null,
      message: `Failed to archive ${season} data. Please try again.`
    }
  }
}

/**
 * Smart season selection based on context
 */
export function getRecommendedSeason(context: {
  userLastActive?: Date
  hasLeagueActivity?: boolean
  currentDate?: Date
}): {
  season: string
  confidence: number
  reasoning: string
} {
  const currentDate = context.currentDate || new Date()
  const currentMonth = currentDate.getMonth() + 1 // 1-12
  
  // During active season (Aug-Jan)
  if (currentMonth >= 8 || currentMonth <= 1) {
    return {
      season: getCurrentSystemSeason(),
      confidence: 0.95,
      reasoning: 'Active fantasy season in progress'
    }
  }
  
  // Off-season but with recent activity
  if (context.hasLeagueActivity) {
    return {
      season: getCurrentSystemSeason(),
      confidence: 0.85,
      reasoning: 'Recent league activity detected'
    }
  }
  
  // Off-season, preparing for next season
  return {
    season: getCurrentSystemSeason(),
    confidence: 0.75,
    reasoning: 'Preparing for upcoming season'
  }
}

/**
 * Season transition UI states
 */
export type SeasonTransitionState = 
  | 'no_action_needed'
  | 'show_migration_prompt' 
  | 'show_archive_prompt'
  | 'show_season_selector'
  | 'show_data_conflict_resolution'

export function getSeasonTransitionState(userContext: {
  preferredSeason?: string
  hasMultipleSeasons: boolean
  hasConflictingData: boolean
  hasSeenPrompt: boolean
}): SeasonTransitionState {
  const currentSeason = getCurrentSystemSeason()
  const { preferredSeason, hasMultipleSeasons, hasConflictingData, hasSeenPrompt } = userContext
  
  if (preferredSeason === currentSeason && !hasConflictingData) {
    return 'no_action_needed'
  }
  
  if (hasConflictingData) {
    return 'show_data_conflict_resolution'
  }
  
  if (hasMultipleSeasons) {
    return 'show_season_selector'
  }
  
  if (preferredSeason !== currentSeason && !hasSeenPrompt) {
    return 'show_migration_prompt'
  }
  
  return 'no_action_needed'
} 