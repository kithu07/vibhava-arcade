import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const { playerId, gameId, score } = await request.json()

    if (!playerId || !gameId || score === undefined) {
      return NextResponse.json({ error: "Player ID, game ID, and score are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    console.log("Submitting score for player:", playerId, "game:", gameId, "score:", score);

    // Find player by various ID formats
    let playerQuery;
    if (ObjectId.isValid(playerId)) {
      // If it looks like an ObjectId, try that first
      playerQuery = { _id: new ObjectId(playerId) };
    } else {
      // Otherwise, try playerId field or other formats
      playerQuery = { 
        $or: [
          { playerId: playerId },
          { _id: playerId },
          { id: playerId }
        ]
      };
    }

    // Check if player exists
    const player = await db.collection("players").findOne(playerQuery);

    if (!player) {
      console.log("Player not found:", playerId);
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    console.log("Player found:", player.name);

    // Check if player has already played this game
    const existingScore = player.scores?.find((s) => s.gameId === gameId)

    if (existingScore) {
      console.log("Player already has a score for this game:", existingScore);
      return NextResponse.json({ error: "Player has already played this game" }, { status: 400 })
    }

    // Calculate the new total score
    const currentTotal = player.totalScore || 0;
    const newTotal = currentTotal + score;

    // Add score
    const result = await db.collection("players").updateOne(
      playerQuery,
      {
        $push: { scores: { gameId, score, playedAt: new Date() } },
        $set: { totalScore: newTotal }
      }
    );

    if (result.modifiedCount === 0) {
      console.log("Failed to update player record");
      return NextResponse.json({ error: "Failed to update player record" }, { status: 500 });
    }

    console.log("Score recorded successfully:", score, "for game:", gameId);
    return NextResponse.json({ 
      success: true,
      gameId,
      score,
      totalScore: newTotal
    });
  } catch (error) {
    console.error("Error recording score:", error)
    return NextResponse.json({ error: "Failed to record score" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get("playerId")

    if (!playerId) {
      return NextResponse.json({ error: "Player ID is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Find player by various ID formats
    let playerQuery;
    if (ObjectId.isValid(playerId)) {
      // If it looks like an ObjectId, try that first
      playerQuery = { _id: new ObjectId(playerId) };
    } else {
      // Otherwise, try playerId field or other formats
      playerQuery = { 
        $or: [
          { playerId: playerId },
          { _id: playerId },
          { id: playerId }
        ]
      };
    }

    const player = await db.collection("players").findOne(playerQuery)

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    return NextResponse.json(player.scores || [])
  } catch (error) {
    console.error("Error fetching scores:", error)
    return NextResponse.json({ error: "Failed to fetch scores" }, { status: 500 })
  }
}

