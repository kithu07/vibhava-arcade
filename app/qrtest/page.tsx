"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import QRCode from "react-qr-code";

export default function QRTest() {
  const [playerId, setPlayerId] = useState("");
  const [createdPlayers, setCreatedPlayers] = useState<Array<{id: string, name: string}>>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerPhone, setNewPlayerPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const createPlayer = async () => {
    if (!newPlayerName || !newPlayerPhone) {
      setError("Name and phone are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newPlayerName,
          phone: newPlayerPhone,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create player");
      }

      const data = await response.json();
      console.log("Created player:", data);
      
      // Add to the list of created players
      setCreatedPlayers(prev => [...prev, {
        id: data.playerId || data._id,
        name: data.name
      }]);
      
      // Clear the form
      setNewPlayerName("");
      setNewPlayerPhone("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen arcade-bg p-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold neon-text">QR Code Tester</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Player</CardTitle>
            <CardDescription>Add a test player to generate a QR code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <Input
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Enter player name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Phone</label>
              <Input
                value={newPlayerPhone}
                onChange={(e) => setNewPlayerPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button onClick={createPlayer} disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create Player"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test QR Code</CardTitle>
            <CardDescription>Generate QR code for any player ID</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Player ID</label>
              <Input
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                placeholder="Enter player ID"
              />
            </div>
            {playerId && (
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-lg mb-2">
                  <QRCode value={playerId} size={200} />
                </div>
                <p className="text-sm text-center">Scan this code with the volunteer scanner</p>
              </div>
            )}
          </CardContent>
        </Card>

        {createdPlayers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Created Players</CardTitle>
              <CardDescription>Players created in this session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {createdPlayers.map((player, index) => (
                  <div key={index} className="border rounded p-4">
                    <p className="text-sm font-medium">{player.name}</p>
                    <p className="text-xs text-muted-foreground mb-2">ID: {player.id}</p>
                    <div className="bg-white p-2 rounded-lg">
                      <QRCode value={player.id} size={100} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 