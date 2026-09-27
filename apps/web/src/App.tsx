import { useCallback, useState } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { FullscreenNavigationMenu } from './components/FullscreenNavigationMenu'
import { Header } from './components/Header'
import AiPage from './pages/AiPage'
import GuidePage from './pages/GuidePage'
import HistoryPage from './pages/HistoryPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'

function TabLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const openMenu = useCallback(() => setIsMenuOpen(true), [])
  const closeMenu = useCallback(() => setIsMenuOpen(false), [])

  return (
    <div className="grid grid-rows-[auto_1fr_auto] h-dvh">
      <Header isMenuOpen={isMenuOpen} onMenuOpen={openMenu} />
      <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </div>
      <BottomNav />
      <FullscreenNavigationMenu open={isMenuOpen} onClose={closeMenu} />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/guide" element={<GuidePage />} />
      <Route element={<TabLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/ai" element={<AiPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
