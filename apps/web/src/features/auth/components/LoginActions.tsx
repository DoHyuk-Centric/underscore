const providers = [
  { name: '카카오', className: 'bg-[#FEE500] text-[#191600]' },
  { name: '토스', className: 'bg-[#0064FF] text-white' },
]

interface LoginActionsProps {
  ready: boolean
  onLogin: () => void
}

function LoginActions({ ready, onLogin }: LoginActionsProps) {
  return (
    <div
      className={`absolute inset-x-0 bottom-16 z-10 grid w-full gap-2 px-6 ${ready ? 'login-actions-ready' : 'login-actions-pending'}`}
      aria-hidden={!ready}
    >
      <button type="button" className="rounded-xl bg-[#191f28] py-4 text-sm font-semibold text-white" disabled={!ready} onClick={onLogin}>
        로그인 없이 시작하기
      </button>
      <div className="flex items-center gap-3 py-1 text-xs text-[#8b95a1]">
        <span className="h-px flex-1 bg-[#e5e8eb]" />
        <span>또는</span>
        <span className="h-px flex-1 bg-[#e5e8eb]" />
      </div>
      {providers.map((provider) => (
        <button key={provider.name} type="button" className={`rounded-xl py-4 text-sm font-semibold ${provider.className}`} disabled={!ready} onClick={onLogin}>
          {provider.name}로 시작하기
        </button>
      ))}
    </div>
  )
}

export default LoginActions
