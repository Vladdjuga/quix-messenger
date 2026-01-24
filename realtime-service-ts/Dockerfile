FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Install all dependencies (including dev) for building
RUN npm ci

COPY . .

# Build the TypeScript project
RUN npm run build

# Prune dev dependencies to keep the runtime image small
RUN npm prune --omit=dev

FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/app.js"]