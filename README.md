# Arcade Leaderboard System

## Overview
The **Arcade Leaderboard System** is a web application built with **Next.js** and **MongoDB (Atlas)**. It allows players to register, volunteers to log in, and scores to be recorded using QR codes. The system maintains a real-time leaderboard, providing a seamless arcade experience. View the deployed website: https://vibhava-arcade.vercel.app/

## Features
- **Player & Volunteer Login**
  - Players log in using their registered credentials.
  - Volunteers use a common preset password for access.
- **QR Code-Based Score Entry**
  - Players are assigned unique QR codes.
  - Volunteers scan QR codes to submit scores.
- **Real-Time Leaderboard**
  - Scores update dynamically as they are entered.
- **MongoDB (Atlas) Integration**
  - Stores player data, scores, and game details.
- **Responsive UI**
  - Optimized for both desktop and mobile.

## Tech Stack
- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Next.js API routes (serverless architecture)
- **Database:** MongoDB Atlas
- **QR Scanning:** `@yudiel/react-qr-scanner`

## Installation & Setup
### Prerequisites
- Node.js installed
- MongoDB Atlas database set up

### Steps to Run Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/kithu07/vibhava-arcade.git
   cd arcade-leaderboard
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env.local` file in the root directory.
   - Add the following:
     ```env
     MONGODB_URI=your-mongodb-atlas-url
     VOLUNTEER_PASSWORD=your-volunteer-password
     ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.


