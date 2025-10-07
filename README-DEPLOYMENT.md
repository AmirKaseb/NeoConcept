# 🚀 NeoConcept Auto-Deployment

## 🔑 Setup (One-time)
1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:
   ```
   AWS_ACCESS_KEY_ID = your-aws-access-key
   AWS_SECRET_ACCESS_KEY = your-aws-secret-key
   ```

## 🚀 Deploy
1. Push to `devops` branch:
   ```bash
   git push origin devops
   ```
2. Go to **Actions** tab in GitHub
3. Get your IP address!

## 💰 Cost
- Server runs for 1 hour then auto-shuts down
- ~$0.10 per deployment

## 🔧 How it Works
1. **Terraform** creates EC2 server with Docker
2. **Server** downloads your code from GitHub
3. **AWS CLI** restarts the application via SSM
4. **Auto-shutdown** after 1 hour

---
**Push to devops → Get IP → Server shuts down in 1 hour!** 🎉
