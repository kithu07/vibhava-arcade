"use client"

import { useEffect, useState } from "react"
import { GameCard } from "@/components/GameCard"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface Game {
    id: string
    name: string
    description: string
    instructions: string
    developedBy?: string
}

export function GamesList() {
    const [games, setGames] = useState<Game[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await fetch('/api/games')
                if (!response.ok) {
                    throw new Error('Failed to fetch games')
                }
                const data = await response.json()
                setGames(data)
            } catch (err) {
                console.error("Error fetching games:", err)
                setError("Failed to load games. Please try again later.")
            } finally {
                setLoading(false)
            }
        }

        fetchGames()
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center text-destructive p-8 bg-destructive/10 rounded-lg border border-destructive/20">
                <p>{error}</p>
            </div>
        )
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    return (
        <div className="w-full py-12">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold neon-text mb-2">Available Games</h2>
                <p className="text-muted-foreground">Select a game to view details and instructions</p>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-6xl mx-auto px-4"
            >
                {games.map((game) => (
                    <GameCard key={game.id} game={game} />
                ))}
            </motion.div>
        </div>
    )
}
