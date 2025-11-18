const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/auth`

/**
 * 로그인 API 호출
 */
export const loginApi = async (usernameOrEmail, password) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      usernameOrEmail,
      password
    })
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result = await response.json()
  console.log('로그인 API 응답:', result)
  
  // 백엔드 응답 구조: { code, message, data, timestamp }
  if (result.code !== 'SUCCESS') {
    throw new Error(result.message || '로그인에 실패했습니다.')
  }

  // 프론트엔드에서 사용하기 쉽게 변환
  return {
    success: true,
    message: result.message,
    user: result.data
  }
}

/**
 * 회원가입 API 호출
 */
export const registerApi = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData)
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result = await response.json()
  
  // 백엔드 응답 구조: { code, message, data, timestamp }
  if (result.code !== 'SUCCESS') {
    throw new Error(result.message || '회원가입에 실패했습니다.')
  }

  // 프론트엔드에서 사용하기 쉽게 변환
  return {
    success: true,
    message: result.message,
    user: result.data
  }
}

/**
 * 사업자등록번호 검증 API
 */
export const verifyBusinessNumberApi = async (businessNumber) => {
  const response = await fetch(`${API_BASE_URL}/verify-business-number`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ businessNumber })
  })

  const result = await response.json()
  
  if (result.code !== 'SUCCESS') {
    throw new Error(result.message || '사업자등록번호 검증에 실패했습니다.')
  }

  return {
    success: true,
    message: result.message,
    data: result.data
  }
}

/**
 * 법인등록번호 검증 API
 */
export const verifyCorporateNumberApi = async (corporateNumber) => {
  const response = await fetch(`${API_BASE_URL}/verify-corporate-number`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ corporateNumber })
  })

  const result = await response.json()
  
  if (result.code !== 'SUCCESS') {
    throw new Error(result.message || '법인등록번호 검증에 실패했습니다.')
  }

  return {
    success: true,
    message: result.message,
    data: result.data
  }
}

/**
 * 휴대폰 인증번호 전송 API
 */
export const sendPhoneVerificationApi = async (phoneNumber) => {
  const response = await fetch(`${API_BASE_URL}/send-verification-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phoneNumber })
  })

  const result = await response.json()
  
  if (result.code !== 'SUCCESS') {
    throw new Error(result.message || '인증번호 전송에 실패했습니다.')
  }

  return {
    success: true,
    message: result.message,
    code: result.data.code, // 개발 환경에서만 반환
    expiresIn: result.data.expiresIn
  }
}

/**
 * 휴대폰 인증번호 확인 API
 */
export const verifyPhoneCodeApi = async (phoneNumber, code) => {
  const response = await fetch(`${API_BASE_URL}/verify-phone-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phoneNumber, code })
  })

  const result = await response.json()

  if (result.code !== 'SUCCESS') {
    throw new Error(result.message || '인증번호 확인에 실패했습니다.')
  }

  return {
    success: true,
    message: result.message
  }
}

/**
 * 사용자 정보 수정 API
 */
export const updateUserProfileApi = async (userId, updateData) => {
  const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData)
  })

  const result = await response.json()

  if (result.code !== 'SUCCESS') {
    throw new Error(result.message || '정보 수정에 실패했습니다.')
  }

  return {
    success: true,
    message: result.message,
    user: result.data
  }
}

/**
 * 사용자 정보 조회 API
 */
export const getUserProfileApi = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/profile/${userId}`)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result = await response.json()

  if (result.code !== 'SUCCESS') {
    throw new Error(result.message || '사용자 정보 조회에 실패했습니다.')
  }

  return {
    success: true,
    message: result.message,
    user: result.data
  }
}



