FROM node:18-alpine

WORKDIR /app

# Package.json kopieren
COPY package*.json ./

# Dependencies installieren
RUN npm ci --only=production && npm cache clean --force

# Server-Code kopieren
COPY . ./

# Port setzen
ENV PORT=3000
EXPOSE 3000

# Non-root user für Sicherheit
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Ownership der App-Dateien ändern
RUN chown -R nodejs:nodejs /app

USER nodejs

CMD ["node", "index.js"]