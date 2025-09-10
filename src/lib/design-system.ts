import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// === FNTZ AI Design System Utilities ===

/**
 * Player Position Color Mapping
 */
export const POSITION_COLORS = {
  QB: 'fntz-player-qb',
  RB: 'fntz-player-rb', 
  WR: 'fntz-player-wr',
  TE: 'fntz-player-te',
  K: 'fntz-player-k',
  DEF: 'fntz-player-def',
  D: 'fntz-player-def', // Alternative for DEF
} as const

export type Position = keyof typeof POSITION_COLORS

/**
 * Get position-specific styling classes
 */
export function getPositionStyles(position: string): string {
  const normalizedPosition = position.toUpperCase() as Position
  return POSITION_COLORS[normalizedPosition] || 'border border-border/20 bg-muted/10 text-muted-foreground'
}

/**
 * Semantic Status Colors
 */
export const STATUS_VARIANTS = {
  success: 'fntz-success',
  warning: 'fntz-warning', 
  danger: 'fntz-danger',
  info: 'fntz-info',
  neutral: 'bg-muted/10 text-muted-foreground border-muted/20'
} as const

export type StatusVariant = keyof typeof STATUS_VARIANTS

/**
 * Get status-specific styling classes
 */
export function getStatusStyles(variant: StatusVariant): string {
  return STATUS_VARIANTS[variant]
}

/**
 * Interactive States & Hover Colors
 * Theme-aware hover colors that maintain text visibility
 */
export const HOVER_STATES = {
  card: 'hover:bg-card/80 hover:border-border/40 transition-colors duration-200',
  elevated: 'hover:bg-background/80 hover:shadow-md transition-all duration-200',
  muted: 'hover:bg-muted/20 hover:border-border/30 transition-colors duration-200',
  accent: 'hover:bg-accent/10 hover:border-accent/20 transition-colors duration-200',
  subtle: 'hover:bg-foreground/5 hover:border-border/20 transition-colors duration-200'
} as const

export type HoverState = keyof typeof HOVER_STATES

/**
 * Get theme-aware hover styling classes
 */
export function getHoverStyles(variant: HoverState = 'muted'): string {
  return HOVER_STATES[variant]
}

/**
 * Card Variants for consistent elevation
 */
export const CARD_VARIANTS = {
  default: 'fntz-card',
  elevated: 'fntz-card-elevated',
  interactive: 'fntz-card-interactive',
  glass: 'fntz-card-glass'
} as const

export type CardVariant = keyof typeof CARD_VARIANTS

/**
 * Interactive Element Variants
 */
export const INTERACTIVE_VARIANTS = {
  clickable: 'fntz-clickable',
  hover: 'fntz-interactive', 
  lift: 'fntz-hover-lift'
} as const

/**
 * Typography Scale
 */
export const TYPOGRAPHY_VARIANTS = {
  h1: 'fntz-heading-1',
  h2: 'fntz-heading-2', 
  h3: 'fntz-heading-3',
  h4: 'fntz-heading-4',
  body: 'fntz-body',
  small: 'fntz-body-small',
  caption: 'fntz-caption'
} as const

export type TypographyVariant = keyof typeof TYPOGRAPHY_VARIANTS

/**
 * Spacing Utilities
 */
export const SPACING_VARIANTS = {
  sm: 'fntz-spacing-sm',
  md: 'fntz-spacing-md',
  lg: 'fntz-spacing-lg'
} as const

/**
 * Injury Status Styling
 */
export function getInjuryStatusStyles(injuryStatus?: string): StatusVariant {
  if (!injuryStatus || injuryStatus === 'Healthy') return 'success'
  
  const status = injuryStatus.toLowerCase()
  if (status.includes('out') || status.includes('ir')) return 'danger'
  if (status.includes('doubtful') || status.includes('questionable')) return 'warning'
  if (status.includes('probable')) return 'info'
  
  return 'warning' // Default for any injury
}

/**
 * Trade Analysis Styling
 */
export function getTradeStatusStyles(verdict: string): StatusVariant {
  switch (verdict.toLowerCase()) {
    case 'good for you':
      return 'success'
    case 'fair trade':
      return 'info' 
    case 'favors opponent':
      return 'danger'
    default:
      return 'neutral'
  }
}

/**
 * Matchup Difficulty Styling
 */
export function getMatchupDifficultyStyles(difficulty: string): StatusVariant {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'success'
    case 'medium':
      return 'warning'
    case 'hard':
      return 'danger'
    default:
      return 'neutral'
  }
}

/**
 * Recommendation Priority Styling
 */
export function getRecommendationStyles(priority: string): StatusVariant {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'success'
    case 'medium':
      return 'warning'
    case 'low':
      return 'neutral'
    default:
      return 'neutral'
  }
}

/**
 * Performance Trend Styling
 */
export function getTrendStyles(trend: string): StatusVariant {
  switch (trend.toLowerCase()) {
    case 'up':
      return 'success'
    case 'down': 
      return 'danger'
    case 'stable':
      return 'info'
    default:
      return 'neutral'
  }
}

/**
 * Metric Value Styling (for analytics)
 */
export function getMetricStyles(value: number, benchmark: number): StatusVariant {
  const ratio = value / benchmark
  if (ratio >= 1.2) return 'success'
  if (ratio >= 0.8) return 'info'
  if (ratio >= 0.6) return 'warning'
  return 'danger'
}

/**
 * Strength Analysis Styling
 */
export function getStrengthStyles(strength: string): StatusVariant {
  switch (strength.toLowerCase()) {
    case 'strong':
      return 'success'
    case 'average':
      return 'info'
    case 'weak':
      return 'danger'
    default:
      return 'neutral'
  }
}

/**
 * Surface Level Utilities
 */
export function getSurfaceClass(level: 1 | 2 | 3): string {
  return `fntz-surface-${level}`
}

/**
 * Animation Utilities
 */
export const ANIMATION_CLASSES = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  bounceSubtle: 'animate-bounce-subtle',
  pulseSlow: 'animate-pulse-slow'
} as const

/**
 * Common Component Sizes
 */
export const SIZE_VARIANTS = {
  xs: 'h-6 px-2 text-xs',
  sm: 'h-8 px-3 text-sm', 
  md: 'h-10 px-4 text-base',
  lg: 'h-12 px-6 text-lg',
  xl: 'h-14 px-8 text-xl'
} as const

/**
 * Loading State Utilities
 */
export function getLoadingClass(width: 'full' | 'half' | 'quarter' = 'full'): string {
  const widthMap = {
    full: 'w-full',
    half: 'w-1/2', 
    quarter: 'w-1/4'
  }
  return cn('fntz-loading h-4', widthMap[width])
} 