"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import { motion } from "framer-motion"

interface LeaderboardPlayer {
  id: string
  name: string
  totalScore: number
  rank: number
}

interface LeaderboardTableProps {
  title?: string
  description?: string
  limit?: number
}

export function LeaderboardTable({
  title = "Leaderboard",
  description = "Top players ranked by score",
  limit = 10,
}: LeaderboardTableProps) {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // In a real app, fetch from API
        // For demo, use mock data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockData = [
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

        setPlayers(mockData.slice(0, limit))
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [limit])

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Card className="border-2 border-muted">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {players.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className={`flex items-center p-3 rounded-lg ${index < 3 ? "bg-muted/50" : ""}`}>
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${
                    index === 0
                      ? "bg-yellow-500/20 text-yellow-500"
                      : index === 1
                        ? "bg-gray-300/20 text-gray-300"
                        : index === 2
                          ? "bg-amber-600/20 text-amber-600"
                          : "bg-muted text-muted-foreground"
                  }`}
                >
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
      </CardContent>
    </Card>
  )
}

