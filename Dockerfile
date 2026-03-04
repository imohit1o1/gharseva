# Builder stage
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .


# Runner stage
FROM node:20-alpine AS runner

WORKDIR /app

RUN corepack enable

COPY --from=builder /app /app
ENV NODE_ENV=production
EXPOSE 8000

CMD ["pnpm", "start"]