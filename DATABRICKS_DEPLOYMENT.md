# Deploying to Databricks Apps

This guide explains how to deploy the Enterprise Data Analytics Platform Support application to Databricks Apps.

## Prerequisites

1. A Databricks workspace
2. A PostgreSQL database (see database options below)
3. Databricks serving endpoint token for AI features

## Step 1: Set Up PostgreSQL Database

The application requires a PostgreSQL database. You can use any of these providers:

### Option A: Neon (Recommended)
1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string (looks like: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`)

### Option B: Supabase
1. Sign up at https://supabase.com
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string in "Connection pooling" mode

### Option C: Azure Database for PostgreSQL
1. Create a PostgreSQL flexible server in Azure
2. Configure firewall rules to allow connections
3. Get the connection string

### Option D: Amazon RDS PostgreSQL
1. Create a PostgreSQL instance in RDS
2. Configure security groups
3. Get the connection string

## Step 2: Deploy Without Environment Variables

1. Deploy the application to Databricks Apps **without any environment variables**
2. The app will start and show a Setup Wizard
3. Complete the Setup Wizard in the UI
4. **IMPORTANT**: After completing setup, you'll receive an encryption passphrase
5. Add the passphrase as an environment variable and restart the app

## Step 3: Configure Environment Variables (After Setup)

After completing the Setup Wizard, you need to add ONE required environment variable:

### Required Environment Variable:

**Encryption Passphrase** (provided by Setup Wizard):
```
ENCRYPTION_PASSPHRASE=your-passphrase-from-setup-wizard
```

To add this:
1. Go to your Databricks workspace
2. Navigate to **Apps** → Your app
3. Click the **Environment** tab
4. Add: `ENCRYPTION_PASSPHRASE` with the value from the Setup Wizard
5. Click **Restart** to apply changes

### Optional Environment Variables (Backward Compatibility):

If you prefer to use environment variables instead of the Setup Wizard:

**Database Connection:**
```
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

**AI Integration (for RCA and Assistant features):**

You have two options:

**Option A: Using Databricks Claude Endpoint (Recommended)**
```
DATABRICKS_HOST=https://your-workspace.cloud.databricks.com
DATABRICKS_TOKEN=your-databricks-pat-token
```

**Option B: Using OpenAI API**
```
OPENAI_API_KEY=sk-your-openai-api-key
```

**Session Security:**
```
SESSION_SECRET=your-random-secret-at-least-32-characters
```
Generate a secure random string for this. Example: `openssl rand -base64 32`

### Optional Environment Variables:

```
NODE_ENV=production
PORT=5000
```

## Important: Network Configuration

### Firewall / Network Access

If using a managed PostgreSQL service (Neon, Supabase, Azure, AWS RDS), you need to:

1. **Allow Databricks Apps IP addresses** to connect to your database
   - For Neon/Supabase: They typically allow all connections by default (secure via password)
   - For Azure Database for PostgreSQL: Add Databricks compute subnet to firewall rules
   - For AWS RDS: Update security group to allow inbound traffic from Databricks VPC

2. **Verify SSL/TLS requirements**
   - Ensure your connection string includes `?sslmode=require`
   - Most cloud providers require SSL connections

3. **Test connectivity** before deploying:
   ```bash
   # Test from a notebook in your Databricks workspace
   psql "postgresql://user:password@host:5432/database?sslmode=require"
   ```

## Step 4: Initialize the Database

Before deploying, you need to initialize the database schema:

### ⚠️ IMPORTANT: Database Initialization Required

The database must be initialized **BEFORE** deploying to Databricks Apps. Choose one of these methods:

### Option A: Run migrations from Replit (Recommended)
1. Open the project in Replit
2. Add a new secret: `DATABASE_URL` pointing to your production PostgreSQL database
3. Open the Replit Shell
4. Run: `npm run db:push`
5. Verify tables were created successfully

### Option B: Run migrations from local development
1. Clone the repository to your local machine
2. Install dependencies: `npm install`
3. Set environment variable: `export DATABASE_URL="your-connection-string"`
4. Run migrations: `npm run db:push`

### Option C: Run from CI/CD Pipeline
If using GitHub Actions or similar:
```yaml
- name: Run Database Migrations
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
  run: |
    npm install
    npm run db:push
```

### Verify Database Schema
After running migrations, verify the following tables exist:
- `organizations`
- `users`
- `pages`
- `widgets`
- `tools`
- `connections`
- `workflows`
- `alerts`
- `audit_logs`

You can verify using:
```bash
psql $DATABASE_URL -c "\dt"
```

## Step 5: Seed Initial Data (Optional - Skip if using Setup Wizard)

To create the initial admin user and demo data:

```bash
npm run db:seed
```

This creates:
- Demo organization
- Admin user (email: admin@demo.com, password: admin123)
- Sample pages and configurations

## Step 6: Complete Setup Wizard

1. Access the app via Databricks Apps URL
2. You'll see the Setup Wizard automatically
3. Follow the 4-step process:
   - **Step 1**: Enter your PostgreSQL database URL and test connection
   - **Step 2**: Create admin account
   - **Step 3**: Configure AI (Databricks/OpenAI) - Optional
   - **Step 4**: Set encryption passphrase and generate session secret
4. Complete the setup
5. **CRITICAL**: Copy the encryption passphrase and add it to Databricks Apps Environment as `ENCRYPTION_PASSPHRASE`
6. Restart the app

## Step 7: Restart with Encryption Passphrase

1. In Databricks Apps, click **Deploy** or **Restart**
2. Monitor the deployment logs for any errors
3. The app should start successfully and be accessible via the Databricks Apps URL
4. First login credentials (if you ran seed data):
   - Email: `admin@demo.com`
   - Password: `admin123`

## Step 6: Verify Deployment

After deployment, verify the following:

1. **App is accessible** - Visit the Databricks Apps URL
2. **Database connection works** - Login page should load (confirms DB connectivity)
3. **AI features work** - Navigate to Settings and verify Databricks/OpenAI configuration
4. **No errors in logs** - Check Databricks Apps → Logs tab for any startup errors

## Troubleshooting

### Error: "DATABASE_URL must be set"
- Ensure you added the `DATABASE_URL` environment variable in the Databricks Apps Environment tab
- Verify the connection string format is correct
- Check that the database is accessible from Databricks

### Database Connection Errors
- Verify your PostgreSQL server allows connections from Databricks IP addresses
- Check that SSL mode is configured correctly (`?sslmode=require` for most cloud providers)
- Test the connection string locally first

### Migration Errors
- If you see "relation does not exist" errors, run `npm run db:push` to create the schema
- For existing databases, backup first before running migrations

## Security Best Practices

1. **Never commit DATABASE_URL to version control** - Always use environment variables
2. **Use strong passwords** for database users
3. **Enable SSL** for database connections (`?sslmode=require`)
4. **Restrict database access** to only necessary IP addresses
5. **Rotate SESSION_SECRET** regularly in production

## Database Schema Management

The application uses Drizzle ORM for database management. Schema is defined in:
- `shared/schema.ts` - Main schema definitions
- `server/db.ts` - Database connection

To modify the schema:
1. Update `shared/schema.ts`
2. Run `npm run db:push` to sync changes
3. Redeploy the Databricks App

## Support

For issues or questions:
- Check application logs in Databricks Apps → Logs tab
- Review the error messages for specific guidance
- Ensure all environment variables are correctly set
