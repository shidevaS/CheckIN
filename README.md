# Tuiton — Tuition Meets the AI Studio

A learning platform that blends school-subject tuition with an AI & innovation track — live classes plus integrated content, daily challenges, and a portfolio that proves what you can build.

## 🚀 Production Status

**This app is partially production-ready and needs the following fixes:**

### ✅ Already Configured
- [x] Next.js App Router with TypeScript
- [x] Prisma ORM with SQLite (dev) / PostgreSQL (prod)
- [x] JWT-based authentication
- [x] Role-based access control (Student / Admin)
- [x] PWA support (manifest, service worker)
- [x] Fresh deployment ready

### ⚠️ Need Configuration
- [ ] Production database (PostgreSQL) - currently using SQLite
- [ ] Environment variables for production
- [ ] Missing PWA icons (only `icon.svg` exists)
- [ ] Production-ready Docker setup

## 📦 Project Structure

```
tuiton/
├── apps/
│   ├── web/        # Next.js web application
│   └── mobile/     # React Native mobile app (Expo)
├── packages/
│   ├── shared/     # Shared types and constants
│   └── db/         # Prisma schema and database utils
├── tests/          # Playwright tests
└── prisma/         # Database migrations
```

## 🛠️ Development

### Prerequisites
- Node.js >= 20
- npm >= 10
- PostgreSQL (for production)

### Setup

```bash
# Install dependencies
npm install

# Copy environment files
cp apps/web/.env.example apps/web/.env.local
cp packages/db/.env.example packages/db/.env

# Update DATABASE_URL for SQLite (dev) or PostgreSQL (prod)
# For SQLite: DATABASE_URL="file:./dev.db"

# Seed the database
npm run db:push 
npm run db:seed

# Start development server
npm run dev
```

### Database Seeding

The seed script creates:
- **Admin accounts**: Shivani Pal, Devendra Sharma
- **Demo student**: student@tuiton.app
- **Sample roadmaps**: Math, Science, AI Foundations, Python Coding, etc.
- **Challenges**: Daily, weekly, monthly exercises
- **Badges and certificates**

## 🚀 Production Deployment

### Environment Variables

Create `.env.production` with these variables:

```bash
# Database (PostgreSQL required for production)
DATABASE_URL="postgresql://user:password@localhost:5432/tuiton?schema=public"

# Authentication
AUTH_SECRET="<32-char-secret-from-crypto.randomBytes(32).toString('hex')>"

# App URL
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# OAuth (optional but recommended)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Docker Deployment

```bash
# Build and run with Docker
docker build -t tuiton .
docker run -p 3000:3000 -d tuiton
```

### Manual Deployment

```bash
# Install dependencies
npm ci --only=production

# Build
npm run build

# Run
npm run start
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/register` - User registration

### Lessons
- `POST /api/lessons/[id]/complete` - Mark lesson complete
- `POST /api/lessons/[id]/quiz` - Submit quiz answers

### Live Classes
- `GET /api/live/[classId]` - Get class details
- `POST /api/live/[classId]/attend` - Mark attendance
- `GET /api/live/[classId]/chat` - Get chat messages

### Challenges
- `POST /api/challenges/[id]/submit` - Submit challenge solution

## 🎨 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Mobile**: React Native (Expo), TypeScript
- **Database**: Prisma ORM, PostgreSQL
- **Authentication**: JWT, Email OTP, Google OAuth
- **Real-time**: WebSockets (Jitsi for live classes)
- **Deployment**: Docker, Docker Compose

## 📚 Roadmap

See `ROADMAP.html` for the detailed build phases:
1. Foundation & access
2. Roadmaps & content
3. Live classes (Jitsi)
4. Challenges & gamification
5. Profile & portfolio
6. Polish, mobile, launch

## 👥 Contributors

- **Shivani Pal** - Host, Content Creator
- **Devendra Sharma** - Tech Track, DevOps

## 📜 License

© 2024 Tuiton Academy. All rights reserved.

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
