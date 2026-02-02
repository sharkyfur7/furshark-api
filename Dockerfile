FROM node:20-alpine
RUN apk add --no-cache python3 make g++ sqlite-dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm rebuild better-sqlite3
RUN npm prune --production
EXPOSE 3000
CMD ["npm", "start"]
