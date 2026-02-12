#!/bin/bash

# CloudFlare Tunnel Setup Script
# Run this ON your EC2 instance

echo "☁️  Setting up CloudFlare Tunnel for Pixematch Backend..."

# Install cloudflared
echo "📦 Installing cloudflared..."
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
rm cloudflared-linux-amd64.deb

echo "✅ Cloudflared installed!"
echo ""
echo "🚀 Starting Quick Tunnel..."
echo ""
echo "⚠️  IMPORTANT: Copy the URL that appears below!"
echo "   It will look like: https://random-name-1234.trycloudflare.com"
echo ""
echo "   Use that URL in Vercel environment variable:"
echo "   VITE_BACKEND_URL=https://your-tunnel-url.trycloudflare.com"
echo ""
echo "Press Ctrl+C to stop the tunnel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start tunnel
cloudflared tunnel --url http://localhost:3001
