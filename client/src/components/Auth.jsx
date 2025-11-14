import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { 
  loginApi, 
  registerApi, 
  verifyBusinessNumberApi, 
  verifyCorporateNumberApi,
  sendPhoneVerificationApi,
  verifyPhoneCodeApi 
} from '../api/authApi'

function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  
  // 로그인 폼 상태
  const [loginForm, setLoginForm] = useState({
    usernameOrEmail: '',
    password: ''
  })
  
  // 회원가입 폼 상태
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    // 세무플랫폼 추가 필드
    residentNumberFront: '',  // 주민등록번호 앞자리
    residentNumberBack: '',   // 주민등록번호 뒷자리
    phoneNumber: '',
    postalCode: '',
    address: '',
    addressDetail: '',
    userType: 'NON_BUSINESS',  // 기본값: 비사업자
    businessNumber: '',
    corporateNumber: ''
  })

  // 검증 상태
  const [verificationStatus, setVerificationStatus] = useState({
    businessNumber: false,
    corporateNumber: false,
    phoneNumber: false
  })

  // 휴대폰 인증 상태
  const [phoneVerification, setPhoneVerification] = useState({
    code: '',
    sentCode: '',
    timer: 0,
    isVerified: false
  })

  // 로그인 Mutation
  const loginMutation = useMutation({
    mutationFn: ({ usernameOrEmail, password }) => 
      loginApi(usernameOrEmail, password),
    onSuccess: (data) => {
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
        
        if (onLoginSuccess) {
          // 성공 메시지를 충분히 보여주고 화면 전환
          setTimeout(() => {
            onLoginSuccess(data.user)
          }, 1200)
        }
      } else {
        console.error('사용자 정보가 없습니다:', data)
      }
    },
  })

  // 회원가입 Mutation
  const registerMutation = useMutation({
    mutationFn: (userData) => registerApi(userData),
    onSuccess: () => {
      setTimeout(() => {
        setIsLogin(true)
        setRegisterForm({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          name: '',
          residentNumberFront: '',
          residentNumberBack: '',
          phoneNumber: '',
          postalCode: '',
          address: '',
          addressDetail: '',
          userType: 'NON_BUSINESS',
          businessNumber: '',
          corporateNumber: ''
        })
        setVerificationStatus({
          businessNumber: false,
          corporateNumber: false,
          phoneNumber: false
        })
        setPhoneVerification({
          code: '',
          sentCode: '',
          timer: 0,
          isVerified: false
        })
      }, 1500)
    },
  })

  // 휴대폰 인증 타이머
  useEffect(() => {
    let interval = null
    if (phoneVerification.timer > 0) {
      interval = setInterval(() => {
        setPhoneVerification(prev => ({
          ...prev,
          timer: prev.timer - 1
        }))
      }, 1000)
    } else if (phoneVerification.timer === 0 && phoneVerification.sentCode) {
      setPhoneVerification(prev => ({
        ...prev,
        sentCode: ''
      }))
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [phoneVerification.timer, phoneVerification.sentCode])

  const handleLogin = async (e) => {
    e.preventDefault()
    loginMutation.mutate({
      usernameOrEmail: loginForm.usernameOrEmail,
      password: loginForm.password
    })
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    
    // 비밀번호 확인
    if (registerForm.password !== registerForm.confirmPassword) {
      registerMutation.reset()
      return
    }

    // 휴대폰 인증 확인
    if (!phoneVerification.isVerified) {
      alert('휴대폰 인증을 완료해주세요.')
      return
    }

    // 사업자 유형별 검증 확인
    if (registerForm.userType === 'INDIVIDUAL' && !verificationStatus.businessNumber) {
      alert('사업자등록번호를 확인해주세요.')
      return
    }

    if (registerForm.userType === 'CORPORATE') {
      if (!verificationStatus.businessNumber) {
        alert('사업자등록번호를 확인해주세요.')
        return
      }
      if (!verificationStatus.corporateNumber) {
        alert('법인등록번호를 확인해주세요.')
        return
      }
    }

    // 주민등록번호 합치기
    const residentNumber = `${registerForm.residentNumberFront}-${registerForm.residentNumberBack}`

    registerMutation.mutate({
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password,
      name: registerForm.name,
      residentNumber,
      phoneNumber: registerForm.phoneNumber,
      postalCode: registerForm.postalCode,
      address: registerForm.address,
      addressDetail: registerForm.addressDetail,
      userType: registerForm.userType,
      businessNumber: registerForm.businessNumber || null,
      corporateNumber: registerForm.corporateNumber || null
    })
  }

  // 사업자등록번호 검증
  const handleVerifyBusinessNumber = async () => {
    if (!registerForm.businessNumber) {
      alert('사업자등록번호를 입력해주세요.')
      return
    }

    try {
      const result = await verifyBusinessNumberApi(registerForm.businessNumber)
      setVerificationStatus(prev => ({ ...prev, businessNumber: true }))
      alert(result.message)
    } catch (error) {
      setVerificationStatus(prev => ({ ...prev, businessNumber: false }))
      alert(error.message)
    }
  }

  // 법인등록번호 검증
  const handleVerifyCorporateNumber = async () => {
    if (!registerForm.corporateNumber) {
      alert('법인등록번호를 입력해주세요.')
      return
    }

    try {
      const result = await verifyCorporateNumberApi(registerForm.corporateNumber)
      setVerificationStatus(prev => ({ ...prev, corporateNumber: true }))
      alert(result.message)
    } catch (error) {
      setVerificationStatus(prev => ({ ...prev, corporateNumber: false }))
      alert(error.message)
    }
  }

  // 휴대폰 인증번호 전송
  const handleSendVerificationCode = async () => {
    if (!registerForm.phoneNumber) {
      alert('휴대폰 번호를 입력해주세요.')
      return
    }

    try {
      const result = await sendPhoneVerificationApi(registerForm.phoneNumber)
      setPhoneVerification({
        code: '',
        sentCode: result.code,
        timer: result.expiresIn,
        isVerified: false
      })
      // 개발 환경에서 인증번호를 alert으로 표시
      alert(`인증번호: ${result.code}\n(3분 내에 입력해주세요)`)
    } catch (error) {
      alert(error.message)
    }
  }

  // 휴대폰 인증번호 확인
  const handleVerifyPhoneCode = async () => {
    if (!phoneVerification.code) {
      alert('인증번호를 입력해주세요.')
      return
    }

    try {
      const result = await verifyPhoneCodeApi(registerForm.phoneNumber, phoneVerification.code)
      setPhoneVerification(prev => ({
        ...prev,
        isVerified: true,
        timer: 0,
        sentCode: ''
      }))
      alert(result.message)
    } catch (error) {
      alert(error.message)
    }
  }

  // 하이픈 자동 삽입 (사업자등록번호)
  const formatBusinessNumber = (value) => {
    const numbers = value.replace(/[^\d]/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`
  }

  // 하이픈 자동 삽입 (법인등록번호)
  const formatCorporateNumber = (value) => {
    const numbers = value.replace(/[^\d]/g, '')
    if (numbers.length <= 6) return numbers
    return `${numbers.slice(0, 6)}-${numbers.slice(6, 13)}`
  }

  // 하이픈 자동 삽입 (휴대폰번호)
  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/[^\d]/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    loginMutation.reset()
    registerMutation.reset()
  }

  const loading = loginMutation.isPending || registerMutation.isPending
  const error = loginMutation.error?.message || registerMutation.error?.message
  const success = loginMutation.isSuccess 
    ? '로그인 성공!' 
    : registerMutation.isSuccess 
    ? '회원가입이 완료되었습니다! 로그인해주세요.'
    : null

  return (
    <div className="auth-page">
      {/* 배경 장식 요소 */}
      <div className="auth-background-decoration">
        <div className="auth-decoration-blob top-20 left-10" style={{ animationDelay: '1s' }}></div>
        <div className="auth-decoration-blob bottom-20 right-10 w-96 h-96 bg-purple-300/20" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Glassmorphism 카드 */}
        <div className="auth-card">
          {/* 헤더 */}
          <div className="auth-header">
            <div className="auth-header-overlay"></div>
            <div className="auth-header-content">
              <h1 className="auth-title">
                {isLogin ? '로그인' : '회원가입'}
              </h1>
              <p className="auth-subtitle">
                {isLogin 
                  ? '계정에 로그인하세요' 
                  : '새 계정을 만드세요'}
              </p>
            </div>
          </div>

          <div className="auth-form-container">
            {/* 에러 메시지 */}
            {error && !success && (
              <div className="auth-message">
                <div className="auth-message-error">
                  <div className="auth-message-content">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* 성공 메시지 */}
            {success && (
              <div className="auth-message auth-message-success-full">
                <div className="auth-message-success">
                  <div className="auth-message-content">
                    <svg className="w-20 h-20 flex-shrink-0 auth-success-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-2xl font-bold">{success}</span>
                  </div>
                </div>
              </div>
            )}

            {!success && isLogin ? (
              <form className="auth-form" onSubmit={handleLogin}>
                <div className="auth-form-group">
                  <label className="auth-form-label">
                    사용자명 또는 이메일
                  </label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="사용자명 또는 이메일을 입력하세요"
                    value={loginForm.usernameOrEmail}
                    onChange={(e) => setLoginForm({
                      ...loginForm,
                      usernameOrEmail: e.target.value
                    })}
                    required
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>

                <div className="auth-form-group">
                  <label className="auth-form-label">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    className="auth-input"
                    placeholder="비밀번호를 입력하세요"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({
                      ...loginForm,
                      password: e.target.value
                    })}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>

                <button 
                  type="submit" 
                  className="auth-button"
                  disabled={loading}
                >
                  {loading && (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {loading ? '로그인 중...' : '로그인'}
                </button>
              </form>
            ) : !success ? (
              <form className="auth-form-register" onSubmit={handleRegister}>
                <div className="auth-form-scrollable">
                  {/* 기본 정보 섹션 */}
                  <div className="auth-form-section">
                    <h3 className="auth-form-section-title">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      기본 정보
                    </h3>
                    
                    <div className="auth-form-group">
                      <label className="auth-form-label">아이디</label>
                      <input
                        type="text"
                        className="auth-input"
                        placeholder="아이디를 입력하세요"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="auth-form-group">
                      <label className="auth-form-label">이메일</label>
                      <input
                        type="email"
                        className="auth-input"
                        placeholder="이메일을 입력하세요"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="auth-form-group">
                      <label className="auth-form-label">비밀번호</label>
                      <input
                        type="password"
                        className="auth-input"
                        placeholder="비밀번호 (최소 4자)"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        required
                        minLength={4}
                        disabled={loading}
                      />
                    </div>

                    <div className="auth-form-group">
                      <label className="auth-form-label">비밀번호 확인</label>
                      <input
                        type="password"
                        className={`auth-input ${
                          registerForm.password && registerForm.confirmPassword && 
                          registerForm.password !== registerForm.confirmPassword ? 'auth-input-error' : ''
                        }`}
                        placeholder="비밀번호를 다시 입력하세요"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        required
                        disabled={loading}
                      />
                      {registerForm.password && registerForm.confirmPassword && 
                       registerForm.password !== registerForm.confirmPassword && (
                        <p className="auth-error-text">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          비밀번호가 일치하지 않습니다.
                        </p>
                      )}
                    </div>

                    <div className="auth-form-group">
                      <label className="auth-form-label">이름</label>
                      <input
                        type="text"
                        className="auth-input"
                        placeholder="이름을 입력하세요"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* 개인 정보 섹션 */}
                  <div className="auth-form-section">
                    <h3 className="auth-form-section-title">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                      </svg>
                      개인 정보
                    </h3>

                    <div className="auth-form-group">
                      <label className="auth-form-label">주민등록번호</label>
                      <div className="auth-resident-number-group">
                        <input
                          type="text"
                          className="auth-input auth-resident-number-input"
                          placeholder="앞 6자리"
                          value={registerForm.residentNumberFront}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '').slice(0, 6)
                            setRegisterForm({ ...registerForm, residentNumberFront: value })
                          }}
                          maxLength={6}
                          required
                          disabled={loading}
                        />
                        <span className="auth-resident-number-separator">-</span>
                        <input
                          type="password"
                          className="auth-input auth-resident-number-input"
                          placeholder="뒤 7자리"
                          value={registerForm.residentNumberBack}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '').slice(0, 7)
                            setRegisterForm({ ...registerForm, residentNumberBack: value })
                          }}
                          maxLength={7}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="auth-form-group">
                      <label className="auth-form-label">휴대폰 번호</label>
                      <div className="auth-address-group">
                        <div className="auth-address-input-wrapper">
                          <input
                            type="text"
                            className="auth-input"
                            placeholder="010-0000-0000"
                            value={registerForm.phoneNumber}
                            onChange={(e) => {
                              const formatted = formatPhoneNumber(e.target.value)
                              setRegisterForm({ ...registerForm, phoneNumber: formatted })
                              setPhoneVerification(prev => ({ ...prev, isVerified: false }))
                            }}
                            required
                            disabled={loading || phoneVerification.isVerified}
                          />
                        </div>
                        <button
                          type="button"
                          className="auth-verify-button"
                          onClick={handleSendVerificationCode}
                          disabled={loading || !registerForm.phoneNumber || phoneVerification.isVerified}
                        >
                          {phoneVerification.isVerified ? '인증완료' : '인증번호 전송'}
                        </button>
                      </div>
                      {phoneVerification.isVerified && (
                        <div className="auth-success-badge">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          휴대폰 인증이 완료되었습니다
                        </div>
                      )}
                    </div>

                    {phoneVerification.sentCode && !phoneVerification.isVerified && (
                      <div className="auth-form-group auth-conditional-field">
                        <label className="auth-form-label">인증번호</label>
                        <div className="auth-verification-group">
                          <div className="auth-verification-input-wrapper">
                            <input
                              type="text"
                              className="auth-input"
                              placeholder="인증번호 6자리"
                              value={phoneVerification.code}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^\d]/g, '').slice(0, 6)
                                setPhoneVerification(prev => ({ ...prev, code: value }))
                              }}
                              maxLength={6}
                              disabled={loading}
                            />
                            {phoneVerification.timer > 0 && (
                              <span className="auth-verification-timer">
                                {Math.floor(phoneVerification.timer / 60)}:{String(phoneVerification.timer % 60).padStart(2, '0')}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            className="auth-verification-button"
                            onClick={handleVerifyPhoneCode}
                            disabled={loading || !phoneVerification.code || phoneVerification.code.length !== 6}
                          >
                            확인
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 주소 정보 섹션 */}
                  <div className="auth-form-section">
                    <h3 className="auth-form-section-title">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      주소 정보
                    </h3>

                    <div className="auth-form-group">
                      <label className="auth-form-label">우편번호</label>
                      <div className="auth-address-group">
                        <div className="auth-address-input-wrapper">
                          <input
                            type="text"
                            className="auth-input"
                            placeholder="우편번호"
                            value={registerForm.postalCode}
                            onChange={(e) => setRegisterForm({ ...registerForm, postalCode: e.target.value })}
                            disabled={loading}
                          />
                        </div>
                        <button
                          type="button"
                          className="auth-address-button"
                          onClick={() => alert('우편번호 검색 기능은 추후 구현 예정입니다.')}
                          disabled={loading}
                        >
                          주소 검색
                        </button>
                      </div>
                    </div>

                    <div className="auth-form-group">
                      <label className="auth-form-label">기본 주소</label>
                      <input
                        type="text"
                        className="auth-input"
                        placeholder="기본 주소를 입력하세요"
                        value={registerForm.address}
                        onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                        disabled={loading}
                      />
                    </div>

                    <div className="auth-form-group">
                      <label className="auth-form-label">상세 주소</label>
                      <input
                        type="text"
                        className="auth-input"
                        placeholder="상세 주소를 입력하세요"
                        value={registerForm.addressDetail}
                        onChange={(e) => setRegisterForm({ ...registerForm, addressDetail: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* 유형 선택 섹션 */}
                  <div className="auth-form-section">
                    <h3 className="auth-form-section-title">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                      유형 선택
                    </h3>

                    <div className="auth-user-type-group">
                      <div className="auth-radio-option">
                        <input
                          type="radio"
                          id="individual"
                          name="userType"
                          value="INDIVIDUAL"
                          className="auth-radio-input"
                          checked={registerForm.userType === 'INDIVIDUAL'}
                          onChange={(e) => {
                            setRegisterForm({ ...registerForm, userType: e.target.value })
                            setVerificationStatus({ businessNumber: false, corporateNumber: false, phoneNumber: false })
                          }}
                          disabled={loading}
                        />
                        <label htmlFor="individual" className="auth-radio-label">
                          <svg className="auth-radio-icon" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                          </svg>
                          개인사업자
                        </label>
                      </div>

                      <div className="auth-radio-option">
                        <input
                          type="radio"
                          id="corporate"
                          name="userType"
                          value="CORPORATE"
                          className="auth-radio-input"
                          checked={registerForm.userType === 'CORPORATE'}
                          onChange={(e) => {
                            setRegisterForm({ ...registerForm, userType: e.target.value })
                            setVerificationStatus({ businessNumber: false, corporateNumber: false, phoneNumber: false })
                          }}
                          disabled={loading}
                        />
                        <label htmlFor="corporate" className="auth-radio-label">
                          <svg className="auth-radio-icon" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                          </svg>
                          법인사업자
                        </label>
                      </div>

                      <div className="auth-radio-option">
                        <input
                          type="radio"
                          id="nonBusiness"
                          name="userType"
                          value="NON_BUSINESS"
                          className="auth-radio-input"
                          checked={registerForm.userType === 'NON_BUSINESS'}
                          onChange={(e) => {
                            setRegisterForm({ ...registerForm, userType: e.target.value })
                            setVerificationStatus({ businessNumber: false, corporateNumber: false, phoneNumber: false })
                          }}
                          disabled={loading}
                        />
                        <label htmlFor="nonBusiness" className="auth-radio-label">
                          <svg className="auth-radio-icon" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          비사업자
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 사업자 정보 섹션 (조건부) */}
                  {(registerForm.userType === 'INDIVIDUAL' || registerForm.userType === 'CORPORATE') && (
                    <div className="auth-form-section auth-conditional-field">
                      <h3 className="auth-form-section-title">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                        </svg>
                        사업자 정보
                      </h3>

                      <div className="auth-form-group">
                        <label className="auth-form-label">사업자등록번호</label>
                        <div className="auth-address-group">
                          <div className="auth-address-input-wrapper">
                            <input
                              type="text"
                              className="auth-input"
                              placeholder="000-00-00000"
                              value={registerForm.businessNumber}
                              onChange={(e) => {
                                const formatted = formatBusinessNumber(e.target.value)
                                setRegisterForm({ ...registerForm, businessNumber: formatted })
                                setVerificationStatus(prev => ({ ...prev, businessNumber: false }))
                              }}
                              required
                              disabled={loading || verificationStatus.businessNumber}
                            />
                          </div>
                          <button
                            type="button"
                            className={`auth-verify-button ${verificationStatus.businessNumber ? 'auth-verify-button-success' : ''}`}
                            onClick={handleVerifyBusinessNumber}
                            disabled={loading || !registerForm.businessNumber || verificationStatus.businessNumber}
                          >
                            {verificationStatus.businessNumber ? '확인완료' : '등록확인'}
                          </button>
                        </div>
                        {verificationStatus.businessNumber && (
                          <div className="auth-success-badge">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            사업자등록번호가 확인되었습니다
                          </div>
                        )}
                      </div>

                      {registerForm.userType === 'CORPORATE' && (
                        <div className="auth-form-group">
                          <label className="auth-form-label">법인등록번호</label>
                          <div className="auth-address-group">
                            <div className="auth-address-input-wrapper">
                              <input
                                type="text"
                                className="auth-input"
                                placeholder="000000-0000000"
                                value={registerForm.corporateNumber}
                                onChange={(e) => {
                                  const formatted = formatCorporateNumber(e.target.value)
                                  setRegisterForm({ ...registerForm, corporateNumber: formatted })
                                  setVerificationStatus(prev => ({ ...prev, corporateNumber: false }))
                                }}
                                required
                                disabled={loading || verificationStatus.corporateNumber}
                              />
                            </div>
                            <button
                              type="button"
                              className={`auth-verify-button ${verificationStatus.corporateNumber ? 'auth-verify-button-success' : ''}`}
                              onClick={handleVerifyCorporateNumber}
                              disabled={loading || !registerForm.corporateNumber || verificationStatus.corporateNumber}
                            >
                              {verificationStatus.corporateNumber ? '확인완료' : '등록확인'}
                            </button>
                          </div>
                          {verificationStatus.corporateNumber && (
                            <div className="auth-success-badge">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              법인등록번호가 확인되었습니다
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="auth-button mt-6"
                  disabled={loading || (registerForm.password !== registerForm.confirmPassword && registerForm.confirmPassword.length > 0)}
                >
                  {loading && (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {loading ? '가입 중...' : '회원가입'}
                </button>
              </form>
            ): null}

            {!success && (
              <div className="auth-switch">
                <p className="auth-switch-text">
                  {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
                </p>
                <button
                  className="auth-switch-button"
                  onClick={switchMode}
                  type="button"
                >
                  {isLogin ? '회원가입' : '로그인'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth
