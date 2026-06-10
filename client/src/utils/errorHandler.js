// Reusable error handling utilities
import Swal from 'sweetalert2'

export const handleFirestoreError = (error, context = '') => {
  console.error(`Firestore error (${context}):`, error)
  
  const errorMessages = {
    'permission-denied': 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้',
    'not-found': 'ไม่พบข้อมูลที่ต้องการ',
    'already-exists': 'ข้อมูลนี้มีอยู่แล้ว',
    'resource-exhausted': 'ใช้งานเกินโควตา กรุณาลองใหม่ภายหลัง',
    'unauthenticated': 'กรุณาเข้าสู่ระบบใหม่',
    'unavailable': 'เชื่อมต่อไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ต',
    'deadline-exceeded': 'หมดเวลาการเชื่อมต่อ กรุณาลองใหม่',
    'cancelled': 'การทำงานถูกยกเลิก'
  }

  const message = errorMessages[error.code] || 'เกิดข้อผิดพลาด กรุณาลองใหม่'
  
  return {
    code: error.code,
    message,
    originalError: error
  }
}

export const showError = (error, context = '') => {
  const { message } = handleFirestoreError(error, context)
  
  Swal.fire({
    icon: 'error',
    title: 'เกิดข้อผิดพลาด',
    text: message,
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#000'
  })
}

export const showSuccess = (message, title = 'สำเร็จ') => {
  Swal.fire({
    icon: 'success',
    title,
    text: message,
    timer: 2000,
    showConfirmButton: false
  })
}

export const showLoading = (message = 'กำลังโหลด...') => {
  Swal.fire({
    title: message,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    }
  })
}

export const closeLoading = () => {
  Swal.close()
}

export const confirm = async (message, title = 'ยืนยันการทำรายการ') => {
  const result = await Swal.fire({
    icon: 'question',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: 'ยืนยัน',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#000',
    cancelButtonColor: '#6b7280'
  })
  
  return result.isConfirmed
}

// Network retry with exponential backoff
export const retryOperation = async (operation, maxRetries = 3, baseDelay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      
      const shouldRetry = ['unavailable', 'deadline-exceeded', 'resource-exhausted'].includes(error.code)
      if (!shouldRetry) throw error
      
      const delay = baseDelay * Math.pow(2, i)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}
