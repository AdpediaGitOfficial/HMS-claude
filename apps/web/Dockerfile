# Dev image — runs the Vite dev server with source mounted for hot reload.
FROM node:20-alpine

RUN corepack enable

WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile --filter @hms/web... 2>/dev/null || pnpm install --filter @hms/web...

COPY packages/shared packages/shared
COPY apps/web apps/web

WORKDIR /app/apps/web
EXPOSE 5173
CMD ["pnpm", "dev", "--host"]
