FROM node:18-alpine

WORKDIR /app

# Zuerst package.json kopieren für besseres Caching
COPY /package*.json ./

# Dependencies installieren
RUN npm ci --only=production && npm cache clean --force

# Quellcode kopieren
COPY / ./

# Port freigeben
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "
const http = require('http');
const options = { hostname: 'localhost', port: 3000, path: '/health', timeout: 5000 };
const req = http.request(options, (res) => { 
if (res.statusCode === 200) process.exit(0); 
else process.exit(1); 
});
req.on('error', () => process.exit(1));
req.end();
"

# Nicht-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

CMD ["node", "index.js"]