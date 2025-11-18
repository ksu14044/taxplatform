import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { checkPaymentStatusApi } from '../api/paymentApi'
import { requestMandateApi, completeMandateApi } from '../api/mandateApi'
import { getUnreadCountApi } from '../api/notificationApi'
import PaymentModal from './PaymentModal'
import NotificationModal from './NotificationModal'

function ClientDashboard({ user, onLogout }) {
  const navigate = useNavigate()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const queryClient = useQueryClient()

  // 결제 상태 조회
  const { data: paymentStatusData, refetch: refetchPaymentStatus } = useQuery({
    queryKey: ['paymentStatus', user.userId],
    queryFn: () => checkPaymentStatusApi(user.userId),
    refetchInterval: 60000 // 1분마다 자동 갱신
  })

  // 읽지 않은 알람 개수 조회
  const { data: unreadCountData } = useQuery({
    queryKey: ['unreadCount', user.userId],
    queryFn: () => getUnreadCountApi(user.userId),
    refetchInterval: 10000 // 10초마다 자동 갱신
  })

  // 수임 해제 요청 알림 조회
  const { data: notificationsData } = useQuery({
    queryKey: ['notifications', user.userId],
    queryFn: () => getNotificationsApi(user.userId),
    refetchInterval: 10000 // 10초마다 자동 갱신
  })

  // 수임 동의 신청 Mutation
  const mandateMutation = useMutation({
    mutationFn: () => requestMandateApi(user.userId),
    onSuccess: () => {
      alert('수임 동의 신청이 완료되었습니다. 세무사가 확인 후 처리할 예정입니다.')
      // 사용자 정보 갱신
      const updatedUser = { ...user, mandateStatus: 'REQUESTED' }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      window.location.reload()
    },
    onError: (error) => {
      alert(error.message)
    }
  })

  // 수임 동의 수락 완료 Mutation
  const completeMandateMutation = useMutation({
    mutationFn: () => completeMandateApi(user.userId),
    onSuccess: () => {
      alert('수임 동의가 완료되었습니다!')
      // 사용자 정보 갱신
      const updatedUser = { ...user, mandateStatus: 'COMPLETED' }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      window.location.reload()
    },
    onError: (error) => {
      alert(error.message)
    }
  })

  const paymentStatus = paymentStatusData?.data
  const unreadCount = unreadCountData?.data || 0
  const isPaymentValid = paymentStatus?.valid || false
  const notifications = notificationsData?.data || []

  // 수임 해제 요청 알림 확인
  const releaseRequestNotification = notifications.find(
    notification => notification.message.includes('수임 해제') && !notification.isRead
  )

  const handlePaymentSuccess = () => {
    refetchPaymentStatus()
    // 사용자 정보 갱신
    const updatedUser = { ...user, paymentStatus: 'PAID' }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    window.location.reload()
  }

  const handleMandateRequest = () => {
    if (window.confirm('수임 동의를 신청하시겠습니까?')) {
      mandateMutation.mutate()
    }
  }

  const handleOpenHometax = () => {
    window.open('https://www.hometax.go.kr', '_blank')
  }

  const handleCompleteMandate = () => {
    if (window.confirm('홈택스에서 수임 동의를 수락하셨습니까?\n수임 동의 수락 완료를 진행하시겠습니까?')) {
      completeMandateMutation.mutate()
    }
  }

  // 상태에 따른 버튼 렌더링
  const renderActionButton = () => {

    if (!isPaymentValid) {
      return (
        <button
          className="dashboard-action-button dashboard-action-button-payment"
          onClick={() => setShowPaymentModal(true)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          결제하기
        </button>
      )
    }

    if (user.mandateStatus === 'NONE' || !user.mandateStatus) {
      return (
        <button
          className="dashboard-action-button dashboard-action-button-mandate"
          onClick={handleMandateRequest}
          disabled={mandateMutation.isPending}
        >
          {mandateMutation.isPending && (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          수임 동의 신청하기
        </button>
      )
    }

    if (user.mandateStatus === 'REQUESTED') {
      return (
        <div className="dashboard-status-card dashboard-status-requested">
          <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-lg font-bold text-yellow-300">수임 동의 신청 대기 중</h3>
            <p className="text-sm text-gray-400">세무사가 확인 중입니다</p>
          </div>
        </div>
      )
    }

    if (user.mandateStatus === 'SENT') {
      return (
        <div className="dashboard-mandate-section">
          <div className="dashboard-status-card dashboard-status-sent">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <div>
              <h3 className="text-lg font-bold text-blue-300">수임 동의 요청이 도착했습니다</h3>
              <p className="text-sm text-gray-400">홈택스에서 수임 동의 요청을 수락해주세요</p>
            </div>
          </div>
          <div className="dashboard-mandate-actions">
            <button
              className="dashboard-hometax-button"
              onClick={handleOpenHometax}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              홈택스로 이동
            </button>
            <button
              className="dashboard-complete-button"
              onClick={handleCompleteMandate}
              disabled={completeMandateMutation.isPending}
            >
              {completeMandateMutation.isPending ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              수임 동의 수락 완료
            </button>
          </div>
          <div className="dashboard-info-box">
            <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-gray-400">
              <p className="font-semibold text-gray-300 mb-1">수임 동의 수락 방법</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>"홈택스로 이동" 버튼을 클릭하여 홈택스 홈페이지로 이동합니다</li>
                <li>홈택스에서 세무사의 수임 동의 요청을 확인하고 수락합니다</li>
                <li>수락 완료 후 플랫폼으로 돌아와 "수임 동의 수락 완료" 버튼을 클릭합니다</li>
              </ol>
            </div>
          </div>
        </div>
      )
    }

    if (user.mandateStatus === 'COMPLETED') {
      return (
        <div className="dashboard-status-card dashboard-status-completed">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-lg font-bold text-green-300">수임 동의 완료</h3>
            <p className="text-sm text-gray-400">세무사와의 수임 동의가 완료되었습니다</p>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="dashboard-page">
      {/* 배경 장식 */}
      <div className="dashboard-background-decoration">
        <div className="dashboard-decoration-blob top-20 left-10"></div>
        <div className="dashboard-decoration-blob bottom-20 right-10 w-96 h-96 bg-purple-300/20"></div>
      </div>

      {/* 헤더 */}
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-logo">
            <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            <h1 className="dashboard-logo-text">세무 플랫폼</h1>
          </div>

          <div className="dashboard-header-actions">
            <button
              className="dashboard-notification-button"
              onClick={() => setShowNotificationModal(true)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="dashboard-notification-badge">{unreadCount}</span>
              )}
            </button>

            <button
              className="dashboard-profile-button"
              onClick={() => navigate('/profile')}
              title="프로필 설정"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            <button className="dashboard-logout-button" onClick={onLogout}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* 환영 카드 */}
          <div className="dashboard-welcome-card">
            <div>
              <h2 className="dashboard-welcome-title">환영합니다, {user.name}님!</h2>
              <p className="dashboard-welcome-subtitle">회원 대시보드</p>
            </div>
            <div className="dashboard-user-avatar">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* 결제 상태 카드 */}
          {isPaymentValid && (
            <div className="dashboard-info-card">
              <div className="dashboard-info-header">
                <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h3 className="dashboard-info-title">결제 상태</h3>
              </div>
              <p className="dashboard-info-content">
                결제 완료 (남은 기간: {paymentStatus?.daysRemaining}일)
              </p>
            </div>
          )}

          {/* 수임 해제 요청 알림 */}
          {releaseRequestNotification && (
            <div className="dashboard-notification-section">
              <div className="dashboard-status-card dashboard-status-warning">
                <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h3 className="text-lg font-bold text-orange-300">수임 해제 요청</h3>
                  <p className="text-sm text-gray-400">세무사가 기존 세무사와의 수임 관계 해제를 요청했습니다</p>
                </div>
              </div>
              <div className="dashboard-mandate-actions">
                <button
                  className="dashboard-hometax-button"
                  onClick={handleOpenHometax}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  홈택스로 이동하여 수임 해제
                </button>
                <button
                  className="dashboard-info-button"
                  onClick={() => alert('수임 해제를 완료하셨다면 다시 로그인하여 수임 동의 신청을 진행해주세요.')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  안내사항
                </button>
              </div>
              <div className="dashboard-info-box">
                <svg className="w-5 h-5 text-orange-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-gray-400">
                  <p className="font-semibold text-gray-300 mb-1">수임 해제 후 절차</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>"홈택스로 이동하여 수임 해제" 버튼을 클릭하여 홈택스에서 기존 세무사와의 수임 관계를 해제합니다</li>
                    <li>수임 해제를 완료한 후 다시 이 플랫폼으로 돌아옵니다</li>
                    <li>플랫폼에서 수임 동의 신청을 진행합니다</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* 액션 버튼 또는 상태 카드 */}
          <div className="dashboard-action-section">
            {renderActionButton()}
          </div>
        </div>
      </main>

      {/* 모달들 */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        user={user}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        user={user}
      />
    </div>
  )
}

export default ClientDashboard

