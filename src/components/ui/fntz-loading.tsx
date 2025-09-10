import React from 'react'
import Image from 'next/image'
import { cn, ANIMATION_CLASSES, getLoadingClass } from '@/lib/design-system'
import { Loader2, AlertCircle, Search, Wifi, WifiOff } from 'lucide-react'

interface FntzLoadingProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'skeleton' | 'pulse'
  className?: string
  text?: string
}

interface FntzEmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

interface FntzErrorStateProps {
  title?: string
  description: string
  retry?: () => void
  className?: string
}

// Loading Components
export const FntzLoading: React.FC<FntzLoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  className,
  text
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }

  if (variant === 'spinner') {
    return (
      <div className={cn("flex items-center justify-center p-6", className)}>
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className={cn(
            "animate-spin text-primary",
            sizeClasses[size]
          )} />
          {text && (
            <p className="text-sm text-muted-foreground animate-pulse">
              {text}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'skeleton') {
    return (
      <div className={cn("space-y-3", className)}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className={getLoadingClass('full')} />
            <div className={getLoadingClass('half')} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn(
      "animate-pulse bg-muted rounded",
      size === 'sm' && 'h-4',
      size === 'md' && 'h-6',
      size === 'lg' && 'h-8',
      className
    )} />
  )
}

// Empty State Component
export const FntzEmptyState: React.FC<FntzEmptyStateProps> = ({
  icon: Icon = Search,
  title,
  description,
  action,
  className
}) => (
  <div className={cn(
    "fntz-empty-state animate-fade-in", 
    className
  )}>
    <div className="w-16 h-16 rounded-2xl bg-muted/50 mx-auto mb-6 flex items-center justify-center">
      <Icon className="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 className="fntz-heading-4 mb-2">{title}</h3>
    {description && (
      <p className="fntz-body-small mb-6 max-w-md mx-auto">
        {description}
      </p>
    )}
    {action && (
      <div className="animate-slide-up">
        {action}
      </div>
    )}
  </div>
)

// Error State Component
export const FntzErrorState: React.FC<FntzErrorStateProps> = ({
  title = "Something went wrong",
  description,
  retry,
  className
}) => (
  <div className={cn(
    "fntz-empty-state text-center animate-fade-in",
    className
  )}>
    <div className="w-16 h-16 rounded-2xl bg-danger/10 mx-auto mb-6 flex items-center justify-center">
      <AlertCircle className="h-8 w-8 text-danger" />
    </div>
    <h3 className="fntz-heading-4 text-danger mb-2">{title}</h3>
    <p className="fntz-body-small mb-6 max-w-md mx-auto">
      {description}
    </p>
    {retry && (
      <button
        onClick={retry}
        className="px-4 py-2 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-colors animate-slide-up"
      >
        Try Again
      </button>
    )}
  </div>
)

// Network Status Indicator
export const FntzNetworkStatus: React.FC<{ isOnline?: boolean }> = ({ isOnline = true }) => (
  <div className={cn(
    "fixed bottom-4 right-4 z-50 px-3 py-2 rounded-lg shadow-lg transition-all duration-500",
    isOnline 
      ? "bg-success text-success-foreground translate-y-20 opacity-0"
      : "bg-danger text-danger-foreground translate-y-0 opacity-100"
  )}>
    <div className="flex items-center space-x-2">
      {isOnline ? (
        <Wifi className="h-4 w-4" />
      ) : (
        <WifiOff className="h-4 w-4" />
      )}
      <span className="text-sm font-medium">
        {isOnline ? 'Connected' : 'No Internet'}
      </span>
    </div>
  </div>
)

// Loading Skeleton for Player Cards
export const FntzPlayerSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="fntz-card p-4 animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-muted rounded-lg" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
          <div className="w-16 h-6 bg-muted rounded" />
        </div>
      </div>
    ))}
  </div>
)

// Metric Loading Component
export const FntzMetricSkeleton: React.FC = () => (
  <div className="fntz-metric-card animate-pulse">
    <div className="space-y-2">
      <div className="h-3 bg-muted rounded w-16 mx-auto" />
      <div className="h-6 bg-muted rounded w-12 mx-auto" />
      <div className="h-3 bg-muted rounded w-20 mx-auto" />
    </div>
  </div>
) 

export const FntzBrandedLoader: React.FC<{
  message?: string
  size?: 'sm' | 'md' | 'lg'
}> = ({ 
  message = "Loading your fantasy data...",
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-12 md:h-16',
    md: 'h-16 md:h-20', 
    lg: 'h-20 md:h-24'
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-6">
      <div className="animate-pulse">
        <Image
          src="/logos/logo_full.webp" 
          alt="FNTZ AI" 
          width={200}
          height={80}
          className={`${sizeClasses[size]} object-contain opacity-90`}
        />
      </div>
      
      <div className="space-y-3 text-center">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.1s]" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
        </div>
        
        {message && (
          <p className="text-sm text-muted-foreground max-w-xs">
            {message}
          </p>
        )}
      </div>
    </div>
  )
} 