import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

// Default games to initialize the database if empty
const DEFAULT_GAMES = [
  {
    id: "game1",
    name: "Slideout 🏂",
    description: "A fast-paced 2D snowboarding game with endless, ever-changing slopes where speed and precision decide survival.",
    instructions: "Up Arrow to move & boost, Left/Right Arrows to flip mid-air, avoid landing on your head, earn distance points + 100 per flip.",
    developedBy: "Aditya Anand",
  },
  {
    id: "game2",
    name: "Maze of Mires 🧭",
    description: "Guide Ginger through a cursed swamp labyrinth, survive five deadly levels, and claim the hidden treasure.",
    instructions: "Arrow Keys to move, Space/Up to jump, Up/Down to climb, Right Click to shoot, avoid hazards and collect coins.",
    developedBy: "Aditya Anand",
  },
  {
    id: "game3",
    name: "Pizza Rush 🍕🚙",
    description: "A delivery-life simulator where timing, speed, and reputation determine your survival.",
    instructions: "Arrow Keys/WASD to drive, pick up pizzas, deliver within one minute, avoid crashes, maintain rating.",
    developedBy: "Aditya Anand",
  },
  {
    id: "game4",
    name: "Protocol YOLO 🚀",
    description: "Survive endless enemy waves in deep space with only one emergency teleport.",
    instructions: "Arrow Keys to move, Space to fire, Left Shift for one-time teleport, destroy enemies and survive.",
    developedBy: "Aditya Anand",
  },
  {
    id: "game5",
    name: "Evolution Odyssey 🎮",
    description: "Embark on a 2D platforming adventure where you collect coins, dodge enemies, and survive with limited lives to rise to the top.",
    instructions: "Arrow Keys to move, Space to jump across platforms, avoid enemies and water, collect coins, and survive with 3 lives.",
    developedBy: "Keerthana D S",
  },
  {
    id: "game6",
    name: "Pixel Guy",
    description: "A 2D Unity platformer with four progressively challenging levels focused on timing, coordination, and precision-based movement.",
    instructions: "Use movement controls to navigate platforms, avoid obstacles, collect items for score, and progress through increasingly difficult levels.",
    developedBy: "Nivedh krishna VM",
  },
]

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    // Ensure all default games exist in the database
    // We use bulkWrite to efficiently update/insert games
    if (DEFAULT_GAMES.length > 0) {
      const operations = DEFAULT_GAMES.map(game => ({
        updateOne: {
          filter: { id: game.id },
          update: { $set: game },
          upsert: true
        }
      }))

      await db.collection("games").bulkWrite(operations)
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

