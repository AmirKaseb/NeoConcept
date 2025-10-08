# Use a more specific base image for better caching
FROM node:20-alpine AS base
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies with frozen lockfile for consistency
RUN npm ci --frozen-lockfile

# Copy source code
COPY . .

# Build the application with optimizations
RUN npm run build

# Debug: Check what's in the out folder
RUN ls -la /app/out/
RUN ls -la /app/out/ || echo "out folder not found"

# Production stage with nginx
FROM nginx:alpine AS production
WORKDIR /app

# Copy public assets (images) first
COPY --from=base /app/public /usr/share/nginx/html

# Copy built application (this will merge with public folder)
COPY --from=base /app/out/* /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Create non-root user for security
RUN adduser -S nextjs -u 1001 -G nginx

# Change ownership of nginx directories
RUN chown -R nextjs:nginx /usr/share/nginx/html && \
    chown -R nextjs:nginx /var/cache/nginx && \
    chown -R nextjs:nginx /var/log/nginx && \
    chown -R nextjs:nginx /etc/nginx/conf.d

# Create nginx pid directory and set permissions
RUN mkdir -p /var/run/nginx && \
    chown -R nextjs:nginx /var/run/nginx

# USER nextjs - commented out to allow nginx to run as root

EXPOSE 80

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
