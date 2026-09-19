# Snake and Ladder Game - Deployment Guide

## 🎮 Project Overview
A full-stack Snake and Ladder game built with:
- **Backend**: NestJS (TypeScript) on port 3002
- **Frontend**: Next.js (TypeScript + Tailwind) on port 3000

## 🧪 Testing

### Manual Testing Steps
1. **Start Backend**:
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Game Functionality**:
   - Open http://localhost:3000
   - Add player names and start game
   - Roll dice and verify movement
   - Test snake and ladder mechanics
   - Test win condition (reach 100)
   - Test reset functionality

### API Testing
Test backend endpoints directly:
```bash
# Get board layout
curl http://localhost:3002/game/board

# Get game state
curl http://localhost:3002/game/state

# Start game
curl -X POST http://localhost:3002/game/start -H "Content-Type: application/json" -d '{"players":["Alice","Bob"]}'

# Roll dice
curl -X POST http://localhost:3002/game/roll

# Reset game
curl -X POST http://localhost:3002/game/reset
```

## 🚀 Deployment Options

### Option 1: Deploy Frontend to Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/snake-ladder-game.git
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` folder as root directory
   - Add environment variable: `NEXT_PUBLIC_API_URL` = your backend URL
   - Click "Deploy"

### Option 2: Deploy Backend to Render

1. **Push to GitHub** (if not done already)

2. **Deploy to Render**:
   - Go to [render.com](https://render.com)
   - Click "New +"
   - Select "Web Service"
   - Connect your GitHub repository
   - Select the `backend` folder
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Click "Deploy Web Service"

3. **Update Frontend Environment Variable**:
   - In Vercel project settings
   - Update `NEXT_PUBLIC_API_URL` to your Render backend URL
   - Redeploy frontend

### Option 3: Deploy Both to Railway

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy Backend**:
   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```

3. **Deploy Frontend**:
   ```bash
   cd frontend
   railway init
   railway up
   ```

4. **Set Environment Variables**:
   - In Railway dashboard
   - Set `NEXT_PUBLIC_API_URL` for frontend to backend URL

## 🌐 Free Deployment Services

### Frontend (Next.js):
- **Vercel**: Free tier, automatic HTTPS, custom domains
- **Netlify**: Free tier, continuous deployment
- **Railway**: Free tier with PostgreSQL option

### Backend (Node.js/NestJS):
- **Render**: Free tier, automatic SSL
- **Railway**: Free tier, easy deployment
- **Heroku**: Free tier (limited)
- **Fly.io**: Free tier, global deployment

## 📝 Environment Variables

### Frontend (.env.local):
```
NEXT_PUBLIC_API_URL=http://localhost:3002
```

### Production:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## 🔧 Pre-deployment Checklist

- [ ] Test game locally
- [ ] Push code to GitHub
- [ ] Update environment variables
- [ ] Deploy backend first
- [ ] Get backend URL
- [ ] Update frontend with backend URL
- [ ] Deploy frontend
- [ ] Test deployed application
- [ ] Share URLs with others

## 🎯 Quick Share URLs

After deployment, you'll have:
- **Frontend URL**: `https://your-project.vercel.app`
- **Backend URL**: `https://your-backend.onrender.com`

Share the frontend URL with others to play the game!

## 🐛 Troubleshooting

### CORS Issues:
- Ensure backend has `app.enableCors()` in main.ts
- Update frontend API URL to correct backend URL

### Build Errors:
- Check Node.js version compatibility
- Ensure all dependencies are installed
- Verify TypeScript compilation

### Game Not Working:
- Check browser console for errors
- Verify backend is running
- Check API connectivity
- Ensure environment variables are set

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Documentation](https://nextjs.org/docs)
