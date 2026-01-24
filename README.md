# Quix Messenger (Monorepo)

A modern, full-stack real-time messaging application built with .NET Core and Next.js. Features SignalR for WebSocket communication, MassTransit + RabbitMQ for event-driven architecture, and includes user authentication, friend management, real-time messaging, presence tracking, and file uploads.

## 🏗️ Architecture Overview

### Services Architecture
```
┌─────────────────┐
│     Frontend    │
│   (Next.js 15)  │
│   Port: 3000    │
└────────┬────────┘
         │ HTTP REST API (BFF Pattern)
         │ SignalR WebSocket (/chat, /presence)
         │
         ▼
┌─────────────────────────────┐
│      User Service           │
│     (.NET Core 10)          │
│      Port: 6001             │
│                             │
│  ┌──────────────────────┐   │
│  │   SignalR Hubs       │   │
│  │   • ChatHub          │   │
│  │   • PresenceHub      │   │
│  └──────────────────────┘   │
│                             │
│  ┌──────────────────────┐   │
│  │   MassTransit +      │   │
│  │   RabbitMQ Events    │   │
│  └──────────────────────┘   │
└──────────┬──────────────────┘
           │
           ├──────────────┬────────────┐
           ▼              ▼            ▼
    ┌─────────────┐ ┌──────────┐ ┌──────────┐
    │ PostgreSQL  │ │ RabbitMQ │ │  Redis   │
    │(Persistence)│ │ (Events) │ │(SignalR) │
    │ Port: 5432  │ │Port: 5672│ │Port: 6379│
    └─────────────┘ └──────────┘ └──────────┘
```

### 📦 Services (in this repo)
- **`frontend`** — Next.js 15 app with BFF pattern (TypeScript, React 19, Tailwind CSS 4)
  - Client-side React application with Server Components
  - API routes acting as BFF proxy layer
  - SignalR client (`@microsoft/signalr`) for real-time features
  - Automatic reconnection with exponential backoff
- **`user-service`** — ASP.NET Core 10 monolithic service
  - **REST API**: Authentication, profiles, friendships, messages, chats
  - **SignalR Hubs**: Real-time messaging (ChatHub) and presence tracking (PresenceHub)
  - **Event-Driven**: MassTransit + RabbitMQ for internal event broadcasting
  - **Persistence**: PostgreSQL with Entity Framework Core 10
  - **Features**: JWT auth, message attachments, avatar uploads, friend requests

### 🗄️ Infrastructure
- **PostgreSQL 16** — Primary database for users, friendships, messages, chats
- **Redis 7** — SignalR backplane for scaling across multiple instances
- **RabbitMQ 3.13** — Event bus for MassTransit (MessageCreated, MessageEdited, MessageDeleted)
- **PgAdmin 4** — Database management UI (Port: 5050)
- **File System** — Avatar and message attachment storage with Docker volumes

## ⚙️ Tech Stack

### Backend Services
- **ASP.NET Core 10** — User service with SignalR hubs and REST API
- **Entity Framework Core 10** — ORM with PostgreSQL provider
- **SignalR Core** — Real-time WebSocket communication (ChatHub, PresenceHub)
- **MassTransit 8.3.4** — Event-driven architecture with RabbitMQ
- **PostgreSQL 16** — Primary database for persistent data
- **Redis 7** — SignalR backplane for distributed deployments
- **RabbitMQ 3.13** — Message broker for event streaming

### Frontend
- **Next.js 15** — React-based frontend with App Router
- **React 19** — Latest React with modern hooks and features
- **Tailwind CSS 4** — Utility-first CSS framework
- **TypeScript 5** — Type-safe development
- **@microsoft/signalr** — SignalR client for real-time WebSocket communication
- **Zod 3.25** — Runtime type validation
- **Axios 1.11** — HTTP client with interceptors

### Development & Deployment
- **Docker & Docker Compose** — Containerized deployment
- **ESLint & TypeScript** — Code quality and type checking
- **Makefile** — Build automation

## 🧠 Frontend Architecture (BFF Pattern)

The frontend implements a Backend-For-Frontend (BFF) pattern using Next.js API routes:

### API Proxy Layer
- **Route Structure**: API routes under `frontend/src/app/api/**` proxy to user-service
- **Unified Proxy**: Single helper `src/lib/proxy.ts` handles all backend communication
- **Examples**: 
  - `/api/chats` → `USER_SERVICE_URL/Chat/getChats`
  - `/api/messages` → `USER_SERVICE_URL/Message/send`
  - `/api/auth/login` → `USER_SERVICE_URL/Auth/login`
- **SignalR Direct**: Frontend connects directly to `USER_SERVICE_URL/chat` and `USER_SERVICE_URL/presence`

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

#### Message Flow (SignalR + MassTransit)
```mermaid
sequenceDiagram
    participant U1 as User 1 (Sender)
    participant Hub as SignalR ChatHub
    participant MediatR as MediatR Handler
    participant DB as PostgreSQL
    participant MT as MassTransit
    participant RMQ as RabbitMQ
    participant U2 as User 2 (Recipient)
    
    U1->>Hub: Connected to /chat
    U1->>MediatR: POST /Message/send
    MediatR->>DB: Save Message
    MediatR->>MT: Publish MessageCreatedEvent
    MT->>RMQ: Send to exchange
    RMQ->>MT: Consume event
    MT->>Hub: Broadcast via IChatClient
    Hub->>U2: NewMessage(payload)
    U2->>UI: Display new message
```

#### SignalR Features
- **JWT Authentication**: Bearer token via `accessTokenFactory`
- **Automatic Reconnection**: Exponential backoff (2s → 30s)
- **Strongly-Typed Hubs**: `Hub<IChatClient>`, `Hub<IPresenceClient>`
- **Group-based Broadcasting**: Each chat has a SignalR group
- **Typing Indicators**: `UserTyping`/`UserStopTyping` methods
- **Presence Tracking**: Real-time `UserOnline`/`UserOffline` events via PresenceHub
- **Redis Backplane**: Scales across multiple instances with Redis pub/sub

#### MassTransit + RabbitMQ Integration
- **Event Publishing**: `IEventPublisher` abstraction for domain events
- **Events**: `MessageCreatedEvent`, `MessageEditedEvent`, `MessageDeletedEvent`
- **Future Consumers**: Can add consumers to trigger push notifications, analytics, etc.
- **Benefits**: Decoupling, reliability, at-least-once delivery, dead-letter queues

### Key Frontend Paths
```
src/
├── app/
│   ├── api/**              # BFF API routes (proxy layer)
│   ├── (protected)/        # Authenticated pages
│   └── globals.css         # Global styles
├── lib/
│   ├── signalr/           # SignalR connection management
│   │   ├── chatConnection.ts
│   │   ├── chatUseCases.ts
│   │   ├── presenceConnection.ts
│   │   └── presenceUseCases.ts
│   ├── contexts/          # React contexts
│   │   ├── SocketContext.tsx (ChatContext)
│   │   └── PresenceContext.tsx
│   ├── hooks/data/        # Data fetching hooks
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
- **Real-time Messaging** — SignalR WebSocket with MassTransit event publishing
- **Group Chats** — Multi-user conversations with ChatType enum (Direct/Group)
- **Typing Indicators** — Real-time typing status via SignalR ChatHub
- **User Presence** — Real-time online/offline tracking via SignalR PresenceHub with Redis backplane
- **Message History** — Persistent PostgreSQL storage with cursor-based pagination
- **User Search** — Search users by username/email with pagination
- **Friend Search** — Search within friend list
- **File Sharing** — Attachment uploads with preview, file type icons, size display
- **Protected Resources** — Data URL caching (5-min TTL) for avatars in SPA context
- **Containerization** — Full Docker Compose with PostgreSQL, RabbitMQ, Redis, PgAdmin
- **Input Validation** — Zod schemas on frontend, FluentValidation on backend
- **Error Handling** — Serilog structured logging, Result pattern for service responses
- **BFF Pattern** — Next.js API routes as proxy layer for REST, direct SignalR connection for WebSocket
- **Scalability** — Redis backplane for SignalR, RabbitMQ for event-driven architecture

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
