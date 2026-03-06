# ---------- Builder ----------
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

# ---------- Production ----------
FROM node:20-alpine AS runner

WORKDIR /app

RUN corepack enable

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app ./


CMD ["pnpm", "start"]