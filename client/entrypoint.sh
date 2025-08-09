#!/bin/sh

cat > /usr/share/nginx/html/env.js << EOF
window._env_ = {
  SERVER_URL: "${SERVER_URL:+https://$SERVER_URL}",
  SERVER_PRIVATE_DOMAIN: "${RAILWAY_PRIVATE_DOMAIN:-}",
  RAILWAY_ENVIRONMENT: "${RAILWAY_ENVIRONMENT:-production}",
  RAILWAY_PROJECT_NAME: "${RAILWAY_PROJECT_NAME:-}",
  RAILWAY_SERVICE_NAME: "${RAILWAY_SERVICE_NAME:-}",
  NODE_ENV: "${NODE_ENV:-production}"
};
EOF

echo "Generated env.js with Railway variables:"
cat /usr/share/nginx/html/env.js

nginx -g "daemon off;"