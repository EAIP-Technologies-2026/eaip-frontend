FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/enterprise-console/package.json ./apps/enterprise-console/
COPY apps/workspace/package.json ./apps/workspace/
COPY apps/administration/package.json ./apps/administration/
COPY apps/mission-control/package.json ./apps/mission-control/
COPY apps/mobile/package.json ./apps/mobile/
COPY packages/*/package.json ./packages/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-lock.yaml ./
COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder /app/apps/enterprise-console/.next ./apps/enterprise-console/.next
COPY --from=builder /app/apps/enterprise-console/public ./apps/enterprise-console/public
COPY --from=builder /app/apps/enterprise-console/package.json ./apps/enterprise-console/
COPY --from=builder /app/apps/workspace/.next ./apps/workspace/.next
COPY --from=builder /app/apps/workspace/public ./apps/workspace/public
COPY --from=builder /app/apps/workspace/package.json ./apps/workspace/
COPY --from=builder /app/apps/administration/.next ./apps/administration/.next
COPY --from=builder /app/apps/administration/public ./apps/administration/public
COPY --from=builder /app/apps/administration/package.json ./apps/administration/
COPY --from=builder /app/apps/mission-control/.next ./apps/mission-control/.next
COPY --from=builder /app/apps/mission-control/public ./apps/mission-control/public
COPY --from=builder /app/apps/mission-control/package.json ./apps/mission-control/
COPY --from=builder /app/apps/mobile/.next ./apps/mobile/.next
COPY --from=builder /app/apps/mobile/public ./apps/mobile/public
COPY --from=builder /app/apps/mobile/package.json ./apps/mobile/
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["pnpm", "--filter", "enterprise-console", "start"]
