FROM node:20-alpine AS build
RUN apk add --no-cache python3 make g++ sqlite-dev
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build
RUN pnpm rebuild better-sqlite3
RUN pnpm prune --production

FROM node:20-alpine
RUN npm install -g pnpm
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
EXPOSE 3000
CMD ["pnpm", "start"]
