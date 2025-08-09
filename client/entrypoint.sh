#!/bin/sh

cat > /usr/share/nginx/html/env.js << EOF
window._env_ = {
  MULTIPLAYER_SERVER: "${MULTIPLAYER_SERVER:+https://$MULTIPLAYER_SERVER}",
};
EOF

echo "Generated env.js with Railway variables:"
cat /usr/share/nginx/html/env.js

nginx -g "daemon off;"