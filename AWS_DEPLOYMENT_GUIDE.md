# AWS Deployment Guide for Pixematch Backend

This guide covers multiple AWS deployment options for your Socket.IO backend.

## 🎯 Recommended Options

### Option 1: AWS EC2 (Easiest & Most Flexible) ⭐ RECOMMENDED

Best for: Full control, WebSocket support, easy debugging

#### Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Choose **Ubuntu Server 22.04 LTS** (Free tier eligible)
3. Instance type: **t2.micro** (free tier) or **t2.small** (better performance)
4. Create or select a key pair (download .pem file)
5. Configure Security Group:
   - SSH (22) - Your IP
   - HTTP (80) - Anywhere
   - HTTPS (443) - Anywhere
   - Custom TCP (3001) - Anywhere (for backend)
6. Launch instance

#### Step 2: Connect to EC2

```bash
# Make key file secure
chmod 400 your-key.pem

# Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

#### Step 3: Install Node.js on EC2

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version

# Install PM2 (process manager)
sudo npm install -g pm2
```

#### Step 4: Deploy Backend Code

```bash
# Create app directory
mkdir -p ~/pixematch-backend
cd ~/pixematch-backend

# Clone or upload your code
# Option A: Using git
git clone https://github.com/madhavchaturvedi005/Pixematch.git
cd Pixematch/backend

# Option B: Upload files manually using SCP from your local machine
# (Run this from your local terminal, not EC2)
# scp -i your-key.pem -r backend/* ubuntu@your-ec2-public-ip:~/pixematch-backend/
```

#### Step 5: Install Dependencies & Start

```bash
# Install dependencies
npm install

# Start with PM2
pm2 start index.js --name pixematch-backend

# Make PM2 start on system reboot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs pixematch-backend
```

#### Step 6: Configure Nginx (Optional but Recommended)

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/pixematch
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # or use EC2 public IP

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/pixematch /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 7: Update Frontend

Update your frontend to use the EC2 public IP or domain:

```typescript
// In your frontend code (useWebRTC.ts, useUserPresence.ts)
const SOCKET_URL = 'http://your-ec2-public-ip:3001';
// or with Nginx: 'http://your-domain.com'
```

---

### Option 2: AWS Elastic Beanstalk (Managed Service)

Best for: Automatic scaling, managed infrastructure

#### Step 1: Install EB CLI

```bash
pip install awsebcli --upgrade --user
```

#### Step 2: Initialize Elastic Beanstalk

```bash
cd backend
eb init -p node.js pixematch-backend --region us-east-1
```

#### Step 3: Create Environment

```bash
eb create pixematch-env
```

#### Step 4: Deploy

```bash
eb deploy
```

#### Step 5: Get URL

```bash
eb status
# Copy the CNAME URL and update your frontend
```

---

### Option 3: AWS Lightsail (Simplest)

Best for: Beginners, fixed pricing

1. Go to AWS Lightsail
2. Create Instance → OS Only → Ubuntu 22.04
3. Choose plan ($3.50/month for 512MB RAM)
4. Follow same steps as EC2 (Step 3-5)

---

## 🔒 Security Best Practices

### 1. Use Environment Variables

Create `.env` file on server:

```bash
nano ~/pixematch-backend/.env
```

```env
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

Update `backend/index.js`:

```javascript
require('dotenv').config();

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

### 2. Install SSL Certificate (HTTPS)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com
```

### 3. Configure Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 📊 Monitoring & Logs

### PM2 Commands

```bash
# View logs
pm2 logs pixematch-backend

# Monitor resources
pm2 monit

# Restart app
pm2 restart pixematch-backend

# Stop app
pm2 stop pixematch-backend
```

### Check Health

```bash
curl http://localhost:3001/health
```

---

## 🚀 Quick Deploy Script

Save this as `deploy.sh` in your backend folder:

```bash
#!/bin/bash

echo "🚀 Deploying Pixematch Backend..."

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Restart PM2
pm2 restart pixematch-backend

echo "✅ Deployment complete!"
pm2 status
```

Make it executable:

```bash
chmod +x deploy.sh
```

Run deployment:

```bash
./deploy.sh
```

---

## 💰 Cost Estimate

- **EC2 t2.micro**: Free tier (1 year) then ~$8/month
- **Elastic Beanstalk**: ~$15-30/month
- **Lightsail**: $3.50-$5/month (fixed pricing)

---

## 🔧 Troubleshooting

### Backend not accessible

```bash
# Check if app is running
pm2 status

# Check logs
pm2 logs pixematch-backend

# Check port
sudo netstat -tulpn | grep 3001
```

### WebSocket connection fails

- Ensure Security Group allows port 3001
- Check CORS settings
- Verify Nginx WebSocket proxy configuration

### High memory usage

```bash
# Increase swap space
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## 📝 Next Steps

1. Deploy backend to EC2
2. Get public IP or domain
3. Update frontend `SOCKET_URL` in:
   - `src/hooks/useWebRTC.ts`
   - `src/hooks/useUserPresence.ts`
4. Test connection
5. Set up SSL certificate
6. Configure monitoring

---

## 🆘 Need Help?

- AWS EC2 Docs: https://docs.aws.amazon.com/ec2/
- PM2 Docs: https://pm2.keymetrics.io/
- Socket.IO Docs: https://socket.io/docs/v4/
