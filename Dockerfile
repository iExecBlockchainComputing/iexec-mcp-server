FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json ./
COPY src ./src

RUN npm ci

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules

ENTRYPOINT ["node", "build/index.js"]
