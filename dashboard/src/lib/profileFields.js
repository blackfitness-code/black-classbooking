const GENDER_LABELS = {
  male: 'ชาย',
  female: 'หญิง',
  other: 'อื่น ๆ',
}

function formatDate(isoStr) {
  if (!isoStr) return ''
  try {
    return new Date(isoStr).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return isoStr.slice(0, 10)
  }
}

function formatDateTime(isoStr) {
  if (!isoStr) return ''
  try {
    return new Date(isoStr).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return isoStr
  }
}

function boolLabel(val) {
  if (val === true) return 'ยอมรับ'
  if (val === false) return 'ไม่ยอมรับ'
  return ''
}

/**
 * รายการฟิลด์โปรไฟล์สำหรับแสดงใน dashboard
 * @param {object} user
 * @returns {Array<{ key: string, label: string, value: string }>}
 */
export function getProfileFields(user) {
  if (!user) return []

  const ec = user.emergencyContact

  return [
    { key: 'displayName', label: 'ชื่อ LINE', value: user.displayName || '' },
    { key: 'lineUserId', label: 'LINE User ID', value: user.lineUserId || user.id || '' },
    { key: 'nickname', label: 'ชื่อเล่น', value: user.nickname || '' },
    { key: 'firstName', label: 'ชื่อจริง', value: user.firstName || '' },
    { key: 'lastName', label: 'นามสกุล', value: user.lastName || '' },
    { key: 'nationalId', label: 'เลขบัตรประชาชน', value: user.nationalId || '' },
    { key: 'phone', label: 'เบอร์โทรศัพท์', value: user.phone || '' },
    { key: 'birthDate', label: 'วันเกิด', value: user.birthDate ? formatDate(user.birthDate) : '' },
    { key: 'gender', label: 'เพศ', value: GENDER_LABELS[user.gender] || user.gender || '' },
    { key: 'healthIssues', label: 'ปัญหาสุขภาพ', value: user.healthIssues || '' },
    { key: 'ecName', label: 'ผู้ติดต่อฉุกเฉิน — ชื่อ', value: ec?.name || '' },
    { key: 'ecPhone', label: 'ผู้ติดต่อฉุกเฉิน — เบอร์', value: ec?.phone || '' },
    { key: 'ecRelationship', label: 'ผู้ติดต่อฉุกเฉิน — ความสัมพันธ์', value: ec?.relationship || '' },
    { key: 'acceptTerms', label: 'ยอมรับข้อกำหนด', value: boolLabel(user.acceptTerms) },
    { key: 'acceptRisk', label: 'ยอมรับความเสี่ยง', value: boolLabel(user.acceptRisk) },
    {
      key: 'profileCompletedAt',
      label: 'กรอกข้อมูลครบเมื่อ',
      value: formatDateTime(user.profileCompletedAt || user.updatedAt),
    },
  ]
}

export function displayName(user) {
  return user?.nickname || user?.displayName || user?.firstName || user?.lineUserId || '—'
}

export function completionTime(user) {
  return user?.profileCompletedAt || user?.updatedAt || user?.createdAt
}

export function relativeTime(isoStr) {
  if (!isoStr) return '—'
  const diff = Date.now() - new Date(isoStr).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s} วินาทีที่แล้ว`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} นาทีที่แล้ว`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ชั่วโมงที่แล้ว`
  const d = Math.floor(h / 24)
  return `${d} วันที่แล้ว`
}
