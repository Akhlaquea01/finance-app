# Multi-stage Dockerfile for combined Frontend + Backend deployment on Render
# This builds both client and server in a single container

# Stage 1: Build Server
FROM node:20-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# Stage 2: Build Client
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package.json client/package-lock.json* client/pnpm-lock.yaml* ./

RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then \
    npm ci; \
  else \
    echo "Lockfile not found." && exit 1; \
  fi

COPY client/ ./

# Build with API URL pointing to same domain (relative path)
# Force relative API URL for production
ENV NEXT_PUBLIC_API_URL=/api/v1
ENV NEXT_PUBLIC_APP_URL=https://atts-finance.onrender.com

RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm build; \
  else \
    npm run build; \
  fi

# Stage 3: Production - Combined Server + Client
FROM node:20-alpine AS production

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache nginx supervisor gettext psmisc netcat-openbsd

# Copy server files
WORKDIR /app/server
COPY --from=server-builder /app/server/package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=server-builder /app/server/dist ./dist
COPY --from=server-builder /app/server/src/swagger.json ./src/swagger.json
COPY --from=server-builder /app/server/public ./public

# Copy client files
WORKDIR /app/client
COPY --from=client-builder /app/client/package.json ./
COPY --from=client-builder /app/client/.next ./.next
COPY --from=client-builder /app/client/public ./public
COPY --from=client-builder /app/client/node_modules ./node_modules

# Setup nginx
WORKDIR /app
RUN mkdir -p /etc/nginx/conf.d /var/log/nginx /var/lib/nginx/tmp /run/nginx

# Copy configuration files
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY supervisord.conf /etc/supervisord.conf

# Create wrapper scripts for backend and frontend with explicit ports
# Preserve all environment variables from Render
RUN echo '#!/bin/sh' > /app/start-backend.sh && \
    echo 'echo "==> Starting backend on PORT 8080"' >> /app/start-backend.sh && \
    echo '# Kill any process on port 8080' >> /app/start-backend.sh && \
    echo 'fuser -k 8080/tcp 2>/dev/null || true' >> /app/start-backend.sh && \
    echo 'sleep 2' >> /app/start-backend.sh && \
    echo 'cd /app/server' >> /app/start-backend.sh && \
    echo '# Preserve all env vars, override PORT' >> /app/start-backend.sh && \
    echo 'export PORT=8080' >> /app/start-backend.sh && \
    echo 'exec node dist/index.js' >> /app/start-backend.sh && \
    chmod +x /app/start-backend.sh

RUN echo '#!/bin/sh' > /app/start-frontend.sh && \
    echo 'echo "==> Starting frontend on PORT 3000"' >> /app/start-frontend.sh && \
    echo '# Wait for backend to start first' >> /app/start-frontend.sh && \
    echo 'sleep 5' >> /app/start-frontend.sh && \
    echo '# Kill any process on port 3000' >> /app/start-frontend.sh && \
    echo 'fuser -k 3000/tcp 2>/dev/null || true' >> /app/start-frontend.sh && \
    echo 'sleep 2' >> /app/start-frontend.sh && \
    echo 'cd /app/client' >> /app/start-frontend.sh && \
    echo '# Preserve all env vars, override PORT' >> /app/start-frontend.sh && \
    echo 'export PORT=3000' >> /app/start-frontend.sh && \
    echo 'exec npm start' >> /app/start-frontend.sh && \
    chmod +x /app/start-frontend.sh

# Create health check wait script
RUN echo '#!/bin/sh' > /app/wait-for-services.sh && \
    echo 'set -e' >> /app/wait-for-services.sh && \
    echo 'echo "Waiting for services to be ready..."' >> /app/wait-for-services.sh && \
    echo 'MAX_WAIT=180' >> /app/wait-for-services.sh && \
    echo 'WAIT_COUNT=0' >> /app/wait-for-services.sh && \
    echo '# Wait for backend' >> /app/wait-for-services.sh && \
    echo 'echo "Checking backend on port 8080..."' >> /app/wait-for-services.sh && \
    echo 'while [ $WAIT_COUNT -lt $MAX_WAIT ]; do' >> /app/wait-for-services.sh && \
    echo '  if nc -z 127.0.0.1 8080 2>/dev/null; then' >> /app/wait-for-services.sh && \
    echo '    echo "✓ Backend is ready on port 8080"' >> /app/wait-for-services.sh && \
    echo '    break' >> /app/wait-for-services.sh && \
    echo '  fi' >> /app/wait-for-services.sh && \
    echo '  sleep 2' >> /app/wait-for-services.sh && \
    echo '  WAIT_COUNT=$((WAIT_COUNT + 2))' >> /app/wait-for-services.sh && \
    echo '  if [ $((WAIT_COUNT % 10)) -eq 0 ]; then' >> /app/wait-for-services.sh && \
    echo '    echo "Still waiting for backend... ($WAIT_COUNT/$MAX_WAIT seconds)"' >> /app/wait-for-services.sh && \
    echo '  fi' >> /app/wait-for-services.sh && \
    echo 'done' >> /app/wait-for-services.sh && \
    echo 'if [ $WAIT_COUNT -ge $MAX_WAIT ]; then' >> /app/wait-for-services.sh && \
    echo '  echo "⚠ Warning: Backend did not become ready in time"' >> /app/wait-for-services.sh && \
    echo 'fi' >> /app/wait-for-services.sh && \
    echo '# Wait for frontend' >> /app/wait-for-services.sh && \
    echo 'WAIT_COUNT=0' >> /app/wait-for-services.sh && \
    echo 'echo "Checking frontend on port 3000..."' >> /app/wait-for-services.sh && \
    echo 'while [ $WAIT_COUNT -lt $MAX_WAIT ]; do' >> /app/wait-for-services.sh && \
    echo '  if nc -z 127.0.0.1 3000 2>/dev/null; then' >> /app/wait-for-services.sh && \
    echo '    echo "✓ Frontend is ready on port 3000"' >> /app/wait-for-services.sh && \
    echo '    break' >> /app/wait-for-services.sh && \
    echo '  fi' >> /app/wait-for-services.sh && \
    echo '  sleep 2' >> /app/wait-for-services.sh && \
    echo '  WAIT_COUNT=$((WAIT_COUNT + 2))' >> /app/wait-for-services.sh && \
    echo '  if [ $((WAIT_COUNT % 10)) -eq 0 ]; then' >> /app/wait-for-services.sh && \
    echo '    echo "Still waiting for frontend... ($WAIT_COUNT/$MAX_WAIT seconds)"' >> /app/wait-for-services.sh && \
    echo '  fi' >> /app/wait-for-services.sh && \
    echo 'done' >> /app/wait-for-services.sh && \
    echo 'if [ $WAIT_COUNT -ge $MAX_WAIT ]; then' >> /app/wait-for-services.sh && \
    echo '  echo "⚠ Warning: Frontend did not become ready in time"' >> /app/wait-for-services.sh && \
    echo 'fi' >> /app/wait-for-services.sh && \
    echo 'echo "✓ All services are ready - starting nginx"' >> /app/wait-for-services.sh && \
    chmod +x /app/wait-for-services.sh

# Create main startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo '# Generate nginx config with Render PORT' >> /app/start.sh && \
    echo 'export PORT=${PORT:-10000}' >> /app/start.sh && \
    echo 'envsubst "\$PORT" < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf' >> /app/start.sh && \
    echo '# Start supervisord' >> /app/start.sh && \
    echo 'exec supervisord -c /etc/supervisord.conf' >> /app/start.sh && \
    chmod +x /app/start.sh

# Expose the port
EXPOSE ${PORT:-10000}

# Environment variables
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# Start all services via supervisord
CMD ["/app/start.sh"]
