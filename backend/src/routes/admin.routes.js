/**
 * admin.routes.js — All /admin/* endpoints
 *
 * Mount at /api/admin in routes/index.js.
 *
 * Auth strategy:
 *   - requireAuth on ALL routes (applied at router level via router.use)
 *   - requireRole('staff','admin') for READS and checkin GET/DELETE
 *   - requireRole('admin') for all WRITES
 *
 * Response wrappers per API contract:
 *   GET /users           → { users }
 *   GET /classes         → { classes }
 *   GET /bookings        → { bookings }
 *   GET /class-types     → { classTypes }
 *   GET /checkins        → { checkins }
 *   POST /classes        → { class }
 *   PUT /classes/:id     → { class }
 *   DELETE /classes/:id  → { ok: true }
 *   PUT /users/:id       → { user }
 *   PUT /users/:id/role  → { user }
 *   PUT /users/:id/membership   → { user }
 *   PUT /users/:id/member-type  → { user }
 *   PUT /users/:id/cooldown     → { user }
 *   DELETE /users/:id           → { ok: true }
 *   POST /users/import          → { created, updated }
 *   POST /bookings              → { booking, currentBookings }
 *   PUT /bookings/:id           → { booking }
 *   PUT /class-types            → { classTypes }
 *   DELETE /checkins/:id        → { ok: true }
 */

import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';

import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ApiError } from '../middleware/errorHandler.js';

// Services
import { listUsers, adminUpdateProfile, setRole, setMembership, setMemberType, setCooldown, deleteUser, importUsers } from '../services/admin.users.js';
import { createClass, updateClass, deleteClass } from '../services/admin.classes.js';
import { listAllBookings, adminCreateBooking, adminUpdateBookingStatus } from '../services/admin.bookings.js';
import { getClassTypes, setClassTypes } from '../services/settings.js';
import { listCheckins, deleteCheckin } from '../services/checkins.js';
import { listClasses } from '../services/classes.js';
import { syncAllMemberships } from '../services/membership-sync.js';
import { publishCrm } from '../services/crm.js';

const router = Router();

// multipart parser สำหรับอัปโหลด CRM CSV (memory storage, สูงสุด 15MB/ไฟล์)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

// ---------------------------------------------------------------------------
// Apply requireAuth to all admin routes
// ---------------------------------------------------------------------------
router.use(requireAuth);

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const classBodySchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'time must be HH:mm'),
  instructor: z.string().min(1),
  maxCapacity: z.number().int().positive(),
  subtype: z.string().optional(),
  description: z.string().optional(),
});

const classUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.string().optional(),
  subtype: z.string().optional(),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  instructor: z.string().optional(),
  maxCapacity: z.number().int().positive().optional(),
});

const profileUpdateSchema = z.object({
  nickname: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  nationalId: z.string().optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
  birthDate: z.string().optional(),
  healthIssues: z.string().optional(),
});

const roleSchema = z.object({
  role: z.enum(['user', 'staff', 'admin']),
});

const membershipSchema = z.object({
  membershipExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'membershipExpiry must be YYYY-MM-DD'),
});

const memberTypeSchema = z.object({
  memberType: z.enum(['', 'gold', 'platinum']),
});

const cooldownSchema = z.object({
  cooldownUntil: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    z.null(),
  ]),
  cooldownReason: z.string().nullable().optional(),
});

const importSchema = z.object({
  users: z.array(
    z.object({
      lineUserId: z.string().min(1),
      nickname: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional(),
      birthDate: z.string().optional(),
      gender: z.string().optional(),
      memberType: z.enum(['', 'gold', 'platinum']).optional(),
      role: z.enum(['user', 'staff', 'admin']).optional(),
      membershipExpiry: z.string().optional(),
    }),
  ),
});

const adminBookingSchema = z.object({
  classId: z.string().min(1),
  userId: z.string().min(1),
});

const bookingStatusSchema = z.object({
  status: z.enum(['confirmed', 'cancelled', 'completed']),
});

const classTypesSchema = z.object({
  classTypes: z.record(z.unknown()),
});

// ---------------------------------------------------------------------------
// READ endpoints — staff|admin
// ---------------------------------------------------------------------------

// GET /admin/users
router.get('/users', requireRole('staff', 'admin'), async (req, res, next) => {
  try {
    const users = await listUsers();
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

// GET /admin/classes — reuses listClasses from classes service (no date filter here)
router.get('/classes', requireRole('staff', 'admin'), async (req, res, next) => {
  try {
    const classes = await listClasses();
    res.json({ classes });
  } catch (err) {
    next(err);
  }
});

// GET /admin/bookings
router.get('/bookings', requireRole('staff', 'admin'), async (req, res, next) => {
  try {
    const bookings = await listAllBookings();
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
});

// GET /admin/class-types
router.get('/class-types', requireRole('staff', 'admin'), async (req, res, next) => {
  try {
    const classTypes = await getClassTypes();
    res.json({ classTypes });
  } catch (err) {
    next(err);
  }
});

// GET /admin/checkins (staff|admin)
router.get('/checkins', requireRole('staff', 'admin'), async (req, res, next) => {
  try {
    const checkins = await listCheckins();
    res.json({ checkins });
  } catch (err) {
    next(err);
  }
});

// DELETE /admin/checkins/:id (staff|admin)
router.delete('/checkins/:id', requireRole('staff', 'admin'), async (req, res, next) => {
  try {
    const result = await deleteCheckin(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Class CRUD — admin only
// ---------------------------------------------------------------------------

// POST /admin/classes
router.post(
  '/classes',
  requireRole('admin'),
  validate(classBodySchema),
  async (req, res, next) => {
    try {
      const cls = await createClass(req.body);
      res.status(201).json({ class: cls });
    } catch (err) {
      next(err);
    }
  },
);

// PUT /admin/classes/:id
router.put(
  '/classes/:id',
  requireRole('admin'),
  validate(classUpdateSchema),
  async (req, res, next) => {
    try {
      const cls = await updateClass(req.params.id, req.body);
      res.json({ class: cls });
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /admin/classes/:id
router.delete('/classes/:id', requireRole('admin'), async (req, res, next) => {
  try {
    const result = await deleteClass(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// User management — admin only
// ---------------------------------------------------------------------------

// POST /admin/users/import  (must be BEFORE /:id routes to avoid param conflict)
router.post(
  '/users/import',
  requireRole('admin'),
  validate(importSchema),
  async (req, res, next) => {
    try {
      const { created, updated } = await importUsers(req.body.users);
      res.json({ created, updated });
    } catch (err) {
      next(err);
    }
  },
);

// PUT /admin/users/:id
router.put(
  '/users/:id',
  requireRole('admin'),
  validate(profileUpdateSchema),
  async (req, res, next) => {
    try {
      const user = await adminUpdateProfile(req.params.id, req.body);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  },
);

// PUT /admin/users/:id/role
router.put(
  '/users/:id/role',
  requireRole('admin'),
  validate(roleSchema),
  async (req, res, next) => {
    try {
      const user = await setRole(req.params.id, req.body.role);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  },
);

// PUT /admin/users/:id/membership  (staff ปรับวันหมดอายุได้ด้วย)
router.put(
  '/users/:id/membership',
  requireRole('staff', 'admin'),
  validate(membershipSchema),
  async (req, res, next) => {
    try {
      const user = await setMembership(req.params.id, req.body.membershipExpiry);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  },
);

// PUT /admin/users/:id/member-type  (staff ปรับประเภทแพ็คเกจได้ด้วย)
router.put(
  '/users/:id/member-type',
  requireRole('staff', 'admin'),
  validate(memberTypeSchema),
  async (req, res, next) => {
    try {
      const user = await setMemberType(req.params.id, req.body.memberType);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  },
);

// PUT /admin/users/:id/cooldown
router.put(
  '/users/:id/cooldown',
  requireRole('admin'),
  validate(cooldownSchema),
  async (req, res, next) => {
    try {
      const user = await setCooldown(req.params.id, req.body);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /admin/users/:id
router.delete('/users/:id', requireRole('admin'), async (req, res, next) => {
  try {
    const result = await deleteUser(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Admin booking ops — admin only
// ---------------------------------------------------------------------------

// POST /admin/bookings
router.post(
  '/bookings',
  requireRole('admin'),
  validate(adminBookingSchema),
  async (req, res, next) => {
    try {
      const { booking, currentBookings } = await adminCreateBooking(req.body);
      res.status(201).json({ booking, currentBookings });
    } catch (err) {
      next(err);
    }
  },
);

// PUT /admin/bookings/:id
router.put(
  '/bookings/:id',
  requireRole('admin'),
  validate(bookingStatusSchema),
  async (req, res, next) => {
    try {
      const booking = await adminUpdateBookingStatus(req.params.id, req.body.status);
      res.json({ booking });
    } catch (err) {
      next(err);
    }
  },
);

// ---------------------------------------------------------------------------
// Membership sync — admin only
// GET  /admin/memberships/sync/preview → ดูก่อนว่าจะแก้ใคร/อะไร (ไม่เขียน)
// POST /admin/memberships/sync         → แก้จริง
// ---------------------------------------------------------------------------
router.get('/memberships/sync/preview', requireRole('admin'), async (req, res, next) => {
  try {
    const result = await syncAllMemberships({ dry: true });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/memberships/sync', requireRole('admin'), async (req, res, next) => {
  try {
    const result = await syncAllMemberships({ dry: false });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// CRM upload — admin only
// POST /admin/crm/upload  (multipart: files[] = CSV export แต่ละสาขา)
//   → merge + publish ขึ้น Cloud Storage → { count, files }
// ---------------------------------------------------------------------------
router.post('/crm/upload', requireRole('admin'), upload.array('files', 5), async (req, res, next) => {
  try {
    if (!req.files || req.files.length < 1) {
      throw new ApiError(400, 'ต้องอัปโหลดอย่างน้อย 1 ไฟล์', 'NO_FILES');
    }
    const texts = req.files.map((f) => f.buffer.toString('utf8'));
    const { count } = await publishCrm(texts);
    res.json({ count, files: req.files.length });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Settings — admin only
// ---------------------------------------------------------------------------

// PUT /admin/class-types
router.put(
  '/class-types',
  requireRole('admin'),
  validate(classTypesSchema),
  async (req, res, next) => {
    try {
      const classTypes = await setClassTypes(req.body.classTypes);
      res.json({ classTypes });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
