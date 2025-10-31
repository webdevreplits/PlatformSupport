import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Check if running in database mode or streamlit mode
export const DB_ENABLED = !!process.env.DATABASE_URL;

if (!DB_ENABLED) {
  console.log('\n=================================================================');
  console.log('🚀 Running in STREAMLIT MODE (No Database)');
  console.log('');
  console.log('Features available:');
  console.log('  ✓ AI-powered Root Cause Analysis (RCA)');
  console.log('  ✓ Databricks Job Monitoring');
  console.log('  ✓ AI Assistant for Databricks');
  console.log('  ✓ Cost Analysis');
  console.log('');
  console.log('Features disabled (require database):');
  console.log('  ✗ User Authentication');
  console.log('  ✗ Page Builder');
  console.log('  ✗ Audit Logs');
  console.log('  ✗ Persistent Settings');
  console.log('');
  console.log('Configuration: Use environment variables');
  console.log('  - DATABRICKS_HOST (required)');
  console.log('  - DATABRICKS_TOKEN (required)');
  console.log('  - DATABRICKS_WAREHOUSE_ID (required for SQL features)');
  console.log('  - OPENAI_API_KEY (optional, for AI features)');
  console.log('=================================================================\n');
}

let pool: Pool | null = null;
let db: any = null;

if (DB_ENABLED) {
  pool = new Pool({ 
    connectionString: process.env.DATABASE_URL!,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  // Handle pool errors to prevent crashes
  pool.on('error', (err) => {
    console.error('Unexpected database pool error:', err);
  });

  db = drizzle({ client: pool, schema });
  console.log('✓ Database connection established');
}

export { pool, db };
