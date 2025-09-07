# Messenger Backend (Microservices)

💬 Microservice-based messenger backend with MongoDB, PostgreSQL, gRPC and WebSocket.

## 📦 Services
- **user-service**: Handles auth, profile and friendships (PostgreSQL, ASP.NET Core)
- **message-service**: Message storage and querying (MongoDB, ASP.NET Core)
- **realtime-service-ts**: Real-time messaging via WebSocket (TypeScript/Express)
- **frontend**: Next.js web application (TypeScript, Tailwind CSS)

## ⚙️ Stack
- ASP.NET Core 9
- Node.js/Express (TypeScript)
- Next.js 15
- EF Core
- MongoDB / PostgreSQL
- Domain driven design
- gRPC
- WebSocket
- React/TypeScript

## 🔧 Setup

- ### Build all Dockerfiles 
  ```bash
  make build # this command will build the app by simply building all docker containers
  ```
- ### Turn on the application
  ```bash
  make up # this command will run docker compose file
  ```
- ### Turn off the application
  ```bash
  make down # this command will stop all services
  ```

## 🧠 Architecture
<p align="center">
  <img src="https://github.com/user-attachments/assets/d7510037-0e1a-4b47-9570-60c7ea91e057" width="400"/>
</p>

## ✅ Planned Features
- [x] Authorization & Authentication
- [x] Friendship management system
- [x] Logging
- [x] Containerization
- [x] gRPC microservice communication
- [x] WebSocket real-time messaging
- [x] Frontend (Next.js)
- [ ] File/image uploading
- [ ] Video/voice calls
- [ ] Caching
