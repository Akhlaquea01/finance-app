# Finance Management Application

Full-stack finance management application with Next.js frontend and Node.js/Express backend.

## Quick Start

### Local Development

```bash
# Install dependencies
npm run install:all

# Create .env file in root directory
# (Contains both backend and frontend config)

# Start both client and server
npm run dev

# Or start separately
npm run dev:server  # Backend only
npm run dev:client  # Frontend only
```

### VS Code Debugging

Press `F5` and select:
- **🎯 Full Stack (Client + Server)** - Start both together
- **🚀 Start Server (Backend)** - Server only
- **🎨 Start Client (Frontend)** - Client only

### Docker (Local Development)

```bash
# Start with Docker
cd docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Production Deployment

#### Option 1: Render.com (Docker)
Deploy to Render using Docker:
1. Push code to GitHub
2. In Render Dashboard, create new Web Service
3. Connect your repository
4. Render will auto-detect `render.yaml` and use Docker
5. Set `MONGODB_URL` environment variable in Render Dashboard
6. Deploy!

**Architecture**: Unified Docker container with nginx reverse proxy
- `/api/v1/*` → Backend (Node.js on port 8080)
- `/*` → Frontend (Next.js on port 3000)
- Nginx on Render's assigned PORT

#### Option 2: Docker (Any Server)
Deploy anywhere using Docker:
```bash
# Create .env.production with your MongoDB URL and secrets
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

**Access**: `http://your-server-ip` (port 80) or configure custom port in `docker-compose.prod.yml`

## Environment Variables

Create `.env` file in the **root directory**:

```env
# Backend Configuration
PORT=5000
NODE_ENV=development
MONGODB_URL=mongodb://localhost:27017/finance-management
CORS_ORIGIN=http://localhost:3000
SOCKET_ORIGIN=*
ACCESS_TOKEN_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-secret-key
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional (Backend)
EMAIL_ADDRESS=
EMAIL_PASS_CODE=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GOOGLE_GENAI_API=
GOOGLE_GENAI_MODEL=
OPENROUTER_API=
OPENROUTER_AI_MODEL=
TELEGRAM_BOT_ENABLE=false
YOUR_TELEGRAM_BOT_TOKEN=
```

## Deployment

### Render.com

1. Push code to Git repository
2. In Render Dashboard: New → Blueprint
3. Connect repository (auto-detects `render.yaml`)
4. Set environment variables in Render dashboard:
   - Server: `MONGODB_URL`, `CORS_ORIGIN`
   - Client: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`
5. Deploy

## Project Structure

```
finance-management/
├── .env             # Environment variables (both backend & frontend)
├── client/          # Next.js frontend
├── server/          # Node.js/Express backend
├── .vscode/         # VS Code debug configurations
├── docker-compose.yml
├── Dockerfile
├── render.yaml      # Render deployment config
└── package.json     # Root workspace
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS, Shadcn UI
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB
- **Deployment**: Docker, Render.com

