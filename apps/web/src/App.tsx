import { useState } from 'react'

const providers = [
  { name: '카카오', className: 'bg-[#FEE500] text-[#191600]' },
  { name: '토스', className: 'bg-[#0064FF] text-white' },
]

type Screen = 'login' | 'home'

function HomeScreen() {
  return (
    <main className="home-screen">
      <header className="home-header">
        <div className="home-brand">
          <span className="home-brand-mark" aria-hidden="true" />
          밑줄
        </div>
        <button type="button" className="home-profile" aria-label="내 프로필">
          나
        </button>
      </header>

      <section className="home-intro">
        <p className="home-eyebrow">AI 판단 리플레이</p>
        <h1>
          내 거래가
          <br />
          다음 판단의 밑줄이 되도록
        </h1>
        <p>수익률과 함께, 그때의 이유도 돌아봐요.</p>
      </section>

      <button type="button" className="home-primary-action">
        첫 거래 기록하기
        <span aria-hidden="true">→</span>
      </button>

      <section className="home-replays" aria-labelledby="replay-title">
        <div className="home-section-heading">
          <h2 id="replay-title">나의 판단 리플레이</h2>
          <span>0개</span>
        </div>
        <div className="home-empty-state">
          <div className="home-empty-icon" aria-hidden="true">
            _
          </div>
          <strong>첫 기록을 기다리고 있어요</strong>
          <p>거래를 남기면 AI와 함께 그때의 판단을 돌아볼 수 있어요.</p>
        </div>
      </section>
    </main>
  )
}

function App() {
  const [screen, setScreen] = useState<Screen>('login')
  const [loginReady, setLoginReady] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  if (screen === 'home') {
    return <HomeScreen />
  }

  return (
    <div className="relative isolate min-h-dvh bg-[#f7f8fa]">
      <div className="stock-hanzi-cloud" aria-hidden="true">
        <span className="stock-hanzi">株</span>
        <span className="stock-hanzi">益</span>
      </div>
      <div className="absolute top-1/2 left-1/2 z-10 animate-[logo-rise_0.5s_ease-in-out_1s_both]">
        <div className="relative inline-block pt-7 text-4xl font-extrabold text-[#191f28]">
          <svg
            viewBox="0 0 64 64"
            aria-hidden="true"
            className="logo-favicon absolute -top-8 left-1/2 h-16 w-16 -translate-x-1/2"
          >
            <g transform="translate(6.8 13.8) scale(0.15)" fill="#191f28">
              <path
                className="favicon-piece favicon-piece-top"
                d="M 0 66 C 67 57 166 15 238 2 C 271 -4 292 7 299 24 L 229 64 C 241 51 208 47 177 50 C 118 53 46 76 0 66 Z"
              />
              <path
                className="favicon-piece favicon-piece-middle"
                d="M 299 24 C 317 67 245 95 195 122 C 146 148 93 182 49 184 C 34 185 28 182 29 180 L 15 218 C 6 169 57 137 123 108 C 168 88 218 72 229 64 Z"
              />
              <path
                className="favicon-piece favicon-piece-bottom"
                onAnimationEnd={() => setLoginReady(true)}
                d="M 29 180 C 16 190 50 193 77 189 C 148 180 229 164 289 170 C 316 171 331 179 333 193 C 337 221 311 240 273 240 L 47 240 C 27 240 17 234 15 218 Z"
              />
            </g>
          </svg>
          <span className="inline-block animate-[logo-bounce_0.4s_ease-out_0.6s_both]">밑줄</span>
          <span className="absolute inset-x-0 -bottom-3 h-1 origin-left animate-[draw-underline_0.6s_ease-out_forwards] rounded-full bg-[#191f28]" />
        </div>
      </div>

      <div
        className={`absolute inset-x-0 bottom-16 z-10 grid w-full gap-2 px-6 ${loginReady ? 'login-actions-ready' : 'login-actions-pending'}`}
        aria-hidden={!loginReady}
      >
        <button
          type="button"
          className="rounded-xl bg-[#191f28] py-4 text-sm font-semibold text-white"
          disabled={!loginReady}
          onClick={() => setScreen('home')}
        >
          로그인 없이 시작하기
        </button>
        <div className="flex items-center gap-3 py-1 text-xs text-[#8b95a1]">
          <span className="h-px flex-1 bg-[#e5e8eb]" />
          <span>또는</span>
          <span className="h-px flex-1 bg-[#e5e8eb]" />
        </div>
        {providers.map((provider) => (
          <button
            key={provider.name}
            type="button"
            className={`rounded-xl py-4 text-sm font-semibold ${provider.className}`}
            disabled={!loginReady}
            onClick={() => setScreen('home')}
          >
            {provider.name}로 시작하기
          </button>
        ))}
      </div>
    </div>
  )
}

export default App
