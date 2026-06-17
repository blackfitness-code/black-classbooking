/**
 * crm.js — Load all_crm_data.csv once at startup, expose lookupByPhone()
 *
 * Phone number is used as the unique key.
 * Returns prefill-safe fields only (no internal scoring/tier data).
 */

import { createReadStream } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { parse } from 'csv-parse';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CRM_PATH = resolve(__dirname, '../../crm-data/all_crm_data.csv');

// phone (digits only) → record
const crmMap = new Map();
let loaded = false;

function normalizePhone(raw) {
  return String(raw ?? '').replace(/\D/g, '');
}

async function loadCRM() {
  if (loaded) return;

  await new Promise((resolve, reject) => {
    createReadStream(CRM_PATH, { encoding: 'utf8' })
      .pipe(parse({ columns: true, skip_empty_lines: true, bom: true }))
      .on('data', (row) => {
        const phone = normalizePhone(row['Phone number']);
        if (phone) crmMap.set(phone, row);
      })
      .on('end', resolve)
      .on('error', reject);
  });

  loaded = true;
  console.log(`[CRM] Loaded ${crmMap.size} records from all_crm_data.csv`);
}

export async function lookupByPhone(rawPhone) {
  await loadCRM();

  const phone = normalizePhone(rawPhone);
  const row = crmMap.get(phone);
  if (!row) return null;

  return {
    firstName:   row['First name']?.trim()                   ?? null,
    lastName:    row['Last name']?.trim()                    ?? null,
    phone:       row['Phone number']?.trim()                 ?? null,
    email:       (() => { const v = (row['Email'] ?? row['อีเมล'] ?? row['E-Mail'])?.trim(); return v && v !== '-' ? v : null; })(),
    dob:         row['Date of Birth (dd-mm-yyyy)']?.trim()   ?? null,
    gender:      row['Gender']?.trim()                       ?? null,
    nickname:    row['ชื่อเล่น']?.trim()                    ?? null,
    nationalId:  (row['หมายเลขบัตรประชาชน'] ?? '').trim()  || null,
    branch:      row['Branch']?.trim()                       ?? null,
  };
}
