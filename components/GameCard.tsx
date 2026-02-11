"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Gamepad2, User } from "lucide-react"

interface Game {
    id: string
    name: string
    description: string
    instructions: string
    developedBy?: string
}

interface GameCardProps {
    game: Game
}

export function GameCard({ game }: GameCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            <Card
                className={`h-full border-2 transition-all duration-300 ${isHovered ? "border-primary neon-border shadow-lg shadow-primary/20" : "border-muted"}`}
            >
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-xl font-bold neon-text">{game.name}</CardTitle>
                        <Gamepad2 className={`h-6 w-6 text-primary transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-70"}`} />
                    </div>
                    <CardDescription className="line-clamp-2 mt-2">
                        {game.description}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>Dev: <span className="text-foreground font-medium">{game.developedBy || "Anonymous"}</span></span>
                    </div>

                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 p-3 bg-secondary/20 rounded-md border border-secondary"
                        >
                            <h4 className="text-sm font-semibold mb-2 text-primary">How to Play:</h4>
                            <p className="text-sm text-muted-foreground">{game.instructions}</p>
                        </motion.div>
                    )}
                </CardContent>

                <CardFooter className="pt-2">
                    <Button
                        variant="ghost"
                        className="w-full justify-between hover:bg-primary/10 hover:text-primary group"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? "Hide Instructions" : "Show Instructions"}
                        {isExpanded ? (
                            <ChevronUp className="h-4 w-4 transition-transform group-hover:-translate-y-1" />
                        ) : (
                            <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-1" />
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    )
}
