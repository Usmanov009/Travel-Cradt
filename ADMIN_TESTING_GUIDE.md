# Admin Panel Testing & Setup Guide

## 🚀 Quick Start (5 Steps)

### Step 1: Setup MongoDB (Choose One Option)

**Option A: MongoDB Atlas (Easiest - Recommended)**
```
1. Go to: https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a free cluster
4. Copy connection string (looks like: mongodb+srv://username:password@cluster.mongodb.net/travelcraft)
5. Update server/.env:
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/travelcraft?retryWrites=true&w=majority
```

**Option B: Docker**
```bash
docker-compose up -d
# Then use default .env MONGO_URI
```

**Option C: Download MongoDB Locally**
- Windows: https://www.mongodb.com/try/download/community
- Install with defaults
- Will auto-start as service

### Step 2: Install Backend Dependencies
```bash
cd server
npm install
```

### Step 3: Start Backend Server
```bash
cd server
npm start
# Should show: "Server running on port 4000"
```

### Step 4: Start Frontend (New Terminal)
```bash
npm run dev
# Should show: "Local: http://localhost:5174/"
```

### Step 5: Access Admin Panel
```
1. Open browser: http://localhost:5174/admin
2. Login with:
   - Email: admin@gmail.com
   - Password: admin@1shu
3. Should see dashboard with stats
```

---

## ✅ Testing Checklist

### Backend Tests
```bash
# Test 1: Server health
curl http://localhost:4000/api/health
# Expected: {"ok":true}

# Test 2: Admin login
curl -X POST http://localhost:4000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"admin@1shu"}'
# Expected: {"token":"jwt_token_here","user":{...}}

# Test 3: Dashboard (replace TOKEN with actual token)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:4000/api/admin/dashboard/overview
# Expected: {"totalUsers":N,"totalPackages":N,"totalBookings":N,"totalRevenue":N,"recentBookings":[...]}
```

### Frontend Tests
```
1. Navigate to http://localhost:5174/admin
   ✅ Should redirect to login if not authenticated
   ✅ Login form should appear
   
2. Enter credentials:
   - Email: admin@gmail.com
   - Password: admin@1shu
   ✅ Should login successfully
   ✅ Should redirect to dashboard
   
3. Check dashboard:
   ✅ Should show 4 stat cards (Users, Packages, Bookings, Revenue)
   ✅ Should show sidebar with navigation
   ✅ Should show recent bookings list
   
4. Test logout:
   ✅ Click logout button
   ✅ Should redirect to login page
   
5. Test session persistence:
   ✅ Refresh page (F5)
   ✅ Should stay logged in (token restored from localStorage)
```

---

## 🔧 Troubleshooting

### "Cannot connect to MongoDB"
```
✅ Solution 1: Check MongoDB is running
   - Windows: Services > MongoDB Server (should be Running)
   - Or: mongod (if installed locally)
   - Or: docker-compose up -d (if using Docker)

✅ Solution 2: Check connection string in server/.env
   MONGO_URI=mongodb://127.0.0.1:27017/travelcraft

✅ Solution 3: Use MongoDB Atlas instead (no local install needed)
```

### "Port 4000 already in use"
```bash
# Find and kill process
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Or use different port in server/.env
PORT=5000
```

### "Cannot find module X" (Frontend)
```bash
# Rebuild frontend
rm -r node_modules
npm install
npm run dev
```

### "Login returns 'Server error'"
```
✅ Check server terminal for error message
✅ Verify MongoDB is connected
✅ Check .env has correct MONGO_URI
✅ Verify admin user was seeded (check server logs on startup)
```

### "Admin page shows 'Loading...' forever"
```
✅ Check browser console (F12) for errors
✅ Verify backend is running on port 4000
✅ Check network tab - API calls should succeed
✅ Try hard refresh: Ctrl+Shift+R
```

---

## 📁 Files Created/Modified

### Backend
- ✅ `server/src/models/User.js` - User schema with password hash
- ✅ `server/src/controllers/admin/authController.js` - Login logic
- ✅ `server/src/controllers/admin/dashboardController.js` - Stats endpoint
- ✅ `server/src/middleware/adminAuth.js` - JWT verification
- ✅ `server/src/routes/admin/auth.js` - Auth routes
- ✅ `server/src/routes/admin/dashboard.js` - Dashboard routes
- ✅ `server/src/index.js` - Updated to mount admin routes
- ✅ `server/package.json` - Added bcryptjs, jsonwebtoken

### Frontend
- ✅ `src/app/contexts/AdminAuthContext.tsx` - Auth state management
- ✅ `src/app/services/adminApi.ts` - API helper
- ✅ `src/app/pages/admin/Login.tsx` - Login page
- ✅ `src/app/pages/admin/Dashboard.tsx` - Dashboard page
- ✅ `src/app/components/admin/AdminLayout.tsx` - Admin UI layout
- ✅ `src/app/components/admin/AdminApp.tsx` - Auth wrapper
- ✅ `src/app/routes.tsx` - Updated routes

---

## 🔐 Admin Credentials
```
Email: admin@gmail.com
Password: admin@1shu
Role: admin
```
(Auto-created when server starts for first time)

---

## 📊 API Endpoints

### Authentication
```
POST /api/admin/auth/login
  Body: {"email":"admin@gmail.com","password":"admin@1shu"}
  Response: {"token":"jwt...","user":{...}}
```

### Dashboard
```
GET /api/admin/dashboard/overview
  Headers: Authorization: Bearer {token}
  Response: {
    "totalUsers": 5,
    "totalPackages": 10,
    "totalBookings": 20,
    "totalRevenue": 5000,
    "recentBookings": [...]
  }
```

---

## 🎯 Next Features (Future)
- [ ] Package management (create, edit, delete)
- [ ] User management (view, block, delete)
- [ ] Booking approval workflow
- [ ] Destination management
- [ ] AI settings & logs
- [ ] Website settings
- [ ] Advanced analytics

---

## ❓ Need Help?

If admin page still doesn't load:
1. Check browser console (F12) for JavaScript errors
2. Check network tab - see which API calls fail
3. Check server terminal for error messages
4. Verify MongoDB connection (should see "MongoDB connected" on server startup)
5. Try clearing browser cache (Ctrl+Shift+Delete)
