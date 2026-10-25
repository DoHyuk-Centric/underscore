// vitest가 넘기는 실행 모드(--mode). 평가 파일은 이 값으로 게이트·캡처·다시 채점 중 하나만 실행합니다.
interface ImportMeta {
  readonly env: { readonly MODE: string };
}
