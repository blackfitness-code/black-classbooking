# API Contract — Phase 2/3 (frontend → backend → Firestore)

All endpoints under `/api`. Auth = `Authorization: Bearer <accessToken>` unless marked **public**.
Error shape: `{ error: { message, code } }`. Dates returned as ISO strings (frontend already tolerates strings).
`req.user = { uid, role }` where `uid` = lineUserId (= users doc id). Roles: `user | staff | admin`.

## Data shapes (Firestore)
- **users/{lineUserId}**: role, lineUserId, displayName, pictureUrl, nickname, firstName, lastName, nationalId, phone, gender, birthDate, healthIssues, memberType ('' | 'gold' | 'platinum'), membershipExpiry (Timestamp), cooldownUntil (Timestamp|null), cooldownReason, profileCompleted, createdAt, updatedAt
- **classes/{id}**: name, type, date ("YYYY-MM-DD"), time ("HH:mm"), instructor, maxCapacity (number), currentBookings (number), [description]
- **bookings/{id}**: userId (lineUserId), classId, className, date, time, instructor, status ('confirmed'|'cancelled'|'completed'), bookedAt (Timestamp), canCancelUntil (Timestamp), cancelledAt (Timestamp)
- **checkins/{id}**: (match existing Admin.vue shape) uid, classId, bookingId, date, className, time, checkedInAt (Timestamp), checkedInBy
- **settings/classTypes**: admin-defined custom class types object

---

## USER / PUBLIC (Phase 2 reads + Phase 3 writes)

### Reads
- `GET /classes?date=YYYY-MM-DD` — list classes; optional `date` filter. → `{ classes: [...] }`
- `GET /classes/:id` — one class. → `{ class: {...} }` (404 if missing)
- `GET /bookings/me` — current user's bookings (all statuses). → `{ bookings: [...] }`
- `GET /members/:id/card` — **public**. Returns ONLY safe fields: `{ card: { lineUserId, displayName, fullName, pictureUrl, membershipExpiry, memberType } }`. Never phone/nationalId/healthIssues. 404 if missing.

### Writes
- `POST /bookings` body `{ classId }` — server validates ALL of:
  membership valid (membershipExpiry > now) · not in cooldown (cooldownUntil <= now or null) · memberType !== 'gold' · class exists · currentBookings < maxCapacity · no existing CONFIRMED booking by this user for same classId+date · time window: (classDateTime - now) > 30 min AND <= 14 days.
  Then **transaction**: re-check capacity, create booking (status confirmed, bookedAt now, canCancelUntil = classDateTime), increment class.currentBookings. → `{ booking, currentBookings }`. On rule fail throw ApiError 4xx with a clear `code` (e.g. CLASS_FULL, ALREADY_BOOKED, MEMBERSHIP_EXPIRED, IN_COOLDOWN, GOLD_NOT_ALLOWED, BOOKING_WINDOW_CLOSED).
- `DELETE /bookings/:id` — server validates: booking exists, `booking.userId === req.user.uid`, status==='confirmed', (classDateTime - now) > 5 hours. Then **transaction**: set status 'cancelled' + cancelledAt, decrement class.currentBookings (floor 0). → `{ ok: true }`. Fail codes: NOT_OWNER, NOT_CONFIRMED, CANCEL_WINDOW_CLOSED.

## CHECK-IN
- `POST /checkins` (staff|admin) body `{ uid, classId, bookingId, date }` (from QR) — validate booking/class exist; dedupe (one check-in per bookingId). Create checkin (match Admin.vue field shape, checkedInBy = req.user.uid). → `{ checkin }`. Dedup → 409 ALREADY_CHECKED_IN.
- `GET /admin/checkins` (staff|admin) → `{ checkins: [...] }`
- `DELETE /admin/checkins/:id` (staff|admin) → `{ ok:true }`

---

## ADMIN (role: admin unless noted)

### Reads (staff|admin)
- `GET /admin/users` → `{ users: [...] }`
- `GET /admin/classes` → `{ classes: [...] }` (or reuse GET /classes)
- `GET /admin/bookings` → `{ bookings: [...] }`
- `GET /admin/class-types` → `{ classTypes: {...} }`

### Class CRUD (admin)
- `POST /admin/classes` body {name,type,date,time,instructor,maxCapacity} → creates (currentBookings:0). → `{ class }`
- `PUT /admin/classes/:id` body partial → `{ class }`
- `DELETE /admin/classes/:id` → `{ ok:true }`

### User management (admin)
- `PUT /admin/users/:id` body {nickname,firstName,lastName,nationalId,phone,gender,birthDate,healthIssues} → `{ user }`
- `PUT /admin/users/:id/role` body {role} → `{ user }`
- `PUT /admin/users/:id/membership` body {membershipExpiry: "YYYY-MM-DD"} → `{ user }`
- `PUT /admin/users/:id/member-type` body {memberType} → `{ user }`
- `PUT /admin/users/:id/cooldown` body {cooldownUntil:"YYYY-MM-DD"|null, cooldownReason} → set or clear → `{ user }`
- `DELETE /admin/users/:id` → `{ ok:true }`
- `POST /admin/users/import` body {users:[...]} → bulk upsert (merge). → `{ created, updated }`

### Admin booking ops (admin)
- `POST /admin/bookings` body {classId, userId} — admin books on behalf; transaction increment. → `{ booking, currentBookings }`
- `PUT /admin/bookings/:id` body {status} — change status; if cancelling a confirmed one, decrement class. → `{ booking }`

### Settings (admin)
- `PUT /admin/class-types` body {classTypes} → writes settings/classTypes → `{ classTypes }`
