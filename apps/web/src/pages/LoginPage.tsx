import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginActions from '../features/auth/components/LoginActions'
import LoginBackground from '../features/auth/components/LoginBackground'
import LoginLogo from '../features/auth/components/LoginLogo'

function LoginPage() {
  const navigate = useNavigate()
  const [loginReady, setLoginReady] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  return (
    <main className="relative isolate min-h-dvh bg-[#f7f8fa]">
      <LoginBackground visible={loginReady} />
      <LoginLogo onReady={() => setLoginReady(true)} />
      <LoginActions ready={loginReady} onLogin={() => navigate('/home')} />
    </main>
  )
}

export default LoginPage
