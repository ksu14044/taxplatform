import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Auth from './components/Auth'
import ClientDashboard from './components/ClientDashboard'
import TaxAccountantDashboard from './components/TaxAccountantDashboard'
import Profile from './components/Profile'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // 컴포넌트 마운트 시 로컬 스토리지에서 사용자 정보 확인
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        console.error('Failed to parse user data:', e)
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const handleLoginSuccess = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  // 보호된 라우트 컴포넌트
  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    if (loading) {
      return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>
    }

    if (!user) {
      return <Navigate to="/login" replace />
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return <Navigate to="/login" replace />
    }

    return children
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>
  }

  return (
    <Router>
      <Routes>
        {/* 로그인 페이지 */}
        <Route
          path="/login"
          element={
            user ? (
              user.role === 'TAX_ACCOUNTANT' ? (
                <Navigate to="/dashboard/tax-accountant" replace />
              ) : (
                <Navigate to="/dashboard/client" replace />
              )
            ) : (
              <Auth onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* 클라이언트 대시보드 (보호된 라우트) */}
        <Route
          path="/dashboard/client"
          element={
            <ProtectedRoute allowedRoles={['CLIENT']}>
              <ClientDashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* 세무사 대시보드 (보호된 라우트) */}
        <Route
          path="/dashboard/tax-accountant"
          element={
            <ProtectedRoute allowedRoles={['TAX_ACCOUNTANT']}>
              <TaxAccountantDashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* 프로필 페이지 (보호된 라우트) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* 기본 경로 - 로그인 상태에 따라 리다이렉트 */}
        <Route
          path="/"
          element={
            user ? (
              user.role === 'TAX_ACCOUNTANT' ? (
                <Navigate to="/dashboard/tax-accountant" replace />
              ) : (
                <Navigate to="/dashboard/client" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 404 페이지 - 정의되지 않은 경로 */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </Router>
  )
}

export default App
