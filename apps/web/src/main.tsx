import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait'
import './index.css'
import App from './App.tsx'

function isAppsInTossRuntime() {
  return (
    typeof window !== 'undefined' &&
    Object.prototype.hasOwnProperty.call(window, '__appsInTossConstants')
  )
}

const app = <App />
const content = isAppsInTossRuntime() ? (
  <TDSMobileAITProvider>{app}</TDSMobileAITProvider>
) : (
  app
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {content}
  </StrictMode>,
)
