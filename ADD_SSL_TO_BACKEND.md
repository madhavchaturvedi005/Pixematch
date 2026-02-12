# Add SSL/HTTPS to Backend - Fix Mixed Content Error

## 🔒 Problem
Your frontend (https://pixematch.vercel.app) is HTTPS, but backend (http://13.62.56.87:3001) is HTTP.
Browsers block HTTP requests from HTTPS pages for security.

## ✅ Solution: Add SSL Certificate to Backend

We'll use **Nginx as reverse proxy** with **Let's Encrypt SSL** (free).

---

## Option 1: Using Self-Signed Certificate (Quick Test - 5 minutes)

This is for testing only. Browsers will show a warning, but it will work.

### SSH into EC2
```bash
ssh -i your-key.pem ubuntu@13.62.56.87
```

### Install Nginx
```bash
sudo apt update
sudo apt install -y nginx
```

### Create Self-Signed Certificate
```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/pixematch.key \
  -out /etc/ssl/certs/pixematch.crt \
  -subj "/C=US/ST=State/L=City/O=Pixematch/CN=13.62.56.87"
```

### Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/pixematch
```

Paste this configuration:
```nginx
server {
    listen 443 ssl;
    server_name 13.62.56.87;

    ssl_certificate /etc/ssl/certs/pixematch.crt;
    ssl_certificate_key /etc/ssl/private/pixematch.key;

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
}

server {
    listen 80;
    server_name 13.62.56.87;
    return 301 https://$server_name$request_uri;
}
```

### Enable and Start Nginx
```bash
sudo ln -s /etc/nginx/sites-available/pixematch /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Update EC2 Security Group
Add inbound rule for HTTPS:
- Type: HTTPS
- Port: 443
- Source: 0.0.0.0/0

### Update Vercel Environment Variable
Change backend URL to:
```
VITE_BACKEND_URL=https://13.62.56.87
```

Note: Browser will show security warning (accept it for testing).

---

## Option 2: Using CloudFlare Tunnel (Recommended - Free & Easy) ⭐

This gives you a real domain with SSL for FREE!

### Step 1: Install Cloudflared on EC2
```bash
ssh -i your-key.pem ubuntu@13.62.56.87

# Download cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Login to CloudFlare
cloudflared tunnel login
```

This will open a browser - login to CloudFlare (create free account if needed).

### Step 2: Create Tunnel
```bash
# Create tunnel
cloudflared tunnel create pixematch-backend

# Note the tunnel ID shown

# Create config
mkdir -p ~/.cloudflared
nano ~/.cloudflared/config.yml
```

Paste this (replace TUNNEL_ID with your actual tunnel ID):
```yaml
tunnel: TUNNEL_ID
credentials-file: /home/ubuntu/.cloudflared/TUNNEL_ID.json

ingress:
  - hostname: pixematch-api.your-domain.com
    service: http://localhost:3001
  - service: http_status:404
```

### Step 3: Route DNS
```bash
cloudflared tunnel route dns pixematch-backend pixematch-api.your-domain.com
```

### Step 4: Run Tunnel
```bash
# Test it
cloudflared tunnel run pixematch-backend

# If it works, run as service
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

### Step 5: Update Vercel
```
VITE_BACKEND_URL=https://pixematch-api.your-domain.com
```

---

## Option 3: Quick Fix - Use Vercel Serverless Functions (Alternative)

If SSL setup is too complex, you can proxy requests through Vercel:

### Create API Route in Vercel
Create `api/proxy.js` in your project:

```javascript
export default async function handler(req, res) {
  const backendUrl = 'http://13.62.56.87:3001';
  
  try {
    const response = await fetch(`${backendUrl}${req.url}`, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error' });
  }
}
```

Then use `/api/proxy` instead of direct backend URL.

---

## 🎯 Recommended Approach

**For Quick Testing (5 min):**
→ Use Option 1 (Self-signed certificate)

**For Production (15 min):**
→ Use Option 2 (CloudFlare Tunnel) - Free domain + SSL

**For Simplest (but limited):**
→ Use Option 3 (Vercel proxy)

---

## 🚀 Quick Start - Self-Signed SSL (Fastest)

Run these commands on EC2:

```bash
# Install Nginx
sudo apt update && sudo apt install -y nginx

# Create certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/pixematch.key \
  -out /etc/ssl/certs/pixematch.crt \
  -subj "/C=US/ST=State/L=City/O=Pixematch/CN=13.62.56.87"

# Download config
curl -o /tmp/pixematch.conf https://raw.githubusercontent.com/yourusername/pixematch/main/backend/nginx.conf

# Or create manually
sudo nano /etc/nginx/sites-available/pixematch
# (paste the nginx config from above)

# Enable
sudo ln -s /etc/nginx/sites-available/pixematch /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Add HTTPS to security group (port 443)
```

Update Vercel env var:
```
VITE_BACKEND_URL=https://13.62.56.87
```

Redeploy Vercel and test!

---

**Which option do you want to try?**
1. Self-signed SSL (quick test)
2. CloudFlare Tunnel (best for production)
3. Vercel proxy (simplest)
