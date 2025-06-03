FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run build

FROM node:20-alpine AS server

WORKDIR /app

COPY --from=builder /app/package*.json .

COPY --from=builder /app/build ./build

ENV NODE_ENV=production

RUN npm ci --omit=dev

RUN npm i --omit=dev -g .

# Expose the port (only useful for remote mode)
EXPOSE 3001

# Start the MCP server (by default using stdio)
CMD ["iexec-mcp"]
