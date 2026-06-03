FROM node:20-alpine
 
WORKDIR /usr/src/app
 
RUN corepack enable && corepack prepare pnpm@latest --activate
 
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
 
COPY workspaces/packages/engine/package.json workspaces/packages/engine/package.json
COPY workspaces/packages/server/package.json workspaces/packages/server/package.json
 
RUN pnpm install --frozen-lockfile
 
COPY workspaces/packages/engine/src        workspaces/packages/engine/src
COPY workspaces/packages/engine/tsconfig.json workspaces/packages/engine/tsconfig.json
COPY workspaces/packages/server/src        workspaces/packages/server/src
COPY workspaces/packages/server/tsconfig.json workspaces/packages/server/tsconfig.json
 
WORKDIR /usr/src/app/workspaces/packages/server
 
CMD ["pnpm", "dev"]
 
