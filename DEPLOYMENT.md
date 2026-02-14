# Pixematch Deployment Guide

## Frontend Deployment

### Option 1: Vercel (Recommended for Frontend)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

The `vercel.json` file is already configured to handle React Router.

### Option 2: Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to Netlify

The `public/_redirects` file is already configured for Netlify.

### Option 3: AWS EC2 with Nginx

1. **Build the React app locally:**
```bash
npm run build
```

2. **Upload to EC2:**
```bash
scp -r dist/* ubuntu@your-ec2-ip:/var/www/pixematch/
```

3. **Install Nginx on EC2:**
```bash
sudo apt update
sudo apt install nginx -y
```

4. **Copy nginx configuration:**
```bash
sudo cp nginx-frontend.conf /etc/nginx/sites-available/pixematch
sudo ln -s /etc/nginx/sites-available/pixematch /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default config
```

5. **Edit the config file:**
```bash
sudo nano /etc/nginx/sites-available/pixematch
```
- Replace `your-domain.com` with your actual domain or IP
- Update the `root` path if different

6. **Test and restart Nginx:**
```bash
sudo nginx -t
sudo systemctl restart nginx
```

7. **Set up SSL (optional but recommended):**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## Backend Deployment (AWS EC2)

1. **SSH into EC2:**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

2. **Clone/Update repository:**
```bash
cd /home/ubuntu
git clone https://github.com/madhavchaturvedi005/Pixematch.git
cd Pixematch/backend
```

3. **Install dependencies:**
```bash
npm install --production
```

4. **Set up environment variables:**
```bash
nano .env
```
Add your production environment variables.

5. **Install PM2:**
```bash
sudo npm install -g pm2
```

6. **Start the backend:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

7. **Check status:**
```bash
pm2 status
pm2 logs
```

## Environment Variables

### Frontend (.env)
```
VITE_BACKEND_URL=https://your-backend-domain.com
```

### Backend (.env)
```
PORT=3001
JWT_SECRET=your-secret-key
DATABASE_URL=your-database-url
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
EMAIL_USER=your-email
EMAIL_PASS=your-email-password
NODE_ENV=production
```

## Troubleshooting

### Issue: Routes return 404 on refresh
**Solution:** Make sure nginx configuration has `try_files $uri $uri/ /index.html;`

### Issue: API calls fail with CORS error
**Solution:** 
1. Check backend CORS configuration includes your frontend domain
2. Verify `VITE_BACKEND_URL` is set correctly in frontend

### Issue: "Not valid JSON" error
**Solution:**
1. Check backend is running: `pm2 status`
2. Check backend logs: `pm2 logs pixematch-backend`
3. Verify API endpoint is accessible: `curl http://localhost:3001/api/users`
4. Check nginx is proxying correctly to backend

### Issue: WebSocket connection fails
**Solution:** Make sure nginx has WebSocket upgrade headers configured (already in nginx-frontend.conf)

## Quick Deploy Script

Create a `deploy.sh` in root:
```bash
#!/bin/bash

echo "🚀 Deploying Pixematch..."

# Build frontend
echo "📦 Building frontend..."
npm run build

# Upload to server
echo "📤 Uploading to server..."
scp -r dist/* ubuntu@your-ec2-ip:/var/www/pixematch/

# Deploy backend
echo "🔧 Deploying backend..."
ssh ubuntu@your-ec2-ip "cd /home/ubuntu/Pixematch && git pull && cd backend && npm install --production && pm2 restart ecosystem.config.js"

echo "✅ Deployment complete!"
```

Make it executable:
```bash
chmod +x deploy.sh
```

Run it:
```bash
./deploy.sh
```
