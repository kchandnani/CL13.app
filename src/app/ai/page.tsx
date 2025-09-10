'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/page-header'
import { getAllRosterPlayers } from '@/utils/sleeper'
import { useCurrentRoster } from '@/hooks/useUserData'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

export default function AIPage() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { roster, teamName, leagueName } = useCurrentRoster()

  const suggestedQuestions = [
    "Should I start Waddle or Hall in Week 5?",
    "Who's the better pickup this week?",
    "Which defense should I stream?",
    "What trades should I consider?",
    "Who are my most injury-prone players?",
    "Rank my RBs by this week's matchup"
  ]

  const handleSendMessage = async () => {
    if (!question.trim()) return
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: question.trim(),
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setQuestion('')
    setIsLoading(true)
    
    try {
      // For now, we'll add a placeholder AI response
      // This is where you'd integrate with your Python AI backend
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API call
      
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Thanks for your question about "${userMessage.content}". I'm currently being developed and will soon provide personalized fantasy football advice based on your ${teamName} roster in ${leagueName}. For now, I can see your roster has ${getAllRosterPlayers(roster).length} players including ${roster.QB.join(', ')} at QB.`,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedQuestion = (suggestion: string) => {
    setQuestion(suggestion)
  }

  const totalPlayers = getAllRosterPlayers(roster).length

  return (
    <div className="container max-w-screen-2xl px-6 py-10">
      <PageHeader
        title="AI Fantasy Assistant"
        description={`Get personalized advice for ${teamName} in ${leagueName}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat Interface */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🤖 Chat with FNTZ AI</CardTitle>
              <CardDescription>
                Ask questions about your roster, matchups, and strategy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Chat Messages */}
              <div className="min-h-[400px] max-h-[400px] overflow-y-auto border rounded-lg p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <div className="text-4xl mb-2">💬</div>
                    <p>Start a conversation with FNTZ AI!</p>
                    <p className="text-sm">Try one of the suggested questions below.</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'fntz-gradient text-black'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Ask FNTZ AI anything about your roster..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Press Enter to send, Shift+Enter for new line
                  </span>
                  <Button onClick={handleSendMessage} disabled={!question.trim() || isLoading}>
                    Send Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Suggested Questions */}
          <Card>
            <CardHeader>
              <CardTitle>💡 Suggested Questions</CardTitle>
              <CardDescription>Click any question to ask FNTZ AI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2">
                {suggestedQuestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="text-left justify-start h-auto p-3"
                    onClick={() => handleSuggestedQuestion(suggestion)}
                  >
                    <span className="text-sm">{suggestion}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Roster Context Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📋 Your Roster Context</CardTitle>
              <CardDescription>AI will consider this when answering</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Team:</span>
                  <span>{teamName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">League:</span>
                  <span className="text-right">{leagueName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Total Players:</span>
                  <span>{totalPlayers}</span>
                </div>
              </div>

              {totalPlayers > 0 ? (
                <div className="space-y-3">
                  {Object.entries(roster).map(([position, players]) => (
                    players.length > 0 && (
                      <div key={position} className="space-y-1">
                        <div className="text-xs font-medium text-muted-foreground">{position}</div>
                        {players.map((player: string) => (
                          <div key={player} className="text-sm px-2 py-1 bg-muted rounded">
                            {player}
                          </div>
                        ))}
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    No roster configured. Add players to get personalized AI advice.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔧 AI Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  🟡 In Development
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                FNTZ AI is currently being developed. Soon it will provide real-time fantasy advice based on injury data, trends, and matchups.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 