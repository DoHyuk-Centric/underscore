import {
  findForbiddenPhrase,
  parseDiagnosisOutput,
  type DiagnosisOutput,
} from './diagnosis.schema.js';

const validOutput: DiagnosisOutput = {
  headline: '차세대 발사체 연소기 공급계약 소식에 30% 올랐어요.',
  companyIntro: null,
  impactContext: null,
  marketContext: [],
  caution: '단기간 급등한 종목이라 변동성이 커질 수 있어요.',
  newsIds: [1],
  disclosureIds: [],
};

describe('parseDiagnosisOutput', () => {
  it('JSON 문자열을 검증해 반환한다', () => {
    expect(parseDiagnosisOutput(JSON.stringify(validOutput))).toEqual(validOutput);
  });

  it('코드 블록으로 감싼 JSON도 처리한다', () => {
    const text = '```json\n' + JSON.stringify(validOutput) + '\n```';

    expect(parseDiagnosisOutput(text)).toEqual(validOutput);
  });

  it('disclosureIds가 없으면 빈 배열로 채운다', () => {
    const { disclosureIds: _ids, ...withoutDisclosures } = validOutput;

    expect(parseDiagnosisOutput(JSON.stringify(withoutDisclosures))).toEqual(
      validOutput,
    );
  });

  it('필수 필드가 없으면 실패한다', () => {
    const { caution: _caution, ...withoutCaution } = validOutput;

    expect(() => parseDiagnosisOutput(JSON.stringify(withoutCaution))).toThrow();
  });

  it('근거 기사 id가 3개를 넘으면 실패한다', () => {
    const text = JSON.stringify({ ...validOutput, newsIds: [1, 2, 3, 4] });

    expect(() => parseDiagnosisOutput(text)).toThrow();
  });
});

describe('findForbiddenPhrase', () => {
  it('안내 문구는 통과시킨다', () => {
    const output = {
      ...validOutput,
      caution: '매수 전에 실제 공시와 사업 내용을 직접 확인하세요.',
    };

    expect(findForbiddenPhrase(output)).toBeNull();
  });

  it.each([
    ['지금 매수하세요', '매수하세요'],
    ['목표가 2만원까지 열려 있어요', '목표가'],
    ['손절 라인을 잡아 두세요', '손절 라인'],
    ['일부는 팔아야 해요', '팔아야'],
  ])('%s 표현을 걸러낸다', (caution, expected) => {
    expect(findForbiddenPhrase({ ...validOutput, caution })).toBe(expected);
  });

  it('headline과 marketContext도 검사한다', () => {
    expect(
      findForbiddenPhrase({ ...validOutput, headline: '지금 사세요' }),
    ).toBe('사세요');
    expect(
      findForbiddenPhrase({ ...validOutput, marketContext: ['목표주가 상향'] }),
    ).toBe('목표주가');
  });
});
