# TravelCraft Server

Run the dev server (needs Node.js and PostgreSQL/NeonDB):

```bash
cd server
npm install
# create server/.env or use root .env with DATABASE_URL configured
npm run dev
```

Environment variables:
- `DATABASE_URL` - PostgreSQL connection string, for example:
  `postgresql://user:pass@host/neondb?sslmode=require&channel_binding=require`
- `JWT_SECRET` - secret for auth tokens
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` - initial admin user credentials

The server supports loading env values from both:
- `server/.env` (takes precedence)
- `../.env` (root .env)

API endpoints:
- `GET /api/health` - app and database health check
- `GET /api/packages` - list packages
- `POST /api/packages` - create package
- `GET /api/bookings` - list bookings
- `POST /api/bookings` - create booking
- `PUT /api/bookings/:id` - update booking (e.g., status)
