/**
 * firebase.js — initialize firebase-admin ครั้งเดียว (guard re-init)
 *
 * Credential resolution order:
 *   1. FIREBASE_SERVICE_ACCOUNT env (JSON string) → cert()
 *   2. GOOGLE_APPLICATION_CREDENTIALS env → applicationDefault()
 *   3. local backend/serviceAccount.json (ถ้ามี) → cert()
 *   4. applicationDefault() fallback + warn
 *
 * ใน dev ถ้าไม่มี credential จะ warn แทน crash
 */

import admin from 'firebase-admin';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_SA_PATH = path.resolve(__dirname, '../../serviceAccount.json');

// Guard: อย่า init ซ้ำ
if (!admin.apps.length) {
  let credential;
  let credSource = '';

  try {
    // 1. FIREBASE_SERVICE_ACCOUNT env (JSON string)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      credential = admin.credential.cert(serviceAccount);
      credSource = 'FIREBASE_SERVICE_ACCOUNT env (JSON)';

    // 2. GOOGLE_APPLICATION_CREDENTIALS → applicationDefault handles it
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      credential = admin.credential.applicationDefault();
      credSource = 'GOOGLE_APPLICATION_CREDENTIALS env';

    // 3. local serviceAccount.json
    } else if (fs.existsSync(LOCAL_SA_PATH)) {
      const require = createRequire(import.meta.url);
      const serviceAccount = JSON.parse(fs.readFileSync(LOCAL_SA_PATH, 'utf8'));
      credential = admin.credential.cert(serviceAccount);
      credSource = `local file: ${LOCAL_SA_PATH}`;

    // 4. fallback — applicationDefault (works in Cloud Run / GCE)
    } else {
      credential = admin.credential.applicationDefault();
      credSource = 'applicationDefault() fallback';
      console.warn(
        '[firebase] No explicit credentials found — falling back to applicationDefault().\n' +
        '           This works in Cloud Run/GCF with a service account attached.\n' +
        '           For local dev, set FIREBASE_SERVICE_ACCOUNT or add backend/serviceAccount.json.'
      );
    }

    const appOptions = { credential };
    if (process.env.FIREBASE_PROJECT_ID) {
      appOptions.projectId = process.env.FIREBASE_PROJECT_ID;
    }

    admin.initializeApp(appOptions);
    console.log(`[firebase] Initialized with: ${credSource}`);

  } catch (err) {
    // ใน dev ให้ warn แทน crash; production ควร fail ชัดเจน
    if (process.env.NODE_ENV === 'production') {
      console.error('[firebase] FATAL: Could not initialize Firebase Admin SDK:', err.message);
      process.exit(1);
    } else {
      console.warn('[firebase] Could not initialize Firebase Admin SDK (dev mode — continuing):', err.message);
    }
  }
}

export { admin };

// db และ auth — safe to export even if init failed (will throw lazily on use)
export const db = admin.apps.length ? admin.firestore() : null;
export const auth = admin.apps.length ? admin.auth() : null;
