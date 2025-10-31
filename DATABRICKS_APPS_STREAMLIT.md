# Databricks Apps Deployment (Streamlit Mode - No Database Required)

## ✅ **Your app now works WITHOUT PostgreSQL!**

The application has been updated to run in **Streamlit Mode** when deployed to Databricks Apps. This mode doesn't require any external PostgreSQL database.

## What Works in Streamlit Mode

✅ **Available Features:**
- AI-powered Root Cause Analysis (RCA)
- Databricks Job Monitoring
- AI Assistant for Databricks
- Cost Analysis
- Incidents Tracking
- Real-time Analytics

❌ **Disabled Features (require database):**
- User Authentication (auto-authenticated as admin)
- Page Builder
- Audit Logs
- Persistent Settings (use environment variables instead)

## Deployment Instructions

### Step 1: Push Code to Databricks Apps

No code changes needed! Just push your code to Databricks Apps workspace.

### Step 2: Configure Environment Variables

In Databricks Apps → Environment tab, add **ONLY**:

```bash
# Required: Databricks workspace and authentication
DATABRICKS_HOST=https://your-workspace.cloud.databricks.com
DATABRICKS_TOKEN=your-databricks-pat-token

# Required: SQL Warehouse for jobs, RCA, and analytics features
DATABRICKS_WAREHOUSE_ID=your-warehouse-id

# Optional: For OpenAI-based AI features (if not using Databricks serving endpoints)
OPENAI_API_KEY=sk-your-openai-key

# Optional: For session security (auto-generated if not provided)
SESSION_SECRET=your-random-32-char-string
```

**How to find your SQL Warehouse ID:**
1. Go to Databricks → SQL Warehouses
2. Click on your warehouse
3. Copy the ID from the URL: `/sql/warehouses/{warehouse-id}`

**IMPORTANT:** Do NOT set `DATABASE_URL` - the app will automatically run in streamlit mode without it!

### Step 3: Deploy

Click **Deploy** in Databricks Apps. The app will:
1. Build successfully ✅
2. Start without database errors ✅
3. Automatically authenticate users ✅
4. Show this message in logs:

```
🚀 Running in STREAMLIT MODE (No Database)

Features available:
  ✓ AI-powered Root Cause Analysis (RCA)
  ✓ Databricks Job Monitoring
  ✓ AI Assistant for Databricks
  ✓ Cost Analysis

Features disabled (require database):
  ✗ User Authentication
  ✗ Page Builder
  ✗ Audit Logs
  ✗ Persistent Settings
```

### Step 4: Access Your App

Visit the Databricks Apps URL. You'll be **automatically logged in** as admin - no username/password required!

## How It Works

The app detects whether `DATABASE_URL` is set:

- **If DATABASE_URL exists** → Full database mode with authentication
- **If DATABASE_URL is missing** → Streamlit mode (no database, auto-authenticated)

This dual-mode design allows you to:
- Deploy easily to Databricks Apps (no database setup)
- Optionally add PostgreSQL later for full features (authentication, audit logs, etc.)

## Architecture Changes

### Backend
- Database connection is now optional
- Authentication middleware auto-authenticates in streamlit mode
- Storage layer uses in-memory mock for user/org data
- RCA, Jobs, and Analytics features query Databricks system tables directly (no database needed)

### Frontend
- Automatically tries to authenticate without token
- Skips login page if streamlit mode is detected
- Shows console message: `🚀 Running in Streamlit mode (no authentication required)`

## Troubleshooting

### App still crashes with "DATABASE_URL must be set"
- **Solution**: Remove `DATABASE_URL` from environment variables completely. The app should auto-detect streamlit mode.

### Can't access features
- **Verify** `DATABRICKS_HOST`, `DATABRICKS_TOKEN`, and `DATABRICKS_WAREHOUSE_ID` are set correctly
- **Check** that your Databricks token has permissions to query system tables and use the SQL warehouse
- **Find your warehouse ID**: Go to Databricks SQL Warehouses → Click your warehouse → Copy ID from URL
- **Review** logs for specific errors about Databricks API calls

### Want to add database later?
1. Get a PostgreSQL connection string (from Neon, Supabase, etc.)
2. Add `DATABASE_URL` to environment variables
3. Run database migrations (see DATABRICKS_DEPLOYMENT.md)
4. Restart the app - it will switch to full database mode automatically

## Comparison: Streamlit Mode vs Database Mode

| Feature | Streamlit Mode | Database Mode |
|---------|---------------|---------------|
| PostgreSQL Required | ❌ No | ✅ Yes |
| Authentication | Auto (no login) | JWT-based |
| RCA & AI Features | ✅ Full | ✅ Full |
| Page Builder | ❌ Disabled | ✅ Enabled |
| Audit Logs | ❌ Disabled | ✅ Enabled |
| Multi-user Support | ❌ Single tenant | ✅ Multi-tenant |
| Deployment Time | 2 minutes | 15-30 minutes |

## Next Steps

🚀 Your app is now ready for Databricks Apps deployment without any database setup!

Just push your code and set the environment variables - that's it!
