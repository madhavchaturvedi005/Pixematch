# Connect Frontend to AWS Backend

## ✅ Backend Status: ONLINE on AWS EC2

Your backend is successfully running! Now let's connect your frontend to it.

## Step 1: Get Your EC2 Public IP

1. Go to AWS Console → EC2 → Instances
2. Select your instance
3. Copy the **Public IPv4 address** (example: `54.123.45.67`)

## Step 2: Update Frontend Environment Variable

Replace `YOUR_EC2_PUBLIC_IP` with your actual IP address:

```bash
# In your project root, update .env file
VITE_BACKEND_URL=http://YOUR_EC2_PUBLIC_IP:3001
```

For example:
```bash
VITE_BACKEND_URL=http://54.123.45.67:3001
```

## Step 3: Restart Your Frontend Dev Server

```bash
# Stop the current dev server (Ctrl+C)
# Then restart it
npm run dev
```

## Step 4: Test the Connection

1. Open your app in the browser
2. Go to the Matching page
3. Open browser console (F12)
4. You should see: `Connected to backend` or similar socket connection messages
5. Try starting a video chat

## Step 5: Verify Backend is Accessible

Open in your browser:
```
http://YOUR_EC2_PUBLIC_IP:3001/health
```

You should see:
```json
{
  "status": "ok",
  "activeUsers": 0,
  "browsingUsers": 0,
  "totalUsers": 0,
  "activeMatches": 0,
  "waitingQueue": 0,
  "timestamp": "2024-..."
}
```

## 🔒 Important: Security Group Configuration

Make sure your EC2 Security Group allows:
- Port 3001 (Custom TCP) from Anywhere (0.0.0.0/0)

To check/update:
1. EC2 Console → Instances → Select instance
2. Security tab → Click security group name
3. Inbound rules → Edit inbound rules
4. Add rule: Custom TCP, Port 3001, Source: 0.0.0.0/0

## 🚀 Deploy Frontend (Optional)

Once everything works locally, you can deploy your frontend to:
- **Vercel** (Recommended): `npm i -g vercel && vercel`
- **Netlify**: Drag & drop `dist` folder
- **AWS S3 + CloudFront**: Static hosting

Don't forget to update `VITE_BACKEND_URL` in your deployment environment variables!

## 📊 Monitor Your Backend

SSH into EC2 and run:

```bash
# Check status
pm2 status

# View logs
pm2 logs pixematch-backend

# Monitor in real-time
pm2 monit

# Restart if needed
pm2 restart pixematch-backend
```

## 🐛 Troubleshooting

### Frontend can't connect to backend

1. **Check EC2 Security Group**: Port 3001 must be open
2. **Check backend is running**: `pm2 status` on EC2
3. **Check CORS**: Backend should allow your frontend origin
4. **Check browser console**: Look for connection errors

### CORS Error

If you see CORS errors, SSH into EC2 and update backend:

```bash
cd ~/pixematch-backend
nano index.js
```

Update CORS configuration:
```javascript
app.use(cors({
  origin: '*',  // For testing, or specify your frontend URL
  credentials: true
}));
```

Then restart:
```bash
pm2 restart pixematch-backend
```

## 🎯 Next Steps

1. ✅ Backend running on AWS
2. ⏳ Update `.env` with EC2 IP
3. ⏳ Test connection
4. ⏳ Deploy frontend
5. ⏳ Set up domain name (optional)
6. ⏳ Add SSL certificate (optional)

---

**What's your EC2 Public IP?** 
Tell me and I'll update the `.env` file for you!
