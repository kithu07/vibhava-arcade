import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const { playerId, gameId, score, updateExisting = false } = await request.json()

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
    let result;

    if (existingScore) {
      console.log("Player already has a score for this game:", existingScore);
      
      if (!updateExisting) {
        return NextResponse.json({ 
          error: "Player has already played this game", 
          existingScore: existingScore,
          canUpdate: true 
        }, { status: 409 })
      }
      
      // Calculate the total score adjustment
      const scoreDiff = score - existingScore.score;
      const newTotal = (player.totalScore || 0) + scoreDiff;
      
      // Update the existing score
      result = await db.collection("players").updateOne(
        { ...playerQuery, "scores.gameId": gameId },
        { 
          $set: { 
            "scores.$.score": score,
            "scores.$.playedAt": new Date(),
            "totalScore": newTotal
          }
        }
      );
      
      console.log("Updated existing score from", existingScore.score, "to", score);
      
      return NextResponse.json({ 
        success: true,
        gameId,
        score,
        previousScore: existingScore.score,
        totalScore: newTotal,
        updated: true
      });
    } else {
      // Calculate the new total score
      const currentTotal = player.totalScore || 0;
      const newTotal = currentTotal + score;

      // Add new score
      result = await db.collection("players").updateOne(
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

      console.log("New score recorded successfully:", score, "for game:", gameId);
      return NextResponse.json({ 
        success: true,
        gameId,
        score,
        totalScore: newTotal,
        updated: false
      });
    }
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

