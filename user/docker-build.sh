#!/bin/bash
# Build script for Docker with environment variables

set -e

echo "🔧 Building Docker image with environment variables..."
echo ""
echo "NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL:-https://dev.wifi.adstechnology.vn/api/v1}"
echo ""

# Load .env.production if exists
if [ -f .env.production ]; then
  export $(cat .env.production | grep -v '^#' | xargs)
fi

# Build with docker-compose
docker-compose build --no-cache

echo ""
echo "✅ Build complete!"
echo ""
echo "To start the container:"
echo "  docker-compose up -d"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
