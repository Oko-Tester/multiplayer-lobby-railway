FROM node:18-alpine
WORKDIR /app

# Package.json + lock kopieren (lock sollte im Repo sein)
COPY package*.json ./

# Dependencies deterministisch installieren
RUN npm ci --omit=dev && npm cache clean --force

# Rest des Codes kopieren
COPY . ./

ENV PORT=3000
EXPOSE 3000

# Optional: non-root user (du hattest nodejs; du kannst auch den eingebauten 'node' nutzen)
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

CMD ["node", "index.js"]
