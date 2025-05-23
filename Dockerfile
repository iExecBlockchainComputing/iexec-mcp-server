FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

# Expose the port (only useful for remote mode)
EXPOSE 3001

ENV NODE_ENV=production

# Start the MCP server (by default using stdio)
CMD ["node", "build/index.js"]
