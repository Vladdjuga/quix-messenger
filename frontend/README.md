# 🧪 Messenger Frontend (Work in Progress)

🚧 This is the **Next.js** frontend for the Messenger project. It's currently in active development.

## ⚙️ Tech Stack

- [Next.js 14+ (App Router)](https://nextjs.org/)
- TypeScript
- Tailwind CSS
- React Hook Form + Zod
- Axios (for backend API)
- Zustand (state management)
- ShadCN/ui (for UI components)
- Framer Motion (animations)

## ✅ Planned Features

- [ ] Auth pages (Login, Register)
- [ ] Chat list with unread counter
- [ ] Real-time messaging via WebSocket
- [ ] Message history (pagination / infinite scroll)
- [ ] User profile
- [ ] Mobile-first responsive layout
- [ ] Dark mode toggle

## 🐳 Docker Support

You can run the Next.js frontend inside a Docker container:

### 🔨 Build & Run

```bash
docker build -t frontend .
docker run -p 3000:3000 frontend
