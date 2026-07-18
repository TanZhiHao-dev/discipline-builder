# Discipline Builder — production image for Coolify.
#
# Not using Next's "standalone" output: better-sqlite3 is a native addon and
# standalone's dependency tracing can miss/mis-copy compiled native binaries.
# Instead we build normally and ship the full production node_modules — bigger
# image, but reliable. Fine on a VPS (not size-constrained like serverless).
#
# The SQLite DB + backups live under DATA_DIR (set to /data at runtime),
# mounted as a persistent Coolify volume — NOT inside /app, so redeploys never
# touch user data.

FROM node:24-bookworm-slim AS deps
WORKDIR /app
# python3/make/g++: build tools for better-sqlite3's native addon (node-gyp).
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:24-bookworm-slim AS prod-deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATA_DIR=/data

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/drizzle ./drizzle
COPY package.json next.config.ts ./

# Where the persistent volume mounts — DB file + hourly backups live here.
RUN mkdir -p /data

EXPOSE 3000
CMD ["node_modules/.bin/next", "start", "-p", "3000"]
