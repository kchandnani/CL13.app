'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ChevronDown, Plus, Download, Settings } from 'lucide-react'
import { useUserData } from '@/hooks/useUserData'
import { LeagueManager } from './LeagueManager'

export function LeagueSwitcher() {
  const { currentLeague, allLeagues, switchLeague, switchingLeague } = useUserData();
  const [open, setOpen] = useState(false);
  const [showManager, setShowManager] = useState(false);

  const handleLeagueSwitch = (leagueId: string) => {
    switchLeague(leagueId);
    setOpen(false);
  };

  const openManager = () => {
    setOpen(false);
    setShowManager(true);
  };

  if (!currentLeague) {
    return (
      <Dialog open={showManager} onOpenChange={setShowManager}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add League
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>League Setup</DialogTitle>
          </DialogHeader>
          <LeagueManager onClose={() => setShowManager(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Current League Display */}
      <div className="flex items-center space-x-2">
        <Badge variant={currentLeague.source === 'sleeper' ? 'outline' : 'secondary'} className="text-xs">
          {currentLeague.source === 'sleeper' ? (
            <Download className="h-3 w-3 mr-1" />
          ) : (
            <Plus className="h-3 w-3 mr-1" />
          )}
          {currentLeague.source}
        </Badge>
        <div className="text-sm">
          <div className="font-medium">{currentLeague.team_name}</div>
          <div className="text-xs text-muted-foreground">{currentLeague.name}</div>
        </div>
      </div>

      {/* League Switcher Dropdown */}
      {allLeagues.length > 1 && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Switch League</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {allLeagues.map((league) => (
                <Button
                  key={league.id}
                  variant={currentLeague.id === league.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleLeagueSwitch(league.id)}
                  disabled={switchingLeague}
                >
                  <div className="flex items-center space-x-2 w-full">
                    <Badge variant="outline" className="text-xs shrink-0">
                      {league.source === 'sleeper' ? (
                        <Download className="h-3 w-3 mr-1" />
                      ) : (
                        <Plus className="h-3 w-3 mr-1" />
                      )}
                      {league.source}
                    </Badge>
                    <div className="text-left">
                      <div className="font-medium">{league.team_name}</div>
                      <div className="text-xs opacity-70">{league.name}</div>
                    </div>
                    {switchingLeague && currentLeague.id !== league.id && (
                      <div className="ml-auto">
                        <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Settings Button */}
      <Dialog open={showManager} onOpenChange={setShowManager}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>League Management</DialogTitle>
          </DialogHeader>
          <LeagueManager onClose={() => setShowManager(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
} 