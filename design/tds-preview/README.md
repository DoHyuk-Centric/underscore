# 밑줄 · 공식 TDS 디자인 시안

앱인토스 미니앱의 디자인 검토를 위한 React 시안이다. `@toss/tds-mobile@2.5.1`과 `@toss/tds-mobile-ait@2.5.1`의 실제 컴포넌트를 사용한다. 기존 수작업 HTML 시안은 비교용으로 보존했다.

## 실행

이 폴더에서 다음 명령을 실행한다.

```sh
npm ci --ignore-scripts
npm run dev -- --port 5173 --strictPort
```

브라우저에서 <http://127.0.0.1:5173/>를 연다. 타입 검사와 정적 빌드는 `npm run build`로 실행한다.

## 화면과 연결

- 내 자산 → 가온테크 → 시장가(현재가) 또는 지정가 선택 → 하단 − / + 수량 조절 → 매수/매도 → 체결 처리 모달(약 1초) → 성공 안내(약 1초) → 판단 입력 → 저장 또는 닫기
- 주문 버튼을 누르면 같은 모달에서 `주문을 안전하게 반영하고 있어요`를 약 1초간 보여준 뒤 `성공적으로 매수/매도가 체결되었습니다`로 전환한다. 성공 안내를 약 1초 보여준 다음 거래 요약과 판단 입력창을 열고, 판단 저장은 체결된 거래에 근거를 연결하며 닫기는 판단을 저장하지 않는다.
- 매도 완료 → 판단 리플레이 만들기 → 작성 상태 → 리플레이 확인
- 판단 기록 → 개별 리플레이 / 월간 리포트
- 종목 찾기 → 이름·업종 검색
- 내 정보 → 리포트·기록 목록

## 공식 컴포넌트 적용

| 화면 영역 | 실제 사용하는 TDS 컴포넌트 |
| --- | --- |
| 상단 내비게이션 | RootTopNavigation, TopNavigation, TopNavigationBackButton, TopNavigationTextButton |
| 상위 화면 전환 | Tab, Tab.Item |
| 화면 제목·금액 | Top, Top.TitleParagraph, Top.SubtitleParagraph |
| 목록과 섹션 | ListHeader, ListRow, ListRow.Texts, Border, Spacing |
| 항목별 금액 비교 | TableRow |
| 거래 입력 | NumericSpinner, BottomSheet, Tab, TextField, TextArea |
| 주요 행동 | BottomCTA.Single, BottomCTA.Double, Button |
| 체결 상태·판단 모달 | Loader, Asset.Image(공식 체크 에셋), BottomSheet, BottomSheet.DoubleCTA, TextArea |
| AI 작성 상태·문서 | Loader, Badge, Paragraph |

패키지의 글꼴·행 높이·여백·모서리·터치 효과를 직접 재현하지 않는다. `layout.css`는 미리보기 배치, 종목의 예시 이니셜, 서비스 고유 차트만 담당한다. 상단 내비게이션의 위치만 시안 프레임 안에 놓이도록 조정했다. 실제 앱인토스 SDK 통합 시 플랫폼 내비게이션과 중복되지 않게 연결해야 한다.

## 시안의 범위

모든 종목명·거래·수급·공시는 가상 예시다. 거래 버튼은 화면을 전환할 뿐 서버 주문이나 자산 변경을 일으키지 않는다. AI 생성 단계는 타이머로 시연하며 실제 DART 조회나 AI 호출은 하지 않는다. 화면별 예시 데이터를 사용하므로 완성된 거래 원장처럼 상태가 누적되지는 않는다. 외부 리소스 연결은 TDS의 폰트·아이콘 로딩에 사용된다.

요금제와 횟수 차감 정책은 확정되지 않아 결제 화면을 만들지 않았다. 이 시안은 앱인토스 내부 서비스 디자인 검토용이며 외부 웹 서비스 배포물이 아니다.

## 확인한 항목

- TypeScript 타입 검사와 Vite 빌드
- 실제 TDS의 브라우저 렌더링 및 런타임 오류
- 수량 1~10주 조절, 매수 가능 7주를 초과하면 매수 버튼 비활성화
- 주문 방식은 시장가·현재가를 기본으로 하며, 지정가 선택 시 가격 입력과 예상 거래금액을 다시 계산
- 매수·매도 버튼을 누르면 같은 BottomSheet에서 약 1초간 체결 상태를 보여준 뒤 `icon-check-circle-green.svg`와 성공 문구로 전환하고, 다시 약 1초 뒤 거래 근거 입력 단계로 전환
- 판단 입력 모달 닫기·재열기, 공백 판단의 확정 방지
- 매도 → 완료 → AI 작성 → 리플레이 흐름
- 검색 결과 없음, 월간 리포트, 출처·용어 펼치기
- 320 / 360 / 390 / 736 / 1280px 가로 넘침

`qa/check.cjs`는 Playwright로 위 동작을 검사한다. Playwright가 별도 위치에 있으면 `PLAYWRIGHT_MODULE_PATH`에 해당 모듈 경로를 지정한다. 테스트는 로컬 Edge 헤드리스 브라우저를 사용하며 `qa/screenshots`에 검토 이미지를 생성한다.

## 공식 근거

- [TDS Mobile 소개](https://tossmini-docs.toss.im/tds-mobile/)
- [패키지 설치와 TDSMobileAITProvider](https://tossmini-docs.toss.im/tds-mobile/start/)
- [Top 구성](https://tossmini-docs.toss.im/tds-mobile/components/top/)
- [ListRow 구성](https://tossmini-docs.toss.im/tds-mobile/components/ListRow/list-row-overview/)

설치된 패키지의 공개 TypeScript 인터페이스를 기준으로 지원하는 속성을 검증했다.
