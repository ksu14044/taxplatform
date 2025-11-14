import { useState, useEffect } from 'react'
import Auth from './components/Auth'
import ClientDashboard from './components/ClientDashboard'
import TaxAccountantDashboard from './components/TaxAccountantDashboard'

function App() {
  const [user, setUser] = useState(null)

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
  }, [])

  const handleLoginSuccess = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  // 역할에 따라 다른 대시보드 렌더링
  const renderDashboard = () => {
    if (!user) {
      return <Auth onLoginSuccess={handleLoginSuccess} />
    }

    // 세무사인 경우
    if (user.role === 'TAX_ACCOUNTANT') {
      return <TaxAccountantDashboard user={user} onLogout={handleLogout} />
    }

    // 일반 회원인 경우 (기본값)
    return <ClientDashboard user={user} onLogout={handleLogout} />
  }

  return (
    <>
      {renderDashboard()}
    </>
  )
}

export default App
