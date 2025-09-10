'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Trash2, Plus, Download, Users, Trophy, Settings } from 'lucide-react'
import { useUserData } from '@/hooks/useUserData'

interface LeagueManagerProps {
  onClose?: () => void;
}

export function LeagueManager({ onClose }: LeagueManagerProps) {
  const {
    currentLeague,
    allLeagues,
    hasLeagues,
    loading,
    switchingLeague,
    error,
    importFromSleeper,
    createManualRoster,
    switchLeague,
    removeLeague
  } = useUserData();

  const [sleeperUsername, setSleeperUsername] = useState('');
  const [sleeperSeason, setSleeperSeason] = useState('2024');
  const [manualName, setManualName] = useState('');
  const [manualTeamName, setManualTeamName] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [showCreateManual, setShowCreateManual] = useState(false);

  const handleSleeperImport = async () => {
    if (!sleeperUsername.trim()) return;
    
    setImportLoading(true);
    try {
      await importFromSleeper(sleeperUsername.trim(), sleeperSeason);
      setSleeperUsername('');
      onClose?.();
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setImportLoading(false);
    }
  };

  const handleCreateManual = () => {
    if (!manualName.trim() || !manualTeamName.trim()) return;
    
    createManualRoster(manualName.trim(), manualTeamName.trim());
    setManualName('');
    setManualTeamName('');
    setShowCreateManual(false);
    onClose?.();
  };

  const handleLeagueSwitch = (leagueId: string) => {
    switchLeague(leagueId);
    onClose?.();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="import" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="import">Import from Sleeper</TabsTrigger>
          <TabsTrigger value="manual">Manual Roster</TabsTrigger>
          <TabsTrigger value="manage">Manage Leagues</TabsTrigger>
        </TabsList>

        {/* Sleeper Import Tab */}
        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Import from Sleeper
              </CardTitle>
              <CardDescription>
                Enter your Sleeper username to import all your leagues and rosters automatically
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="sleeper-username">Sleeper Username</Label>
                  <Input
                    id="sleeper-username"
                    placeholder="YourSleeperUsername"
                    value={sleeperUsername}
                    onChange={(e) => setSleeperUsername(e.target.value)}
                    disabled={importLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="sleeper-season">Season</Label>
                  <Input
                    id="sleeper-season"
                    placeholder="2024"
                    value={sleeperSeason}
                    onChange={(e) => setSleeperSeason(e.target.value)}
                    disabled={importLoading}
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleSleeperImport}
                disabled={!sleeperUsername.trim() || importLoading}
                className="w-full"
              >
                {importLoading ? (
                  <>
                    <Skeleton className="h-4 w-4 mr-2" />
                    Importing leagues...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Import My Leagues
                  </>
                )}
              </Button>
              
              <div className="text-sm text-muted-foreground">
                <p><strong>Note:</strong> Your Sleeper username is public information. We only read your league rosters and settings - no private data is accessed.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Roster Tab */}
        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Manual Roster
              </CardTitle>
              <CardDescription>
                Build a custom roster manually if you don&apos;t use Sleeper or want multiple test rosters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="manual-name">League Name</Label>
                  <Input
                    id="manual-name"
                    placeholder="My Fantasy League"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="manual-team">Team Name</Label>
                  <Input
                    id="manual-team"
                    placeholder="My Team Name"
                    value={manualTeamName}
                    onChange={(e) => setManualTeamName(e.target.value)}
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleCreateManual}
                disabled={!manualName.trim() || !manualTeamName.trim()}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Empty Roster
              </Button>
              
              <div className="text-sm text-muted-foreground">
                <p>After creating, you can add players manually through the roster management page.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Leagues Tab */}
        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Your Leagues & Rosters
              </CardTitle>
              <CardDescription>
                Switch between your leagues or remove ones you no longer need
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allLeagues.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No leagues yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Import from Sleeper or create a manual roster to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allLeagues.map((league) => (
                    <div 
                      key={league.id}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        currentLeague?.id === league.id ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {league.source === 'sleeper' ? (
                            <Badge variant="outline" className="text-xs">
                              <Download className="h-3 w-3 mr-1" />
                              Sleeper
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              <Plus className="h-3 w-3 mr-1" />
                              Manual
                            </Badge>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{league.name}</div>
                          <div className="text-sm text-muted-foreground">{league.team_name}</div>
                          {league.source === 'sleeper' && (
                            <div className="text-xs text-muted-foreground">
                              {league.settings?.num_teams || 'Unknown'} teams
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {currentLeague?.id === league.id ? (
                          <Badge className="fntz-gradient text-black">
                            Current
                          </Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLeagueSwitch(league.id)}
                            disabled={switchingLeague}
                          >
                            {switchingLeague ? (
                              <>
                                <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full mr-2" />
                                Switching...
                              </>
                            ) : (
                              'Switch'
                            )}
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLeague(league.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 