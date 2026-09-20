# Production Deployment Guide

## Overview

This document describes how to deploy Tuiton to production. The app is ready for end-to-end production deployment with the following requirements:

### Prerequisites
- Node.js 20.x or higher
- PostgreSQL 14+ (required for production)
- Redis (for sessions, optional initially)
- Docker (recommended for containerization)

## Quick Start with Docker

```bash
# Set environment variables
cp apps/web/.env.production.example apps/web/.env.production

# Edit apps/web/.env.production with your values:
# - DATABASE_URL: PostgreSQL connection string
# - AUTH_SECRET: Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# - NEXT_PUBLIC_APP_URL: Your production URL

# Build and run
docker-compose up -d --build

# Seed the database
docker-compose exec app npm run db:push --workspace=@tuiton/db
docker-compose exec app npm run db:seed --workspace=@tuiton/db
```

## Manual Deployment

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb tuiton

# Set environment
export DATABASE_URL="postgresql://tuiton:password@localhost:5432/tuiton?schema=public"

# Run migrations
npm run db:push

# Seed data
npm run db:seed
```

### 2. Generate Auth Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Configure Environment

Create `.env` in the root with:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/tuiton?schema=public"
AUTH_SECRET="<generated-secret>"
NEXT_PUBLIC_APP_URL="https://tuiton.app"

# Optional services
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
MSG91_AUTH_KEY="your-msg91-key"
```

### 4. Build and Start

```bash
npm install --only=production
npm run build
npm run start
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `AUTH_SECRET` | ✅ | 32+ char secret for JWT signing |
| `NEXT_PUBLIC_APP_URL` | ✅ | Production app URL |
| `GOOGLE_CLIENT_ID` | ❌ | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ❌ | Google OAuth client secret |
| `MSG91_AUTH_KEY` | ❌ | SMS provider API key |

## Production Checklist

- [x] SQLite replaced with PostgreSQL
- [x] HFS256 JWT signing implemented
- [x] Environment variables secured
- [x] PWA icons configured
- [x] Docker deployment ready
- [x] TypeScript type checking passes
- [x] Seed script for production data
- [ ] SSL/HTTPS configured (via CDN or reverse proxy)
- [ ] Rate limiting enabled
- [ ] Backup strategy for database
- [ ] Monitoring and logging

## Services

**Web App**: http://localhost:3000

### Default Users (seed script)
- Admin 1: `shivani@tuiton.app` / `tuiton123`
- Admin 2: `devendra@tuiton.app` / `tuiton123`
- Demo Student: `student@tuiton.app` / `tuiton123`

## Production Deployment Options

### VPS Deployment (Recommended for initial launch)
1. Set up Ubuntu 22.04 server
2. Install Node.js 20, PostgreSQL, Redis
3. Clone repository and run `docker-compose up -d`

### Cloud Deployment
- Deploy on any cloud provider supporting Docker
- Use managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)
- Use managed Redis if needed

## Scaling Considerations

For production traffic, consider:
- Using a managed PostgreSQL service
- Redis for session storage (instead of JWT cookies)
- Cloudflare for CDN and DDoS protection
- Monitoring with Prometheus/Grafana or similar

---

For questions, contact: Shivani Pal (admin@tuiton.app)