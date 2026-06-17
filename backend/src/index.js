/**
 * index.js — entrypoint
 * โหลด app และ start HTTP server
 */

import app from './app.js';
import { env } from './config/env.js';

// ---------------------------------------------------------------------------
// Unhandled error safety net
// ---------------------------------------------------------------------------
process.on('unhandledRejection', (reason, promise) => {
  console.error('[process] Unhandled Promise Rejection at:', promise, 'reason:', reason);
  // ใน production อาจต้องการ exit และให้ process manager restart
  // process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('[process] Uncaught Exception:', err);
  // uncaughtException ไม่ safe ที่จะ continue — exit เสมอ
  process.exit(1);
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
const server = app.listen(env.PORT, () => {
  console.log(`[server] Running in ${env.NODE_ENV} mode`);
  console.log(`[server] Listening at http://localhost:${env.PORT}`);
  console.log(`[server] Health check: http://localhost:${env.PORT}/api/health`);
});

export default server;
