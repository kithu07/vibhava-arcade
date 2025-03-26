import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

// Default games to initialize the database if empty
const DEFAULT_GAMES = [
  {
    id: "game1",
    name: "Space Invaders",
    description: "Shoot down waves of alien invaders before they reach you.",
    instructions:
      "Use the joystick to move left and right. Press the button to shoot. Destroy all aliens to advance to the next level.",
  },
  {
    id: "game2",
    name: "Pac-Man",
    description: "Navigate through a maze while eating dots and avoiding ghosts.",
    instructions:
      "Use the joystick to navigate through the maze. Eat all dots to complete the level. Power pellets allow you to eat ghosts temporarily.",
  },
  {
    id: "game3",
    name: "Street Fighter",
    description: "Battle against opponents using various fighting techniques.",
    instructions:
      "Use the joystick for movement and buttons for different attacks. Perform special moves by combining joystick movements with button presses.",
  },
  {
    id: "game4",
    name: "Dance Dance Revolution",
    description: "Step on the arrows in time with the music.",
    instructions:
      "Step on the corresponding arrow panels when they reach the top of the screen. Timing affects your score.",
  },
  {
    id: "game5",
    name: "Skee-Ball",
    description: "Roll balls up an inclined lane to get them into targets.",
    instructions: "Roll the ball up the lane aiming for the highest point targets. Each game gives you 9 balls.",
  },
]

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()
    
    // Check if we have games in the database
    const gamesCount = await db.collection("games").countDocuments()
    
    // If no games, initialize with default games
    if (gamesCount === 0) {
      await db.collection("games").insertMany(DEFAULT_GAMES)
    }
    
    // Fetch games from database
    const games = await db.collection("games").find({}).toArray()
    
    return NextResponse.json(games)
  } catch (error) {
    console.error("Error fetching games:", error)
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 })
  }
}

// Add endpoint to create a new game
export async function POST(request: Request) {
  try {
    const { name, description, instructions } = await request.json()

    if (!name || !description) {
      return NextResponse.json({ error: "Name and description are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    
    // Generate a unique ID for the game
    const gameCount = await db.collection("games").countDocuments()
    const gameId = `game${gameCount + 1}`
    
    // Create the game
    const result = await db.collection("games").insertOne({
      id: gameId,
      name,
      description,
      instructions: instructions || "",
      createdAt: new Date()
    })

    return NextResponse.json({
      id: gameId,
      name,
      description,
      instructions: instructions || "",
      _id: result.insertedId
    })
  } catch (error) {
    console.error("Error creating game:", error)
    return NextResponse.json({ error: "Failed to create game" }, { status: 500 })
  }
}

