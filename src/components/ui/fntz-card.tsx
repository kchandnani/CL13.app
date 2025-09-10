import React from 'react'
import { cn, CARD_VARIANTS, type CardVariant } from '@/lib/design-system'

interface FntzCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  children: React.ReactNode
  asChild?: boolean
}

interface FntzCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface FntzCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface FntzCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
  level?: 1 | 2 | 3 | 4
}

interface FntzCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
}

// Main Card Component
export const FntzCard = React.forwardRef<HTMLDivElement, FntzCardProps>(
  ({ variant = 'default', className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(CARD_VARIANTS[variant], className)}
      {...props}
    >
      {children}
    </div>
  )
)
FntzCard.displayName = "FntzCard"

// Card Header
export const FntzCardHeader = React.forwardRef<HTMLDivElement, FntzCardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    >
      {children}
    </div>
  )
)
FntzCardHeader.displayName = "FntzCardHeader"

// Card Title with Semantic Levels
export const FntzCardTitle = React.forwardRef<HTMLHeadingElement, FntzCardTitleProps>(
  ({ level = 3, className, children, ...props }, ref) => {
    const Component = `h${level}` as keyof JSX.IntrinsicElements
    const baseClasses = "fntz-heading-3 leading-none tracking-tight"
    
    return React.createElement(Component, {
      ref,
      className: cn(baseClasses, className),
      ...props
    }, children)
  }
)
FntzCardTitle.displayName = "FntzCardTitle"

// Card Description
export const FntzCardDescription = React.forwardRef<HTMLParagraphElement, FntzCardDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("fntz-body-small", className)}
      {...props}
    >
      {children}
    </p>
  )
)
FntzCardDescription.displayName = "FntzCardDescription"

// Card Content
export const FntzCardContent = React.forwardRef<HTMLDivElement, FntzCardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-6 pt-0", className)}
      {...props}
    >
      {children}
    </div>
  )
)
FntzCardContent.displayName = "FntzCardContent"

// Card Footer
export const FntzCardFooter = React.forwardRef<HTMLDivElement, FntzCardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    >
      {children}
    </div>
  )
)
FntzCardFooter.displayName = "FntzCardFooter"

// Specialized Card Variants
interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'stable'
  className?: string
}

export const FntzMetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  trend,
  className 
}) => (
  <FntzCard variant="default" className={cn("fntz-metric-card", className)}>
    <div className="space-y-2">
      <p className="fntz-caption">{title}</p>
      <div className="flex items-center justify-center space-x-2">
        <span className="fntz-metric-value">{value}</span>
        {trend && (
          <div className={cn(
            "w-2 h-2 rounded-full",
            trend === 'up' && "bg-success",
            trend === 'down' && "bg-danger", 
            trend === 'stable' && "bg-info"
          )} />
        )}
      </div>
      {subtitle && <p className="fntz-metric-label">{subtitle}</p>}
    </div>
  </FntzCard>
)

// Player Card with Position Styling
interface PlayerCardProps {
  playerName: string
  position: string
  team: string
  injuryStatus?: string
  stats?: Array<{ label: string; value: string | number }>
  onClick?: () => void
  className?: string
}

export const FntzPlayerCard: React.FC<PlayerCardProps> = ({
  playerName,
  position,
  team,
  injuryStatus,
  stats,
  onClick,
  className
}) => (
  <FntzCard 
    variant={onClick ? "interactive" : "default"} 
    className={cn("p-4", onClick && "cursor-pointer", className)}
    onClick={onClick}
  >
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="fntz-heading-4">{playerName}</h4>
          <div className="flex items-center space-x-2">
            <span className={cn("px-2 py-1 rounded-md text-xs font-medium border", 
              getPositionStyles(position))}
            >
              {position}
            </span>
            <span className="fntz-body-small">{team}</span>
          </div>
        </div>
        {injuryStatus && injuryStatus !== 'Healthy' && (
          <span className={cn(
            "px-2 py-1 rounded-md text-xs font-medium border",
            getInjuryStatusStyles(injuryStatus)
          )}>
            {injuryStatus}
          </span>
        )}
      </div>
      
      {stats && stats.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border/20">
          {stats.map((stat, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="fntz-body-small">{stat.label}</span>
              <span className="font-semibold">{stat.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  </FntzCard>
)

// Import helper functions
import { getPositionStyles, getInjuryStatusStyles } from '@/lib/design-system' 