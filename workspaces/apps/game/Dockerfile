FROM node:20-alpine AS build

WORKDIR /usr/src/app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

COPY workspaces/packages/engine/package.json workspaces/packages/engine/package.json
COPY workspaces/apps/game/package.json       workspaces/apps/game/package.json

RUN pnpm install --frozen-lockfile

# engine (dépendance buildée du front)
COPY workspaces/packages/engine/src            workspaces/packages/engine/src
COPY workspaces/packages/engine/tsconfig.json  workspaces/packages/engine/tsconfig.json
COPY workspaces/packages/engine/tsup.config.ts workspaces/packages/engine/tsup.config.ts
RUN pnpm --filter @reflexer/engine build

# front (vite lit .env.production automatiquement en mode build)
COPY workspaces/apps/game workspaces/apps/game
RUN pnpm --filter game build

# ---- runtime ----
FROM nginx:alpine

COPY workspaces/apps/game/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/workspaces/apps/game/dist /usr/share/nginx/html

EXPOSE 80
