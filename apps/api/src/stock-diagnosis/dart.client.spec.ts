import {
  extractBusinessOverview,
  parseCorpCodes,
  xmlToText,
} from './dart.client.js';

describe('parseCorpCodes', () => {
  it('상장사의 종목코드와 고유번호를 매핑하고 비상장사는 제외한다', () => {
    const xml = `<result>
      <list><corp_code>00126380</corp_code><corp_name>삼성전자</corp_name><stock_code>005930</stock_code></list>
      <list><corp_code>00999999</corp_code><corp_name>비상장</corp_name><stock_code> </stock_code></list>
      <list><corp_code>01234567</corp_code><corp_name>나라스페이스</corp_name><stock_code>478340</stock_code></list>
    </result>`;

    const corpCodes = parseCorpCodes(xml);

    expect(corpCodes.get('005930')).toBe('00126380');
    expect(corpCodes.get('478340')).toBe('01234567');
    expect(corpCodes.size).toBe(2);
  });
});

describe('xmlToText', () => {
  it('태그와 엔티티를 걷어내고 문단 구분을 줄바꿈으로 남긴다', () => {
    const xml =
      '<?xml version="1.0" encoding="utf-8"?><BODY><TITLE>공급계약</TITLE><P>계약금액&nbsp;4,500,000,000</P><TABLE><TR><TD>매출액대비(%)</TD><TD>14.9</TD></TR></TABLE></BODY>';

    expect(xmlToText(xml)).toBe('공급계약\n계약금액 4,500,000,000\n매출액대비(%) 14.9');
  });

  it('스타일·스크립트 블록은 본문에서 뺀다', () => {
    const html =
      '<html><style>.xforms * { font-family: 돋움체;}</style><script>var a = 1;</script><P>조회공시 요구</P></html>';

    expect(xmlToText(html)).toBe('조회공시 요구');
  });
});

describe('extractBusinessOverview', () => {
  it('"사업의 내용" 이후의 "사업의 개요"부터 발췌한다', () => {
    const text = [
      'I. 회사의 개요',
      '1. 회사의 개요 사업의 개요는 II장을 참고하세요.',
      'II. 사업의 내용',
      '1. 사업의 개요',
      '당사는 전력기기와 특수전지를 제조합니다.',
    ].join('\n');

    expect(extractBusinessOverview(text)).toBe(
      '당사는 전력기기와 특수전지를 제조합니다.',
    );
  });

  it('목차에 나온 "사업의 개요"는 건너뛰고 본문을 발췌한다', () => {
    const text = [
      'II. 사업의 내용 1. 사업의 개요 ----------- 11 2. 주요 제품 및 서비스 ----------- 12',
      'II. 사업의 내용',
      '1. 사업의 개요',
      '당사는 희귀질환 유전체 분석 서비스를 제공합니다.',
    ].join('\n');

    expect(extractBusinessOverview(text)).toBe(
      '당사는 희귀질환 유전체 분석 서비스를 제공합니다.',
    );
  });

  it('"사업의 개요"가 없으면 null을 반환한다', () => {
    expect(extractBusinessOverview('I. 회사의 개요')).toBeNull();
  });
});
