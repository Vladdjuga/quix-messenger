# Messenger Backend (Microservices)

💬 Microservice-based messenger backend with MongoDB, PostgreSQL, gRPC and WebSocket.

## 📦 Services
- **user-service**: Handles auth, profile and contacts (PostgreSQL)
- **message-service**: Message storage and querying (MongoDB)
- **real-time-service**: Real-time messaging ([gorilla/websocket](https://github.com/gorilla/websocket))

## ⚙️ Stack
- ASP.NET Core 9
- [Gin](https://github.com/gin-gonic/gin)
- EF Core
- MongoDB / MSSQL
- Domain driven design
- gRPC
- WebSocket

## 🔧 Setup

- ### Build all Dockerfiles 
  ```bash
  make build # this command will build the app by simply building all docker containers
  ```
- ### Turn up the application
  ```bash
  make up # this command will run docker compose file
  ```
- ### Turn down the application
  ```bash
  make down # this command will stop all services
  ```

## 🧠 Architechture
<p align="center">
  <img src="https://github.com/user-attachments/assets/d7510037-0e1a-4b47-9570-60c7ea91e057" width="400"/>
</p>

## ✅ Planned Features
- [x] Authorization & Authentication
- [x] Logging
- [x] Containerization
- [x] gRPC microservice communication
- [x] Websocket
- [ ] Frontend
- [ ] File/image uploading
- [ ] Video/voice calls
- [ ] Caching
