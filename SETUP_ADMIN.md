# TravelCraft Admin Panel - Setup Guide

## Prerequisites
- Node.js (already installed)
- MongoDB (or use MongoDB Atlas cloud)

## Quick Start (3 Options)

### Option 1: MongoDB Atlas Cloud (Recommended - No Installation)
**Fastest way to get running:**

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/travelcraft`)
4. Update `.env` file:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/travelcraft?retryWrites=true&w=majority
   ```
5. Run server:
   ```
   cd server
   npm start
   ```

### Option 2: Docker (If Docker Desktop is installed)
```bash
# From project root
docker-compose up -d

# Then start server
cd server
npm start
```

### Option 3: Local MongoDB Installation
**On Windows:**
```bash
# Run the installer script (requires Admin)
server/install-mongodb.bat

# Or use Chocolatey (if installed)
choco install mongodb-community

# Start MongoDB service
net start MongoDB

# Or start manually (create C:\data\db folder first)
mongod --dbpath "C:\data\db"

# In another terminal, start server
cd server
npm start
```

## Verify Setup

1. Check server is running:
   ```
   curl http://localhost:4000/api/health
   ```
   Should return: `{"ok":true}`

2. Test admin login:
   ```
   curl -X POST http://localhost:4000/api/admin/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@gmail.com","password":"admin@1shu"}'
   ```
   Should return a JWT token

3. Open browser and go to:
   ```
   http://localhost:5173/admin
   ```
   (Or replace 5173 with your Vite port)

## Admin Credentials
- Email: `admin@gmail.com`
- Password: `admin@1shu`

## Troubleshooting

**MongoDB connection refused:**
- Make sure MongoDB is running (service or mongod command)
- Check connection string in `.env`

**Port 4000 already in use:**
```bash
# Find process using port 4000
netstat -ano | findstr :4000

# Kill it (replace PID)
taskkill /PID <PID> /F

# Or use different port in .env
PORT=5000
```

**Cannot connect to admin panel:**
- Start frontend dev server: `npm run dev` (in project root)
- Ensure backend is running on port 4000
- Check browser console for errors
