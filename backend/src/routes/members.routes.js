/**
 * members.routes.js — Public member card endpoint
 *
 * GET /api/members/:id/card  — PUBLIC (no auth required)
 *   → { card: { lineUserId, displayName, fullName, pictureUrl, membershipExpiry, memberType } }
 *   Never exposes: phone, nationalId, healthIssues, role, etc.
 */

import { Router } from 'express';
import { getPublicCard } from '../services/members.js';

const router = Router();

// ---------------------------------------------------------------------------
// GET /:id/card — public member card (no requireAuth)
// ---------------------------------------------------------------------------
router.get('/:id/card', async (req, res, next) => {
  try {
    const card = await getPublicCard(req.params.id);
    res.json({ card });
  } catch (err) {
    next(err);
  }
});

export default router;
