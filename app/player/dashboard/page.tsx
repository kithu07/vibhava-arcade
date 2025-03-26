"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, QrCode, Gamepad2, ArrowLeft, Info } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import QRCode from "react-qr-code"
import { motion } from "framer-motion"

// Game type definition
interface Game {
  id: string;
  name: string;
  description: string;
  instructions?: string;
}

// Score type definition
interface Score {
  gameId: string;
  score: number;
  playedAt: string;
}

// Player type definition
interface Player {
  _id: string;
  name: string;
  phone: string;
  scores: Score[];
  totalScore?: number;
}

export default function PlayerDashboard() {
  const router = useRouter()
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [playerName, setPlayerName] = useState<string | null>(null)
  const [player, setPlayer] = useState<Player | null>(null)
  const [games, setGames] = useState<Game[]>([])
  const [rank, setRank] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [leaderboardData, setLeaderboardData] = useState<Player[]>([])
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(true)

  // Fetch games from API
  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games');
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }
      const data = await response.json();
      setGames(data);
    } catch (error) {
      console.error('Error fetching games:', error);
      setError('Failed to load games. Please refresh the page.');
    }
  };

  // Fetch player data from API
  const fetchPlayerData = async (id: string) => {
    try {
      console.log("Fetching player data with ID:", id);
      const response = await fetch(`/api/players/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.error("Player not found with ID:", id);
          setError("Player not found. Please log in again.");
          localStorage.removeItem("arcadePlayerId");
          localStorage.removeItem("arcadePlayerName");
          return null;
        }
        throw new Error('Failed to fetch player data');
      }
      
      const data = await response.json();
      console.log("Player data received:", data);
      setPlayer(data);
      return data;
    } catch (error) {
      console.error('Error fetching player:', error);
      setError("Failed to load player data. Please refresh the page.");
      return null;
    }
  };

  // Fetch player rank
  const fetchRank = async (id: string) => {
    try {
      const response = await fetch('/api/players');
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      
      const data = await response.json();
      
      // Find player's rank
      const playerRank = data.findIndex((p: Player) => p._id === id) + 1;
      setRank(playerRank > 0 ? playerRank : null);
    } catch (error) {
      console.error('Error fetching rank:', error);
      setRank(null);
    }
  };

  // Add a function to fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      setIsLeaderboardLoading(true)
      const response = await fetch('/api/players')
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard')
      }
      
      const data = await response.json()
      console.log("Leaderboard data:", data)
      
      // Sort by total score (the API should already return sorted data)
      const sortedData = data.sort((a: Player, b: Player) => 
        (b.totalScore || 0) - (a.totalScore || 0)
      )
      
      setLeaderboardData(sortedData)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setIsLeaderboardLoading(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Check if player is logged in
        const id = localStorage.getItem("arcadePlayerId")
        const name = localStorage.getItem("arcadePlayerName")

        if (!id) {
          console.log("No player ID found, redirecting to login");
          router.push("/login/player")
          return
        }

        console.log("Using player ID from storage:", id);
        setPlayerId(id)
        if (name) setPlayerName(name)

        // Fetch games and player data and leaderboard
        await Promise.all([
          fetchGames(),
          fetchPlayerData(id).then(player => {
            if (player) {
              fetchRank(player._id);
              // Also fetch leaderboard data
              fetchLeaderboard();
            } else {
              console.log("No player data returned, redirecting to login");
              router.push("/login/player");
            }
          })
        ]);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load data. Please refresh and try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router])

  const getPlayedGames = () => {
    if (!player?.scores || !games.length) return [];
    return games.filter((game) => player.scores.some((score) => score.gameId === game.id));
  }

  const getUnplayedGames = () => {
    if (!player?.scores || !games.length) return [];
    return games.filter((game) => !player.scores.some((score) => score.gameId === game.id));
  }

  if (isLoading) {
    return (
      <div className="min-h-screen arcade-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen arcade-bg flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button className="mt-4 w-full" onClick={() => router.push('/login/player')}>
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!playerId || !playerName || !player) {
    return (
      <div className="min-h-screen arcade-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen arcade-bg p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold neon-text">Player Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="border-2 border-muted">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-primary" />
                  Your QR Code
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="bg-white p-2 rounded-lg mb-2">
                  <QRCode value={playerId} size={100} />
                </div>
                <p className="text-sm text-center">Scan at game stations</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border-2 border-muted">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  Your Rank
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold neon-text mb-1">#{rank || '-'}</div>
                <p className="text-sm text-muted-foreground">
                  Total Score: <span className="text-primary font-semibold">{player.totalScore || 0}</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="border-2 border-muted">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4 text-primary" />
                  Games Played
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold neon-text mb-1">
                  {player.scores?.length || 0}/{games.length}
                </div>
                <p className="text-sm text-muted-foreground">{games.length - (player.scores?.length || 0)} games remaining</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Tabs defaultValue="games" className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="games" className="text-sm">
              Available Games
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-sm">
              Leaderboard
            </TabsTrigger>
          </TabsList>
          <TabsContent value="games">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <Card className="border-2 border-muted">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5 text-primary" />
                    Games
                  </CardTitle>
                  <CardDescription>Games you've played and games still available</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {getUnplayedGames().length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                          Available Games
                        </h3>
                        <div className="grid gap-3">
                          {getUnplayedGames().map((game) => (
                            <Card key={game.id} className="border border-muted">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium">{game.name}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">{game.description}</p>
                                  </div>
                                  <Button variant="outline" size="sm" className="shrink-0">
                                    <Info className="h-4 w-4 mr-1" />
                                    Details
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {getPlayedGames().length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                          Completed Games
                        </h3>
                        <div className="grid gap-3">
                          {getPlayedGames().map((game) => {
                            const scoreData = player.scores.find((s) => s.gameId === game.id)
                            return (
                              <Card key={game.id} className="border border-muted">
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-medium">{game.name}</h4>
                                      <p className="text-sm text-muted-foreground mt-1">{game.description}</p>
                                      <p className="text-sm text-primary font-medium mt-2">
                                        Your score: {scoreData?.score}
                                      </p>
                                    </div>
                                    <Button variant="outline" size="sm" className="shrink-0">
                                      <Info className="h-4 w-4 mr-1" />
                                      Details
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="leaderboard">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <Card className="border-2 border-muted">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Leaderboard
                  </CardTitle>
                  <CardDescription>Top players across all games</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLeaderboardLoading ? (
                    <div className="flex justify-center p-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : leaderboardData.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      No players found
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {leaderboardData.slice(0, 10).map((leaderPlayer, index) => {
                        const isCurrentPlayer = playerId === leaderPlayer.playerId || 
                          playerId === leaderPlayer._id;
                        
                        return (
                          <div 
                            key={leaderPlayer._id} 
                            className={`flex items-center p-3 rounded-lg ${
                              isCurrentPlayer ? "bg-primary/10 border border-primary/30" : "bg-muted/30"
                            }`}
                          >
                            <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${
                              index < 3 ? 
                                index === 0 ? "bg-yellow-500/20 text-yellow-500" : 
                                index === 1 ? "bg-gray-300/20 text-gray-300" : 
                                "bg-amber-600/20 text-amber-600" 
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className={`font-medium ${isCurrentPlayer ? "text-primary" : ""}`}>
                                {leaderPlayer.name}
                                {isCurrentPlayer && " (You)"}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-bold ${isCurrentPlayer ? "text-primary" : ""}`}>
                                {leaderPlayer.totalScore || 0}
                              </div>
                              <div className="text-xs text-muted-foreground">points</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

