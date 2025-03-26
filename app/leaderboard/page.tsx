"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Trophy } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

// Mock leaderboard data
const mockLeaderboardData = [
  { id: "player1", name: "Alex", totalScore: 2450, rank: 1 },
  { id: "player2", name: "Jordan", totalScore: 2320, rank: 2 },
  { id: "player3", name: "Taylor", totalScore: 1570, rank: 3 },
  { id: "player4", name: "Casey", totalScore: 1490, rank: 4 },
  { id: "player5", name: "Riley", totalScore: 1350, rank: 5 },
  { id: "player6", name: "Morgan", totalScore: 1240, rank: 6 },
  { id: "player7", name: "Jamie", totalScore: 1120, rank: 7 },
  { id: "player8", name: "Quinn", totalScore: 980, rank: 8 },
  { id: "player9", name: "Avery", totalScore: 870, rank: 9 },
  { id: "player10", name: "Dakota", totalScore: 760, rank: 10 },
]

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      // In a real app, fetch from API
      // For demo, use mock data
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setLeaderboardData(mockLeaderboardData)
      setIsLoading(false)
    }

    fetchLeaderboard()
  }, [])

  return (
    <div className="min-h-screen arcade-bg p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold neon-text">Arcade Leaderboard</h1>
        </div>

        <Card className="border-2 border-muted neon-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Top Players
            </CardTitle>
            <CardDescription>The highest scoring players in the arcade</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {leaderboardData.slice(0, 3).map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card
                        className={`border-2 ${index === 0 ? "border-yellow-500 neon-border" : index === 1 ? "border-gray-300 neon-border" : "border-amber-600 neon-border"}`}
                      >
                        <CardContent className="p-6 text-center">
                          <div
                            className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                              index === 0
                                ? "bg-yellow-500/20 text-yellow-500"
                                : index === 1
                                  ? "bg-gray-300/20 text-gray-300"
                                  : "bg-amber-600/20 text-amber-600"
                            }`}
                          >
                            <Trophy className="h-6 w-6" />
                          </div>
                          <div className="text-lg font-bold mb-1">{player.name}</div>
                          <div className="text-2xl font-bold text-primary neon-text">{player.totalScore}</div>
                          <div className="text-xs text-muted-foreground">points</div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-3">
                  {leaderboardData.slice(3).map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                    >
                      <div className="flex items-center p-3 bg-muted/30 rounded-lg">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full mr-3 bg-muted text-muted-foreground">
                          {player.rank}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{player.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{player.totalScore}</div>
                          <div className="text-xs text-muted-foreground">points</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

