"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, QrCode } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import QRCode from "react-qr-code"
import { motion } from "framer-motion"

export default function PlayerLogin() {
  const router = useRouter()
  const [step, setStep] = useState<"form" | "qrcode">("form")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [playerId, setPlayerId] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name || !phone) {
      setError("Please fill in all fields")
      return
    }

    try {
      // In a real app, this would be an API call to register/login the player
      // For demo purposes, we'll just generate a random ID
      const id = `player_${Date.now()}_${Math.floor(Math.random() * 1000)}`
      setPlayerId(id)
      setStep("qrcode")

      // In a real app, you would save this to the database
      localStorage.setItem("arcadePlayerId", id)
      localStorage.setItem("arcadePlayerName", name)
      localStorage.setItem("arcadePlayerPhone", phone)
    } catch (err) {
      setError("Failed to register. Please try again.")
    }
  }

  const handleContinue = () => {
    router.push("/player/dashboard")
  }

  return (
    <div className="min-h-screen arcade-bg flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-muted neon-border">
        <CardHeader>
          <div className="flex items-center">
            <Link href="/" className="mr-2">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              <span>{step === "form" ? "Player Registration" : "Your QR Code"}</span>
            </CardTitle>
          </div>
          <CardDescription>
            {step === "form" ? "Enter your details to register or login" : "Scan this QR code at game stations"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "form" ? (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
              </div>
              <Button className="w-full mt-6" type="submit">
                Generate QR Code
              </Button>
            </motion.form>
          ) : (
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white p-4 rounded-lg">
                <QRCode value={playerId} size={200} />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Player ID</p>
                <p className="font-mono text-xs bg-muted p-2 rounded">{playerId}</p>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Save this QR code or take a screenshot. You'll need it to log in next time.
              </p>
            </motion.div>
          )}
        </CardContent>
        {step === "qrcode" && (
          <CardFooter>
            <Button className="w-full" onClick={handleContinue}>
              Continue to Dashboard
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

