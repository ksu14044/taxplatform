import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { processPaymentApi } from '../api/paymentApi'

function PaymentModal({ isOpen, onClose, user, onPaymentSuccess }) {
  const [loading, setLoading] = useState(false)

  const paymentMutation = useMutation({
    mutationFn: () => processPaymentApi(user.userId),
    onSuccess: () => {
      setTimeout(() => {
        onPaymentSuccess()
        onClose()
      }, 1500)
    },
    onError: (error) => {
      alert(error.message)
      setLoading(false)
    }
  })

  const handlePayment = () => {
    setLoading(true)
    paymentMutation.mutate()
  }

  if (!isOpen) return null

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h2 className="payment-modal-title">결제하기</h2>
          <button className="payment-modal-close" onClick={onClose}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {paymentMutation.isSuccess ? (
          <div className="payment-success-message">
            <svg className="payment-success-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-2xl font-bold text-green-300">결제가 완료되었습니다!</p>
          </div>
        ) : (
          <>
            <div className="payment-modal-body">
              <div className="payment-info-card">
                <div className="payment-info-row">
                  <span className="payment-info-label">이름</span>
                  <span className="payment-info-value">{user.name}</span>
                </div>
                <div className="payment-info-row">
                  <span className="payment-info-label">이메일</span>
                  <span className="payment-info-value">{user.email}</span>
                </div>
                <div className="payment-info-divider"></div>
                <div className="payment-info-row">
                  <span className="payment-info-label">결제 금액</span>
                  <span className="payment-amount">30,000원</span>
                </div>
                <div className="payment-info-row">
                  <span className="payment-info-label">이용 기간</span>
                  <span className="payment-info-value">1개월</span>
                </div>
              </div>

              <div className="payment-notice">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-gray-300">
                  이것은 목업 결제 시스템입니다. 실제 결제는 이루어지지 않습니다.
                </p>
              </div>
            </div>

            <div className="payment-modal-footer">
              <button
                className="payment-cancel-button"
                onClick={onClose}
                disabled={loading}
              >
                취소
              </button>
              <button
                className="payment-confirm-button"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? '처리 중...' : '결제하기'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PaymentModal

