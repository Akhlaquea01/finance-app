# Multi-stage Dockerfile for Finance Management Application
# This Dockerfile builds both the client (Next.js) and server (Node.js/Express) applications

# ============================================
# Stage 1: Build Server
# ============================================
FROM node:20-alpine AS server-builder

WORKDIR /app/server

# Copy server package files
COPY server/package*.json ./

# Install server dependencies
RUN npm ci

# Copy server source files
COPY server/ ./

# Build TypeScript to JavaScript
RUN npm run build

# ============================================
# Stage 2: Build Client
# ============================================
FROM node:20-alpine AS client-builder

WORKDIR /app/client

# Accept build arguments for client
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Copy client package files
COPY client/package.json client/package-lock.json* client/pnpm-lock.yaml* ./

# Install client dependencies
RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then \
    npm ci; \
  else \
    echo "Lockfile not found." && exit 1; \
  fi

# Copy client source files
COPY client/ ./

# Build the Next.js application
RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm build; \
  else \
    npm run build; \
  fi

# ============================================
# Stage 3: Production Server Image
# ============================================
FROM node:20-alpine AS server-production

WORKDIR /app/server

# Copy server package files
COPY server/package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built server files from builder stage
COPY --from=server-builder /app/server/dist ./dist
COPY --from=server-builder /app/server/src/swagger.json ./src/swagger.json
COPY --from=server-builder /app/server/public ./public

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app/server

USER nodejs

# Expose server port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 5000) + '/api/v1/healthcheck', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server application
CMD ["node", "-r", "dotenv/config", "dist/index.js"]

# ============================================
# Stage 4: Production Client Image
# ============================================
FROM node:20-alpine AS client-production

WORKDIR /app/client

ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy package files
COPY --from=client-builder --chown=nextjs:nodejs /app/client/package.json ./package.json
COPY --from=client-builder --chown=nextjs:nodejs /app/client/package-lock.json* ./package-lock.json*
COPY --from=client-builder --chown=nextjs:nodejs /app/client/pnpm-lock.yaml* ./pnpm-lock.yaml*

# Copy configuration files
COPY --from=client-builder --chown=nextjs:nodejs /app/client/next.config.mjs ./next.config.mjs
COPY --from=client-builder --chown=nextjs:nodejs /app/client/tsconfig.json ./tsconfig.json
COPY --from=client-builder --chown=nextjs:nodejs /app/client/tailwind.config.ts ./tailwind.config.ts
COPY --from=client-builder --chown=nextjs:nodejs /app/client/postcss.config.* ./
COPY --from=client-builder --chown=nextjs:nodejs /app/client/components.json ./components.json

# Copy built .next folder (production build)
COPY --from=client-builder --chown=nextjs:nodejs /app/client/.next ./.next

# Copy public folder
COPY --from=client-builder --chown=nextjs:nodejs /app/client/public ./public

# Copy minimal source files needed for production
COPY --from=client-builder --chown=nextjs:nodejs /app/client/middleware.ts ./middleware.ts

# Copy only production node_modules
COPY --from=client-builder --chown=nextjs:nodejs /app/client/node_modules ./node_modules

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use production mode
CMD ["npm", "start"]

