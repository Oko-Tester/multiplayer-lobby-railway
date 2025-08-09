FROM node:18-alpine

WORKDIR /app

COPY server/package*.json ./

RUN npm ci --only=production

COPY server/ ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

USER node

CMD ["node", "index.js"]