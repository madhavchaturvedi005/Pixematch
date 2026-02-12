# CloudFlare Tunnel Setup - Get Real SSL for Free

## Why CloudFlare Tunnel?
- ✅ Real SSL certificate (works on all devices)
- ✅ Free subdomain (e.g., pixematch-api.trycloudflare.com)
- ✅ No need to manage certificates
- ✅ Works behind firewalls
- ✅ DDoS protection included

## 🚀 Quick Setup (10 minutes)

### Step 1: SSH into EC2
```bash
ssh -i your-key.pem ubuntu@13.62.56.87
```

### Step 2: Install Cloudflared
```bash
# Download cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb

# Install it
sudo dpkg -i cloudflared-linux-amd64.deb

# Verify installation
cloudflared --version
```

### Step 3: Start Quick Tunnel (No Account Needed!)
```bash
# This creates a temporary tunnel with a random URL
cloudflared tunnel --url http://localhost:3001
```

You'll see output like:
```
Your quick Tunnel has been created! Visit it at:
https://random-name-1234.trycloudflare.com
```

**Copy that URL!** This is your backend URL with real SSL.

### Step 4: Test It
Open in browser:
```
https://random-name-1234.trycloudflare.com/health
```

Should work on ANY device without certificate errors!

### Step 5: Update Vercel Environment Variable
1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Update `VITE_BACKEND_URL` to your CloudFlare URL:
   ```
   VITE_BACKEND_URL=https://random-name-1234.trycloudflare.com
   ```
4. Redeploy

### Step 6: Keep Tunnel Running (Make it Permanent)

The quick tunnel stops when you close SSH. To make it permanent:

```bash
# Stop the quick tunnel (Ctrl+C)

# Install as a service
sudo cloudflared service install

# Create config directory
mkdir -p ~/.cloudflared

# Create config file
nano ~/.cloudflared/config.yml
```

Add this content:
```yaml
url: http://localhost:3001
```

Save and exit (Ctrl+X, Y, Enter)

```bash
# Start the service
sudo systemctl start cloudflared
sudo systemctl enable cloudflared

# Check status
sudo systemctl status cloudflared

# View the tunnel URL
sudo journalctl -u cloudflared -n 50 | grep trycloudflare.com
```

---

## 🎯 Alternative: Use CloudFlare with Custom Domain (Better)

If you have a domain name (or want to get one):

### Step 1: Create CloudFlare Account
1. Go to https://dash.cloudflare.com/sign-up
2. Sign up (free)

### Step 2: Login via CLI
```bash
cloudflared tunnel login
```

This opens a browser - login and authorize.

### Step 3: Create Named Tunnel
```bash
# Create tunnel
cloudflared tunnel create pixematch-backend

# You'll get a tunnel ID - copy it
```

### Step 4: Configure Tunnel
```bash
nano ~/.cloudflared/config.yml
```

Add:
```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /home/ubuntu/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: api.yourdomain.com
    service: http://localhost:3001
  - service: http_status:404
```

### Step 5: Route DNS
```bash
cloudflared tunnel route dns pixematch-backend api.yourdomain.com
```

### Step 6: Run Tunnel
```bash
# Test it
cloudflared tunnel run pixematch-backend

# If it works, install as service
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

Now use: `https://api.yourdomain.com`

---

## 📊 Quick Comparison

| Method | SSL Valid? | Setup Time | Cost | Best For |
|--------|-----------|------------|------|----------|
| Self-signed | ❌ No | 5 min | Free | Local testing only |
| CloudFlare Quick | ✅ Yes | 2 min | Free | Quick testing |
| CloudFlare Named | ✅ Yes | 10 min | Free | Production |
| Let's Encrypt | ✅ Yes | 15 min | Free | Need custom domain |

---

## 🚀 Recommended: Quick Tunnel (Right Now)

Run this on EC2:
```bash
cloudflared tunnel --url http://localhost:3001
```

Copy the URL it gives you, update Vercel, and you're done!

The URL changes each time you restart, but it's perfect for testing.

For production, use the named tunnel with a custom domain.
