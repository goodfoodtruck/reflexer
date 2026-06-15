FROM node:20-alpine
 
WORKDIR /usr/src/app
 
RUN corepack enable && corepack prepare pnpm@latest --activate
 
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
 
COPY workspaces/packages/engine/package.json workspaces/packages/engine/package.json
COPY workspaces/apis/server/package.json workspaces/apis/server/package.json
 
RUN pnpm install --frozen-lockfile
 
COPY workspaces/packages/engine/src        workspaces/packages/engine/src
COPY workspaces/packages/engine/tsconfig.json workspaces/packages/engine/tsconfig.json
COPY workspaces/packages/engine/tsup.config.ts workspaces/packages/engine/tsup.config.ts

RUN pnpm --filter @reflexer/engine build

COPY workspaces/apis/server/src        workspaces/apis/server/src
COPY workspaces/apis/server/tsconfig.json workspaces/apis/server/tsconfig.json

WORKDIR /usr/src/app/workspaces/apis/server
 
CMD ["pnpm", "dev"]
 
