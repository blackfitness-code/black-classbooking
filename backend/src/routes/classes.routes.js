/**
 * classes.routes.js — Class listing endpoints
 *
 * GET /api/classes?date=YYYY-MM-DD  → { classes: [...] }
 * GET /api/classes/:id              → { class: {...} }
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listClasses, getClass } from '../services/classes.js';

const router = Router();

// ---------------------------------------------------------------------------
// GET / — list all classes (optional date filter)
// ---------------------------------------------------------------------------
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { date } = req.query;
    const classes = await listClasses({ date });
    res.json({ classes });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /:id — single class
// ---------------------------------------------------------------------------
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const cls = await getClass(req.params.id);
    res.json({ class: cls });
  } catch (err) {
    next(err);
  }
});

export default router;
