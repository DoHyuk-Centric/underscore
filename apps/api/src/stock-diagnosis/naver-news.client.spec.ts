import { selectArticles, stripHtml } from './naver-news.client.js';

const item = (overrides: Partial<Parameters<typeof selectArticles>[0][number]> = {}) => ({
  title: '<b>비츠로테크</b> 상한가',
  originallink: 'https://news.example.com/1',
  link: 'https://n.news.naver.com/1',
  description: '&quot;계약&quot; 체결 &amp; 공시',
  // 2026-09-17 15:00 KST
  pubDate: 'Thu, 17 Sep 2026 15:00:00 +0900',
  ...overrides,
});

describe('stripHtml', () => {
  it('태그와 HTML 엔티티를 제거한다', () => {
    expect(stripHtml('<b>비츠로테크</b> &quot;상한가&quot; &amp; 계약')).toBe(
      '비츠로테크 "상한가" & 계약',
    );
  });
});

describe('selectArticles', () => {
  it('기사를 정리해 id를 매기고 원문 링크를 사용한다', () => {
    expect(selectArticles([item()], '20260917', '비츠로테크')).toEqual([
      {
        id: 1,
        title: '비츠로테크 상한가',
        description: '"계약" 체결 & 공시',
        url: 'https://news.example.com/1',
        publishedDate: '2026-09-17',
      },
    ]);
  });

  it('원문 링크가 없으면 네이버 링크를 사용한다', () => {
    const [article] = selectArticles([item({ originallink: '' })], '20260917', '비츠로테크');

    expect(article.url).toBe('https://n.news.naver.com/1');
  });

  it('기준일 2일 전보다 오래된 기사는 제외한다', () => {
    const old = item({
      originallink: 'https://news.example.com/old',
      pubDate: 'Mon, 14 Sep 2026 10:00:00 +0900',
    });
    const withinRange = item({
      originallink: 'https://news.example.com/ok',
      pubDate: 'Tue, 15 Sep 2026 10:00:00 +0900',
    });

    const articles = selectArticles([old, withinRange], '20260917', '비츠로테크');

    expect(articles.map((a) => a.url)).toEqual(['https://news.example.com/ok']);
  });

  it('같은 링크는 한 번만 담고, 최대 8건까지만 반환한다', () => {
    const items = Array.from({ length: 12 }, (_, i) =>
      item({ originallink: `https://news.example.com/${i}` }),
    );

    const articles = selectArticles([item(), ...items], '20260917', '비츠로테크');

    expect(articles).toHaveLength(8);
    expect(articles.map((a) => a.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(new Set(articles.map((a) => a.url)).size).toBe(8);
  });

  it('발행일을 알 수 없는 기사는 제외한다', () => {
    expect(selectArticles([item({ pubDate: 'invalid' })], '20260917', '비츠로테크')).toEqual([]);
  });

  it('제목에 종목명이 있는 기사, 기준일에 가까운 기사를 앞에 둔다', () => {
    const weeklyRoundup = item({
      title: '[베스트&워스트] 주간 상승률 1위',
      description: '이번 주 상승률 1위 종목은 비츠로테크다.',
      originallink: 'https://news.example.com/roundup',
      pubDate: 'Sat, 19 Sep 2026 09:00:00 +0900',
    });
    const followUp = item({
      originallink: 'https://news.example.com/follow-up',
      pubDate: 'Sat, 19 Sep 2026 10:00:00 +0900',
    });
    const sameDay = item({
      originallink: 'https://news.example.com/same-day',
      pubDate: 'Thu, 17 Sep 2026 15:00:00 +0900',
    });

    const articles = selectArticles(
      [weeklyRoundup, followUp, sameDay],
      '20260917',
      '비츠로테크',
    );

    expect(articles.map((a) => [a.id, a.url])).toEqual([
      [1, 'https://news.example.com/same-day'],
      [2, 'https://news.example.com/follow-up'],
      [3, 'https://news.example.com/roundup'],
    ]);
  });

  it('제목·요약에 종목명이 없는 기사는 제외한다', () => {
    const unrelated = item({
      title: '와이즈플래닛컴퍼니 회전율 260%…주식 거래 활발',
      description: '거래가 활발했다.',
      originallink: 'https://news.example.com/unrelated',
    });
    const spacedName = item({
      title: '비츠로 테크, 공급계약 체결',
      originallink: 'https://news.example.com/spaced',
    });

    const articles = selectArticles([unrelated, spacedName], '20260917', '비츠로테크');

    expect(articles.map((a) => a.url)).toEqual(['https://news.example.com/spaced']);
  });
});
