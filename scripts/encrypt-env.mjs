#!/usr/bin/env node

/**
 * Script to encrypt your API key
 * Usage: node scripts/encrypt-env.js
 * 
 * This script will:
 * 1. Read your GROQ_API_KEY from .env.local
 * 2. Encrypt it
 * 3. Show you the encrypted value to use
 * 4. Show you the ENCRYPTION_KEY to store securely
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

// Extract GROQ_API_KEY
const apiKeyMatch = envContent.match(/GROQ_API_KEY=(.+)/);
const plainApiKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;

if (!plainApiKey) {
    console.error('❌ GROQ_API_KEY not found in .env.local');
    process.exit(1);
}

// Generate encryption key (32 bytes for AES-256)
const encryptionKey = crypto.randomBytes(32).toString('hex');

// Encrypt the API key
function encryptValue(value, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        Buffer.from(key, 'hex'),
        iv
    );

    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
}

const encryptedApiKey = encryptValue(plainApiKey, encryptionKey);

console.log('\n✅ Encryption Complete!\n');
console.log('📋 Update your .env.local with:\n');
console.log('ENCRYPTION_KEY=' + encryptionKey);
console.log('GROQ_API_KEY_ENCRYPTED=' + encryptedApiKey);
console.log('\nℹ️ For Vercel deployment, add ENCRYPTION_KEY to secrets in Vercel dashboard\n');
