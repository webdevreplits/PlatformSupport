# Azure Platform Support - Databricks Deployment Guide

## 🚀 Quick Start on Azure Databricks

### Prerequisites
- Azure Databricks workspace
- Node.js 18+ (usually pre-installed)
- PostgreSQL database (optional - will run in limited mode without it)

### Deployment Steps

1. **Upload to Databricks**
   ```bash
   # Clone or upload this repository to Databricks workspace
   ```

2. **Install Python Dependencies**
   ```bash
   pip install -r requirements-streamlit.txt
   ```

3. **Set Environment Variables** (Optional)
   ```bash
   export DATABASE_URL="postgresql://user:password@host:5432/dbname"
   export JWT_SECRET="your-secret-key-here"
   ```

4. **Run the Streamlit App**
   ```bash
   streamlit run streamlit_app.py --server.port 8000
   ```

5. **Access the Application**
   - The app will be available at the Streamlit URL provided by Databricks
   - The React app will be embedded in an iframe
   - Alternatively, access directly at `http://localhost:5000`

## 🎯 Features Available in Databricks

### ✅ Fully Functional
- **Dashboard**: Real-time monitoring with metrics
- **Cost Analysis**: Azure spending tracking
- **Resources**: Infrastructure resource management  
- **Pages**: Custom page builder (with auth)
- **Incidents**: ServiceNow ticket management
- **Jobs**: Databricks job monitoring
- **Authentication**: JWT-based with role-based access

### ⚠️ Limited Mode (No Database)
If DATABASE_URL is not set, the app will run with:
- ✅ All UI features available
- ✅ Demo data for visualization
- ❌ No persistent user authentication
- ❌ No data persistence

## 🔧 Configuration

### Environment Variables
```bash
# Required for full functionality
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-secret-key-change-in-production

# Optional
NODE_ENV=production
PORT=5000
```

### Database Setup
```bash
# Push schema to database
npm run db:push

# Seed demo data
npx tsx server/seed.ts
```

## 📊 Architecture

```
┌─────────────────────────────────────┐
│   Azure Databricks Streamlit        │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   streamlit_app.py           │  │
│  │   (Python Wrapper)           │  │
│  └──────────────┬───────────────┘  │
│                 │                   │
│                 ▼                   │
│  ┌──────────────────────────────┐  │
│  │   React/Express App          │  │
│  │   (Node.js on port 5000)     │  │
│  │                              │  │
│  │  ┌─────────────────────────┐ │  │
│  │  │  React Frontend         │ │  │
│  │  │  - Dashboard            │ │  │
│  │  │  - Cost Analysis        │ │  │
│  │  │  - Resources            │ │  │
│  │  │  - Page Builder         │ │  │
│  │  └─────────────────────────┘ │  │
│  │                              │  │
│  │  ┌─────────────────────────┐ │  │
│  │  │  Express Backend        │ │  │
│  │  │  - REST API             │ │  │
│  │  │  - JWT Auth             │ │  │
│  │  │  - PostgreSQL/Drizzle   │ │  │
│  │  └─────────────────────────┘ │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

## 🔐 Demo Credentials

- **Admin**: admin@demo.com / admin123
- **Editor**: editor@demo.com / editor123
- **Viewer**: viewer@demo.com / viewer123

## 🐛 Troubleshooting

### Server Won't Start
```bash
# Check if port is in use
lsof -ti:5000 | xargs kill -9

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Database Connection Issues
```bash
# Test database connection
psql $DATABASE_URL

# Check environment variables
echo $DATABASE_URL
```

### Streamlit Issues
```bash
# Check Streamlit logs
tail -f ~/.streamlit/logs/streamlit.log

# Restart Streamlit
pkill streamlit
streamlit run streamlit_app.py
```

## 📝 Notes

- The app auto-detects the environment (Databricks/Replit/Local)
- Node.js dependencies are auto-installed on first run
- The app gracefully degrades if database is unavailable
- All features work in both embedded and direct access modes
