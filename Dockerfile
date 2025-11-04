FROM node:22-alpine AS base

ARG BUILD_ENV=local
ENV BUILD_ENV=$BUILD_ENV
# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1
RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build:$BUILD_ENV; \
  elif [ -f package-lock.json ]; then npm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_SHARP_PATH=/app/node_modules/sharp
ENV AUTH_SECRET=secret
# ENV NEXT_APP_API_URL=http://localhost:8013/api/v1
ENV NEXT_APP_API_URL=http://localhost:8013/api/v1
# ENV NEXTAUTH_URL=https://ordenes.fcbravos.com/
ENV NEXTAUTH_URL=http://localhost:3013/
ENV AUTH_TRUSTED_HOST=true
# ENV NEXTAUTH_URL_INTERNAL=https://ordenes.fcbravos.com/
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs-scape

# COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next && \
  chown nextjs-scape:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs-scape.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs-scape:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs-scape:nodejs /app/.next/static ./.next/static

USER nextjs-scape

EXPOSE 3013

ENV PORT=3013

# server.js is created by next build from the standalone output
# https://nextjs-scape.org/docs/pages/api-reference/next-config-js/output
CMD HOSTNAME="0.0.0.0" node server.js
