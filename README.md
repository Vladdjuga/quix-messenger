# Quix Messenger

A modern, full-stack real-time messaging application built with **.NET 10** and **Next.js 15**. Features SignalR for WebSocket communication, MassTransit + RabbitMQ for event-driven architecture, and includes user authentication, friend management, real-time messaging, presence tracking, and file uploads.

## 🏗️ Architecture Overview

**Modular Monolith** with event-driven communication via MassTransit and RabbitMQ.

```
┌─────────────────────────────┐
│         Frontend            │
│       (Next.js 15)          │
│        Port: 3000           │
└──────────┬──────────────────┘
           │ HTTP REST API (BFF Pattern)
           │ SignalR WebSocket (/chat, /presence)
           │
           ▼
┌─────────────────────────────────────────┐
│          User Service                   │
│         (.NET 10 / C# 14)               │
│           Port: 6001                    │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │      SignalR Hubs                │   │
│  │      • ChatHub (/chat)           │   │
│  │      • PresenceHub (/presence)   │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  MassTransit Event Bus           │   │
│  │  • MessageCreatedEvent           │   │
│  │  • MessageEditedEvent            │   │
│  │  • MessageDeletedEvent           │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  REST API Controllers            │   │
│  │  • Auth, User, Chat, Message     │   │
│  └──────────────────────────────────┘   │
└──────────┬──────────────────────────────┘
           │
           ├─────────────┬───────────────┐
           ▼             ▼               ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │PostgreSQL│   │ RabbitMQ │   │  Redis   │
    │  (EF 10) │   │(MassTransit)│ │(SignalR  │
    │Port: 5432│   │Port: 5672│   │Backplane)│
    └──────────┘   └──────────┘   │Port: 6379│
                                  └──────────┘
```

## 📦 Services

### Frontend
- **Next.js 15** with App Router and React 19
- **BFF Pattern**: API routes proxy requests to user-service
- **SignalR Client** (`@microsoft/signalr`) for real-time features
- **Automatic reconnection** with exponential backoff
- **TypeScript 5**, **Tailwind CSS 4**

### User Service
- **ASP.NET Core Web API** on **.NET 10**
- **Modular Monolith** architecture with module boundaries
- **SignalR Hubs**: Real-time messaging (ChatHub) and presence tracking (PresenceHub)
- **MassTransit + RabbitMQ**: Event bus for decoupled module communication
- **Entity Framework Core 10** with PostgreSQL
- **Redis**: SignalR backplane for horizontal scaling + presence cache
- **Features**: JWT auth, friendships, chats, messages, file uploads (avatars/attachments)

## 🗄️ Infrastructure

- **PostgreSQL 16** — Primary database for users, friendships, messages, chats
- **Redis 7** — SignalR backplane + presence tracking cache
- **RabbitMQ 3.13** — Message broker for MassTransit events
- **PgAdmin 4** — Database management UI (Port: 5050)
- **Docker Compose** — Containerized deployment

## ⚙️ Tech Stack

### Backend
- **.NET 10 (LTS)** — Latest Long Term Support release
- **ASP.NET Core** — High-performance web framework
- **C# 14** — Latest language features
- **SignalR** — Real-time WebSocket communication
- **MassTransit** — Distributed application framework
- **RabbitMQ** — Reliable message broker
- **Entity Framework Core 10** — ORM
- **Redis 7** — Caching and SignalR backplane
- **PostgreSQL 16** — Relational database
- **Serilog** — Structured logging

### Frontend
- **Next.js 15** — React framework with App Router
- **React 19** — Latest React with Server Components
- **TypeScript 5** — Type-safe development
- **Tailwind CSS 4** — Utility-first CSS framework
- **@microsoft/signalr** — SignalR client library
- **Zod 3.25** — Runtime validation
- **Axios 1.11** — HTTP client

### DevOps
- **Docker & Docker Compose** — Containerization
- **Makefile** — Build automation
- **ESLint** — Code linting

## 🚀 Features

### ✅ Implemented
- **User Authentication** — JWT-based (access token + refresh token)
- **Token Refresh** — Automatic token renewal via Axios interceptors
- **User Profiles** — View, edit, avatar upload, password change
- **Friendships** — Send/accept/reject friend requests
- **Real-time Messaging** — SignalR WebSocket with event publishing
- **Group Chats** — Multi-user conversations (Direct/Group types)
- **Typing Indicators** — Real-time typing status
- **User Presence** — Online/offline tracking via PresenceHub + Redis
- **Message History** — Persistent storage with pagination
- **User/Friend Search** — Search by username/email
- **File Uploads** — Avatar and message attachment support
- **Event-Driven** — MassTransit + RabbitMQ for decoupled communication
- **Scalability** — Redis backplane for SignalR horizontal scaling

### 🔄 In Progress
- **Message Read Status** — Read receipts (✓✓)

### 📋 Planned
- **Push Notifications** — Browser notifications
- **Voice/Video Calls** — WebRTC integration
- **Mobile App** — React Native
- **Admin Dashboard** — System management
- **Message Reactions** — Emoji reactions

## 🔧 Quick Start

### Prerequisites
- **Docker** & **Docker Compose**
- **.NET 10 SDK** (for local development)
- **Node.js 18+** (for local development)

### Start All Services
```bash
# Clone repository
git clone <repository-url>
cd quix-messenger

# Build containers
make build

# Start all services
make up

# View logs
docker-compose logs -f

# Stop services
make down
```

### Services Available At
- **Frontend**: http://localhost:3000
- **User Service**: http://localhost:6001
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **RabbitMQ AMQP**: localhost:5672
- **RabbitMQ Management UI**: http://localhost:15672
- **PgAdmin**: http://localhost:5050

## 🔐 Configuration

### Frontend Environment Variables

Create `frontend/.env`:
```env
NEXT_PUBLIC_USER_SERVICE_URL=http://localhost:6001
NEXT_PUBLIC_SIGNALR_HUB_URL=http://localhost:6001
NEXT_PUBLIC_AVATAR_URL=http://localhost:6001/uploads/avatars/
NEXT_PUBLIC_PAGE_SIZE=20
```

### User Service Configuration

`user-service/UI/appsettings.json`:
```json
{
  "JwtSettings": {
    "Issuer": "http://localhost:6001",
    "Audience": "http://localhost:6001",
    "Key": "your-secret-key-at-least-256-bits-long",
    "AccessTokenExpirationMinutes": 15,
    "RefreshTokenExpirationDays": 7
  },
  "ConnectionStrings": {
    "PostgresSQLConnection": "Host=postgres;Port=5432;Database=appdb;Username=appuser;Password=secret",
    "RedisConnection": "redis:6379"
  },
  "RabbitMQ": {
    "Host": "rabbitmq",
    "Port": 5672,
    "Username": "guest",
    "Password": "guest"
  },
  "FileStorage": {
    "AvatarStoragePath": "/var/lib/quix-messenger/avatars",
    "MigrateDefaultAssetsOnStartup": true
  }
}
```

## 🏛️ Architecture Details

### Authentication Flow
```
1. User → Frontend → POST /api/auth/login
2. Frontend BFF → User Service /Auth/login
3. User Service → Validate credentials
4. User Service → Generate JWT (access + refresh tokens)
5. User Service → Set refresh token in HttpOnly cookie
6. User Service → Return access token
7. Frontend → Store access token in localStorage
8. Frontend → Connect to SignalR with Bearer token
```

### Real-time Message Flow
```
1. User sends message → HTTP POST to /api/messages
2. User Service → Validate & save to PostgreSQL
3. User Service → Publish MessageCreatedEvent to RabbitMQ (MassTransit)
4. MassTransit Consumer → Receive event
5. Consumer → Broadcast via SignalR ChatHub
6. ChatHub → Send to recipients' SignalR connections
7. Recipients → Receive real-time message
```

### SignalR Features
- **JWT Authentication**: Bearer token via `accessTokenFactory`
- **Automatic Reconnection**: Exponential backoff (2s → 30s)
- **Strongly-Typed Hubs**: `Hub<IChatClient>`, `Hub<IPresenceClient>`
- **Group Management**: Each chat = SignalR group
- **Typing Indicators**: `UserTyping` / `UserStopTyping`
- **Presence Tracking**: `UserOnline` / `UserOffline`
- **Redis Backplane**: Horizontal scaling with Redis pub/sub

### MassTransit Integration
- **Event Publisher**: `IEventPublisher` abstraction
- **Events**: `MessageCreatedEvent`, `MessageEditedEvent`, `MessageDeletedEvent`
- **Benefits**: Decoupling, at-least-once delivery, dead-letter queues
- **Future**: Add consumers for push notifications, analytics, etc.

## 🔧 Development

### Local Development (Frontend Only)
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

### Local Development (User Service Only)
```bash
# Start infrastructure
docker-compose up -d postgres redis rabbitmq

# Run user service
cd user-service
dotnet run --project UI
# Service runs on http://localhost:7001
```

### Adding a New Feature
1. **Backend**: Add endpoint/hub method to user service
2. **Events**: Define and publish events via MassTransit (if needed)
3. **BFF**: Add proxy route in `frontend/src/app/api/`
4. **Frontend**: Create hook in `frontend/src/lib/hooks/data/`
5. **UI**: Build components with proper error handling
6. **Validation**: Add Zod schemas (frontend) and FluentValidation (backend)

## 📊 Monitoring

### Health Checks
- **Frontend**: http://localhost:3000/api/health
- **User Service**: http://localhost:6001/health (if implemented)

### Logging
- **User Service**: Serilog structured logging (console + file)
- **Frontend**: Next.js logging + browser console

### Database Management
- **PgAdmin**: http://localhost:5050
  - Email: `admin@admin.com`
  - Password: `admin`
- **Redis CLI**: `docker-compose exec redis redis-cli`
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

## 📈 Performance & Scalability

### Architecture Benefits
- **Event-Driven**: MassTransit + RabbitMQ decouple message production from delivery
- **Horizontal Scaling**: Redis backplane enables multiple SignalR instances
- **Message Reliability**: RabbitMQ provides at-least-once delivery with dead-letter queues
- **Redis Caching**: Sub-millisecond latency for presence tracking
- **PostgreSQL**: ACID compliance for critical data
- **Modular Monolith**: Easy to deploy, can split into microservices later
- **BFF Pattern**: Single API surface, improved security

### Design Decisions
- **MassTransit over direct SignalR**: Reliable event delivery, retry logic, DLQ
- **Redis Backplane**: Necessary for SignalR horizontal scaling
- **Hybrid JWT**: Access token (localStorage) for SignalR compatibility, refresh token (HttpOnly) for security
- **Modular Monolith**: Simpler deployment vs microservices, module boundaries enforced

## 🔒 Security

### Authentication & Authorization
- **JWT Strategy**: Access token (15min) + Refresh token (7 days, HttpOnly cookie)
- **Token Refresh**: Automatic via Axios interceptors
- **SignalR Auth**: Bearer token verification on connection
- **Password Hashing**: ASP.NET Core Identity (PBKDF2)

### Input Validation
- **Frontend**: Zod schemas for runtime validation
- **Backend**: FluentValidation for request validation
- **SQL Injection**: EF Core parameterized queries
- **XSS**: React JSX escaping
- **File Uploads**: MIME type validation, size limits

### Data Protection
- **HTTPS**: Production-ready SSL/TLS configuration
- **CORS**: Controlled cross-origin policies
- **Environment Secrets**: Docker secrets (prod), .env (dev)

## 🤝 Contributing

### Development Setup
1. Install: Docker, Docker Compose, .NET 10 SDK, Node.js 18+
2. Clone repository
3. Run `make up`
4. Develop locally as needed

### Code Standards
- **TypeScript**: Strict mode, proper types
- **C#**: Async/await, SOLID principles
- **React**: Functional components with hooks
- **Validation**: Zod (frontend), FluentValidation (backend)

### Commit Convention
- ✨ `feat`: New features
- 🐛 `fix`: Bug fixes
- 📚 `docs`: Documentation
- ♻️ `refactor`: Code improvements
- ✅ `test`: Tests

## 📊 Project Stats

- **Architecture**: Modular Monolith with Event-Driven Communication
- **Languages**: C# 14 (.NET 10), TypeScript (Next.js 15)
- **Databases**: PostgreSQL, Redis
- **Message Broker**: RabbitMQ (MassTransit)
- **Real-time**: SignalR (WebSockets)
- **Containers**: frontend, user-service, postgres, redis, rabbitmq, pgadmin

---

*Built with ❤️ using .NET 10 and Next.js 15*
