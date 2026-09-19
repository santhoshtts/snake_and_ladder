# Snake and Ladder Game - Testing Guide

## 🧪 Test Cases

### Backend API Tests

#### 1. Game Initialization
- **Test**: Start game with 2 players
- **Expected**: Game state initialized with 2 players at position 0
- **API**: `POST /game/start` with `{"players":["Alice","Bob"]}`

#### 2. Dice Rolling
- **Test**: Roll dice and verify value (1-6)
- **Expected**: Dice value between 1 and 6, player position updated
- **API**: `POST /game/roll`

#### 3. Snake Mechanics
- **Test**: Land on snake head (position 16)
- **Expected**: Player moved to snake tail (position 6)
- **API**: Manually set position to 16, then roll dice

#### 4. Ladder Mechanics
- **Test**: Land on ladder base (position 4)
- **Expected**: Player moved to ladder top (position 14)
- **API**: Manually set position to 4, then roll dice

#### 5. Win Condition
- **Test**: Reach position 100
- **Expected**: Winner declared, game ends
- **API**: Set position to 99, roll until getting 1

#### 6. Exact Roll Requirement
- **Test**: Try to exceed 100
- **Expected**: Player stays at current position if roll would exceed 100
- **API**: Set position to 99, roll dice

### Frontend UI Tests

#### 1. Game Start
- **Test**: Enter player names and start game
- **Expected**: Game board appears, controls enabled

#### 2. Player Management
- **Test**: Add/remove players
- **Expected**: Player list updates correctly

#### 3. Dice Animation
- **Test**: Click roll dice button
- **Expected**: Dice animates, shows result, player moves

#### 4. Visual Feedback
- **Test**: Land on snake/ladder
- **Expected**: Visual indicators show movement

#### 5. Win Display
- **Test**: Player reaches 100
- **Expected**: Winner announcement, play again button

#### 6. Game Reset
- **Test**: Click reset button
- **Expected**: Game returns to initial state

### Integration Tests

#### 1. Full Game Flow
- **Test**: Complete game from start to finish
- **Expected**: All mechanics work correctly

#### 2. Multiplayer
- **Test**: 2+ players complete game
- **Expected**: Turn-based system works correctly

#### 3. Edge Cases
- **Test**: Rapid dice rolling
- **Expected**: No state corruption

## 📋 Manual Testing Checklist

### Before Deployment:
- [ ] Game starts correctly
- [ ] Player names display properly
- [ ] Dice rolling works
- [ ] Snakes function correctly
- [ ] Ladders function correctly
- [ ] Win condition triggers
- [ ] Reset functionality works
- [ ] Visual elements load
- [ ] No console errors
- [ ] Responsive design works

### After Deployment:
- [ ] Frontend loads from deployed URL
- [ ] Backend API responds
- [ ] Game functions in production
- [ ] No CORS errors
- [ ] Environment variables work
- [ ] Multiple users can play

## 🔍 Testing Commands

### Backend Testing:
```bash
cd backend
npm start
# Test each endpoint with curl or Postman
```

### Frontend Testing:
```bash
cd frontend
npm run dev
# Open browser and test UI
```

### Integration Testing:
```bash
# Start both servers
cd backend && npm start
cd frontend && npm run dev
# Test full game flow
```

## 🐛 Common Issues & Solutions

### Issue: Backend not responding
- **Solution**: Check if backend is running on correct port
- **Command**: `curl http://localhost:3002/game/state`

### Issue: Frontend can't connect to backend
- **Solution**: Check CORS settings and API URL
- **Check**: Environment variables

### Issue: Game state not updating
- **Solution**: Verify API calls are successful
- **Check**: Browser network tab for failed requests

### Issue: Visual elements not displaying
- **Solution**: Check console for JavaScript errors
- **Check**: CSS and SVG rendering

## 📊 Test Results Template

```
Date: [DATE]
Tester: [NAME]
Environment: [Local/Production]

Backend Tests:
- Game Initialization: ✅/❌
- Dice Rolling: ✅/❌
- Snake Mechanics: ✅/❌
- Ladder Mechanics: ✅/❌
- Win Condition: ✅/❌
- Exact Roll: ✅/❌

Frontend Tests:
- Game Start: ✅/❌
- Player Management: ✅/❌
- Dice Animation: ✅/❌
- Visual Feedback: ✅/❌
- Win Display: ✅/❌
- Game Reset: ✅/❌

Integration Tests:
- Full Game Flow: ✅/❌
- Multiplayer: ✅/❌
- Edge Cases: ✅/❌

Notes: [ANY ISSUES FOUND]
```
