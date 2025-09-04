# 1. Build stage
FROM node:18-alpine AS builder
ENV PORT=3000

WORKDIR /app

# Устанавливаем зависимости
COPY package.json package-lock.json* ./
RUN npm install

# Копируем остальные файлы
COPY . .

# Remove .env.local to ensure we use .env for Docker environment
RUN rm -f .env.local

# Собираем проект
RUN npm run build

# 2. Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Только необходимые файлы для запуска
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Если используешь Next.js 13+ с App Router, нужно указать это:
ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]