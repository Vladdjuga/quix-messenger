# Quix Messenger (Monorepo)

A modern, full-stack real-time messaging application built with a microservices architecture. Features include user authentication, friend management, real-time messaging, user presence tracking, and file uploads.

## 🏗️ Architecture Overview

### Services Architecture
```
┌─────────────────┐
│     Frontend    │
│   (Next.js)     │
│   Port: 3000    │
└────────┬────────┘
         │ HTTP (BFF Pattern)
         ├──────────────┐
         │              │ WebSocket
         ▼              ▼
┌─────────────────┐    ┌─────────────────┐
│  User Service   │    │  Realtime-TS    │
│  (.NET Core)    │◄──►│   (Node.js)     │
│   Port: 6001    │    │   Port: 8081    │
└────────┬────────┘    └────────┬────────┘
         │                      │
         │ Kafka Publish        │ Kafka Consume
         │                      │
         ▼                      ▼
    ┌─────────────────────────────────┐
    │           Kafka                 │
    │  (Event Streaming)              │
    │  Port: 9092                     │
    │  Topic: messenger.events.       │
    │         newMessage              │
    └─────────────────────────────────┘
         │                      │
         ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │     Redis       │
│  (Persistence)  │    │   (Presence)    │
│   Port: 5432    │    │   Port: 6379    │
└─────────────────┘    └─────────────────┘
```

### 📦 Services (in this repo)
- **`frontend`** — Next.js 15 app with BFF pattern (TypeScript, React 19, Tailwind CSS 4)
  - Client-side React application with Server Components
  - API routes acting as BFF proxy layer
  - WebSocket client for real-time features
- **`realtime-service-ts`** — WebSocket gateway and Kafka consumer (Express.js 4.18, Socket.io 4.8, KafkaJS 2.2)
  - Real-time message delivery via Socket.IO rooms
  - Kafka consumer for `messenger.events.newMessage` topic
  - User presence tracking with Redis
  - Typing indicators broadcast
- **`user-service`** — ASP.NET Core service (PostgreSQL, EF Core 9, KafkaFlow)
  - Authentication with JWT (access + refresh tokens)
  - User profiles and friendship management
  - Message persistence to PostgreSQL
  - Kafka producer for new messages

### 🗄️ Infrastructure
- **PostgreSQL 16** — Primary database for users, friendships, messages, chats
- **Redis 7** — Ephemeral data for online presence (Sets + Hashes), last seen timestamps
- **Apache Kafka 3.8.1** — Event streaming for message broadcasting (3 partitions)
- **Kafka UI** — Web interface for monitoring topics (Port: 8080)
- **PgAdmin 4** — Database management UI (Port: 5050)
- **File System** — Avatar storage with Docker volumes

## ⚙️ Tech Stack

### Backend Services
- **ASP.NET Core 9** — User service with Entity Framework Core, Kafka producer
- **Express.js 4.18** — TypeScript-based realtime service with Node.js 18
- **PostgreSQL 16** — Primary database for persistent data
- **Redis 7** — In-memory store for ephemeral presence data
- **Apache Kafka 3.8.1 (KRaft mode)** — Event streaming without Zookeeper
- **KafkaJS 2.2.4** — Node.js Kafka client for consuming message events

### Frontend
- **Next.js 15** — React-based frontend with App Router
- **React 19** — Latest React with modern hooks and features
- **Tailwind CSS 4** — Utility-first CSS framework
- **TypeScript 5** — Type-safe development
- **Socket.io Client 4.8** — Real-time WebSocket communication
- **Zod 3.25** — Runtime type validation
- **Axios 1.11** — HTTP client with interceptors

### Development & Deployment
- **Docker & Docker Compose** — Containerized deployment
- **ESLint & TypeScript** — Code quality and type checking
- **Makefile** — Build automation

## 🧠 Frontend Architecture (BFF Pattern)

The frontend implements a Backend-For-Frontend (BFF) pattern using Next.js API routes:

### API Proxy Layer
- **Route Structure**: API routes under `frontend/src/app/api/**` proxy to backend services
- **Unified Proxy**: Single helper `src/lib/proxy.ts` handles all backend communication
- **Examples**: 
  - `/api/chats` → `USER_SERVICE_URL/Chat/getChats`
  - `/api/online/[userId]` → `REALTIME_URL/online/:userId`
  - `/api/realtime/user/[userId]/presence` → `REALTIME_URL/user/:userId/presence`

### Security & Validation
- **Input Validation**: Each route validates query/body with Zod schemas
- **Consistent Errors**: Unified error shape `{ message, details? }`
- **JWT Authentication**: Bearer token-based auth with automatic refresh
- **CORS Handling**: Proper cross-origin resource sharing

### Authentication Flow (Hybrid JWT)
```mermaid
sequenceDiagram
    participant UI as Frontend UI
    participant BFF as Next.js BFF
    participant Auth as User Service
    participant RT as Realtime Service
    
    UI->>BFF: Login Request
    BFF->>Auth: POST /Auth/login
    Auth->>BFF: Access Token + Refresh Token (HttpOnly Cookie)
    BFF->>UI: Access Token (localStorage) + Set-Cookie
    UI->>RT: WebSocket Connect (Bearer Token)
    RT->>Auth: Verify JWT
    Auth->>RT: User Data
    RT->>UI: Connection Established
```

### Real-time Communication & Event Streaming

#### Message Flow (Kafka-based)
```mermaid
sequenceDiagram
    participant U1 as User 1 (Sender)
    participant US as User Service
    participant K as Kafka
    participant RT as Realtime Service
    participant U2 as User 2 (Recipient)
    
    U1->>US: POST /Message/send
    US->>PostgreSQL: Save Message
    US->>K: Publish to messenger.events.newMessage
    K->>RT: Consumer receives event
    RT->>U2: Emit via Socket.IO to room
    U2->>UI: Display new message
```

#### Socket.IO Features
- **Token-based Authentication**: Bearer JWT for WebSocket handshake
- **Automatic Reconnection**: Built-in retry logic with exponential backoff
- **Room-based Broadcasting**: Each chat has a dedicated Socket.IO room
- **Typing Indicators**: Real-time `onTyping`/`onStopTyping` events
- **Presence Tracking**: Online/offline status with 10-second polling + Redis Sets

#### Kafka Integration
- **Producer**: User service publishes messages to `messenger.events.newMessage`
- **Consumer**: Realtime service consumes events and broadcasts via WebSocket
- **Consumer Group**: `realtime-service-group` for horizontal scaling
- **Partitions**: 3 partitions for parallel processing
- **Benefits**: Decoupling, message durability, at-least-once delivery

### Key Frontend Paths
```
src/
├── app/
│   ├── api/**              # BFF API routes (proxy layer)
│   ├── (protected)/        # Authenticated pages
│   └── globals.css         # Global styles
├── lib/
│   ├── proxy.ts           # Unified proxy helper
│   ├── hooks/data/        # Data fetching hooks
│   ├── realtime/          # Socket.io workflows
│   ├── mappers/           # DTO → Domain type mapping
│   ├── types/             # TypeScript definitions
│   └── schemas/           # Zod validation schemas
└── components/            # Reusable UI components
```

## 🚀 Features

### ✅ Implemented & Working
- **Authentication** — JWT hybrid approach (access token in localStorage, refresh token in HttpOnly cookies)
- **Automatic Token Refresh** — Axios interceptors handle token expiry transparently
- **User Profiles** — View, edit profile, avatar upload, password change
- **Friendships** — Send/accept/reject friend requests, friend lists, sent requests
- **Real-time Messaging** — Kafka event streaming + Socket.IO delivery
- **Group Chats** — Multi-user conversations with ChatType enum (Direct/Group)
- **Typing Indicators** — Real-time typing status broadcast via Socket.IO
- **User Presence** — Online/offline status via Redis Sets, "last seen" via Redis Hashes, 10-second polling
- **Message History** — Persistent PostgreSQL storage with cursor-based pagination
- **User Search** — Search users by username/email with pagination
- **Friend Search** — Search within friend list
- **File Sharing** — Attachment uploads with preview, file type icons, size display
- **Protected Resources** — Data URL caching (5-min TTL) for avatars in SPA context
- **Containerization** — Full Docker Compose with all services (includes Kafka UI, PgAdmin)
- **Input Validation** — Zod schemas on frontend, FluentValidation on backend
- **Error Handling** — Winston logging (realtime service), Serilog (user service)
- **BFF Pattern** — Next.js API routes as proxy layer, eliminates CORS issues

### 🔄 In Progress
- **Message Read Status** — Read receipts and delivery indicators (✓✓ checkmarks)

### 📋 Planned Features
- **Push Notifications** — Browser push notifications for new messages
- **Voice/Video Calls** — WebRTC-based calling features
- **Mobile App** — React Native mobile application
- **Admin Dashboard** — User and system management interface
- **Advanced Caching** — Redis caching for message history and user data
- **Message Reactions** — Emoji reactions to messages
- **Media Gallery** — Shared photos/videos gallery per chat

## 🔧 Setup & Development

### Quick Start with Docker
```bash
# Clone the repository
git clone <repository-url>
cd quix-messenger-monorepo

# Build all containers
make build

# Start all services
make up

# View logs
docker-compose logs -f

# Stop all services
make down
```

### Services will be available at:
- **Frontend**: http://localhost:3000
- **User Service**: http://localhost:6001
- **Realtime Service**: http://localhost:8081
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Kafka**: localhost:9092
- **Kafka UI**: http://localhost:8080
- **PgAdmin**: http://localhost:5050

### Local Development (Frontend only)
```bash
cd frontend
npm install
npm run dev
```

### Development with specific services
```bash
# Start only database services
docker-compose up -d postgres redis

# Run user service locally
cd user-service
dotnet run --project UI

# Run realtime service locally  
cd realtime-service-ts
npm install
npm run build
npm run dev
```

## 🔐 Environment Variables

### Frontend Environment
The frontend expects these environment variables (via `.env` or container env):

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:8081/
NEXT_PUBLIC_USER_SERVICE_URL=http://user-service:7001/api
NEXT_PUBLIC_REALTIME_URL=http://realtime-service-ts:8080
NEXT_PUBLIC_AVATAR_HOST_PORT=6001
NEXT_PUBLIC_AVATAR_URL=http://localhost:6001/uploads/avatars/
NEXT_PUBLIC_PAGE_SIZE=20
```

### Realtime Service Environment
```env
JWT_SECRET=a-string-secret-at-least-256-bits-long
PORT=8080
USER_SERVICE_URL=http://user-service:7001
REDIS_URL=redis://redis:6379
KAFKA_BROKERS=kafka:9092
KAFKA_GROUP_ID=realtime-service-group
KAFKA_NEW_MESSAGE_TOPIC=messenger.events.newMessage
```

### User Service Configuration
The user service uses `appsettings.json` for configuration:

```json
{
  "JwtSettings": {
    "Issuer": "http://localhost:5001",
    "Key": "a-string-secret-at-least-256-bits-long",
    "AccessTokenExpirationMinutes": 15,
    "RefreshTokenExpirationDays": 7
  },
  "ConnectionStrings": {
    "PostgresSQLConnection": "Host=postgres;Port=5432;Database=appdb;Username=appuser;Password=secret"
  },
  "FileStorage": {
    "AvatarStoragePath": "/var/lib/quix-messenger/avatars",
    "MigrateDefaultAssetsOnStartup": true
  }
}
```

## 📁 File Storage & Asset Management

### Avatar Storage Configuration
The user service uses configurable file storage for user avatars:

```json
{
  "FileStorage": {
    "AvatarStoragePath": "/var/lib/quix-messenger/avatars",
    "MigrateDefaultAssetsOnStartup": true
  }
}
```

### Features
- **Configurable Storage Path**: Set custom paths for different environments
- **Default Asset Migration**: Automatically migrates default avatars on startup
- **Docker Volume Support**: Persistent storage outside containers
- **Protected File Access**: Secure avatar serving through API endpoints

### Docker Volume Setup
```yaml
services:
  user-service:
    volumes:
      - avatar-storage:/var/lib/quix-messenger/avatars
      - ./user-service/UI/wwwroot:/app/wwwroot

volumes:
  avatar-storage:
    driver: local
```

### Development Setup
For local development, configure a local path:
```json
{
  "FileStorage": {
    "AvatarStoragePath": "C:\\temp\\quix-messenger\\avatars",
    "MigrateDefaultAssetsOnStartup": true
  }
}
```

## 🧭 Request Flow Architecture

### 1. Standard API Request Flow
```
UI Component → api.* call → Next.js API Route → Zod Validation → proxy() → Backend Service
                    ↓
          Response ← JSON Response ← Stream Response ← Backend Response ← Service Logic
```

### 2. Authentication Flow
```
Login Request → BFF Route → User Service → JWT Tokens → Set-Cookie → UI State Update
                    ↓
WebSocket Connect → Socket.io → JWT Verification → User Online Status → Redis Cache
```

### 3. Real-time Message Flow (Kafka-based)
```
UI Message Send → HTTP POST → User Service → Validate & Save → PostgreSQL
                                     ↓
                              Publish to Kafka Topic
                                     ↓
                      Kafka Consumer (Realtime Service)
                                     ↓
                      Socket.IO Room Broadcast → Recipients
```

### 4. Error Handling Flow
```
Service Error → Proxy Handler → Consistent Error Format → UI Error Boundary → User Notification
       ↓
401 Error → Axios Interceptor → Token Refresh → Retry Request → Success/Login Redirect
```

## 🔧 Development Workflows

### Adding a New Feature
1. **Backend**: Add endpoint to appropriate service (User/Realtime)
2. **BFF Layer**: Create proxy route in `frontend/src/app/api/`
3. **Frontend API**: Add method to `frontend/src/app/api/index.ts`
4. **UI Hook**: Create data hook in `frontend/src/lib/hooks/data/`
5. **Components**: Build UI components with proper error handling
6. **Validation**: Add Zod schemas for type safety

### Testing Strategy
```bash
# Unit tests (when implemented)
npm run test

# Integration testing with Docker
make up
curl http://localhost:3000/api/health
curl http://localhost:8081/health

# Manual testing
open http://localhost:3000
```

## 📊 Monitoring & Debugging

### Available Endpoints
- **Health Checks**: 
  - Frontend: `http://localhost:3000/api/health`
  - Realtime: `http://localhost:8081/health`
  - User Service: `http://localhost:6001/health`

### Logging
- **Realtime Service**: Winston with daily rotation and multiple log levels
- **User Service**: Serilog with console and file outputs
- **Frontend**: Next.js built-in logging and browser dev tools

### Database Management
- **PgAdmin**: Available at `http://localhost:5050`
  - Email: `admin@admin.com`
  - Password: `admin`
- **Redis CLI**: Access via `docker-compose exec redis redis-cli`

## 📈 Performance & Scalability

### Current Architecture Benefits
- **Event-Driven Architecture**: Kafka decouples message production from delivery
- **Horizontal Scalability**: Kafka consumer groups enable multiple realtime service instances
- **Message Durability**: Kafka retains messages even if consumers are offline
- **Redis for Ephemeral Data**: Sub-millisecond O(1) operations for presence tracking
- **PostgreSQL for Persistence**: ACID compliance for critical user/message data
- **Microservices**: Independent deployment and scaling of services
- **BFF Pattern**: Single API surface for frontend, improved security boundary
- **Socket.IO Rooms**: Efficient targeted message delivery to specific chats

### Architectural Decisions & Trade-offs
- **Kafka vs Direct WebSocket**: Chose Kafka for resilience, scalability, and decoupling (9/10 worth it)
- **Redis Sets for Presence**: Chose Redis over Kafka for <1ms latency on presence checks (9/10 worth it)
- **Hybrid JWT Storage**: Access token in localStorage (Socket.IO compatibility) + refresh token in HttpOnly cookies
- **Data URL Caching**: Solves blob URL invalidation on SPA navigation, 5-min TTL (7/10 worth it)
- **10s Polling for Presence**: Simpler than Kafka-based presence, adequate for <10K users (4/10 worth switching to Kafka)
- **KRaft Kafka**: No Zookeeper dependency, simplified deployment

## 🤝 Contributing

### Development Setup
1. **Prerequisites**: Docker, Docker Compose, .NET 9 SDK, Node.js 18+
2. **Clone Repository**: `git clone <repo-url>`
3. **Start Services**: `make up`
4. **Development Mode**: Run individual services locally as needed

### Code Standards
- **TypeScript**: Strict mode enabled, proper type definitions
- **C#**: Follow .NET conventions, async/await patterns
- **React**: Functional components with hooks
- **Validation**: Zod schemas for runtime type safety
- **Error Handling**: Consistent error shapes across services

### Commit Guidelines
Follow the project's emoji-based commit convention:
- ✨ `feat`: New features
- 🐛 `fix`: Bug fixes  
- 📚 `docs`: Documentation
- ♻️ `refactor`: Code improvements
- ✅ `test`: Testing additions

## 🔒 Security Features

### Authentication & Authorization
- **Hybrid JWT Strategy**: Access tokens (localStorage, 15min expiry) + Refresh tokens (HttpOnly cookies, 7 days)
- **Automatic Token Refresh**: Axios interceptors handle expiry without user interruption
- **WebSocket Authentication**: Bearer token verification on Socket.IO handshake
- **Password Hashing**: ASP.NET Core Identity with secure hashing (PBKDF2)
- **HTTPS Ready**: Production-ready configuration for SSL/TLS

### Input Validation & Sanitization
- **Runtime Validation**: Zod schemas (frontend), FluentValidation (backend)
- **SQL Injection Protection**: EF Core parameterized queries
- **XSS Protection**: React's built-in JSX escaping
- **File Upload Security**: MIME type validation, size limits (5MB for avatars)
- **CORS Configuration**: Controlled cross-origin policies

### Data Protection  
- **Session Management**: Redis-based user sessions with TTL
- **Protected File Access**: Avatar serving through authenticated endpoints
- **Environment Secrets**: Docker secrets for production, .env for development
- **JWT Secret**: Minimum 256-bit secret key requirement
- **Rate Limiting**: Ready for implementation with Express middleware

## � Support & Community

### Getting Help
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Documentation**: Comprehensive README and inline code comments
- **Development**: Well-structured codebase with clear separation of concerns

### Roadmap Participation
The project welcomes contributions in areas like:
- Performance optimization and caching strategies
- Mobile app development (React Native)
- Advanced chat features (file sharing, voice/video)
- Admin dashboard and analytics
- DevOps and deployment improvements

---

## 📊 Project Stats

- **Architecture**: Event-driven microservices with Kafka
- **Services**: 3 main services + 5 infrastructure components
- **Primary Languages**: TypeScript (Frontend + Realtime), C# (User Service)
- **Databases**: PostgreSQL (persistence), Redis (ephemeral state)
- **Message Queue**: Apache Kafka 3.8.1 (KRaft mode, 3 partitions)
- **API Endpoints**: 25+ REST endpoints + 10+ WebSocket events
- **Frontend Pages**: 15+ responsive pages (auth, chats, friends, profile)
- **Docker Services**: 8 containers (frontend, user-service, realtime-service-ts, postgres, redis, kafka, kafka-ui, pgadmin)
- **Real-time Features**: WebSocket connections, typing indicators, presence tracking
- **Authentication**: Hybrid JWT (localStorage + HttpOnly cookies)

---

*Built with ❤️ by the Quix team*
