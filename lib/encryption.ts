// Encryption utility for sensitive environment variables
// Uses Node.js crypto module (server-side only)

import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dev-key-256-bits-1234567890123'; // 32 chars = 256 bits

/**
 * Encrypt a string using AES-256-CBC
 */
export function encryptValue(value: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
        iv
    );

    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return IV + encrypted value
    return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt a string using AES-256-CBC
 */
export function decryptValue(encrypted: string): string {
    const [ivHex, encryptedValue] = encrypted.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
        iv
    );

    let decrypted = decipher.update(encryptedValue, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

/**
 * Get and decrypt API key from environment
 */
export function getDecryptedApiKey(): string {
    const encryptedKey = process.env.GROQ_API_KEY_ENCRYPTED;

    if (!encryptedKey) {
        // Fallback to plain key if encrypted version not available
        const plainKey = process.env.GROQ_API_KEY;
        if (!plainKey) {
            throw new Error('GROQ_API_KEY not configured');
        }
        return plainKey;
    }

    return decryptValue(encryptedKey);
}
