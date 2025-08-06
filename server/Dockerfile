FROM node:18-alpine
WORKDIR /app

env PATH /app/node_modules/.bin:$PATH
COPY server/package.json server/package-lock.json* ./
RUN npm install --production

COPY server/index.js ./

env PORT 3000
EXPOSE 3000

CMD ["node","index.js"]