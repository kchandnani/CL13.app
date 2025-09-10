import React from 'react'
import { cn, TYPOGRAPHY_VARIANTS } from '@/lib/design-system'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  breadcrumb?: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function PageHeader({ 
  title, 
  description, 
  actions, 
  breadcrumb,
  className,
  size = 'md'
}: PageHeaderProps) {
  const sizeClasses = {
    sm: 'py-6',
    md: 'py-8', 
    lg: 'py-12'
  }

  const titleClasses = {
    sm: TYPOGRAPHY_VARIANTS.h3,
    md: TYPOGRAPHY_VARIANTS.h2,
    lg: TYPOGRAPHY_VARIANTS.h1
  }

  return (
    <div className={cn(
      "fntz-container border-b border-border/20 bg-gradient-to-b from-background to-background/50",
      sizeClasses[size],
      className
    )}>
      <div className="space-y-4">
        {/* Breadcrumb */}
        {breadcrumb && (
          <div className="fntz-caption">
            {breadcrumb}
          </div>
        )}

        {/* Main Header Content */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2 flex-1">
            <h1 className={cn(titleClasses[size], "fntz-text-gradient")}>
              {title}
            </h1>
            {description && (
              <p className={cn(
                TYPOGRAPHY_VARIANTS.body, 
                "text-muted-foreground max-w-2xl"
              )}>
                {description}
              </p>
            )}
          </div>

          {/* Actions */}
          {actions && (
            <div className="flex items-center space-x-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 