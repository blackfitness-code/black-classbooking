/**
 * crm.js — CRM phone lookup สำหรับ prefill ตอนลงทะเบียน
 *
 * ที่มาข้อมูล (priority):
 *   1. Cloud Storage object  gs://<CRM_BUCKET>/crm/all_crm_data.csv  (อัปเดตผ่าน Admin)
 *   2. ไฟล์ committed ใน repo backend/crm-data/all_crm_data.csv      (fallback)
 *
 * cache ในหน่วยความจำ TTL 10 นาที — instance อื่นจะเห็นข้อมูลใหม่ภายใน TTL
 * ส่วน instance ที่อัปโหลดเองจะ refresh cache ทันที
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { parse } from 'csv-parse/sync';

import { admin } from '../config/firebase.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCAL_PATH = resolve(__dirname, '../../crm-data/all_crm_data.csv');

const BUCKET =
  process.env.CRM_BUCKET ||
  (process.env.FIREBASE_PROJECT_ID ? `${process.env.FIREBASE_PROJECT_ID}-crm-data` : null);
const OBJECT = 'crm/all_crm_data.csv';

const CACHE_TTL_MS = 10 * 60 * 1000;

// phone (digits only) → row object
let crmMap = new Map();
let cacheAt = 0;
let inflight = null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizePhone(raw) {
  return String(raw ?? '').replace(/\D/g, '');
}

function csvQuote(v) {
  const s = String(v ?? '');
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** parse raw export (มี metadata 2 บรรทัดก่อน header "Member type") */
function parseExport(text) {
  const lines = text.split(/\r?\n/);
  const idx = lines.findIndex((l) => l.includes('Member type'));
  if (idx === -1) return { fields: [], rows: [] };
  const body = lines.slice(idx).join('\n');
  const rows = parse(body, {
    columns: true,
    bom: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  });
  return { fields: rows.length ? Object.keys(rows[0]) : [], rows };
}

/** parse merged csv (header เดียว สะอาดแล้ว) → phone map */
function buildMapFromText(text) {
  const rows = parse(text, {
    columns: true,
    bom: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });
  const map = new Map();
  for (const row of rows) {
    const phone = normalizePhone(row['Phone number']);
    if (phone) map.set(phone, row);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Merge — รวมไฟล์ export หลายสาขา (dedup เบอร์, ไฟล์หลังเขียนทับ)
// ---------------------------------------------------------------------------
export function mergeCrmCsvs(texts) {
  const map = new Map();
  const fields = [];

  for (const text of texts) {
    const { fields: f, rows } = parseExport(text);
    for (const name of f) if (!fields.includes(name)) fields.push(name);
    for (const row of rows) {
      const phone = normalizePhone(row['Phone number']);
      if (phone) map.set(phone, row);
    }
  }

  const header = fields.map(csvQuote).join(',');
  const body = [...map.values()]
    .map((r) => fields.map((h) => csvQuote(r[h])).join(','))
    .join('\n');
  const csv = `${header}\n${body}\n`;

  return { csv, count: map.size };
}

// ---------------------------------------------------------------------------
// Cloud Storage
// ---------------------------------------------------------------------------

function getBucket() {
  if (!BUCKET) throw new Error('CRM_BUCKET not configured');
  return admin.storage().bucket(BUCKET);
}

async function downloadFromBucket() {
  if (!BUCKET) return null;
  try {
    const file = getBucket().file(OBJECT);
    const [exists] = await file.exists();
    if (!exists) return null;
    const [buf] = await file.download();
    return buf.toString('utf8');
  } catch (err) {
    console.warn(`[CRM] bucket download failed: ${err.message}`);
    return null;
  }
}

async function uploadToBucket(text) {
  await getBucket()
    .file(OBJECT)
    .save(Buffer.from(text, 'utf8'), {
      contentType: 'text/csv; charset=utf-8',
      resumable: false,
    });
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

async function build() {
  let text = await downloadFromBucket();
  let source = 'bucket';
  if (!text) {
    try {
      text = readFileSync(LOCAL_PATH, 'utf8');
      source = 'local file';
    } catch {
      console.warn('[CRM] no bucket object and no local file — empty dataset');
      return new Map();
    }
  }
  const map = buildMapFromText(text);
  console.log(`[CRM] loaded ${map.size} records from ${source}`);
  return map;
}

async function getCrmMap() {
  if (crmMap.size && Date.now() - cacheAt < CACHE_TTL_MS) return crmMap;

  if (!inflight) {
    inflight = build()
      .then((map) => {
        crmMap = map;
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
    console.warn(`[CRM] build failed: ${err.message}`);
    return crmMap;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * merge ไฟล์ export แล้ว publish ขึ้น bucket + refresh cache ทันที
 * @param {string[]} texts  เนื้อหา CSV ของแต่ละสาขา
 * @returns {Promise<{ count: number }>}
 */
export async function publishCrm(texts) {
  const { csv, count } = mergeCrmCsvs(texts);
  const withBom = `﻿${csv}`;
  await uploadToBucket(withBom);

  // อัปเดต cache ของ instance นี้ทันที (instance อื่นรอ TTL)
  crmMap = buildMapFromText(withBom);
  cacheAt = Date.now();

  return { count };
}

export async function lookupByPhone(rawPhone) {
  const map = await getCrmMap();
  const row = map.get(normalizePhone(rawPhone));
  if (!row) return null;

  return {
    firstName:   row['First name']?.trim()                  ?? null,
    lastName:    row['Last name']?.trim()                   ?? null,
    phone:       row['Phone number']?.trim()                ?? null,
    email:       (() => { const v = (row['Email'] ?? row['อีเมล'] ?? row['E-Mail'])?.trim(); return v && v !== '-' ? v : null; })(),
    dob:         row['Date of Birth (dd-mm-yyyy)']?.trim()  ?? null,
    gender:      row['Gender']?.trim()                      ?? null,
    nickname:    row['ชื่อเล่น']?.trim()                   ?? null,
    nationalId:  (row['หมายเลขบัตรประชาชน'] ?? '').trim() || null,
    branch:      row['Branch']?.trim()                      ?? null,
  };
}
