# TravelCraft Server

Run the dev server (needs Node.js and MongoDB):

```bash
cd server
npm install
# set MONGO_URI in .env or use local MongoDB
npm run dev
```

API endpoints:
- `GET /api/packages` - list packages
- `POST /api/packages` - create package
- `GET /api/bookings` - list bookings
- `POST /api/bookings` - create booking
- `PUT /api/bookings/:id` - update booking (e.g., status)
