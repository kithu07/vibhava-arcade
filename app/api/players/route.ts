import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

function generateCustomPlayerId() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded characters that can be confused: I, O, 0, 1
  let result = 'P';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function POST(request: Request) {
  try {
    const { name, phone } = await request.json()

    if (!name || !phone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Check if player already exists
    const existingPlayer = await db.collection("players").findOne({ phone })

    if (existingPlayer) {
      console.log("Player already exists:", existingPlayer);
      
      // Create a response that includes different ID formats
      const response = {
        _id: existingPlayer._id.toString(),
        playerId: existingPlayer.playerId || existingPlayer._id.toString(),
        name: existingPlayer.name,
        isNewPlayer: false,
      };
      
      console.log("Returning existing player data:", response);
      return NextResponse.json(response);
    }

    // Create a custom player ID that's easy to read and type
    const customPlayerId = generateCustomPlayerId();

    // Create new player
    const result = await db.collection("players").insertOne({
      playerId: customPlayerId,
      name,
      phone,
      createdAt: new Date(),
      scores: [],
      totalScore: 0
    });

    const response = {
      _id: result.insertedId.toString(),
      playerId: customPlayerId,
      name,
      isNewPlayer: true,
    };
    
    console.log("Created new player:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error creating player:", error)
    return NextResponse.json({ error: "Failed to create player" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    const players = await db.collection("players").find({}).sort({ totalScore: -1 }).limit(10).toArray()

    console.log(`Found ${players.length} players for leaderboard`);
    
    // Transform IDs to strings in the response
    const formattedPlayers = players.map(player => ({
      ...player,
      _id: player._id.toString(),
    }));
    
    return NextResponse.json(formattedPlayers);
  } catch (error) {
    console.error("Error fetching players:", error)
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 })
  }
}

