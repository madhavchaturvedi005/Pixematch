# Vercel Deployment Setup

## ✅ Your Setup
- **Frontend**: https://pixematch.vercel.app
- **Backend**: http://13.62.56.87:3001
- **Status**: Backend is ONLINE on AWS EC2

## 🚀 Steps to Complete Deployment

### Step 1: Update Backend on AWS

SSH into your EC2 instance and update the backend:

```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@13.62.56.87

# Navigate to backend directory
cd ~/pixematch-backend

# Pull latest changes (if using git)
git pull origin main

# Or manually update index.js with the new CORS settings
nano index.js
```

Make sure CORS allows Vercel:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://pixematch.vercel.app', 'http://13.62.56.87:3001'], 
  credentials: true
}));
```

Then restart:
```bash
pm2 restart pixematch-backend
pm2 logs pixematch-backend
```

### Step 2: Update Vercel Environment Variables

1. Go to https://vercel.com/dashboard
2. Select your `pixematch` project
3. Go to **Settings** → **Environment Variables**
4. Add/Update:
   - **Name**: `VITE_BACKEND_URL`
   - **Value**: `http://13.62.56.87:3001`
   - **Environment**: Production, Preview, Development (select all)
5. Click **Save**

### Step 3: Redeploy on Vercel

After updating environment variables:

```bash
# From your local project directory
git add .
git commit -m "Update backend URL for production"
git push origin main
```

Or manually trigger redeploy:
1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** tab
3. Click **...** on latest deployment → **Redeploy**

### Step 4: Test Your Live App

Visit: https://pixematch.vercel.app

1. Open browser console (F12)
2. Check for socket connection messages
3. Try the matching feature
4. Test video chat

### Step 5: Verify Backend Health

Open in browser:
```
http://13.62.56.87:3001/health
```

Should return:
```json
{
  "status": "ok",
  "activeUsers": 0,
  "browsingUsers": 0,
  ...
}
```

## 🔒 Important: HTTPS Upgrade (Recommended)

Vercel uses HTTPS, but your backend is HTTP. This might cause issues in some browsers.

### Option A: Use Nginx with SSL on EC2

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get a domain name (e.g., from Namecheap, GoDaddy)
# Point domain to your EC2 IP: api.pixematch.com → 13.62.56.87

# Get SSL certificate
sudo certbot --nginx -d api.pixematch.com

# Update backend URL to: https://api.pixematch.com
```

### Option B: Use CloudFlare (Free SSL)

1. Sign up at cloudflare.com
2. Add your domain
3. Create DNS A record: `api` → `13.62.56.87`
4. Enable SSL/TLS → Full
5. Use: `https://api.pixematch.com`

## 🐛 Troubleshooting

### Mixed Content Error (HTTPS → HTTP)

If you see "Mixed Content" errors:
- Your frontend (HTTPS) is trying to connect to backend (HTTP)
- Solution: Add SSL to backend or use CloudFlare

### CORS Error

Check backend logs:
```bash
ssh -i your-key.pem ubuntu@13.62.56.87
pm2 logs pixematch-backend
```

Make sure CORS includes `https://pixematch.vercel.app`

### WebSocket Connection Failed

1. Check EC2 Security Group allows port 3001
2. Check backend is running: `pm2 status`
3. Test health endpoint: `http://13.62.56.87:3001/health`

## 📊 Monitor Your App

### Backend Monitoring
```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@13.62.56.87

# Check status
pm2 status

# View logs
pm2 logs pixematch-backend --lines 100

# Monitor resources
pm2 monit
```

### Frontend Monitoring
- Vercel Dashboard → Analytics
- Check deployment logs
- Monitor function invocations

## 🎯 Current Status Checklist

- ✅ Backend deployed on AWS EC2 (13.62.56.87:3001)
- ✅ Backend status: ONLINE
- ✅ Frontend deployed on Vercel (pixematch.vercel.app)
- ⏳ Update Vercel environment variables
- ⏳ Update backend CORS settings
- ⏳ Redeploy Vercel
- ⏳ Test live app
- 🔜 Add SSL certificate (recommended)

## 🚀 Quick Commands

### Update Backend on EC2
```bash
ssh -i your-key.pem ubuntu@13.62.56.87
cd ~/pixematch-backend
git pull origin main
npm install
pm2 restart pixematch-backend
```

### Deploy Frontend to Vercel
```bash
git add .
git commit -m "Update"
git push origin main
# Vercel auto-deploys
```

---

**Next Steps:**
1. Update Vercel environment variable: `VITE_BACKEND_URL=http://13.62.56.87:3001`
2. Redeploy on Vercel
3. Test at https://pixematch.vercel.app
4. Consider adding SSL to backend for production
