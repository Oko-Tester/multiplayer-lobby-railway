#!/bin/sh

cat > /usr/share/nginx/html/env.js << EOF
window._env_ = {
  SERVER_URL: "${SERVER_URL:+https://$SERVER_URL}",
};
EOF

echo "Generated env.js with Railway variables:"
cat /usr/share/nginx/html/env.js

nginx -g "daemon off;"