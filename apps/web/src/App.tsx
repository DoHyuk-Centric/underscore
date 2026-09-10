const providers = [
  { name: '카카오', className: 'bg-[#FEE500] text-[#191600]' },
  { name: 'Google', className: 'border border-[#d1d6db] bg-white text-[#191f28]' },
  { name: '토스', className: 'bg-[#191f28] text-white' },
]

function App() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#f7f8fa]">
      <div className="absolute top-1/2 left-1/2 animate-[logo-rise_0.5s_ease-in-out_1s_both]">
        <div className="relative inline-block text-4xl font-extrabold text-[#191f28]">
          <span className="inline-block animate-[logo-bounce_0.4s_ease-out_0.6s_both]">밑줄</span>
          <span className="absolute inset-x-0 -bottom-3 h-1 origin-left animate-[draw-underline_0.6s_ease-out_forwards] rounded-full bg-[#191f28]" />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-16 grid w-full gap-2 px-6 opacity-0 animate-[login-fade-in_0.5s_ease-out_1.3s_forwards]">
        {providers.map((provider) => (
          <button
            key={provider.name}
            type="button"
            className={`rounded-full py-4 text-sm font-semibold ${provider.className}`}
          >
            {provider.name}로 시작하기
          </button>
        ))}
      </div>
    </div>
  )
}

export default App
