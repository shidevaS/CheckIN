# Tuiton - Production Dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY packages/shared/package*.json packages/shared/
COPY packages/db/package*.json packages/db/
COPY apps/web/package*.json apps/web/

RUN npm ci

# Copy source code
COPY . .

# Build shared packages
RUN npm run build --workspace=@tuiton/shared

# Build db package (generate Prisma client)
RUN npm run db:generate --workspace=@tuiton/db

# Build web app
RUN npm run build --workspace=@tuiton/web

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy built files
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/package*.json ./apps/web/
COPY --from=builder /app/apps/web/next.config.js ./apps/web/
COPY --from=builder /app/apps/web/tsconfig.json ./apps/web/
COPY --from=builder /app/apps/web/.eslintrc.json ./apps/web/
COPY --from=builder /app/apps/web/tailwind.config.ts ./apps/web/
COPY --from=builder /app/apps/web/postcss.config.js ./apps/web/
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/packages/db ./packages/db
COPY --from=builder /app/package*.json ./

# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy Prisma schema
COPY --from=builder /app/packages/db/prisma ./packages/db/prisma

# Create necessary directories
RUN mkdir -p /app/data

# Set production environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Switch to non-root user
USER nextjs

# Start the app
CMD ["npm", "run", "start", "--workspace=@tuiton/web"]