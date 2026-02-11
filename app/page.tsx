"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Gamepad2, QrCode, Trophy, Users } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { GamesList } from "@/components/GamesList"

export default function Home() {
  const [isHovering, setIsHovering] = useState<string | null>(null)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen arcade-bg flex flex-col items-center justify-center p-4 relative">
      <div className="text-center mb-8 fade-in">
        <h1 className="text-4xl md:text-6xl font-bold neon-text mb-2">ARCADE</h1>
        <p className="text-primary text-lg md:text-xl">Track your scores. Claim your glory.</p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full"
      >
        <motion.div variants={item}>
          <Link href="/login/player">
            <Card
              className={`border-2 transition-all duration-300 hover:scale-105 ${isHovering === "player" ? "border-primary neon-border" : "border-muted"}`}
              onMouseEnter={() => setIsHovering("player")}
              onMouseLeave={() => setIsHovering(null)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  <span>Player Login</span>
                </CardTitle>
                <CardDescription>Register or login as a player</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <QrCode className="h-24 w-24 text-primary opacity-80" />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Enter as Player</Button>
              </CardFooter>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Link href="/login/volunteer">
            <Card
              className={`border-2 transition-all duration-300 hover:scale-105 ${isHovering === "volunteer" ? "border-primary neon-border" : "border-muted"}`}
              onMouseEnter={() => setIsHovering("volunteer")}
              onMouseLeave={() => setIsHovering(null)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-6 w-6 text-primary" />
                  <span>Volunteer Login</span>
                </CardTitle>
                <CardDescription>Login as a game volunteer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <Gamepad2 className="h-24 w-24 text-primary opacity-80" />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Enter as Volunteer</Button>
              </CardFooter>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={item} className="md:col-span-2">
          <Link href="/leaderboard">
            <Card
              className={`border-2 transition-all duration-300 hover:scale-105 ${isHovering === "leaderboard" ? "border-primary neon-border" : "border-muted"}`}
              onMouseEnter={() => setIsHovering("leaderboard")}
              onMouseLeave={() => setIsHovering(null)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-primary" />
                  <span>Leaderboard</span>
                </CardTitle>
                <CardDescription>View the top players</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <Trophy className="h-24 w-24 text-primary opacity-80" />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">View Leaderboard</Button>
              </CardFooter>
            </Card>
          </Link>
        </motion.div>
      </motion.div>

      <div className="w-full max-w-6xl mt-12 mb-8 border-t border-muted pt-8">
        <GamesList />
      </div>
    </div >
  )
}

