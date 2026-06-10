// Firestore operations with caching and error handling
import { cache } from './cache'
import { handleFirestoreError, retryOperation } from './errorHandler'

export const cachedGetDocs = async (queryFn, cacheKey, ttl) => {
  // Try cache first
  const cached = cache.get(cacheKey)
  if (cached) {
    console.log(`Cache hit: ${cacheKey}`)
    return cached
  }

  // Fetch with retry
  try {
    const result = await retryOperation(queryFn)
    cache.set(cacheKey, result, ttl)
    return result
  } catch (error) {
    throw handleFirestoreError(error, `cachedGetDocs: ${cacheKey}`)
  }
}

export const invalidateCache = (pattern) => {
  const keys = Object.keys(localStorage).filter(k => k.includes(pattern))
  keys.forEach(k => localStorage.removeItem(k))
}

// Transaction helper for booking with optimistic locking
export const safeBooking = async (db, classId, bookingData) => {
  const { runTransaction, doc } = await import('firebase/firestore')
  
  return retryOperation(async () => {
    return runTransaction(db, async (transaction) => {
      const classRef = doc(db, 'classes', classId)
      const classDoc = await transaction.get(classRef)
      
      if (!classDoc.exists()) {
        throw new Error('Class not found')
      }
      
      const classData = classDoc.data()
      
      // Check capacity
      if (classData.currentBookings >= classData.maxCapacity) {
        throw new Error('Class is full')
      }
      
      // Create booking
      const bookingRef = doc(db, 'bookings')
      transaction.set(bookingRef, bookingData)
      
      // Update class booking count
      transaction.update(classRef, {
        currentBookings: classData.currentBookings + 1
      })
      
      return bookingRef.id
    })
  })
}

export const safeCancelBooking = async (db, bookingId, classId) => {
  const { runTransaction, doc } = await import('firebase/firestore')
  
  return retryOperation(async () => {
    return runTransaction(db, async (transaction) => {
      const bookingRef = doc(db, 'bookings', bookingId)
      const classRef = doc(db, 'classes', classId)
      
      const [bookingDoc, classDoc] = await Promise.all([
        transaction.get(bookingRef),
        transaction.get(classRef)
      ])
      
      if (!bookingDoc.exists() || !classDoc.exists()) {
        throw new Error('Booking or class not found')
      }
      
      // Update booking status
      transaction.update(bookingRef, {
        status: 'cancelled',
        cancelledAt: new Date()
      })
      
      // Decrease class booking count
      const classData = classDoc.data()
      transaction.update(classRef, {
        currentBookings: Math.max(0, classData.currentBookings - 1)
      })
    })
  })
}
