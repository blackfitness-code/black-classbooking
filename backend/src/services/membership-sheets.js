/**
 * membership-sheets.js
 *
 * ดึงข้อมูลแพ็กเกจสมาชิกจาก Google Sheets 2 อัน (published CSV) แล้ว match
 * ด้วย ชื่อเล่น (NICKNAME) + ชื่อจริง (NAME) เพื่อหา memberType + วันหมดอายุ
 *
 * Sheets columns ที่ใช้: NICKNAME, NAME, END (dd/mm/yyyy), PACKAGE
 *
 * Package → memberType mapping:
 *   all day / allday / platinum            → 'platinum'  (จองคลาสได้)
 *   silver / afternoon / morning / gold    → 'gold'      (จองคลาสไม่ได้)
 *   อื่น ๆ (crm, ตัวเลข, ว่าง)              → null        (ข้าม)
 *
 * ผลลัพธ์ cache ในหน่วยความจำ TTL 10 นาที — refresh อัตโนมัติเมื่อหมดอายุ
 */

import { parse } from 'csv-parse/sync';

const SHEET_URLS = (process.env.MEMBERSHIP_SHEET_URLS
  ? process.env.MEMBERSHIP_SHEET_URLS.split(',').map((s) => s.trim()).filter(Boolean)
  : [
      'https://docs.google.com/spreadsheets/d/1OwBZJMfS6jJpc-VJ1PaciXG9kMYva_V0xMN5FzSlX9U/export?format=csv&gid=0',
      'https://docs.google.com/spreadsheets/d/1kcDdPKPTYVHO_uWuTEfqmw5QH-okYflzvJw1AeZAbjI/export?format=csv&gid=0',
    ]);

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 นาที

// key (normalized "nickname|name") → { memberType, expiry: Date, rawPackage }
let cache = null;
let cacheAt = 0;
let inflight = null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeName(s) {
  return String(s ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function makeKey(nickname, name) {
  return `${normalizeName(nickname)}|${normalizeName(name)}`;
}

/** package text → 'platinum' | 'gold' | null */
export function packageToMemberType(pkg) {
  const p = normalizeName(pkg);
  if (!p) return null;
  if (p.includes('all day') || p.includes('allday') || p.includes('platinum')) return 'platinum';
  if (p.includes('silver') || p.includes('afternoon') || p.includes('morning') || p.includes('gold')) return 'gold';
  return null;
}

/** "dd/mm/yyyy" → Date | null */
function parseSheetDate(val) {
  const m = String(val ?? '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const [, d, mo, y] = m;
  // UTC midnight — deterministic ไม่ขึ้นกับ timezone ของ server (Cloud Run = UTC)
  // และตรงกับ convention เดิมของ admin ที่ใช้ "YYYY-MM-DD"
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

// ---------------------------------------------------------------------------
// Fetch + parse
// ---------------------------------------------------------------------------

async function fetchSheet(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`sheet fetch failed: ${res.status} ${url}`);
  const text = await res.text();

  const rows = parse(text, {
    columns: true,
    bom: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  });
  return rows;
}

async function buildCache() {
  const map = new Map();

  for (const url of SHEET_URLS) {
    let rows;
    try {
      rows = await fetchSheet(url);
    } catch (err) {
      console.warn(`[membership-sheets] ${err.message}`);
      continue; // sheet หนึ่งล่ม ก็ใช้อีกอันต่อได้
    }

    for (const row of rows) {
      const nickname = row.NICKNAME ?? '';
      const name = row.NAME ?? '';
      if (!nickname && !name) continue;

      const memberType = packageToMemberType(row.PACKAGE);
      const expiry = parseSheetDate(row.END);
      if (!memberType || !expiry) continue;

      const key = makeKey(nickname, name);
      const existing = map.get(key);
      // เก็บ row ที่วันหมดอายุไกลสุด (แพ็กเกจล่าสุดของคน ๆ นั้น)
      if (!existing || expiry > existing.expiry) {
        map.set(key, { memberType, expiry, rawPackage: String(row.PACKAGE ?? '').trim() });
      }
    }
  }

  console.log(`[membership-sheets] cache built: ${map.size} members`);
  return map;
}

async function getCache() {
  const fresh = cache && Date.now() - cacheAt < CACHE_TTL_MS;
  if (fresh) return cache;

  // กัน fetch ซ้อนหลาย request พร้อมกัน
  if (!inflight) {
    inflight = buildCache()
      .then((map) => {
        cache = map;
        cacheAt = Date.now();
        return map;
      })
      .finally(() => {
        inflight = null;
      });
  }

  try {
    return await inflight;
  } catch (err) {
    console.warn(`[membership-sheets] build failed: ${err.message}`);
    return cache ?? new Map(); // ใช้ cache เก่าถ้ามี ไม่งั้น map ว่าง
  }
}

/** บังคับ rebuild cache ทันที (ข้าม TTL) — ใช้ตอน admin sync */
export async function refreshCache() {
  cache = await buildCache();
  cacheAt = Date.now();
  return cache;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * หา membership จากชื่อเล่น + ชื่อจริง
 * @returns {Promise<{ memberType: 'gold'|'platinum', membershipExpiry: Date, rawPackage: string } | null>}
 */
export async function lookupMembership(nickname, name) {
  if (!nickname && !name) return null;

  const map = await getCache();
  const hit = map.get(makeKey(nickname, name));
  if (!hit) return null;

  return {
    memberType: hit.memberType,
    membershipExpiry: hit.expiry,
    rawPackage: hit.rawPackage,
  };
}
