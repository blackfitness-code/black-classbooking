/**
 * env.js — โหลด .env และ validate ค่า config ทั้งหมดด้วย zod
 * ถ้า validate ไม่ผ่านใน production → exit(1)
 *
 * Load order (dotenv-flow style — earlier = more specific = wins):
 *   1. .env.<NODE_ENV>.local
 *   2. .env.<NODE_ENV>
 *   3. .env.local
 *   4. .env
 * NODE_ENV must be set BEFORE this module loads (e.g. via cross-env in npm scripts).
 */

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// backend root is two levels up from backend/src/config/
const BACKEND_ROOT = path.resolve(__dirname, '../../');

// Determine NODE_ENV before loading any file (chicken-egg: can't read it from files)
const NODE_ENV = process.env.NODE_ENV || 'development';

const { config: dotenvConfig } = await import('dotenv');

// Load env files in priority order; dotenv skips vars already set (no override)
const envFileCandidates = [
  `.env.${NODE_ENV}.local`,
  `.env.${NODE_ENV}`,
  `.env.local`,
  `.env`,
];

const loadedFiles = [];
for (const filename of envFileCandidates) {
  const filePath = path.resolve(BACKEND_ROOT, filename);
  if (fs.existsSync(filePath)) {
    dotenvConfig({ path: filePath }); // does NOT override already-set vars
    loadedFiles.push(filename);
  }
}

console.log(`[env] NODE_ENV=${NODE_ENV} (loaded: ${loadedFiles.length ? loadedFiles.join(', ') : 'none'})`);

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  PORT: z
    .string()
    .default('8080')
    .transform((v) => Number(v))
    .pipe(z.number().int().positive()),

  CORS_ORIGIN: z.string().default('*'),

  // JWT_SECRET: required in production, optional otherwise (dev uses a fallback warning)
  JWT_SECRET: z.string().optional(),

  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('30d'),

  // TODO Phase 1: LINE OAuth
  LINE_CHANNEL_ID: z.string().optional(),

  // Firebase — ทุกอย่าง optional; firebase.js จัดการ credential resolution เอง
  FIREBASE_PROJECT_ID: z.string().optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  FIREBASE_SERVICE_ACCOUNT: z.string().optional(), // JSON string ของ service account key
});

let parsed;
try {
  parsed = envSchema.parse(process.env);
} catch (err) {
  console.error('[env] Configuration validation failed:');
  if (err.errors) {
    err.errors.forEach((e) => {
      console.error(`  • ${e.path.join('.')}: ${e.message}`);
    });
  }
  process.exit(1);
}

// Production safety checks
const isProd = parsed.NODE_ENV === 'production';

if (isProd && !parsed.JWT_SECRET) {
  console.error('[env] JWT_SECRET is required in production. Set it in your environment.');
  process.exit(1);
}

if (!parsed.JWT_SECRET) {
  console.warn('[env] WARNING: JWT_SECRET not set — using insecure dev fallback. Do NOT use in production.');
  parsed.JWT_SECRET = 'dev-insecure-fallback-secret-change-me';
}

export const env = Object.freeze(parsed);
export { isProd };
