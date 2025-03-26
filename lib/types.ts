export interface Player {
  id: string
  name: string
  phone: string
  scores: GameScore[]
  totalScore: number
}

export interface GameScore {
  gameId: string
  score: number
  playedAt: Date
}

export interface Game {
  id: string
  name: string
  description: string
  instructions: string
}

