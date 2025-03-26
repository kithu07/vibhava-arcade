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
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!name || !phone) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    try {
      // Submit to the API to create or find a player
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phone }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to register player')
      }

      const data = await response.json()
      console.log("Player data received:", data)
      
      // Use the ID returned from the server
      const playerIdToUse = data.playerId || data._id
      setPlayerId(playerIdToUse)
      
      // Save player data to localStorage for persistent session
      localStorage.setItem("arcadePlayerId", playerIdToUse)
      localStorage.setItem("arcadePlayerName", data.name || name)
      
      // Move to QR code step
      setStep("qrcode")
    } catch (err: any) {
      console.error("Registration error:", err)
      setError(err.message || "Failed to register. Please try again.")
    } finally {
      setIsLoading(false)
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
              <Button className="w-full mt-6" type="submit" disabled={isLoading}>
                {isLoading ? "Processing..." : "Generate QR Code"}
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

