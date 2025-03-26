"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, Check, QrCode, Scan, X, UserIcon, 
  Trophy, Clock, ArrowUpDown, Edit, AlertCircle 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Dynamically import the QR reader component
const QrReader = dynamic(() => import("@/components/QrReader"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />
});

// Game type definition
interface Game {
  _id?: string;
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
  playerId?: string;
  name: string;
  phone: string;
  scores: Score[];
  totalScore?: number;
}

export default function VolunteerScanner() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"scan" | "scores">("scan");
  const [isLookupMode, setIsLookupMode] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedPlayerId, setScannedPlayerId] = useState<string | null>(null);
  const [playerData, setPlayerData] = useState<Player | null>(null);
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [score, setScore] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [gamesMap, setGamesMap] = useState<Record<string, Game>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [lookupId, setLookupId] = useState<string>("");
  const [isUpdatingScore, setIsUpdatingScore] = useState(false);
  const [existingScoreId, setExistingScoreId] = useState<string | null>(null);

  // Fetch games from API
  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games');
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }
      const data = await response.json();
      
      // Create a map of game IDs to game objects for quick lookup
      const gameMapping: Record<string, Game> = {};
      data.forEach((game: Game) => {
        gameMapping[game.id] = game;
      });
      
      setGamesMap(gameMapping);
      setGames(data);
    } catch (error) {
      console.error('Error fetching games:', error);
      setError('Failed to load games. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    
    try {
      // Check if volunteer is logged in - safely handle localStorage
      const loginStatus = localStorage.getItem("arcadeVolunteerLoggedIn");
      setIsLoggedIn(loginStatus === "true");
      
      if (loginStatus !== "true") {
        router.push("/login/volunteer");
        return;
      }

      // Fetch games when component mounts
      fetchGames();
    } catch (err) {
      // Handle any localStorage or JSON parse errors
      console.error("Error checking login status:", err);
    }
  }, [router]);

  // Fetch player data from API
  const fetchPlayerData = async (playerId: string) => {
    try {
      setIsLoading(true);
      console.log("Fetching player data for ID:", playerId);
      
      const response = await fetch(`/api/players/${playerId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Player not found. Please check the ID and try again.");
          setPlayerData(null);
          return null;
        }
        throw new Error('Failed to fetch player data');
      }
      
      const data = await response.json();
      console.log("Player data received:", data);
      setPlayerData(data);
      setError("");
      setActiveTab("scan");
      return data;
    } catch (error) {
      console.error('Error fetching player:', error);
      setError("Failed to load player data. Please try again.");
      setPlayerData(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayerLookup = () => {
    if (!lookupId) {
      setError("Please enter a player ID");
      return;
    }
    
    setScannedPlayerId(lookupId);
    fetchPlayerData(lookupId);
    setIsLookupMode(false);
  };
  
  const handleScan = (result: string) => {
    console.log("Player ID input:", result);
    setScannedPlayerId(result);
    fetchPlayerData(result);
    setIsScanning(false);
  };

  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId);
    
    // If player has already played this game, populate the score field
    if (playerData?.scores) {
      const existingScore = playerData.scores.find(s => s.gameId === gameId);
      if (existingScore) {
        setScore(existingScore.score.toString());
        setIsUpdatingScore(true);
        setExistingScoreId(gameId);
      } else {
        setScore("");
        setIsUpdatingScore(false);
        setExistingScoreId(null);
      }
    }
  };
  
  const handleExistingScoreEdit = (gameId: string) => {
    setSelectedGame(gameId);
    const existingScore = playerData?.scores.find(s => s.gameId === gameId);
    if (existingScore) {
      setScore(existingScore.score.toString());
      setIsUpdatingScore(true);
      setExistingScoreId(gameId);
      setActiveTab("scan");
    }
  };

  const handleSubmitScore = async () => {
    setError("");
    setSuccess("");

    if (!scannedPlayerId) {
      setError("No player selected");
      return;
    }

    if (!selectedGame) {
      setError("Please select a game");
      return;
    }

    if (!score || isNaN(Number(score))) {
      setError("Please enter a valid score");
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit score to API with updateExisting flag if we're updating
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId: scannedPlayerId,
          gameId: selectedGame,
          score: Number(score),
          updateExisting: isUpdatingScore
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Special handling for the case where player already has a score
        if (response.status === 409 && errorData.canUpdate) {
          setIsUpdatingScore(true);
          setExistingScoreId(selectedGame);
          setError(`Player already has a score of ${errorData.existingScore.score} for this game. You can update it.`);
          setIsSubmitting(false);
          return;
        }
        
        throw new Error(errorData.error || 'Failed to submit score');
      }

      const data = await response.json();
      console.log("Score submission result:", data);

      // Fetch updated player data
      await fetchPlayerData(scannedPlayerId);
      
      if (data.updated) {
        setSuccess(`Score updated successfully from ${data.previousScore} to ${data.score}!`);
      } else {
        setSuccess("Score submitted successfully!");
      }
      
      setScore("");
      setSelectedGame("");
      setIsUpdatingScore(false);
      setExistingScoreId(null);
    } catch (err: any) {
      setError(err.message || "Failed to submit score. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetScan = () => {
    setScannedPlayerId(null);
    setPlayerData(null);
    setSelectedGame("");
    setScore("");
    setError("");
    setSuccess("");
    setLookupId("");
    setIsUpdatingScore(false);
    setExistingScoreId(null);
    setActiveTab("scan");
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (err) {
      return dateString;
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen arcade-bg p-4">
        <div className="max-w-md mx-auto">
          <Skeleton className="h-12 w-full mb-6" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen arcade-bg p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold neon-text">Volunteer Scanner</h1>
        </div>

        {!isLookupMode && !isScanning && !scannedPlayerId && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="border-2 border-muted neon-border mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-primary" />
                  Scan Player QR Code
                </CardTitle>
                <CardDescription>Scan a player's QR code to record their score</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <Scan className="h-24 w-24 text-primary opacity-80" />
                <Button
                  onClick={() => setIsScanning(true)}
                  className="w-full"
                  disabled={isLoading || games.length === 0}
                >
                  {isLoading ? "Loading..." : "Scan QR Code"}
                </Button>
                {games.length === 0 && !isLoading && (
                  <p className="text-destructive text-sm text-center">No games available. Please contact an admin.</p>
                )}
              </CardContent>
            </Card>
            
            <Card className="border-2 border-muted">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-primary" />
                  Player Lookup
                </CardTitle>
                <CardDescription>Enter a player ID to record their game score</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <UserIcon className="h-24 w-24 text-primary opacity-80" />
                <Button
                  onClick={() => setIsLookupMode(true)}
                  className="w-full"
                  disabled={isLoading || games.length === 0}
                >
                  {isLoading ? "Loading..." : "Look Up Player"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {isScanning && !scannedPlayerId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-muted">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-primary" />
                  Enter Player ID
                </CardTitle>
                <CardDescription>Scan the player's QR code or enter ID manually</CardDescription>
              </CardHeader>
              <CardContent>
                {isClient && (
                  <QrReader 
                    onResult={handleScan} 
                    onCancel={() => setIsScanning(false)} 
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {isLookupMode && !scannedPlayerId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-muted">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-primary" />
                  Look Up Player
                </CardTitle>
                <CardDescription>Enter the player's ID</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    placeholder="Enter player ID"
                    value={lookupId}
                    onChange={(e) => setLookupId(e.target.value)}
                  />
                  <Button
                    className="w-full"
                    onClick={handlePlayerLookup}
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Look Up Player"}
                  </Button>
                  {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-2 rounded flex items-center gap-2">
                      <X className="h-4 w-4" />
                      {error}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => setIsLookupMode(false)} className="w-full">
                  Go Back
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {scannedPlayerId && playerData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="border-2 border-muted mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  Player Found: {playerData.name}
                </CardTitle>
                <CardDescription>
                  Player ID: {playerData.playerId || playerData._id}
                  {playerData.totalScore !== undefined && (
                    <div className="mt-1 flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span>Total Score: {playerData.totalScore}</span>
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "scan" | "scores")}>
                <TabsList className="w-full">
                  <TabsTrigger value="scan" className="flex-1">Record Score</TabsTrigger>
                  <TabsTrigger value="scores" className="flex-1">View Scores</TabsTrigger>
                </TabsList>
                
                <TabsContent value="scan">
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="game">
                          {isUpdatingScore ? "Update Score for Game" : "Select Game"}
                          {isUpdatingScore && (
                            <Badge variant="outline" className="ml-2">
                              <Edit className="h-3 w-3 mr-1" />
                              Updating
                            </Badge>
                          )}
                        </Label>
                        <Select value={selectedGame} onValueChange={handleGameSelect}>
                          <SelectTrigger id="game">
                            <SelectValue placeholder="Select a game" />
                          </SelectTrigger>
                          <SelectContent>
                            {games.map((game) => {
                              const hasPlayed = playerData.scores?.some(s => s.gameId === game.id);
                              return (
                                <SelectItem key={game.id} value={game.id}>
                                  {game.name} {hasPlayed ? "⭐" : ""}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {isUpdatingScore && (
                        <div className="bg-primary/10 text-primary text-sm p-2 rounded flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Updating existing score for this game
                        </div>
                      )}
                      
                      <div className="grid gap-2">
                        <Label htmlFor="score">Score</Label>
                        <Input
                          id="score"
                          type="number"
                          placeholder="Enter player's score"
                          value={score}
                          onChange={(e) => setScore(e.target.value)}
                        />
                      </div>
                      
                      {error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-2 rounded flex items-center gap-2">
                          <X className="h-4 w-4" />
                          {error}
                        </div>
                      )}
                      
                      {success && (
                        <div className="bg-primary/10 text-primary text-sm p-2 rounded flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          {success}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex flex-col gap-2">
                    <Button onClick={handleSubmitScore} className="w-full" disabled={isSubmitting}>
                      {isSubmitting 
                        ? "Submitting..." 
                        : isUpdatingScore 
                          ? "Update Score" 
                          : "Submit Score"
                      }
                    </Button>
                    <Button variant="outline" onClick={resetScan} className="w-full">
                      Scan Another Player
                    </Button>
                  </CardFooter>
                </TabsContent>
                
                <TabsContent value="scores">
                  <CardContent>
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Player's Game History</h3>
                      
                      {playerData.scores && playerData.scores.length > 0 ? (
                        <div className="space-y-3">
                          {playerData.scores.map((score, index) => (
                            <div key={index} className="bg-muted p-3 rounded-md">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium">
                                    {gamesMap[score.gameId]?.name || `Game ${score.gameId}`}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Trophy className="h-3 w-3" />
                                    <span>Score: {score.score}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                    <Clock className="h-3 w-3" />
                                    <span>Played: {formatDate(score.playedAt)}</span>
                                  </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8"
                                  onClick={() => handleExistingScoreEdit(score.gameId)}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <p>No game scores yet</p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-sm">
                          <span className="font-medium">Games Played:</span> {playerData.scores?.length || 0}/{games.length}
                        </div>
                        {playerData.totalScore !== undefined && (
                          <div className="text-sm">
                            <span className="font-medium">Total Score:</span> {playerData.totalScore}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button variant="outline" onClick={resetScan} className="w-full">
                      Scan Another Player
                    </Button>
                  </CardFooter>
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>
        )}

        {scannedPlayerId && !playerData && !error && (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </div>
  );
}