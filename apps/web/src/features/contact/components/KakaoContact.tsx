import './KakaoContact.css'

export function KakaoContact() {
  return (
    <a
      className="kakao-contact"
      href="https://open.kakao.com/o/sgiUE8Mi"
      target="_blank"
      rel="noreferrer"
      aria-label="카카오 오픈채팅으로 의견 보내기"
    >
      <span className="kakao-contact__icon" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 4C6.48 4 3 7.02 3 10.7c0 2.35 1.55 4.43 4 5.62l-.8 3.18 3.5-2.24c.74.13 1.51.2 2.3.2 5.52 0 9-3.03 9-6.76S17.52 4 12 4Z" fill="currentColor" />
          <path d="M8 10.5h8" stroke="#FEE500" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
      <span className="kakao-contact__label">의견 보내기</span>
    </a>
  )
}
