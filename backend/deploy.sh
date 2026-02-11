#!/bin/bash

echo "🚀 Deploying Pixematch Backend..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Pull latest code (if using git)
echo -e "${YELLOW}📥 Pulling latest code...${NC}"
git pull origin main || echo "Not a git repository, skipping pull"

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install --production

# Create logs directory if it doesn't exist
mkdir -p logs

# Restart PM2
echo -e "${YELLOW}🔄 Restarting application...${NC}"
pm2 restart ecosystem.config.js

# Save PM2 configuration
pm2 save

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "📊 Application Status:"
pm2 status

echo ""
echo "📝 View logs with: pm2 logs pixematch-backend"
echo "🔍 Monitor with: pm2 monit"
