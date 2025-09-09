# Quix Messenger - Clean Frontend

A clean, simple, and maintainable frontend for the Quix Messenger application built with Next.js.

## 🎯 Goals

- **Simple & Readable**: Easy to understand code structure
- **No Over-Engineering**: Minimal abstractions, maximum clarity
- **Type Safe**: Full TypeScript support
- **Modern**: Latest React patterns and hooks
- **Fast**: Optimized for performance

## 🏗️ Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # Simple API routes
│   ├── chat/              # Chat page
│   ├── login/             # Auth pages
│   └── page.tsx           # Home page
├── components/            # Reusable React components
│   ├── chat/              # Chat-specific components
│   └── providers/         # Context providers
├── hooks/                 # Custom React hooks
├── services/              # API service functions
├── stores/                # Zustand state stores
└── types/                 # TypeScript type definitions
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Real-time**: Socket.io Client
- **HTTP Client**: Native fetch API

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your service URLs
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**: Visit [http://localhost:3000](http://localhost:3000)

## 🔑 Key Principles

### Simple API Patterns
```typescript
// ✅ Simple function-based API calls
export async function login(credentials: LoginData) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  return response.json();
}

// ❌ No complex class hierarchies
```

### Clean State Management
```typescript
// ✅ Simple Zustand stores
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

// ❌ No complex reducers or boilerplate
```

### Component Simplicity
- Components do one thing well
- Props are clearly typed
- Minimal abstractions
- Easy to test and modify

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌟 Features

- ✅ Clean authentication flow
- ✅ Real-time messaging
- ✅ Simple chat interface
- ✅ Type-safe throughout
- ✅ Responsive design
- ✅ Easy to extend

## 🔗 Integration

This frontend integrates with:
- **User Service** (C#): Authentication and user management
- **Message Service** (C#): Message storage and retrieval
- **Realtime Service** (Node.js): Socket.io for real-time features

## 📝 Notes

This is a **clean rewrite** of the original frontend, focusing on:
- Removing unnecessary abstractions
- Using simple, direct patterns
- Making the code easy to read and maintain
- Following modern React best practices

The architecture is intentionally simple and can be easily extended as needed.
