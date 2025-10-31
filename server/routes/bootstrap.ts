import { Router, Request, Response } from 'express';
import { configService } from '../config/ConfigService';
import { reinitializeDatabase, isDatabaseConfigured } from '../db';
import { Pool } from '@neondatabase/serverless';
import { hash } from 'bcryptjs';

const router = Router();

// Check setup status
router.get('/status', (req: Request, res: Response) => {
  const setupCompleted = configService.isSetupCompleted();
  const databaseConfigured = isDatabaseConfigured();
  const locked = configService.isLocked();
  
  res.json({
    setupCompleted,
    databaseConfigured,
    locked,
    requiresSetup: !setupCompleted || (!databaseConfigured && !locked)
  });
});

// Unlock app with passphrase
router.post('/unlock', (req: Request, res: Response) => {
  try {
    const { encryptionPassphrase } = req.body;
    
    if (!encryptionPassphrase) {
      return res.status(400).json({ error: 'Encryption passphrase is required' });
    }

    // Try to set the passphrase - this will fail if passphrase is incorrect
    try {
      configService.setEncryptionPassphrase(encryptionPassphrase);
      
      // Verify by attempting to get database URL
      const databaseUrl = configService.getDatabaseUrl();
      
      if (!databaseUrl) {
        throw new Error('Failed to decrypt database URL with provided passphrase');
      }

      // Reinitialize database connection
      reinitializeDatabase();

      res.json({ 
        success: true, 
        message: 'Application unlocked successfully'
      });
    } catch (decryptError: any) {
      // Reset encryption key on failure so isLocked() stays true
      configService.clearEncryptionKey();
      
      return res.status(400).json({ 
        error: 'Incorrect passphrase',
        message: 'The passphrase you entered does not match the one used during setup.',
        details: decryptError.message
      });
    }
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Unlock failed',
      details: error.message 
    });
  }
});

// Validate database connection
router.post('/validate-database', async (req: Request, res: Response) => {
  try {
    const { databaseUrl } = req.body;
    
    if (!databaseUrl) {
      return res.status(400).json({ error: 'Database URL is required' });
    }

    // Test the connection
    const testPool = new Pool({ 
      connectionString: databaseUrl,
      max: 1,
      connectionTimeoutMillis: 10000,
    });

    try {
      const client = await testPool.connect();
      await client.query('SELECT 1');
      client.release();
      await testPool.end();
      
      res.json({ valid: true, message: 'Database connection successful' });
    } catch (error: any) {
      await testPool.end();
      res.status(400).json({ 
        valid: false, 
        error: 'Failed to connect to database',
        details: error.message 
      });
    }
  } catch (error: any) {
    res.status(500).json({ 
      valid: false, 
      error: 'Validation failed',
      details: error.message 
    });
  }
});

// Initialize the application
router.post('/initialize', async (req: Request, res: Response) => {
  try {
    const { 
      databaseUrl, 
      encryptionPassphrase,
      sessionSecret,
      databricksHost,
      databricksToken,
      openaiApiKey,
      adminEmail,
      adminPassword,
      organizationName
    } = req.body;

    // Validate required fields
    if (!databaseUrl) {
      return res.status(400).json({ error: 'Database URL is required' });
    }

    if (!encryptionPassphrase) {
      return res.status(400).json({ error: 'Encryption passphrase is required' });
    }

    if (!adminEmail || !adminPassword) {
      return res.status(400).json({ error: 'Admin credentials are required' });
    }

    // Set encryption passphrase
    configService.setEncryptionPassphrase(encryptionPassphrase);

    // Save configuration
    configService.setDatabaseUrl(databaseUrl, true);
    
    if (sessionSecret) {
      configService.setSessionSecret(sessionSecret, true);
    }

    if (databricksHost || databricksToken) {
      configService.setDatabricksConfig({
        host: databricksHost,
        token: databricksToken
      }, true);
    }

    if (openaiApiKey) {
      configService.setOpenAIKey(openaiApiKey, true);
    }

    // Reinitialize database connection
    reinitializeDatabase();

    // Import db after reinitialization
    const { getDb } = await import('../db');
    const db = getDb();

    // Check if we need to run migrations
    const { sql } = await import('drizzle-orm');
    
    try {
      // Check if organizations table exists
      await db.execute(sql`SELECT 1 FROM organizations LIMIT 1`);
      console.log('[Bootstrap] Database tables already exist');
    } catch (error) {
      return res.status(400).json({
        error: 'Database tables not found',
        message: 'Please run database migrations first using: npm run db:push',
        requiresMigration: true
      });
    }

    // Create organization and admin user
    const schema = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');

    // Check if organization already exists
    let org = await db.query.organizations.findFirst({
      where: eq(schema.organizations.name, organizationName || 'Default Organization')
    });

    if (!org) {
      const [newOrg] = await db.insert(schema.organizations).values({
        name: organizationName || 'Default Organization'
      }).returning();
      org = newOrg;
    }

    // Check if admin user already exists
    const existingAdmin = await db.query.users.findFirst({
      where: eq(schema.users.email, adminEmail)
    });

    if (!existingAdmin) {
      const hashedPassword = await hash(adminPassword, 10);
      await db.insert(schema.users).values({
        orgId: org.id,
        email: adminEmail,
        passwordHash: hashedPassword,
        role: 'admin'
      });
    }

    // Mark setup as completed
    configService.markSetupCompleted();

    res.json({ 
      success: true, 
      message: 'Application initialized successfully',
      organizationId: org.id
    });
  } catch (error: any) {
    console.error('[Bootstrap] Initialization error:', error);
    res.status(500).json({ 
      error: 'Initialization failed',
      details: error.message 
    });
  }
});

export default router;
