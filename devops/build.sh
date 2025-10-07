#!/bin/bash

# Build optimization script for Docker Compose
set -e

echo "🚀 Starting optimized Docker build..."

# Clean up old images and containers
echo "🧹 Cleaning up old Docker resources..."
docker-compose down --remove-orphans || true

# Remove specific images to force rebuild
echo "🗑️ Removing old images..."
docker rmi $(docker images "neoconcept*" -q) 2>/dev/null || true
docker rmi $(docker images "*frontend*" -q) 2>/dev/null || true
docker rmi $(docker images "*backend*" -q) 2>/dev/null || true

# Build without cache to ensure clean build
echo "🔨 Building services (clean build)..."
docker-compose build --parallel --no-cache

# Start services
echo "▶️ Starting services..."
docker-compose up -d

echo "✅ Build completed! Services are starting up..."
echo "📊 Check service status with: docker-compose ps"
echo "📝 View logs with: docker-compose logs -f"
