import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sendMandateRequestApi, getMandateListApi } from '../api/mandateApi'
import { getNotificationsApi, getUnreadCountApi } from '../api/notificationApi'
import NotificationModal from './NotificationModal'

function TaxAccountantDashboard({ user, onLogout }) {
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL') // ALL, REQUESTED, SENT, COMPLETED
  const queryClient = useQueryClient()

  // 알람 목록 조회
  const { data: notificationsData } = useQuery({
    queryKey: ['notifications', user.userId],
    queryFn: () => getNotificationsApi(user.userId),
    refetchInterval: 10000 // 10초마다 자동 갱신
  })

  // 읽지 않은 알람 개수 조회
  const { data: unreadCountData } = useQuery({
    queryKey: ['unreadCount', user.userId],
    queryFn: () => getUnreadCountApi(user.userId),
    refetchInterval: 10000 // 10초마다 자동 갱신
  })

  // 수임 동의 내역 조회
  const { data: mandateListData, isLoading: isMandateListLoading } = useQuery({
    queryKey: ['mandateList'],
    queryFn: () => getMandateListApi(),
    refetchInterval: 10000 // 10초마다 자동 갱신
  })

  // 수임 동의 요청 전송 Mutation
  const sendMandateMutation = useMutation({
    mutationFn: (clientId) => sendMandateRequestApi(user.userId, clientId),
    onSuccess: () => {
      alert('수임 동의 요청이 회원에게 전송되었습니다.')
      queryClient.invalidateQueries(['mandateList'])
      queryClient.invalidateQueries(['notifications', user.userId])
      setSelectedClientId(null)
    },
    onError: (error) => {
      alert(error.message)
    }
  })

  const unreadCount = unreadCountData?.data || 0
  const mandateList = mandateListData?.data || []

  // 상태별 필터링
  const filteredMandateList = statusFilter === 'ALL' 
    ? mandateList 
    : mandateList.filter(client => client.mandateStatus === statusFilter)

  // 상태별 카운트
  const statusCounts = {
    ALL: mandateList.length,
    REQUESTED: mandateList.filter(c => c.mandateStatus === 'REQUESTED').length,
    SENT: mandateList.filter(c => c.mandateStatus === 'SENT').length,
    COMPLETED: mandateList.filter(c => c.mandateStatus === 'COMPLETED').length
  }

  const handleOpenHometax = () => {
    window.open('https://www.hometax.go.kr', '_blank')
  }

  const handleSendMandateRequest = (clientId) => {
    if (window.confirm('홈택스에서 수임 동의 신청을 완료하셨습니까?\n회원에게 수임 동의 수락 요청 알람을 전송하시겠습니까?')) {
      sendMandateMutation.mutate(clientId)
    }
  }

  return (
    <div className="tax-dashboard-page">
      {/* 배경 장식 */}
      <div className="tax-dashboard-background-decoration">
        <div className="tax-dashboard-decoration-blob top-20 left-10"></div>
        <div className="tax-dashboard-decoration-blob bottom-20 right-10 w-96 h-96 bg-purple-300/20"></div>
      </div>

      {/* 헤더 */}
      <header className="tax-dashboard-header">
        <div className="tax-dashboard-header-content">
          <div className="tax-dashboard-logo">
            <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            <h1 className="tax-dashboard-logo-text">세무 플랫폼 - 세무사</h1>
          </div>

          <div className="tax-dashboard-header-actions">
            <button
              className="tax-dashboard-notification-button"
              onClick={() => setShowNotificationModal(true)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="tax-dashboard-notification-badge">{unreadCount}</span>
              )}
            </button>

            <button className="tax-dashboard-logout-button" onClick={onLogout}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="tax-dashboard-main">
        <div className="tax-dashboard-container">
          {/* 환영 카드 */}
          <div className="tax-dashboard-welcome-card">
            <div>
              <h2 className="tax-dashboard-welcome-title">환영합니다, {user.name} 세무사님!</h2>
              <p className="tax-dashboard-welcome-subtitle">세무사 대시보드</p>
            </div>
            <div className="tax-dashboard-user-avatar">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* 수임 동의 관리 */}
          <div className="tax-dashboard-section">
            <h3 className="tax-dashboard-section-title">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              수임 동의 관리 ({statusCounts.ALL})
            </h3>

            {/* 상태 필터 */}
            <div className="tax-dashboard-filter-tabs">
              <button
                className={`tax-dashboard-filter-tab ${statusFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setStatusFilter('ALL')}
              >
                전체 ({statusCounts.ALL})
              </button>
              <button
                className={`tax-dashboard-filter-tab ${statusFilter === 'REQUESTED' ? 'active' : ''}`}
                onClick={() => setStatusFilter('REQUESTED')}
              >
                신청됨 ({statusCounts.REQUESTED})
              </button>
              <button
                className={`tax-dashboard-filter-tab ${statusFilter === 'SENT' ? 'active' : ''}`}
                onClick={() => setStatusFilter('SENT')}
              >
                요청 전송됨 ({statusCounts.SENT})
              </button>
              <button
                className={`tax-dashboard-filter-tab ${statusFilter === 'COMPLETED' ? 'active' : ''}`}
                onClick={() => setStatusFilter('COMPLETED')}
              >
                완료 ({statusCounts.COMPLETED})
              </button>
            </div>

            {isMandateListLoading ? (
              <div className="tax-dashboard-loading">
                <svg className="animate-spin h-8 w-8 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-400">불러오는 중...</p>
              </div>
            ) : filteredMandateList.length === 0 ? (
              <div className="tax-dashboard-empty">
                <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-400">
                  {statusFilter === 'ALL' ? '수임 동의 내역이 없습니다' : `${statusFilter === 'REQUESTED' ? '신청된' : statusFilter === 'SENT' ? '요청 전송된' : '완료된'} 수임 동의가 없습니다`}
                </p>
              </div>
            ) : (
              <div className="tax-dashboard-request-list">
                {filteredMandateList.map((client) => (
                  <div key={client.userId} className="tax-dashboard-request-card">
                    <div className="tax-dashboard-request-content">
                      <div className="tax-dashboard-request-header">
                        <span className={`tax-dashboard-status-badge status-${client.mandateStatus.toLowerCase()}`}>
                          {client.mandateStatus === 'REQUESTED' && '신청됨'}
                          {client.mandateStatus === 'SENT' && '요청 전송됨'}
                          {client.mandateStatus === 'COMPLETED' && '완료'}
                        </span>
                        <span className="tax-dashboard-request-time">
                          {new Date(client.updatedAt).toLocaleString('ko-KR')}
                        </span>
                      </div>
                      <div className="tax-dashboard-client-info">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-bold text-slate-800">{client.name}</h4>
                          <span className={`tax-dashboard-user-type-badge ${
                            client.userType === 'CORPORATE' ? 'type-corporate' : 
                            client.userType === 'INDIVIDUAL' ? 'type-individual' : 'type-non-business'
                          }`}>
                            {client.userType === 'CORPORATE' && '법인사업자'}
                            {client.userType === 'INDIVIDUAL' && '개인사업자'}
                            {client.userType === 'NON_BUSINESS' && '비사업자'}
                          </span>
                        </div>
                        <div className="tax-dashboard-request-info">
                          <span className="text-sm text-gray-400">ID: {client.userId}</span>
                          <span className="text-sm text-gray-400">주민등록번호: {client.residentNumber}</span>
                          <span className="text-sm text-gray-400">이메일: {client.email}</span>
                          <span className="text-sm text-gray-400">전화: {client.phoneNumber}</span>
                          {client.businessNumber && (
                            <span className="text-sm text-gray-400">사업자번호: {client.businessNumber}</span>
                          )}
                          {client.corporateNumber && (
                            <span className="text-sm text-gray-400">법인번호: {client.corporateNumber}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {client.mandateStatus === 'REQUESTED' && (
                      <div className="tax-dashboard-request-actions">
                        <button
                          className="tax-dashboard-hometax-button"
                          onClick={handleOpenHometax}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          홈택스로 이동
                        </button>
                        <button
                          className="tax-dashboard-action-button"
                          onClick={() => {
                            setSelectedClientId(client.userId)
                            handleSendMandateRequest(client.userId)
                          }}
                          disabled={sendMandateMutation.isPending}
                        >
                          {sendMandateMutation.isPending && selectedClientId === client.userId ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          수임 동의 요청 전송
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 안내 카드 */}
          <div className="tax-dashboard-info-card">
            <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-bold text-gray-200 mb-1">수임 동의 처리 방법</h4>
              <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                <li>회원의 수임 동의 신청 알람을 확인합니다</li>
                <li>"홈택스로 이동" 버튼을 클릭하여 홈택스 홈페이지로 이동합니다</li>
                <li>홈택스에서 해당 회원의 정보를 토대로 수임 동의 요청을 보냅니다</li>
                <li>홈택스 처리 완료 후 플랫폼으로 돌아와 "수임 동의 요청 전송" 버튼을 클릭합니다</li>
                <li>회원에게 홈택스에서 수임 동의를 수락하라는 알람이 전송됩니다</li>
              </ol>
            </div>
          </div>
        </div>
      </main>

      {/* 알람 모달 */}
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        user={user}
      />
    </div>
  )
}

export default TaxAccountantDashboard

