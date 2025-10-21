import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

// Get encryption key from environment or generate a default one
// In production, this should be a strong secret stored in environment variables
const getEncryptionKey = (): Buffer => {
  const secret = process.env.ENCRYPTION_SECRET || 'default-encryption-key-change-in-production';
  return crypto.scryptSync(secret, 'salt', KEY_LENGTH);
};

export function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  // Return: iv + tag + encrypted (all hex-encoded)
  return iv.toString('hex') + tag.toString('hex') + encrypted;
}

export function decrypt(encryptedData: string): string {
  const key = getEncryptionKey();
  
  // Parse: iv + tag + encrypted
  const iv = Buffer.from(encryptedData.slice(0, IV_LENGTH * 2), 'hex');
  const tag = Buffer.from(encryptedData.slice(IV_LENGTH * 2, (IV_LENGTH + TAG_LENGTH) * 2), 'hex');
  const encrypted = encryptedData.slice((IV_LENGTH + TAG_LENGTH) * 2);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
