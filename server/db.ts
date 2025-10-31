import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { configService } from './config/ConfigService';

neonConfig.webSocketConstructor = ws;

let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

function initializeDatabase(): void {
  const databaseUrl = configService.getDatabaseUrl();
  
  if (!databaseUrl) {
    console.log('[Database] No DATABASE_URL configured - running in setup mode');
    return;
  }

  try {
    pool = new Pool({ 
      connectionString: databaseUrl,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    // Handle pool errors to prevent crashes
    pool.on('error', (err) => {
      console.error('Unexpected database pool error:', err);
    });

    db = drizzle({ client: pool, schema });
    console.log('[Database] Successfully connected to PostgreSQL');
  } catch (error) {
    console.error('[Database] Error initializing database:', error);
    throw error;
  }
}

export function getDb() {
  if (!db) {
    initializeDatabase();
  }
  
  if (!db) {
    throw new Error('Database not configured. Please complete the setup wizard.');
  }
  
  return db;
}

export function getPool() {
  if (!pool) {
    initializeDatabase();
  }
  
  return pool;
}

export function isDatabaseConfigured(): boolean {
  return configService.getDatabaseUrl() !== null;
}

export function reinitializeDatabase(): void {
  // Close existing pool if any
  if (pool) {
    pool.end().catch(err => console.error('Error closing pool:', err));
    pool = null;
    db = null;
  }
  
  // Reinitialize with new config
  initializeDatabase();
}

// Try to initialize on startup (non-blocking)
try {
  initializeDatabase();
} catch (error) {
  console.log('[Database] Startup initialization skipped - will initialize after configuration');
}
