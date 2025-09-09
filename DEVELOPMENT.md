# Development Commands

## 🚀 Quick Development Setup

### Start Backend Services Only
```bash
# Start backend services in Docker
docker-compose up -d postgres mongodb user-service message-service realtime-service-ts

# Run frontend locally for development
cd frontend-clean
npm run dev
```
Frontend: http://localhost:3000
Backend APIs: Available at localhost ports

### Full Docker Stack (Testing/Production)
```bash
# Build and start everything
make restart

# Or manually:
docker-compose up -d
```
Frontend: http://localhost:3001
Everything containerized

## 🔧 Available Commands

### Development Mode (Recommended)
```bash
# Terminal 1: Backend services
docker-compose up postgres mongodb user-service message-service realtime-service-ts

# Terminal 2: Frontend development
cd frontend-clean && npm run dev
```

### Production Mode
```bash
# Build all images
make build

# Start full stack
docker-compose up -d

# Check status
docker-compose ps
```

### Cleanup
```bash
# Stop all services
make down

# Remove containers and images
docker-compose down --rmi all
```

## 🌐 Service URLs

### Development Mode
- Frontend: http://localhost:3000 (local dev server)
- User Service: http://localhost:5001
- Message Service: http://localhost:5000  
- Realtime Service: http://localhost:8081
- PgAdmin: http://localhost:5050

### Docker Mode
- Frontend: http://localhost:3001 (containerized)
- User Service: http://localhost:5001
- Message Service: http://localhost:5000
- Realtime Service: http://localhost:8081
- PgAdmin: http://localhost:5050

## 💡 Development Tips

1. **Use Development Mode** for active coding
2. **Use Docker Mode** for testing full integration
3. **Environment Variables** automatically switch based on mode
4. **Hot Reload** only available in development mode
5. **Network Isolation** only in Docker mode
