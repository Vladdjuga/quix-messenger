# 🚀 Development Environment Setup

## 📁 Environment Files Overview

### `.env.local` - Local Development (Recommended)
Use when running frontend locally with `npm run dev`
```bash
# Backend services in Docker, frontend local
USER_SERVICE_URL=http://localhost:5001
MESSAGE_SERVICE_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:8081
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### `.env` - Docker Production
Use when running frontend in Docker container
```bash
# All services in Docker network
USER_SERVICE_URL=http://user-service:7000
MESSAGE_SERVICE_URL=http://message-service:7000
NEXT_PUBLIC_SOCKET_URL=http://localhost:8081
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 🛠️ Development Workflow

### Option 1: Local Frontend + Docker Backend (Recommended)

**Step 1: Start Backend Services**
```bash
# From monorepo root
docker-compose up -d postgres mongodb user-service message-service realtime-service-ts
```

**Step 2: Start Frontend Locally**
```bash
# Navigate to frontend
cd frontend-clean

# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

**Access Points:**
- 🌐 Frontend: http://localhost:3000
- 🔐 User Service: http://localhost:5001
- 💬 Message Service: http://localhost:5000
- ⚡ Realtime Service: http://localhost:8081
- 🗄️ PgAdmin: http://localhost:5050

### Option 2: Full Docker Stack

**Start Everything:**
```bash
# Build and start all services
make build
docker-compose up -d
```

**Access Points:**
- 🌐 Frontend: http://localhost:3001
- 🔐 User Service: http://localhost:5001
- 💬 Message Service: http://localhost:5000
- ⚡ Realtime Service: http://localhost:8081

## ⚙️ Environment Variables Explained

| Variable | Local Dev | Docker | Description |
|----------|-----------|---------|-------------|
| `USER_SERVICE_URL` | `localhost:5001` | `user-service:7000` | Backend API endpoint |
| `MESSAGE_SERVICE_URL` | `localhost:5000` | `message-service:7000` | Message API endpoint |
| `NEXT_PUBLIC_SOCKET_URL` | `localhost:8081` | `localhost:8081` | Socket.io connection |
| `NEXT_PUBLIC_API_URL` | `localhost:3000/api` | `localhost:3001/api` | Frontend API routes |

## 🔄 Quick Commands

### Development Mode
```bash
# Terminal 1: Backend
docker-compose up postgres mongodb user-service message-service realtime-service-ts

# Terminal 2: Frontend  
cd frontend-clean && npm run dev
```

### Check Backend Status
```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs user-service
docker-compose logs message-service
docker-compose logs realtime-service-ts
```

### Reset Everything
```bash
# Stop all services
docker-compose down

# Remove containers and rebuild
docker-compose down --rmi all
make build
docker-compose up -d
```

## 🐛 Troubleshooting

### Frontend Can't Connect to Backend
1. Check backend services are running: `docker-compose ps`
2. Verify ports are correct in `.env.local`
3. Check user-service logs: `docker-compose logs user-service`

### Socket Connection Issues
1. Verify realtime-service is running: `docker-compose logs realtime-service-ts`
2. Check socket URL in environment: `NEXT_PUBLIC_SOCKET_URL=http://localhost:8081`

### Database Connection Issues
1. Check postgres is running: `docker-compose ps postgres`
2. Verify connection strings in backend services
3. Check pgAdmin at http://localhost:5050

## 💡 Development Tips

1. **Use Local Development** for active frontend coding
2. **Environment auto-loads** from `.env.local` when using `npm run dev`
3. **Hot reload** works only in local development mode
4. **Docker mode** for testing full integration
5. **Check Network** - backend services expose ports to localhost
