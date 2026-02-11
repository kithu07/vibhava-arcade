import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Access ID from params properly
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Player ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    console.log("Searching for player with ID:", id);

    // Try multiple ways to look up player
    let player;

    // Try looking up by custom playerId (preferred)
    player = await db.collection("players").findOne({ playerId: id });

    // If not found, try ObjectId if it's a valid one
    if (!player && ObjectId.isValid(id)) {
      player = await db.collection("players").findOne({
        _id: new ObjectId(id)
      });
    }

    // Also try string representation of _id
    if (!player) {
      // Find any players that might have their _id stored as a string
      player = await db.collection("players").findOne({
        $or: [
          { _id: id },
          { id: id }
        ]
      });
    }

    if (!player) {
      console.log("Player not found with ID:", id);
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    // Ensure _id is serialized as a string
    const response = {
      ...player,
      _id: player._id.toString()
    };

    console.log("Player found:", player.name);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching player:", error);
    return NextResponse.json({ error: "Failed to fetch player" }, { status: 500 });
  }
} 