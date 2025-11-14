const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/notifications`

/**
 * 알람 목록 조회 API
 */
export const getNotificationsApi = async (userId) => {
  const response = await fetch(`${API_BASE_URL}?userId=${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result = await response.json()
  
  if (result.code !== 'SUCCESS') {
    throw new Error(result.message || '알람 목록 조회에 실패했습니다.')
  }

  return {
    success: true,
    message: result.message,
    data: result.data
  }
}

/**
 * 알람 읽음 처리 API
 */
export const markAsReadApi = async (notificationId) => {
  const response = await fetch(`${API_BASE_URL}/${notificationId}/read`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result = await response.json()
  
  if (result.code !== 'SUCCESS') {
    throw new Error(result.message || '알람 읽음 처리에 실패했습니다.')
  }

  return {
    success: true,
    message: result.message
  }
}

/**
 * 읽지 않은 알람 개수 조회 API
 */
export const getUnreadCountApi = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/unread-count?userId=${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result = await response.json()
  
  if (result.code !== 'SUCCESS') {
    throw new Error(result.message || '읽지 않은 알람 개수 조회에 실패했습니다.')
  }

  return {
    success: true,
    message: result.message,
    data: result.data
  }
}

