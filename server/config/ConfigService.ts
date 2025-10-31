import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface RuntimeConfig {
  database?: {
    url: string;
    encrypted: boolean;
  };
  databricks?: {
    host?: string;
    token?: string;
    encrypted: boolean;
  };
  openai?: {
    apiKey?: string;
    encrypted: boolean;
  };
  session?: {
    secret?: string;
    encrypted: boolean;
  };
  setupCompleted: boolean;
  encryptionSalt?: string;
}

const CONFIG_DIR = join(process.cwd(), 'server', 'runtime');
const CONFIG_FILE = join(CONFIG_DIR, 'runtime-config.json');
const ALGORITHM = 'aes-256-gcm';

class ConfigService {
  private config: RuntimeConfig | null = null;
  private encryptionKey: Buffer | null = null;

  constructor() {
    this.ensureConfigDir();
    this.loadConfig();
    this.initializeEncryptionKey();
  }

  private initializeEncryptionKey(): void {
    // Check if encryption passphrase is in environment
    const passphrase = process.env.ENCRYPTION_PASSPHRASE;
    if (passphrase && this.config?.encryptionSalt) {
      this.encryptionKey = this.deriveKey(passphrase, this.config.encryptionSalt);
      console.log('[ConfigService] Encryption key initialized from environment');
    } else if (this.config?.setupCompleted) {
      console.warn('[ConfigService] WARNING: Setup completed but ENCRYPTION_PASSPHRASE not set!');
      console.warn('[ConfigService] Encrypted secrets cannot be decrypted. Please set ENCRYPTION_PASSPHRASE environment variable.');
    }
  }

  private ensureConfigDir(): void {
    if (!existsSync(CONFIG_DIR)) {
      mkdirSync(CONFIG_DIR, { recursive: true });
    }
  }

  private loadConfig(): void {
    try {
      if (existsSync(CONFIG_FILE)) {
        const data = readFileSync(CONFIG_FILE, 'utf8');
        this.config = JSON.parse(data);
        console.log('[ConfigService] Runtime configuration loaded');
      } else {
        console.log('[ConfigService] No runtime configuration found - setup required');
        this.config = {
          setupCompleted: false,
          encryptionSalt: randomBytes(16).toString('hex')
        };
        this.saveConfig();
      }
    } catch (error) {
      console.error('[ConfigService] Error loading configuration:', error);
      this.config = {
        setupCompleted: false,
        encryptionSalt: randomBytes(16).toString('hex')
      };
    }
  }

  private saveConfig(): void {
    try {
      writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2));
      console.log('[ConfigService] Configuration saved');
    } catch (error) {
      console.error('[ConfigService] Error saving configuration:', error);
      throw error;
    }
  }

  private deriveKey(passphrase: string, salt: string): Buffer {
    return scryptSync(passphrase, salt, 32);
  }

  private encrypt(text: string, key: Buffer): { encrypted: string; iv: string; authTag: string } {
    const iv = randomBytes(16);
    const cipher = createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: cipher.getAuthTag().toString('hex')
    };
  }

  private decrypt(encrypted: string, iv: string, authTag: string, key: Buffer): string {
    const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  public setEncryptionPassphrase(passphrase: string): void {
    if (!this.config?.encryptionSalt) {
      throw new Error('Encryption salt not initialized');
    }
    this.encryptionKey = this.deriveKey(passphrase, this.config.encryptionSalt);
  }

  public clearEncryptionKey(): void {
    this.encryptionKey = null;
  }

  public isSetupCompleted(): boolean {
    return this.config?.setupCompleted || false;
  }

  public isLocked(): boolean {
    // App is locked if setup is complete but encryption key is not available
    return this.isSetupCompleted() && !this.encryptionKey && this.config?.database?.encrypted;
  }

  public hasEncryptionKey(): boolean {
    return this.encryptionKey !== null;
  }

  public getDatabaseUrl(): string | null {
    // First check environment variable (backward compatibility)
    if (process.env.DATABASE_URL) {
      return process.env.DATABASE_URL;
    }

    // Then check runtime config
    if (!this.config?.database?.url) {
      return null;
    }

    if (this.config.database.encrypted && this.encryptionKey) {
      try {
        const parts = this.config.database.url.split(':');
        const encrypted = parts[0];
        const iv = parts[1];
        const authTag = parts[2];
        return this.decrypt(encrypted, iv, authTag, this.encryptionKey);
      } catch (error) {
        console.error('[ConfigService] Error decrypting database URL:', error);
        return null;
      }
    }

    return this.config.database.url;
  }

  public setDatabaseUrl(url: string, encrypt: boolean = true): void {
    if (!this.config) {
      this.config = { setupCompleted: false };
    }

    if (encrypt && this.encryptionKey) {
      const { encrypted, iv, authTag } = this.encrypt(url, this.encryptionKey);
      this.config.database = {
        url: `${encrypted}:${iv}:${authTag}`,
        encrypted: true
      };
    } else {
      this.config.database = {
        url,
        encrypted: false
      };
    }

    this.saveConfig();
  }

  public getSessionSecret(): string {
    // First check environment variable (backward compatibility)
    if (process.env.SESSION_SECRET) {
      return process.env.SESSION_SECRET;
    }

    // Then check runtime config
    if (!this.config?.session?.secret) {
      // Generate a default session secret for development
      return randomBytes(32).toString('hex');
    }

    if (this.config.session.encrypted && this.encryptionKey) {
      try {
        const parts = this.config.session.secret.split(':');
        const encrypted = parts[0];
        const iv = parts[1];
        const authTag = parts[2];
        return this.decrypt(encrypted, iv, authTag, this.encryptionKey);
      } catch (error) {
        console.error('[ConfigService] Error decrypting session secret:', error);
        return randomBytes(32).toString('hex');
      }
    }

    return this.config.session.secret;
  }

  public setSessionSecret(secret: string, encrypt: boolean = true): void {
    if (!this.config) {
      this.config = { setupCompleted: false };
    }

    if (encrypt && this.encryptionKey) {
      const { encrypted, iv, authTag } = this.encrypt(secret, this.encryptionKey);
      this.config.session = {
        secret: `${encrypted}:${iv}:${authTag}`,
        encrypted: true
      };
    } else {
      this.config.session = {
        secret,
        encrypted: false
      };
    }

    this.saveConfig();
  }

  public getDatabricksConfig(): { host?: string; token?: string } {
    const result: { host?: string; token?: string } = {};

    // Check environment variables first (backward compatibility)
    if (process.env.DATABRICKS_HOST) {
      result.host = process.env.DATABRICKS_HOST;
    }
    if (process.env.DATABRICKS_TOKEN) {
      result.token = process.env.DATABRICKS_TOKEN;
    }

    // Check runtime config
    if (this.config?.databricks) {
      if (this.config.databricks.encrypted && this.encryptionKey) {
        try {
          if (this.config.databricks.host) {
            const parts = this.config.databricks.host.split(':');
            result.host = this.decrypt(parts[0], parts[1], parts[2], this.encryptionKey);
          }
          if (this.config.databricks.token) {
            const parts = this.config.databricks.token.split(':');
            result.token = this.decrypt(parts[0], parts[1], parts[2], this.encryptionKey);
          }
        } catch (error) {
          console.error('[ConfigService] Error decrypting Databricks config:', error);
        }
      } else {
        if (this.config.databricks.host) result.host = this.config.databricks.host;
        if (this.config.databricks.token) result.token = this.config.databricks.token;
      }
    }

    return result;
  }

  public setDatabricksConfig(config: { host?: string; token?: string }, encrypt: boolean = true): void {
    if (!this.config) {
      this.config = { setupCompleted: false };
    }

    if (encrypt && this.encryptionKey) {
      const databricks: any = { encrypted: true };
      if (config.host) {
        const { encrypted, iv, authTag } = this.encrypt(config.host, this.encryptionKey);
        databricks.host = `${encrypted}:${iv}:${authTag}`;
      }
      if (config.token) {
        const { encrypted, iv, authTag } = this.encrypt(config.token, this.encryptionKey);
        databricks.token = `${encrypted}:${iv}:${authTag}`;
      }
      this.config.databricks = databricks;
    } else {
      this.config.databricks = {
        ...config,
        encrypted: false
      };
    }

    this.saveConfig();
  }

  public getOpenAIKey(): string | null {
    // Check environment variable first (backward compatibility)
    if (process.env.OPENAI_API_KEY) {
      return process.env.OPENAI_API_KEY;
    }

    // Check runtime config
    if (!this.config?.openai?.apiKey) {
      return null;
    }

    if (this.config.openai.encrypted && this.encryptionKey) {
      try {
        const parts = this.config.openai.apiKey.split(':');
        return this.decrypt(parts[0], parts[1], parts[2], this.encryptionKey);
      } catch (error) {
        console.error('[ConfigService] Error decrypting OpenAI key:', error);
        return null;
      }
    }

    return this.config.openai.apiKey;
  }

  public setOpenAIKey(apiKey: string, encrypt: boolean = true): void {
    if (!this.config) {
      this.config = { setupCompleted: false };
    }

    if (encrypt && this.encryptionKey) {
      const { encrypted, iv, authTag } = this.encrypt(apiKey, this.encryptionKey);
      this.config.openai = {
        apiKey: `${encrypted}:${iv}:${authTag}`,
        encrypted: true
      };
    } else {
      this.config.openai = {
        apiKey,
        encrypted: false
      };
    }

    this.saveConfig();
  }

  public markSetupCompleted(): void {
    if (!this.config) {
      this.config = { setupCompleted: false };
    }
    this.config.setupCompleted = true;
    this.saveConfig();
  }

  public getConfig(): RuntimeConfig | null {
    return this.config;
  }
}

export const configService = new ConfigService();
