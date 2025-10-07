#!/bin/bash

# Build optimization script for Docker Compose
set -e

echo "🚀 Starting optimized Docker build..."

# Clean up old images and containers
echo "🧹 Cleaning up old Docker resources..."
docker-compose down --remove-orphans || true
docker system prune -f

# Build with build cache
echo "🔨 Building services with cache..."
docker-compose build --parallel --no-cache=false

# Start services
echo "▶️ Starting services..."
docker-compose up -d

echo "✅ Build completed! Services are starting up..."
echo "📊 Check service status with: docker-compose ps"
echo "📝 View logs with: docker-compose logs -f"
