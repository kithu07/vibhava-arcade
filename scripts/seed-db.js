const { MongoClient } = require("mongodb");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const GAMES = [
    {
        id: "game1",
        name: "Slideout 🏂",
        description:
            "A fast-paced 2D snowboarding game with endless, ever-changing slopes where speed and precision decide survival.",
        instructions:
            "Up Arrow to move & boost, Left/Right Arrows to flip mid-air, avoid landing on your head, earn distance points + 100 per flip.",
        developedBy: "Aditya Anand",
    },
    {
        id: "game2",
        name: "Maze of Mires 🧭",
        description:
            "Guide Ginger through a cursed swamp labyrinth, survive five deadly levels, and claim the hidden treasure.",
        instructions:
            "Arrow Keys to move, Space/Up to jump, Up/Down to climb, Right Click to shoot, avoid hazards and collect coins.",
        developedBy: "Aditya Anand",
    },
    {
        id: "game3",
        name: "Pizza Rush 🍕🚙",
        description:
            "A delivery-life simulator where timing, speed, and reputation determine your survival.",
        instructions:
            "Arrow Keys/WASD to drive, pick up pizzas, deliver within one minute, avoid crashes, maintain rating.",
        developedBy: "Aditya Anand",
    },
    {
        id: "game4",
        name: "Protocol YOLO 🚀",
        description:
            "Survive endless enemy waves in deep space with only one emergency teleport.",
        instructions:
            "Arrow Keys to move, Space to fire, Left Shift for one-time teleport, destroy enemies and survive.",
        developedBy: "Aditya Anand",
    },
];

async function seed() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error('Invalid/Missing environment variable: "MONGODB_URI"');
        process.exit(1);
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to database");

        const db = client.db();
        const collection = db.collection("games");

        // Clear existing games
        await collection.deleteMany({});
        console.log("Cleared existing games");

        // Insert new games
        const result = await collection.insertMany(GAMES);
        console.log(`Inserted ${result.insertedCount} games`);

    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

seed();
