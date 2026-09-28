import { lazy, Suspense, useCallback, useState } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { FullscreenNavigationMenu } from './components/FullscreenNavigationMenu'
import { Header } from './components/Header'
import AiPage from './pages/AiPage'
import GuidePage from './pages/GuidePage'
import HistoryPage from './pages/HistoryPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import StockDetailPage from './pages/StockDetailPage'
import { useDailyPopularDataSync } from './hooks/useDailyPopularDataSync'

// AI 진단 버전 비교는 개발 서버에서만 여는 내부 도구라 배포 빌드에는 포함하지 않습니다.
const DiagnosisComparePage = import.meta.env.DEV
  ? lazy(() => import('./pages/DiagnosisComparePage'))
  : null

const TabLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const openMenu = useCallback(() => setIsMenuOpen(true), [])
  const closeMenu = useCallback(() => setIsMenuOpen(false), [])

  return (
    <div className="grid grid-rows-[auto_1fr_auto] h-dvh">
      <Header isMenuOpen={isMenuOpen} onMenuOpen={openMenu} />
      <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden scrollbar-gutter-stable">
        <Outlet />
      </div>
      <BottomNav />
      <FullscreenNavigationMenu open={isMenuOpen} onClose={closeMenu} />
    </div>
  )
}

const App = () => {
  useDailyPopularDataSync()

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/guide" element={<GuidePage />} />
      <Route path="/stocks/:stockCode" element={<StockDetailPage />} />
      {DiagnosisComparePage ? (
        <Route
          path="/dev/diagnosis-compare"
          element={
            <Suspense fallback={null}>
              <DiagnosisComparePage />
            </Suspense>
          }
        />
      ) : null}
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

