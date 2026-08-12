# Dev image — runs via `pnpm start:dev` with source mounted for hot reload.
# A production build would use a separate multi-stage Dockerfile (`nest build`
# + `node dist/main.js`), out of scope for local scaffolding.
FROM node:20-alpine

RUN corepack enable

WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile --filter @hms/api... 2>/dev/null || pnpm install --filter @hms/api...

COPY packages/shared packages/shared
COPY apps/api apps/api

WORKDIR /app/apps/api
EXPOSE 3000
CMD ["pnpm", "start:dev"]
