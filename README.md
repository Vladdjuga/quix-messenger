# Quix Messenger (Monorepo)

End-to-end messenger with a Next.js frontend, a real-time service (WebSocket), and a .NET user service. The frontend uses a lightweight BFF pattern (Next API routes) to proxy calls to backend services and centralize auth, validation, and error handling.

## 📦 Services (in this repo)
- `frontend` — Next.js 15 app (TypeScript, Tailwind CSS)
- `realtime-service-ts` — WebSocket gateway (TypeScript/Express, socket.io)
- `user-service` — ASP.NET Core service for auth, profiles, friendships (PostgreSQL/EF Core)

> Note: A separate message persistence service may be introduced later. The real-time service currently mediates message flow.

## ⚙️ Tech Stack
- ASP.NET Core 9, EF Core, PostgreSQL
- Node.js/Express (TypeScript), socket.io
- Next.js 15, React 19, Tailwind CSS 4
- WebSocket (client real-time)

## 🧠 Frontend Architecture (BFF)

The frontend acts as a thin Backend-For-Frontend (BFF):

- API Proxy: Next API routes under `frontend/src/app/api/**` forward to backend services via a single helper `src/lib/proxy.ts`.
  - Example: `/api/chats` → `USER_SERVICE_URL/Chat/getChats`
  - Example: `/api/online/[userId]` → `REALTIME_URL/online/:userId`
- Validation: Each route validates query/body with `zod` and returns a consistent error shape `{ message, details? }`.
- Auth: Client uses `axios` (`src/app/api/http.ts`) with an interceptor that:
  - Attaches `Authorization: Bearer <token>` when present
  - Auto-refreshes tokens via `/api/auth/refresh` on 401 (see `refreshTokenUseCase.ts`)
  - Redirects to `/login` if refresh fails
- Data mapping: UI consumes `api.*` from `src/app/api/index.ts`; DTOs from backend are mapped to domain types with small mappers in `src/lib/mappers/*` when needed.
- Real-time: `socket.io-client` is initialized in `src/lib/socket/socket.ts` with token-based auth. High-level socket actions live in `src/lib/realtime/chatSocketUseCases.ts`.

### Key Frontend Paths
- `src/app/api/**` — Next.js API routes (BFF)
- `src/lib/proxy.ts` — Unified proxy helper for BFF routes
- `src/app/api/http.ts` — Axios instance + interceptors
- `src/app/api/index.ts` — Client-facing API surface for the UI
- `src/lib/realtime/chatSocketUseCases.ts` — Socket workflows (join/leave/send/listen)
- `src/lib/mappers/*` — Map backend DTOs → UI domain types
- `src/lib/types/*` — Domain types and enums for the UI

## 🔧 Setup

### With Docker
```bash
make build   # Build all containers
make up      # Start docker compose
make down    # Stop all services
```

### Local Dev (Frontend only)
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Environment Variables

Frontend expects these (e.g., via `.env.local` or container env):

- `NEXT_PUBLIC_USER_SERVICE_URL` — Base URL of the user-service (used by BFF proxy)
- `NEXT_PUBLIC_REALTIME_URL` — Base URL of the realtime-service (used by BFF proxy and socket.io)

The BFF forwards `Authorization` headers to backend services when present and uses `Set-Cookie` from backend auth endpoints where applicable.

## 📁 File Storage Configuration

The user-service uses configurable storage for user avatars. Configuration is done via the `FileStorage` section in `appsettings.json`:

```json
{
  "FileStorage": {
    "AvatarStoragePath": "/var/lib/quix-messenger/avatars",
    "MigrateDefaultAssetsOnStartup": true
  }
}
```

### Default Avatar Migration

The service automatically migrates default assets (like `default-avatar.jpg`) from the application's `wwwroot` directory to the configured storage location on startup. This ensures that default avatars are available even when using external storage volumes.

- **`MigrateDefaultAssetsOnStartup`**: Controls whether default assets are automatically copied to the storage location during application startup
- The migration only runs if the default avatar doesn't already exist in the target location
- The original file in `wwwroot/uploads/avatars/default-avatar.jpg` is copied to `{AvatarStoragePath}/default-avatar.jpg`

### Docker Volume Setup

The avatar storage is configured as a Docker volume to persist files outside the container:

```yaml
services:
  user-service:
    volumes:
      - avatar-storage:/var/lib/quix-messenger/avatars

volumes:
  avatar-storage:
    driver: local
```

For development, you can use a local path:
```json
{
  "FileStorage": {
    "AvatarStoragePath": "C:\\temp\\quix-messenger\\avatars",
    "MigrateDefaultAssetsOnStartup": true
  }
}
```

## 🧭 Request Flow Summary
1) UI calls `api.*` (axios → Next API route)
2) Next API route validates input with zod and proxies via `proxy.ts`
3) Backend responds; route streams response back to UI with a consistent content-type
4) On 401, axios interceptor triggers `/api/auth/refresh` and retries once
5) For real-time events, UI uses socket.io with the current access token

## ✅ Status & Roadmap
- [x] Auth (login/logout/refresh)
- [x] Friendships (requests, accepts, lists)
- [x] WebSocket real-time messaging
- [x] BFF Proxy + Validation (zod)
- [x] Containerization
- [x] Avatar uploading with configurable storage
- [ ] File/image uploading (other types)
- [ ] Calls (voice/video)
- [ ] Caching and performance tuning

## 🖼️ Diagram
<p align="center">
  <img src="https://github.com/user-attachments/assets/d7510037-0e1a-4b47-9570-60c7ea91e057" width="520"/>
  <br/>
  <em>High-level overview. Frontend uses a BFF layer to talk to backend services.</em>
  
</p>
