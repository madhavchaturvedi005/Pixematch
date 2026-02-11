#!/bin/bash

# Quick script to update backend on AWS EC2
# Run this from your LOCAL machine

echo "🚀 Updating Pixematch Backend on AWS..."

EC2_IP="13.62.56.87"
KEY_FILE="$1"  # Pass your .pem file as first argument

if [ -z "$KEY_FILE" ]; then
    echo "❌ Error: Please provide your .pem key file"
    echo "Usage: ./UPDATE_BACKEND.sh /path/to/your-key.pem"
    exit 1
fi

echo "📤 Uploading updated backend files..."
scp -i "$KEY_FILE" backend/index.js ubuntu@$EC2_IP:~/pixematch-backend/

echo "🔄 Restarting backend service..."
ssh -i "$KEY_FILE" ubuntu@$EC2_IP << 'EOF'
cd ~/pixematch-backend
pm2 restart pixematch-backend
echo "✅ Backend restarted!"
pm2 status
EOF

echo ""
echo "✅ Backend updated successfully!"
echo "🔍 Test it: http://13.62.56.87:3001/health"
