#!/bin/bash

# Quick SSL Setup Script for Pixematch Backend
# Run this ON your EC2 instance

echo "🔒 Setting up SSL for Pixematch Backend..."

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt update
sudo apt install -y nginx

# Create self-signed certificate
echo "🔐 Creating SSL certificate..."
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/pixematch.key \
  -out /etc/ssl/certs/pixematch.crt \
  -subj "/C=US/ST=State/L=City/O=Pixematch/CN=13.62.56.87"

# Create Nginx config
echo "⚙️  Configuring Nginx..."
sudo tee /etc/nginx/sites-available/pixematch > /dev/null <<'EOF'
server {
    listen 443 ssl http2;
    server_name 13.62.56.87;

    ssl_certificate /etc/ssl/certs/pixematch.crt;
    ssl_certificate_key /etc/ssl/private/pixematch.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
}

server {
    listen 80;
    server_name 13.62.56.87;
    return 301 https://$server_name$request_uri;
}
EOF

# Enable site
echo "🔗 Enabling site..."
sudo ln -sf /etc/nginx/sites-available/pixematch /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    # Restart Nginx
    echo "🔄 Restarting Nginx..."
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    echo ""
    echo "✅ SSL Setup Complete!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Add HTTPS (port 443) to EC2 Security Group"
    echo "2. Update Vercel environment variable:"
    echo "   VITE_BACKEND_URL=https://13.62.56.87"
    echo "3. Test: https://13.62.56.87/health"
    echo ""
    echo "⚠️  Note: Browser will show security warning (self-signed cert)"
    echo "   Click 'Advanced' → 'Proceed anyway' to test"
else
    echo "❌ Nginx configuration test failed!"
    exit 1
fi
