import crypto from 'crypto';

// Note: In production, this key must be a 32-byte string stored securely in an environment variable.
// We provide a fallback for development ONLY.
const getSecretKey = () => {
  if (process.env.ENCRYPTION_KEY) {
    // Ensure it's exactly 32 bytes
    if (process.env.ENCRYPTION_KEY.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be exactly 32 characters long');
    }
    return Buffer.from(process.env.ENCRYPTION_KEY, 'utf-8');
  }
  
  console.warn("WARNING: Using ephemeral encryption key. Keys will be lost on restart.");
  return crypto.createHash('sha256').update('dev-ephemeral-key').digest();
};

const ENCRYPTION_KEY = getSecretKey();
const ALGORITHM = 'aes-256-gcm';

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Return format: iv:authTag:encryptedText
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedData: string): string {
  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encryptedText = parts[2];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
