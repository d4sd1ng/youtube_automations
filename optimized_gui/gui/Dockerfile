# Multi-stage build für optimale Performance
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (Vite hat keine ajv-Konflikte)
RUN npm ci --silent

# Copy source code
COPY . .

# Build with Vite (viel schneller als React Scripts)
RUN npm run build

# Production stage mit optimiertem nginx
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configurations
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx-custom.conf /etc/nginx/nginx.conf

# Security: Run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    mkdir -p /var/cache/nginx && \
    chown -R nextjs:nodejs /var/cache/nginx && \
    mkdir -p /tmp/nginx && \
    chown -R nextjs:nodejs /tmp/nginx && \
    touch /var/run/nginx.pid && \
    chown nextjs:nodejs /var/run/nginx.pid

# Switch to non-root user
USER nextjs

EXPOSE 80

# Start nginx in foreground without daemon mode
CMD ["nginx", "-g", "daemon off;"]