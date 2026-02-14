# Frontend-Backend Integration Flow

## Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    BOWLING SCORING APP                          │
│                   Frontend ↔ Backend Flow                        │
└─────────────────────────────────────────────────────────────────┘

PHASE 1: GAME INITIALIZATION
═════════════════════════════════════════════════════════════════

  Frontend (React)                   Backend (.NET API)
  ───────────────────                ──────────────────
       
   1. PlayerSetup Component
      User enters: ["Alice", "Bob"]
                   ↓
   2. handleStartGame(names)
                   ├─→ POST /api/game
                   │   ├─ Body: ["Alice", "Bob"]
                   │   │
                   ├──────────────────────→ GameController.CreateGame()
                   │                         ├─ Create Game record
                   │                         ├─ Create Player records
                   │                         ├─ Initialize 10 empty Frames
                   │                         └─ Save to DB
                   │
                   ←──────────────────────── Response:
                   │   {
                   │     "id": 1,
                   │     "players": [
                   │       {"id": 1, "name": "Alice", "frames": []},
                   │       {"id": 2, "name": "Bob", "frames": []}
                   │     ],
                   │     "isFinished": false
                   │   }
                   │
   3. setGame(newGame)
      ↓
   4. Display ScoreBoard
      ├─ 10 columns for 10 frames
      ├─ 2 rows for 2 players
      └─ Empty frames ready for input


PHASE 2: ROLL SUBMISSION & SCORING
═════════════════════════════════════════════════════════════════

  Frontend                           Backend
  ────────────────                   ──────────────────
  
   1. User clicks frame
      ↓
   2. RollModal opens
      "Alice's Turn - Frame 1, Roll 1"
      [0] [1] [2] ... [9] [X]
      ↓
   3. User clicks pin button (e.g., 7)
      ↓
   4. handleRoll(7)
      ├─→ rollBall(gameId=1, playerId=1, pins=7)
      │   ├─ POST /api/game/1/roll
      │   │  Body: {"playerId": 1, "pins": 7}
      │   │
      ├────────────────────────────→ GameController.Roll()
      │                               ├─ Find Game
      │                               ├─ Find Player
      │                               ├─ Get current Frame
      │                               ├─ Apply Bowling Logic:
      │                               │  ├─ If roll1: set it, await roll2
      │                               │  ├─ If roll2: complete frame
      │                               │  ├─ Calculate score with bonuses
      │                               │  └─ Advance turn
      │                               └─ Save to DB
      │
      ←──────────────────────────── Response: 200 OK
      │
      ├─→ getGame(gameId=1)
      │   ├─ GET /api/game/1
      │   │
      ├────────────────────────────→ GameController.GetGame()
      │                               ├─ Query Game from DB
      │                               ├─ Load all Players
      │                               ├─ Load all Frames
      │                               └─ Return complete state
      │
      ←──────────────────────────── Response:
      │   {
      │     "id": 1,
      │     "isFinished": false,
      │     "players": [
      │       {
      │         "id": 1,
      │         "name": "Alice",
      │         "frames": [
      │           {"frameNumber": 1, "roll1": 7, "roll2": null, "score": null},
      │           ...
      │         ]
      │       },
      │       {"id": 2, "name": "Bob", "frames": [...]}
      │     ]
      │   }
      │
   5. Update Game State
      ├─ setGame(updatedGame)
      │
   6. Determine Next Player
      ├─ Analyze frames
      ├─ If Alice frame[0].roll2 === null → Alice's turn (Roll 2)
      ├─ setCurrentPlayerIndex(0)
      │
   7. Update UI
      ├─ ScoreBoard updates with "7" in Frame 1, Roll 1
      ├─ Yellow highlight on Frame 1, Roll 2 (Alice's turn)
      ├─ Blue highlight on Alice's row
      └─ Display "Current Turn: Alice"
      
   [Wait for Roll 2]
      ↓ User clicks Roll 2 pin (e.g., 3)
      ↓
   8. handleRoll(3)
      ├─→ rollBall(gameId=1, playerId=1, pins=3)
      │   POST /api/game/1/roll
      │
      ├───────────────────→ Backend processes Roll 2
      │                     ├─ Frame 1: roll1=7, roll2=3
      │                     ├─ Calculate score: 7+3 = 10
      │                     ├─ Move to next player
      │                     └─ Check game state
      │
      ├─→ getGame(gameId=1)
      │
      ←──────────────────── Response with updated frames
      │
   9. Update Turn to Bob
      ├─ Analyze frames
      ├─ Bob has no frames yet → Bob's turn (Roll 1)
      ├─ setCurrentPlayerIndex(1)
      │
  10. ScoreBoard updates
      ├─ Alice's Frame 1: "7 3" with score "10"
      ├─ Yellow highlight moves to Bob's Frame 1, Roll 1
      ├─ Blue highlight on Bob's row
      └─ Display "Current Turn: Bob"


PHASE 3: STRIKE EXAMPLE
═════════════════════════════════════════════════════════════════

  User (Alice) clicks X (Strike - 10 pins)
      ↓
  handleRoll(10)
  
  Backend receives:
  ├─ playerId: 1 (Alice)
  ├─ pins: 10
  ├─ Current frame: Frame 1
  ├─ Logic:
  │  ├─ Strike detected (roll1 = 10)
  │  ├─ Frame 1: roll1=10, roll2=null (or void)
  │  ├─ Score calculation DEFERRED:
  │  │  └─ Need next 2 rolls for bonus
  │  └─ Turn passes to next player immediately
  │
  Frontend receives:
  ├─ Frame 1: "X" (displayed as strike)
  ├─ Previous frame's score updated (if they were waiting for bonus)
  ├─ Yellow highlight → Bob's Frame 1, Roll 1
  └─ Current turn → Bob


PHASE 4: SPARE EXAMPLE
═════════════════════════════════════════════════════════════════

  Round 1 Frame 1:
  ├─ Alice rolls 7
  ├─ Alice rolls 3
  
  Round 1 Frame 2:
  ├─ Alice rolls 6
  ├─ Alice rolls 4 → SPARE (6+4=10)
  
  Backend:
  ├─ Detects spare (roll1 + roll2 = 10)
  ├─ Frames[1]: roll1=6, roll2=4, score=null (waiting for next roll)
  
  Round 2 Frame 1:
  ├─ Bob rolls, Alice gets bonus...
  
  Eventually:
  ├─ Alice rolls Frame 3: roll1=5
  ├─ Backend calculates Frame 2 score:
  │  ├─ 10 + 5 (next roll) = 15
  │  ├─ Plus previous: 10 + 15 = 25 total
  └─ Frame 2 now has score


PHASE 5: GAME COMPLETION
═════════════════════════════════════════════════════════════════

  After all players complete Frame 10 + bonus rolls (if applicable):
  
  Backend:
  ├─ Detects: All players have 10 complete frames
  ├─ Sets: isFinished = true
  └─ Returns this in response
  
  Frontend:
  ├─ Checks: if (updatedGame.isFinished)
  ├─ Triggers: setIsGameOver(true)
  ├─ Display: GameOverModal
  ├─ Shows: Final standings
  │  ├─ #1 👑 Winner (highest score)
  │  ├─ #2 Second place
  │  └─ #3 Third place (if 3+ players)
  └─ Option: "Play Again" → resets game
```

---

## API Request-Response Examples

### Example 1: Create Game
```
REQUEST:
POST http://localhost:5000/api/game
Content-Type: application/json

["Alice", "Bob", "Charlie"]

RESPONSE (200 OK):
{
  "id": 1,
  "players": [
    {
      "id": 1,
      "name": "Alice",
      "frames": []
    },
    {
      "id": 2,
      "name": "Bob",
      "frames": []
    },
    {
      "id": 3,
      "name": "Charlie",
      "frames": []
    }
  ],
  "isFinished": false
}
```

### Example 2: Submit Roll
```
REQUEST:
POST http://localhost:5000/api/game/1/roll
Content-Type: application/json

{
  "playerId": 1,
  "pins": 7
}

RESPONSE (200 OK):
{
  "id": 1,
  "isFinished": false,
  "players": [
    {
      "id": 1,
      "name": "Alice",
      "frames": [
        {
          "frameNumber": 1,
          "roll1": 7,
          "roll2": null,
          "score": null
        }
      ]
    },
    ...
  ]
}
```

### Example 3: Get Game State
```
REQUEST:
GET http://localhost:5000/api/game/1

RESPONSE (200 OK):
{
  "id": 1,
  "isFinished": false,
  "players": [
    {
      "id": 1,
      "name": "Alice",
      "frames": [
        {
          "frameNumber": 1,
          "roll1": 7,
          "roll2": 3,
          "score": 10
        },
        {
          "frameNumber": 2,
          "roll1": 10,
          "roll2": null,
          "score": null  // Waiting for bonus rolls
        }
      ]
    },
    {
      "id": 2,
      "name": "Bob",
      "frames": [
        {
          "frameNumber": 1,
          "roll1": 5,
          "roll2": 4,
          "score": 19  // Previous strike was 10, this is 5+4=9, total 19
        }
      ]
    },
    {
      "id": 3,
      "name": "Charlie",
      "frames": [
        {
          "frameNumber": 1,
          "roll1": 8,
          "roll2": 2,  // Spare
          "score": 10  // Waiting for bonus roll
        }
      ]
    }
  ]
}
```

---

## Key Points for Backend Implementation

### 1. Frame Completion Rules
- **Regular Frames (1-9)**:
  - If roll1 = 10 (Strike) → Frame ends, next player's turn
  - If roll1 ≠ 10 → Await roll2
  - Once roll2 submitted → Frame ends

- **10th Frame**:
  - If roll1 = 10 or (roll1 + roll2 = 10) → Get one more roll (roll3)
  - After roll3 → Frame ends

### 2. Scoring Logic
- **Open Frame**: score = roll1 + roll2
- **Spare**: score = 10 + next_1_roll (calculated when next roll received)
- **Strike**: score = 10 + next_2_rolls (calculated when 2nd bonus roll received)
- **10th Frame**: No bonuses, just sum the rolls

### 3. Turn Management
- Track which player and frame is current
- After each roll:
  - If frame incomplete → same player, next roll
  - If frame complete → next player, frame 1
- After frame 10 complete for all → game over

### 4. Database State
- Store each Game once
- Store each Player once per game
- Store each Frame once per player (10 frames max)
- Update frames as rolls come in
- Calculate scores with each update

---

## Example Database Records

```sql
-- Games Table
INSERT INTO Games (Id, IsFinished)
VALUES (1, false);

-- Players Table
INSERT INTO Players (Id, GameId, Name)
VALUES 
  (1, 1, 'Alice'),
  (2, 1, 'Bob');

-- Frames Table
INSERT INTO Frames (Id, PlayerIdId, FrameNumber, Roll1, Roll2, Score)
VALUES
  (1, 1, 1, 7, 3, 10),          -- Alice Frame 1
  (2, 1, 2, 10, NULL, NULL),    -- Alice Frame 2 (Strike, awaiting bonus)
  (3, 2, 1, 5, 4, 9),           -- Bob Frame 1
  (4, 2, 2, NULL, NULL, NULL);  -- Bob Frame 2 (Empty)
```

---

## Frontend Processing After Each Roll

```javascript
// Pseudocode of what happens after rollBall()

async function handleRoll(pins) {
  // 1. Submit roll to backend
  await rollBall(gameId, currentPlayer.id, pins);
  
  // 2. Get updated state
  const updatedGame = await getGame(gameId);
  setGame(updatedGame);
  
  // 3. Determine next player
  let nextPlayerIndex = findPlayerWithIncompleteFrame();
  if (nextPlayerIndex === -1) {
    // All players have complete frames, cycle to next
    nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
  }
  setCurrentPlayerIndex(nextPlayerIndex);
  
  // 4. Check game completion
  if (updatedGame.isFinished) {
    setIsGameOver(true);
  }
  
  // 5. UI updates automatically via re-render
}
```

---

This diagram shows the complete integration between the React frontend and .NET backend API.
