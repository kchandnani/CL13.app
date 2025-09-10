import React, { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/design-system'
import { FntzCard, FntzCardHeader, FntzCardTitle, FntzCardDescription, FntzCardContent } from '@/components/ui/fntz-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Users, 
  Gamepad2, 
  BarChart3, 
  Activity, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Zap,
  Shield,
  TrendingUp 
} from 'lucide-react'

interface WelcomeFlowProps {
  onComplete: (data: { setupType: 'sleeper' | 'manual'; sleeperUsername?: string }) => void
  className?: string
}

interface OnboardingStep {
  id: string
  title: string
  description: string
  component: React.ComponentType<any>
}

const WelcomeStep: React.FC<{ onNext: () => void }> = ({ onNext }) => (
  <div className="text-center space-y-8 max-w-2xl mx-auto">
    <div className="space-y-4">
      <div className="mx-auto w-24 h-24 rounded-3xl overflow-hidden shadow-2xl bg-white/5 backdrop-blur-sm">
        <Image
          src="/logos/logo_icon_128x128.png" 
          alt="FNTZ AI Logo" 
          width={96}
          height={96}
          className="w-full h-full object-contain p-2"
        />
      </div>
      <div className="space-y-2">
        <h1 className="fntz-heading-1">Welcome to FNTZ AI</h1>
        <p className="fntz-body text-muted-foreground max-w-lg mx-auto">
          The smartest way to manage your fantasy football team. Get real-time insights, 
          player comparisons, and AI-powered recommendations.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="text-center p-6">
        <div className="w-12 h-12 rounded-xl fntz-info mx-auto mb-4 flex items-center justify-center">
          <Activity className="h-6 w-6" />
        </div>
        <h3 className="fntz-heading-4 mb-2">Real-time Data</h3>
        <p className="fntz-body-small">
          Live injury updates and trending player insights from Sleeper API
        </p>
      </div>
      
      <div className="text-center p-6">
        <div className="w-12 h-12 rounded-xl fntz-warning mx-auto mb-4 flex items-center justify-center">
          <BarChart3 className="h-6 w-6" />
        </div>
        <h3 className="fntz-heading-4 mb-2">Advanced Analytics</h3>
        <p className="fntz-body-small">
          Player comparisons, matchup analysis, and roster optimization tools
        </p>
      </div>
      
      <div className="text-center p-6">
        <div className="w-12 h-12 rounded-xl fntz-success mx-auto mb-4 flex items-center justify-center">
          <Zap className="h-6 w-6" />
        </div>
        <h3 className="fntz-heading-4 mb-2">AI Insights</h3>
        <p className="fntz-body-small">
          Smart recommendations for lineups, trades, and waiver wire moves
        </p>
      </div>
    </div>

    <Button onClick={onNext} size="lg" className="px-8">
      Get Started
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  </div>
)

const SetupTypeStep: React.FC<{ 
  onSelect: (type: 'sleeper' | 'manual') => void 
  onBack: () => void 
}> = ({ onSelect, onBack }) => (
  <div className="max-w-4xl mx-auto space-y-8">
    <div className="text-center space-y-4">
      <h2 className="fntz-heading-2">Choose Your Setup Method</h2>
      <p className="fntz-body text-muted-foreground max-w-2xl mx-auto">
        Connect your existing Sleeper league for instant setup, or create a manual roster 
        to track any fantasy team.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Sleeper Integration */}
      <FntzCard 
        variant="interactive" 
        className="group cursor-pointer p-8"
        onClick={() => onSelect('sleeper')}
      >
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-2xl fntz-success flex items-center justify-center group-hover:scale-110 transition-transform">
            <Gamepad2 className="h-8 w-8" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <FntzCardTitle level={3}>Connect Sleeper</FntzCardTitle>
              <Badge variant="secondary">Recommended</Badge>
            </div>
            <FntzCardDescription className="text-base">
              Import your existing Sleeper leagues automatically
            </FntzCardDescription>
          </div>

          <div className="space-y-3 text-left">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
              <span className="fntz-body-small">Instant roster import</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
              <span className="fntz-body-small">Real league settings sync</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
              <span className="fntz-body-small">Multiple leagues support</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
              <span className="fntz-body-small">No manual entry needed</span>
            </div>
          </div>

          <Button className="w-full group-hover:bg-primary/90 transition-colors">
            Connect with Sleeper
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </FntzCard>

      {/* Manual Setup */}
      <FntzCard 
        variant="interactive" 
        className="group cursor-pointer p-8"
        onClick={() => onSelect('manual')}
      >
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-2xl fntz-info flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="h-8 w-8" />
          </div>
          
          <div className="space-y-2">
            <FntzCardTitle level={3}>Manual Roster</FntzCardTitle>
            <FntzCardDescription className="text-base">
              Build your roster manually from our player database
            </FntzCardDescription>
          </div>

          <div className="space-y-3 text-left">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-4 w-4 text-info flex-shrink-0" />
              <span className="fntz-body-small">Works with any league</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-4 w-4 text-info flex-shrink-0" />
              <span className="fntz-body-small">2000+ NFL players available</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-4 w-4 text-info flex-shrink-0" />
              <span className="fntz-body-small">Custom team names</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-4 w-4 text-info flex-shrink-0" />
              <span className="fntz-body-small">Full analytics access</span>
            </div>
          </div>

          <Button variant="outline" className="w-full group-hover:bg-muted transition-colors">
            Create Manual Roster
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </FntzCard>
    </div>

    <div className="flex justify-center">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
    </div>
  </div>
)

const SleeperSetupStep: React.FC<{ 
  onComplete: (username: string) => void
  onBack: () => void
}> = ({ onComplete, onBack }) => {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return

    setLoading(true)
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    onComplete(username.trim())
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl fntz-success mx-auto flex items-center justify-center">
          <Gamepad2 className="h-8 w-8" />
        </div>
        <h2 className="fntz-heading-2">Connect Your Sleeper Account</h2>
        <p className="fntz-body text-muted-foreground">
          Enter your Sleeper username to import your leagues and rosters automatically.
        </p>
      </div>

      <FntzCard variant="elevated" className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="fntz-body font-medium">
              Sleeper Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your Sleeper username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="text-lg p-4"
              autoFocus
            />
            <p className="fntz-body-small">
              This is the username you use to log into Sleeper, not your display name.
            </p>
          </div>

          <div className="fntz-info p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-sm">Privacy & Security</p>
                <p className="text-xs">
                  We only read public league data. Your login credentials are never stored or accessed.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={loading}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              type="submit"
              disabled={!username.trim() || loading}
              className="flex-1"
            >
              {loading ? 'Connecting...' : 'Import Leagues'}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </form>
      </FntzCard>
    </div>
  )
}

export const WelcomeFlow: React.FC<WelcomeFlowProps> = ({ onComplete, className }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [setupType, setSetupType] = useState<'sleeper' | 'manual' | null>(null)

  // Render the current step directly instead of using a complex props system
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={() => setCurrentStep(1)} />
      case 1:
        return (
          <SetupTypeStep
            onSelect={(type: 'sleeper' | 'manual') => {
              setSetupType(type)
              if (type === 'manual') {
                onComplete({ setupType: 'manual' })
              } else {
                setCurrentStep(2)
              }
            }}
            onBack={() => setCurrentStep(0)}
          />
        )
      case 2:
        return (
          <SleeperSetupStep
            onComplete={(username: string) => {
              onComplete({ setupType: 'sleeper', sleeperUsername: username })
            }}
            onBack={() => setCurrentStep(1)}
          />
        )
      default:
        return <WelcomeStep onNext={() => setCurrentStep(1)} />
    }
  }

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center p-6",
      className
    )}>
      <div className="w-full max-w-6xl animate-fade-in">
        {/* Progress Indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[0, 1, 2].map((step) => (
              <div key={step} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  currentStep >= step 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {currentStep > step ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    step + 1
                  )}
                </div>
                {step < 2 && (
                  <div className={cn(
                    "w-12 h-0.5 mx-2 transition-colors",
                    currentStep > step ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {renderCurrentStep()}
      </div>
    </div>
  )
} 