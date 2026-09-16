const HANGUL_BASE = 0xac00;
const HANGUL_LAST = 0xd7a3;
const CHOSUNG_UNIT = 588; // 중성(21) * 종성(28)

const CHOSUNG_LIST = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
] as const;

function getChosung(char: string): string | null {
  const code = char.charCodeAt(0) - HANGUL_BASE;
  if (code < 0 || code > HANGUL_LAST - HANGUL_BASE) return null;
  return CHOSUNG_LIST[Math.floor(code / CHOSUNG_UNIT)];
}

function isStandaloneConsonant(char: string): boolean {
  return char >= 'ㄱ' && char <= 'ㅎ';
}

function matchesAt(target: string, query: string, offset: number): boolean {
  for (let i = 0; i < query.length; i++) {
    const queryChar = query[i];
    const targetChar = target[offset + i];
    if (targetChar === undefined) return false;

    if (isStandaloneConsonant(queryChar)) {
      if (getChosung(targetChar) !== queryChar) return false;
    } else if (targetChar !== queryChar) {
      return false;
    }
  }
  return true;
}

/**
 * target 안에 query가 포함되는지 검사하되, query의 마지막 글자가 아직
 * 조합되지 않은 단독 자음(예: '삼ㅅ'의 'ㅅ')이면 해당 위치는 초성만 일치해도 매칭으로 본다.
 */
export function includesHangulFuzzy(target: string, query: string): boolean {
  if (query.length === 0) return true;
  if (query.length > target.length) return false;

  for (let offset = 0; offset <= target.length - query.length; offset++) {
    if (matchesAt(target, query, offset)) return true;
  }
  return false;
}
