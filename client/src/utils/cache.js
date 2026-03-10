// Cache utility for reducing Firestore reads
const CACHE_DURATION = 5 * 60 * 1000 // 5 นาที

export const getCachedData = (key) => {
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return null
    
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(key)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error reading cache:', error)
    return null
  }
}

export const setCachedData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }))
  } catch (error) {
    console.error('Error setting cache:', error)
  }
}

export const clearCache = (key) => {
  try {
    if (key) {
      localStorage.removeItem(key)
    } else {
      // Clear all cache keys
      const keys = Object.keys(localStorage)
      keys.forEach(k => {
        if (k.startsWith('cache_')) {
          localStorage.removeItem(k)
        }
      })
    }
  } catch (error) {
    console.error('Error clearing cache:', error)
  }
}

export const CACHE_KEYS = {
  ADMIN_CLASSES: 'cache_admin_classes',
  ADMIN_USERS: 'cache_admin_users',
  ADMIN_BOOKINGS: 'cache_admin_bookings',
  USER_BOOKINGS: (userId) => `cache_user_bookings_${userId}`,
  CLASS_DETAIL: (classId) => `cache_class_${classId}`
}
