const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/payment`

/**
 * 결제 처리 API (목업)
 */
export const processPaymentApi = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId })
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result = await response.json()
  
  if (result.code !== 'SUCCESS') {
    throw new Error(result.message || '결제 처리에 실패했습니다.')
  }

  return {
    success: true,
    message: result.message,
    data: result.data
  }
}

/**
 * 결제 상태 확인 API
 */
export const checkPaymentStatusApi = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/status?userId=${userId}`, {
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
    throw new Error(result.message || '결제 상태 확인에 실패했습니다.')
  }

  return {
    success: true,
    message: result.message,
    data: result.data
  }
}

