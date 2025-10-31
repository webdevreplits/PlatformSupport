# Quick Start: Deploy to Databricks Apps

## ⚡ 5-Minute Deployment Checklist

### ☑️ Before You Deploy

- [ ] **Get a PostgreSQL database** (Neon.tech is fastest - takes 2 minutes)
- [ ] **Get DATABASE_URL** connection string
- [ ] **Generate SESSION_SECRET** with: `openssl rand -base64 32`
- [ ] **Get Databricks token** (or OpenAI API key for AI features)

### ☑️ Step 1: Initialize Database (Do This First!)

From Replit Shell:
```bash
# Set your production database URL
export DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# Create database schema
npm run db:push

# Create admin user and demo data
npm run db:seed
```

### ☑️ Step 2: Configure Databricks Apps

In Databricks Apps → Environment tab, add:

**Required:**
```
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
SESSION_SECRET=your-32-char-random-string
DATABRICKS_HOST=https://your-workspace.cloud.databricks.com
DATABRICKS_TOKEN=your-databricks-pat-token
```

**Optional:**
```
NODE_ENV=production
```

### ☑️ Step 3: Deploy

1. Click **Deploy** in Databricks Apps
2. Wait for build to complete (~2 minutes)
3. Check logs for "Server running on port 5000"

### ☑️ Step 4: Login

1. Visit your Databricks App URL
2. Login with:
   - Email: `admin@demo.com`
   - Password: `admin123`

## 🔥 Common Issues

| Error | Fix |
|-------|-----|
| "DATABASE_URL must be set" | Add DATABASE_URL in Environment tab |
| "Connection refused" | Check database firewall allows Databricks IPs |
| "SSL required" | Add `?sslmode=require` to DATABASE_URL |
| "Tables don't exist" | Run `npm run db:push` before deploying |

## 📚 Need More Details?

See [DATABRICKS_DEPLOYMENT.md](./DATABRICKS_DEPLOYMENT.md) for complete documentation.

## 🚀 Recommended Database Provider

**Neon** (https://neon.tech) - Best for Databricks Apps deployment:
- ✅ Free tier available
- ✅ No firewall configuration needed
- ✅ Automatic SSL
- ✅ Serverless (pay per use)
- ✅ Setup in 2 minutes

Just copy the connection string and you're ready!
