import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

import aitDevtools from "@apps-in-toss/devtools/unplugin";

// AI 진단 비교 페이지(/dev/diagnosis-compare)가 읽는 버전별 결과 폴더입니다.
// 프로젝트 바깥이라 새 파일이 생겨도 감지되지 않아 개발 서버 감시 대상에 추가합니다.
const watchDiagnosisLog = (): Plugin => ({
  name: 'watch-diagnosis-log',
  apply: 'serve',
  configureServer(server) {
    server.watcher.add(fileURLToPath(new URL('../../docs/ai-diagnosis-log', import.meta.url)))
  },
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    ...(mode === 'ait' ? [aitDevtools.vite()] : []),
    react(),
    tailwindcss(),
    watchDiagnosisLog(),
  ],
  server: {
    proxy: {
      '/market-data': 'http://localhost:3000',
    },
  },
}))
