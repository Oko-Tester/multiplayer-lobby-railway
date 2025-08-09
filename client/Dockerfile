FROM nginx:alpine

# Nginx Konfiguration
COPY . /etc/nginx/nginx.conf

# Static files kopieren
COPY . /usr/share/nginx/html/

# Port freigeben
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]