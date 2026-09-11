interface LoginLogoProps {
  onReady: () => void
}

function LoginLogo({ onReady }: LoginLogoProps) {
  return (
    <div className="absolute top-1/2 left-1/2 z-10 animate-[logo-rise_0.5s_ease-in-out_1s_both]">
      <div className="relative inline-block pt-7 text-4xl font-extrabold text-[#191f28]">
        <svg viewBox="0 0 64 64" aria-hidden="true" className="logo-favicon absolute -top-8 left-1/2 h-16 w-16 -translate-x-1/2">
          <g transform="translate(6.8 13.8) scale(0.15)" fill="#191f28">
            <path className="favicon-piece favicon-piece-top" d="M 0 66 C 67 57 166 15 238 2 C 271 -4 292 7 299 24 L 229 64 C 241 51 208 47 177 50 C 118 53 46 76 0 66 Z" />
            <path className="favicon-piece favicon-piece-middle" d="M 299 24 C 317 67 245 95 195 122 C 146 148 93 182 49 184 C 34 185 28 182 29 180 L 15 218 C 6 169 57 137 123 108 C 168 88 218 72 229 64 Z" />
            <path className="favicon-piece favicon-piece-bottom" onAnimationEnd={onReady} d="M 29 180 C 16 190 50 193 77 189 C 148 180 229 164 289 170 C 316 171 331 179 333 193 C 337 221 311 240 273 240 L 47 240 C 27 240 17 234 15 218 Z" />
          </g>
        </svg>
        <span className="inline-block animate-[logo-bounce_0.4s_ease-out_0.6s_both]">밑줄</span>
        <span className="absolute inset-x-0 -bottom-3 h-1 origin-left animate-[draw-underline_0.6s_ease-out_forwards] rounded-full bg-[#191f28]" />
      </div>
    </div>
  )
}

export default LoginLogo
