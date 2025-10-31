import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error('\n=================================================================');
  console.error('ERROR: DATABASE_URL environment variable is not set!');
  console.error('');
  console.error('To fix this in Databricks Apps:');
  console.error('1. Go to your Databricks App settings');
  console.error('2. Navigate to the "Environment" tab');
  console.error('3. Add a new environment variable:');
  console.error('   Name: DATABASE_URL');
  console.error('   Value: Your PostgreSQL connection string');
  console.error('');
  console.error('Example PostgreSQL connection string:');
  console.error('postgresql://user:password@host:5432/database?sslmode=require');
  console.error('');
  console.error('You can use any PostgreSQL provider:');
  console.error('- Neon (https://neon.tech)');
  console.error('- Supabase (https://supabase.com)');
  console.error('- Amazon RDS');
  console.error('- Azure Database for PostgreSQL');
  console.error('=================================================================\n');
  
  throw new Error(
    "DATABASE_URL must be set. Please configure it in Databricks Apps Environment settings.",
  );
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Handle pool errors to prevent crashes
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

export const db = drizzle({ client: pool, schema });
