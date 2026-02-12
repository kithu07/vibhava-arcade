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
    name: "Pixel Guy👾",
    description: "A 2D Unity platformer with four progressively challenging levels focused on timing, coordination, and precision-based movement.",
    instructions: "Use movement controls to navigate platforms, avoid obstacles, collect items for score, and progress through increasingly difficult levels.",
    developedBy: "Nivedh krishna VM",
  },
  {
    id: "game7",
    name: "Brick Bounce 🏓",
    description: "Control the paddle, keep the ball in play, and break all the bricks to score points in this fast-paced arcade classic.",
    instructions: "Use the Left and Right Arrow keys to move the paddle, bounce the ball to hit and destroy all bricks, and don’t let the ball miss the paddle — or you lose!",
    developedBy: "Keerthana D S",
  },
  // {
  //   id: "game8",
  //   name: "Dino IRL 🦖",
  //   description: "A reimagined Chrome Dino game where you are the dinosaur. No keyboard. No space bar. Just you, your jumps, and the obstacles ahead.",
  //   instructions: "Stand in front of your camera and jump to make the dino jump. Your movements are tracked in real time — dodge obstacles by physically jumping and survive as long as you can!",
  //   developedBy: "Keerthana D S",
  // },
  {
    id: "game8",
    name: "Block Game ▀",
    description: "A fast-paced tile-matching puzzle game where the primary goal is to bring order to chaos by arranging falling, four-block shapes.",
    instructions: "Use the left and right arrow keys to move the blocks also rotate the blocks and stack them at the bottom and earn score as you clear each horizontal rows.",
    developedBy: "Amal Vinayan",
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

