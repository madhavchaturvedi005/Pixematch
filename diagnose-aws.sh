#!/bin/bash

echo "🔍 AWS Backend Diagnostics"
echo "================================"
echo ""

# Test if domain resolves
echo "1️⃣ DNS Resolution:"
nslookup pixematch.madhavchaturvedi.me
echo ""

# Test HTTP connection
echo "2️⃣ HTTP Connection Test:"
curl -I http://pixematch.madhavchaturvedi.me 2>&1 | head -5
echo ""

# Test HTTPS connection
echo "3️⃣ HTTPS Connection Test:"
curl -I https://pixematch.madhavchaturvedi.me 2>&1 | head -5
echo ""

# Test health endpoint
echo "4️⃣ Health Endpoint Test:"
curl -s https://pixematch.madhavchaturvedi.me/health 2>&1 | head -10
echo ""

# Test API endpoint
echo "5️⃣ API Users Endpoint Test:"
curl -s https://pixematch.madhavchaturvedi.me/api/users 2>&1 | head -10
echo ""

echo "================================"
echo ""
echo "📋 Diagnosis:"
echo ""
if curl -s https://pixematch.madhavchaturvedi.me/health | grep -q "ok"; then
    echo "✅ Backend is running and responding correctly!"
else
    echo "❌ Backend is NOT responding correctly."
    echo ""
    echo "Possible issues:"
    echo "  1. Backend not deployed to AWS"
    echo "  2. PM2 not running the backend"
    echo "  3. Nginx not configured correctly"
    echo "  4. Firewall blocking the connection"
    echo ""
    echo "Follow the steps in DEPLOY_TO_AWS.md to deploy your backend."
fi
