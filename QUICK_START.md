# 🚀 Quick Start Guide - Running the Frontend

## Prerequisites Checklist

- [ ] Node.js v18+ installed ([download here](https://nodejs.org/))
- [ ] npm available in terminal (`npm --version`)
- [ ] Backend API running on `http://localhost:5000`
- [ ] `.env.local` file created in `BowlingApp.Web/` with `VITE_APP_MODE=LIVE`

---

## Step-by-Step Setup

### Step 1: Verify Node.js Installation
```powershell
node --version
npm --version
```
Expected output: `v18.x.x` or higher

### Step 2: Navigate to Frontend Directory
```powershell
cd "c:\Users\GUE55WH08206\source\repos\IT_ELECTIVE_3_MIDTERM_EXAM_2026\BowlingApp.Web"
```

### Step 3: Install Dependencies
```powershell
npm install
```
This may take 1-2 minutes. It installs:
- React 19.2.0
- Vite 7.2.4
- Tailwind CSS 4.1.18
- ESLint and dev tools

### Step 4: Start Development Server
```powershell
npm run dev
```

**Expected Output:**
```
  VITE v7.2.4  ready in 245 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

### Step 5: Open Frontend in Browser
- Open browser and go to: http://localhost:5173
- You should see the Bowling Score Keeper app

---

## Verification Checklist

After starting the frontend, verify:

- [ ] **Status Bar**: Shows green "✅ LIVE MODE: Connected to API"
  - (Red bar means backend is not running)
- [ ] **Page Title**: "Bowling Score Keeper 🎳"
- [ ] **Player Setup Screen**: Shows "New Game Setup"
- [ ] **Input Fields**: 1 player field, "+ Add Player" button, "Start Game" button
- [ ] **Browser Console**: No red errors (F12 → Console tab)
  - Warning: May see some React dev warnings, that's OK

---

## Full Testing Workflow

### 1. Start the Backend
```powershell
# In a separate terminal, navigate to backend directory
cd "c:\Users\GUE55WH08206\source\repos\IT_ELECTIVE_3_MIDTERM_EXAM_2026\BowlingApp.API"

# Restore and run
dotnet restore
dotnet run
```
Backend should run on `http://localhost:5000`

### 2. Start the Frontend
```powershell
# In another terminal
cd "c:\Users\GUE55WH08206\source\repos\IT_ELECTIVE_3_MIDTERM_EXAM_2026\BowlingApp.Web"
npm run dev
```
Frontend runs on `http://localhost:5173`

### 3. Test the Game Flow

1. **Enter Player Names**
   - Clear default "Player 1"
   - Type "Alice"
   - Click "+ Add Player"
   - Type "Bob"
   - Click "Start Game"

2. **Verify API Call**
   - Backend console should show HTTP POST request
   - Frontend should display ScoreBoard with 2 player rows
   - All 10 frames should be empty

3. **Submit a Roll**
   - Click on Alice's Frame 1 (any cell in Frame 1)
   - RollModal should open showing "Alice's Turn - Frame 1, Roll 1"
   - Click pin button "5"
   - Should see "5" appear in Frame 1, Roll 1 box
   - Modal closes

4. **Verify Turn Changes**
   - Yellow highlighting should move to Frame 1, Roll 2
   - Blue highlight should stay on Alice's row
   - "Current Turn: Alice" should display

5. **Submit Roll 2**
   - Click Frame 1, Roll 2 (yellow highlighted cell)
   - RollModal should show "Frame 1, Roll 2"
   - Click pin button "3"
   - Should see "3" appear in Frame 1, Roll 2
   - Score "9" should display in Score box
   - Yellow should move to Bob's Frame 1

6. **Verify Multiple Players**
   - Blue highlight should move to Bob's row
   - Display should show "Current Turn: Bob"
   - Yellow highlighting should be on Bob's Frame 1, Roll 1

7. **Test Strike**
   - Click a frame when it's your turn
   - Click "X" (STRIKE) button
   - Should see "X" in Roll 1
   - Turn should immediately pass to next player

8. **Complete Game**
   - Continue playing through all 10 frames
   - After all frames complete, GameOverModal should appear
   - Should show final standings with winner
   - Click "Play Again" to restart

---

## Troubleshooting

### Frontend Won't Start: `npm: The term 'npm' is not recognized`
**Fix**: Install Node.js from https://nodejs.org/

### Connection Error: "MOCK MODE: Not Connected to API"
**Status bar shows red**
- Backend might not be running on port 5000
- Check `.env.local` has `VITE_APP_MODE=LIVE`
- Verify backend is running: Test `http://localhost:5000` in browser
- Check CORS settings in backend

### Error: "Failed to create game: 404"
- Backend API endpoint doesn't exist
- Verify GameController has POST /api/game endpoint
- Check backend is using port 5000 (not 5001 or other)

### Error in Browser Console
- Open DevTools: Press `F12`
- Go to "Console" tab
- Screenshots helpful for debugging
- Check "Network" tab to see API requests

### Pins Not Updating on Roll
- Check browser console for errors
- Verify backend is returning correct frame structure
- Frame should have: frameNumber, roll1, roll2, score
- Verify backend scoring logic is correct

### Game Won't End
- Backend must set `isFinished: true` when all frames complete
- Frontend checks this flag to show GameOverModal
- Verify 10th frame bonus rolls are handled correctly

---

## Useful Commands

### During Development
```powershell
# Start dev server
npm run dev

# Run linter
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Stop the Server
```
# Press Ctrl+C in the terminal running "npm run dev"
```

---

## Backend Port Configuration

If backend runs on **different port** (not 5000):

1. Open: `BowlingApp.Web\src\api\gameService.js`
2. Find: `const API_BASE_URL = "http://localhost:5000/api/game";`
3. Replace `5000` with your port number
4. Save file
5. Frontend will auto-reload and use new port

Example for port 7000:
```javascript
const API_BASE_URL = "http://localhost:7000/api/game";
```

---

## Frontend Ports

If port 5173 is already in use:

Vite will automatically use the next available port and show you which one:
```
➜  Local:   http://localhost:5174/
```

Just open that URL in your browser.

---

## Browser Compatibility

The frontend works on:
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Any modern browser

---

## Development Mode Features

Since running `npm run dev`:
- **Hot Module Reload**: Changes to code auto-refresh browser
- **Development warnings**: Helpful error messages in console
- **Source maps**: Easier debugging in browser DevTools
- **Unoptimized bundle**: Faster builds but larger file size

---

## Summary

```
Terminal 1 (Backend):
$ cd BowlingApp.API
$ dotnet run
→ API listening on http://localhost:5000

Terminal 2 (Frontend):
$ cd BowlingApp.Web
$ npm install    (first time only)
$ npm run dev
→ Front-end running on http://localhost:5173

Browser:
→ Open http://localhost:5173
→ Green "LIVE MODE" indicator shows all connected
→ Play the game!
```

---

## Next Steps After Frontend Works

1. **Test all features**:
   - [ ] Create game with multiple players
   - [ ] Submit rolls and verify scoring
   - [ ] Test strikes and spares
   - [ ] Complete full 10-frame game
   - [ ] Verify final standings

2. **Production build** (when ready):
   ```powershell
   npm run build
   # Creates optimized 'dist/' folder for deployment
   ```

3. **Deploy frontend** (optional):
   - Vercel: `git push` to Vercel repo
   - Azure Static Web Apps: Upload `dist/` folder
   - Your server: Copy `dist/` folder to web server

---

**You're all set! 🎳 Let the scoring begin!**
