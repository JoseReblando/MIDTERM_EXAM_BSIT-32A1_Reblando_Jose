# Bowling Scoring Application - Frontend Setup Guide

## 🎯 Overview

The React + Vite frontend has been configured to connect to the .NET 8 API backend. The application supports both **LIVE Mode** (connected to backend API) and **MOCK Mode** (local simulation).

---

## ✅ Frontend Setup Status

### Completed:
- ✅ Created `.env.local` file with `VITE_APP_MODE=LIVE`
- ✅ Verified API service implementation (`src/api/gameService.js`)
- ✅ Updated App.jsx to properly track current player in LIVE mode
- ✅ All React components are properly configured
- ✅ Environment variable detection is working

---

## 🚀 How to Run the Frontend

### Prerequisites:
- Node.js (v18 or higher) installed
- npm (comes with Node.js)
- Backend API running on `http://localhost:5000`

### Installation Steps:

```bash
# Navigate to the frontend folder
cd BowlingApp.Web

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173` (or another available port shown in the terminal).

---

## 🔌 API Integration Details

### Environment Variable Toggle
The frontend detects whether to use Live API or Mock mode via:
```javascript
const isLive = import.meta.env.VITE_APP_MODE === 'LIVE';
```

**In `.env.local`**:
```
VITE_APP_MODE=LIVE
```

### API Endpoints Expected

The frontend calls these endpoints on the backend:

#### 1. **Create Game** - `POST /api/game`
Request body:
```json
["Player 1", "Player 2", "Player 3"]
```

Response expected:
```json
{
  "id": 1,
  "players": [
    { "id": 1, "name": "Player 1", "frames": [] },
    { "id": 2, "name": "Player 2", "frames": [] }
  ],
  "isFinished": false
}
```

#### 2. **Submit Roll** - `POST /api/game/{gameId}/roll`
Request body:
```json
{
  "playerId": 1,
  "pins": 5
}
```

Response: `200 OK` with updated game state (or empty if backend doesn't return data)

#### 3. **Get Game State** - `GET /api/game/{gameId}`
Response expected:
```json
{
  "id": 1,
  "isFinished": false,
  "players": [
    {
      "id": 1,
      "name": "Player 1",
      "frames": [
        { "frameNumber": 1, "roll1": 5, "roll2": 4, "score": 9 },
        { "frameNumber": 2, "roll1": 10, "roll2": null, "score": 29 }
      ]
    }
  ]
}
```

---

## 📊 Game Data Structure

### Frame Object (Expected from Backend)
```javascript
{
  frameNumber: 1,        // Frame number (1-10)
  roll1: 5,             // First roll (pins knocked down)
  roll2: 4,             // Second roll (null if strike or incomplete)
  score: 9,             // Cumulative score for this frame
  roll3: null           // Only for 10th frame if spare/strike
}
```

### Player Object
```javascript
{
  id: 1,                           // Unique player ID
  name: "Player 1",                // Player name
  frames: [/* Frame objects */]    // Array of 10 Frame objects
}
```

### Game Object
```javascript
{
  id: 1,                           // Unique game ID
  isFinished: false,               // Whether all players completed game
  players: [/* Player objects */]  // Array of players
}
```

---

## 🎮 Frontend Components

### 1. **App.jsx** (Main Component)
- Manages game state and player turn
- Handles API calls in LIVE mode vs Mock simulation in MOCK mode
- Displays status bar showing LIVE/MOCK mode
- Manages modals for rolling and game over

### 2. **PlayerSetup.jsx**
- Initial screen for entering player names (1-4 players)
- Calls `handleStartGame(playerNames)` when "Start Game" is clicked
- Passes player names to `createGame()` API

### 3. **ScoreBoard.jsx**
- Displays bowling scoreboard with all 10 frames
- Shows:
  - Player names (left column)
  - Frame rolls (roll1 and roll2 for each frame 1-9; three rolls for frame 10)
  - Cumulative scores
  - Frame as "X" for strikes, "/" for spares
- **Blue highlighting**: Active player's row
- **Yellow highlighting**: Current frame awaiting input
- Click any frame to open RollModal

### 4. **RollModal.jsx**
- Modal dialog for entering roll scores
- Shows buttons for:
  - Gutter (0 pins)
  - Individual pin counts (1-9)
  - Strike (X - 10 pins)
  - Spare (/ - 10 pins)
- Validates maximum pins available (e.g., if roll1=6, max for roll2=4)

### 5. **GameOverModal.jsx**
- Displays final standings after game completes
- Shows players ranked by final score
- Shows winner with crown emoji (👑)
- Has "Play Again" button to restart

---

## 🔄 Game Flow in LIVE Mode

1. **Start Game**
   - User enters player names in PlayerSetup
   - `createGame(playerNames)` is called → `POST /api/game`
   - Backend creates game and returns game object with players
   - ScoreBoard displays with empty frames

2. **Roll Phase**
   - User clicks a frame or next frame loads automatically
   - RollModal opens (can show different roll numbers)
   - User clicks a pin button (1-10)
   - `rollBall(gameId, playerId, pins)` is called → `POST /api/game/{id}/roll`
   - Backend processes roll and updates game state
   - `getGame(gameId)` is called → `GET /api/game/{id}`
   - Frontend updates game state with response
   - **Frontend determines next player** by looking for incomplete frames
   - Current player is highlighted in yellow, moves to next incomplete frame

3. **Game Over**
   - Backend returns `isFinished: true`
   - GameOverModal displays with final standings
   - User can click "Play Again" to restart

---

## 🔧 Current Player Determination (LIVE Mode)

The frontend determines whose turn it is by analyzing the game state:

1. **Incomplete Frame Detection**: Checks each player's last frame
   - If `roll2 === null && roll1 !== 10` → Player awaits roll 2
   - This player's turn continues

2. **Fallback Logic**: If no incomplete frames found
   - Cycles to next player in order
   - This happens after each round of frames

```javascript
// From App.jsx handleRoll function
let nextPlayerIndex = 0;
for (let i = 0; i < updatedGame.players.length; i++) {
  const player = updatedGame.players[i];
  const lastFrame = player.frames?.[player.frames.length - 1];
  
  if (lastFrame && lastFrame.roll2 === null && lastFrame.roll1 !== 10) {
    nextPlayerIndex = i;
    break;
  }
  if (!lastFrame || (lastFrame.roll2 !== null || lastFrame.roll1 === 10)) {
    nextPlayerIndex = (i + 1) % updatedGame.players.length;
  }
}
setCurrentPlayerIndex(nextPlayerIndex);
```

---

## 🎨 UI Features

### Status Bar
- **LIVE MODE**: Green bar showing "✅ LIVE MODE: Connected to API"
- **MOCK MODE**: Red bar showing "⚠️ MOCK MODE: Not Connected to API"

### Player Highlighting
- **Blue border/background**: Currently active player row
- **Yellow highlighting**: Current frame waiting for input
- **Blue text "● Active"**: Indicator next to active player name

### Frame Display
- **Roll 1 box**: Shows first roll (or "X" for strike)
- **Roll 2 box**: Shows second roll, spare ("/"), or empty
- **Score box**: Shows cumulative score for that frame

### Scoreboard Layout
```
Player Name | Frame 1 | Frame 2 | ... | Frame 10 | Total
            |  5  3   |   X     | ... |  9  /  8 |  145
            |    9    |   19    | ... |         | 
```

---

## 🐛 Troubleshooting

### Frontend Won't Start
- **Problem**: npm command not found
- **Solution**: Ensure Node.js is installed and added to PATH

### API Connection Fails
- **Problem**: "Failed to create game" error in console
- **Solution**: 
  - Check if backend is running on `http://localhost:5000`
  - Verify `.env.local` has `VITE_APP_MODE=LIVE`
  - Check backend CORS settings (may need to allow `http://localhost:5173`)

### Wrong Player Taking Turn
- **Problem**: Turn doesn't pass to next player correctly
- **Solution**:
  - Ensure backend is returning correct frame/roll state
  - Check browser console for error messages
  - Verify frame structure matches expected format

### Scores Not Updating Correctly
- **Problem**: Frame scores seem wrong or incomplete
- **Solution**:
  - This is typically a backend bowling logic issue
  - Frontend displays what backend returns - verify backend calculations

---

## 📋 Environment Configuration

### `.env.local` (Already Created)
```env
VITE_APP_MODE=LIVE
```

### Optional: Change API Port
If backend runs on a different port (not 5000):
1. Open `src/api/gameService.js`
2. Find: `const API_BASE_URL = "http://localhost:5000/api/game";`
3. Change `5000` to your port number

---

## 🔐 CORS Configuration

The backend must allow requests from the frontend. Typical CORS setup in .NET:

```csharp
// In Program.cs
builder.Services.AddCors(options => {
    options.AddPolicy("AllowLocalhost", policy => {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

app.UseRouting();
app.UseCors("AllowLocalhost");
```

---

## 🚢 Production Build

To create a production build:

```bash
npm run build
```

This generates optimized files in the `dist/` folder, ready for deployment.

---

## 📝 Notes

- The frontend is fully responsive using Tailwind CSS
- All UI interactions trigger API calls in LIVE mode
- Mock mode is useful for frontend testing without backend
- The application validates pin counts (e.g., can't exceed remaining pins)
- Game completion is determined by backend (`isFinished` flag)

---

**Ready to connect to backend at**: `http://localhost:5000/api/game` ✅
