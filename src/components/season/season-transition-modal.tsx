'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Archive, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { 
  SeasonData, 
  MigrationStrategy, 
  getSeasonTransitionMessage,
  archiveSeasonData,
  getCurrentSystemSeason
} from '@/utils/season-manager'

interface SeasonTransitionModalProps {
  isOpen: boolean
  onClose: () => void
  scenario: 'new_season' | 'old_data' | 'draft_detected'
  availableSeasons: SeasonData[]
  migrationStrategy: MigrationStrategy
  onSeasonSelected: (season: string) => void
  onArchiveConfirmed: (season: string) => void
}

export function SeasonTransitionModal({
  isOpen,
  onClose,
  scenario,
  availableSeasons,
  migrationStrategy,
  onSeasonSelected,
  onArchiveConfirmed
}: SeasonTransitionModalProps) {
  const [isArchiving, setIsArchiving] = useState(false)
  const [archiveComplete, setArchiveComplete] = useState(false)
  const [selectedSeason, setSelectedSeason] = useState(getCurrentSystemSeason())
  
  const transitionMessage = getSeasonTransitionMessage(scenario)
  
  const handleArchive = async (seasonToArchive: string) => {
    setIsArchiving(true)
    
    // Simulate archiving process
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const result = archiveSeasonData(seasonToArchive)
    
    if (result.archived) {
      setArchiveComplete(true)
      onArchiveConfirmed(seasonToArchive)
    }
    
    setIsArchiving(false)
  }
  
  const handleProceed = () => {
    onSeasonSelected(selectedSeason)
    onClose()
  }
  
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'fntz-danger'
      case 'medium': return 'fntz-warning' 
      case 'low': return 'fntz-info'
      default: return 'fntz-info'
    }
  }
  
  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return <AlertTriangle className="h-4 w-4" />
      case 'medium': return <Info className="h-4 w-4" />
      case 'low': return <CheckCircle className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>{transitionMessage.title}</span>
          </DialogTitle>
          <DialogDescription>
            {transitionMessage.message}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Urgency Badge */}
          <Alert className={getUrgencyColor(transitionMessage.urgency)}>
            <div className="flex items-center space-x-2">
              {getUrgencyIcon(transitionMessage.urgency)}
              <AlertDescription>
                <strong>Priority:</strong> {transitionMessage.urgency.toUpperCase()}
              </AlertDescription>
            </div>
          </Alert>
          
          {/* Available Seasons */}
          <div className="space-y-2">
            <h4 className="font-medium">Available Seasons:</h4>
            <div className="space-y-2">
              {availableSeasons.map((season) => (
                <Card 
                  key={season.year}
                  className={`cursor-pointer transition-colors ${
                    selectedSeason === season.year 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:bg-muted/30'
                  }`}
                  onClick={() => setSelectedSeason(season.year)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          season.status === 'active' ? 'bg-green-500' :
                          season.status === 'archived' ? 'bg-gray-400' :
                          'bg-blue-500'
                        }`} />
                        <div>
                          <p className="font-medium">{season.displayName}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {season.status}
                          </p>
                        </div>
                      </div>
                      
                      {season.status === 'archived' && (
                        <Badge variant="outline" className="text-xs">
                          <Archive className="h-3 w-3 mr-1" />
                          Archived
                        </Badge>
                      )}
                      
                      {season.status === 'active' && (
                        <Badge className="fntz-success text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Migration Strategy */}
          <div className="space-y-2">
            <h4 className="font-medium">Migration Plan:</h4>
            <div className="text-sm space-y-1">
              <p className="text-muted-foreground mb-2">{migrationStrategy.reason}</p>
              <ul className="space-y-1">
                {migrationStrategy.actions.map((action, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span className="text-sm">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Archive Option */}
          {availableSeasons.some(s => s.status === 'archived') && (
            <Alert>
              <Archive className="h-4 w-4" />
              <AlertDescription>
                Your 2024 data will be safely archived and can be restored anytime from Settings.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Not Now
            </Button>
            <Button 
              onClick={handleProceed}
              className="flex-1"
              disabled={isArchiving}
            >
              {isArchiving ? 'Processing...' : transitionMessage.action}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Season selector banner for non-modal scenarios
export function SeasonTransitionBanner({
  scenario,
  onAction,
  onDismiss
}: {
  scenario: 'new_season' | 'old_data' | 'draft_detected'
  onAction: () => void
  onDismiss: () => void
}) {
  const message = getSeasonTransitionMessage(scenario)
  
  return (
    <Alert className={`${message.urgency === 'high' ? 'fntz-danger' : 'fntz-warning'} mb-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calendar className="h-4 w-4" />
          <div>
            <h4 className="font-medium">{message.title}</h4>
            <p className="text-sm">{message.message}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onDismiss}>
            Later
          </Button>
          <Button size="sm" onClick={onAction}>
            {message.action}
          </Button>
        </div>
      </div>
    </Alert>
  )
} 