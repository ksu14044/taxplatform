import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotificationsApi, markAsReadApi } from '../api/notificationApi'

function NotificationModal({ isOpen, onClose, user }) {
  const queryClient = useQueryClient()

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications', user.userId],
    queryFn: () => getNotificationsApi(user.userId),
    enabled: isOpen
  })

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) => markAsReadApi(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications', user.userId])
      queryClient.invalidateQueries(['unreadCount', user.userId])
    }
  })

  const handleMarkAsRead = (notificationId) => {
    markAsReadMutation.mutate(notificationId)
  }

  const notifications = notificationsData?.data || []

  if (!isOpen) return null

  return (
    <div className="notification-modal-overlay" onClick={onClose}>
      <div className="notification-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="notification-modal-header">
          <h2 className="notification-modal-title">알람</h2>
          <button className="notification-modal-close" onClick={onClose}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="notification-modal-body">
          {isLoading ? (
            <div className="notification-loading">
              <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-400">알람을 불러오는 중...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notification-empty">
              <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-gray-400">알람이 없습니다</p>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <div
                  key={notification.notificationId}
                  className={`notification-item ${notification.isRead ? 'notification-item-read' : 'notification-item-unread'}`}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.notificationId)}
                >
                  <div className="notification-item-content">
                    <div className="notification-item-header">
                      {!notification.isRead && (
                        <span className="notification-unread-badge"></span>
                      )}
                      <span className={`notification-type-badge ${
                        notification.type === 'CLIENT_TO_TAX' ? 'notification-type-client' : 'notification-type-tax'
                      }`}>
                        {notification.type === 'CLIENT_TO_TAX' ? '회원 요청' : '세무사 알람'}
                      </span>
                      {notification.message.includes('수임 동의') && (
                        <span className="notification-mandate-badge">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          수임 동의
                        </span>
                      )}
                    </div>
                    <p className="notification-message">{notification.message}</p>
                    <p className="notification-time">
                      {new Date(notification.createdAt).toLocaleString('ko-KR')}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <button
                      className="notification-read-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMarkAsRead(notification.notificationId)
                      }}
                    >
                      읽음
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationModal

