# syntax=docker/dockerfile:1
FROM node:22-alpine AS build

ENV JOBS=4
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk add --no-cache python3 make g++ libc6-compat

RUN corepack enable pnpm
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yam[l] ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --offline

COPY . .
RUN pnpm run build

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm prune --prod --config.ignore-scripts=true

FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

EXPOSE 3000
CMD ["node", "dist/index.js"]