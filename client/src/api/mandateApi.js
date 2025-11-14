const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/mandate`

/**
 * 수임 동의 신청 API (회원 → 세무사)
 */
export const requestMandateApi = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/request`, {
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
    throw new Error(result.message || '수임 동의 신청에 실패했습니다.')
  }

  return {
    success: true,
    message: result.message,
    data: result.data
  }
}

/**
 * 수임 동의 요청 전송 API (세무사 → 회원)
 */
export const sendMandateRequestApi = async (taxAccountantId, clientId) => {
  const response = await fetch(`${API_BASE_URL}/send-request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ taxAccountantId, clientId })
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result = await response.json()
  
  if (result.code !== 'SUCCESS') {
    throw new Error(result.message || '수임 동의 요청 전송에 실패했습니다.')
  }

  return {
    success: true,
    message: result.message,
    data: result.data
  }
}

/**
 * 수임 동의 수락 완료 API (회원 → 시스템)
 */
export const completeMandateApi = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/complete`, {
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
    throw new Error(result.message || '수임 동의 수락 완료 처리에 실패했습니다.')
  }

  return {
    success: true,
    message: result.message,
    data: result.data
  }
}

/**
 * 모든 수임 동의 내역 조회 API (세무사용)
 */
export const getMandateListApi = async () => {
  const response = await fetch(`${API_BASE_URL}/list`, {
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
    throw new Error(result.message || '수임 동의 내역 조회에 실패했습니다.')
  }

  return {
    success: true,
    message: result.message,
    data: result.data
  }
}

