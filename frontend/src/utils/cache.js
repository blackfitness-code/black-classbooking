// LocalStorage cache with TTL
const CACHE_VERSION = 'v1'
const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

// Cache keys (for backwards compatibility)
export const CACHE_KEYS = {
  CLASSES: 'classes',
  USERS: 'users',
  BOOKINGS: 'bookings',
  ADMIN_CLASSES: 'admin_classes',
  ADMIN_USERS: 'admin_users',
  ADMIN_BOOKINGS: 'admin_bookings'
}

// Legacy functions (for backwards compatibility)
export const getCachedData = (key) => cache.get(key)
export const setCachedData = (key, data, ttl) => cache.set(key, data, ttl)
export const clearCache = () => cache.clear()

export const cache = {
  set(key, data, ttl = DEFAULT_TTL) {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl,
        version: CACHE_VERSION
      }
      localStorage.setItem(`cache_${key}`, JSON.stringify(item))
      return true
    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  },

  get(key) {
    try {
      const cached = localStorage.getItem(`cache_${key}`)
      if (!cached) return null

      const item = JSON.parse(cached)
      
      // Version mismatch
      if (item.version !== CACHE_VERSION) {
        this.remove(key)
        return null
      }

      // Expired
      if (Date.now() - item.timestamp > item.ttl) {
        this.remove(key)
        return null
      }

      return item.data
    } catch (error) {
      console.error('Cache get error:', error)
      this.remove(key)
      return null
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(`cache_${key}`)
      return true
    } catch (error) {
      console.error('Cache remove error:', error)
      return false
    }
  },

  clear() {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('cache_'))
      keys.forEach(k => localStorage.removeItem(k))
      return true
    } catch (error) {
      console.error('Cache clear error:', error)
      return false
    }
  },

  // Clear expired items
  cleanup() {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('cache_'))
      keys.forEach(k => {
        const cached = localStorage.getItem(k)
        if (!cached) return

        const item = JSON.parse(cached)
        if (item.version !== CACHE_VERSION || Date.now() - item.timestamp > item.ttl) {
          localStorage.removeItem(k)
        }
      })
      return true
    } catch (error) {
      console.error('Cache cleanup error:', error)
      return false
    }
  }
}

// Auto cleanup on app start
if (typeof window !== 'undefined') {
  cache.cleanup()
}
