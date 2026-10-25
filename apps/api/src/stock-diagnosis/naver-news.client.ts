import { Injectable } from '@nestjs/common';
import axios from 'axios';

// 2026-07-31부로 검색 API가 옛 개발자센터(openapi.naver.com)에서
// NAVER API HUB(NCP)로 이관됐습니다. 호출 주소와 인증 헤더가 예전과 다릅니다.
const NAVER_NEWS_SEARCH_URL =
  'https://naverapihub.apigw.ntruss.com/search/v1/news';
const SEARCH_DISPLAY = 30;
const SEARCH_QUERIES = ['특징주', '주가'];
const MAX_ARTICLES = 8;
// 기준일 이틀 전 기사부터 근거로 삼습니다.
const LOOKBACK_DAYS = 2;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface NewsArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  /** KST 기준 발행일 (YYYY-MM-DD) */
  publishedDate: string;
}

interface NaverNewsItem {
  title: string;
  originallink?: string;
  link: string;
  description: string;
  pubDate: string;
}

const HTML_ENTITIES: Record<string, string> = {
  '&quot;': '"',
  '&apos;': "'",
  '&#39;': "'",
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
};

export function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, '')
    .replace(/&(quot|apos|amp|lt|gt|#39);/g, (entity) => HTML_ENTITIES[entity])
    .trim();
}

function toKstDate(date: Date): string {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

function normalize(value: string): string {
  return value.replace(/\s+/g, '').toLowerCase();
}

/**
 * 네이버 뉴스 검색 결과에서 종목명이 제목·요약에 실제로 나오고,
 * 기준일 -2일 이후에 발행된 기사만 골라 최대 8건을 반환합니다. 기준일은 YYYYMMDD 형식입니다.
 * 제목에 종목명이 있는 기사, 기준일에 가까운 기사를 앞에 둡니다.
 */
export function selectArticles(
  items: NaverNewsItem[],
  baseDate: string,
  stockName: string,
): NewsArticle[] {
  const baseKstDate = `${baseDate.slice(0, 4)}-${baseDate.slice(4, 6)}-${baseDate.slice(6, 8)}`;
  const base = new Date(`${baseKstDate}T00:00:00+09:00`);
  const since = toKstDate(new Date(base.getTime() - LOOKBACK_DAYS * DAY_MS));
  const name = normalize(stockName);
  const seen = new Set<string>();
  const candidates: (Omit<NewsArticle, 'id'> & {
    titleMatch: boolean;
    distance: number;
  })[] = [];

  for (const item of items) {
    const published = new Date(item.pubDate);
    if (Number.isNaN(published.getTime())) continue;

    const publishedDate = toKstDate(published);
    if (publishedDate < since) continue;

    const url = item.originallink || item.link;
    if (seen.has(url)) continue;

    const title = stripHtml(item.title);
    const description = stripHtml(item.description);

    // 검색어와 느슨하게만 겹치는 다른 종목 기사는 근거에서 제외합니다.
    // 여러 종목을 묶은 시황 기사도 요약에 종목명이 있으면 근거가 될 수 있어 남깁니다.
    if (!normalize(`${title} ${description}`).includes(name)) continue;

    seen.add(url);
    candidates.push({
      title,
      description,
      url,
      publishedDate,
      titleMatch: normalize(title).includes(name),
      distance: Math.abs(
        new Date(publishedDate).getTime() - new Date(baseKstDate).getTime(),
      ),
    });
  }

  return candidates
    .sort(
      (a, b) =>
        Number(b.titleMatch) - Number(a.titleMatch) || a.distance - b.distance,
    )
    .slice(0, MAX_ARTICLES)
    .map(({ titleMatch: _titleMatch, distance: _distance, ...article }, index) => ({
      id: index + 1,
      ...article,
    }));
}

// "OO 주가, 9월 30일 장중 …", "애프터마켓 …"처럼 시세만 옮겨 적은 자동 생성 기사는 배경 설명이 없어 뺍니다.
const PRICE_TICKER_TITLE_PATTERN = /주가,?\s*\d{1,2}월\s*\d{1,2}일\s*(장중|애프터마켓|프리마켓)/;
// 요약에 이런 말이 있으면 숫자의 이유나 기대치를 설명하는 기사일 가능성이 높아 먼저 고릅니다.
const EXPLANATION_PATTERN = /때문|덕분|힘입|견인|영향으로|배경|이유|호조|부진|증가로|감소로|상승으로|하락으로|전망치|컨센서스|예상치/;
const PERIOD_SEARCH_DISPLAY = 100;
// 검색어 하나가 결과를 독차지하지 않도록 검색어마다 고르는 기사 수를 제한합니다.
const MAX_ARTICLES_PER_QUERY = 2;

/**
 * 기간(YYYY-MM-DD ~ YYYY-MM-DD)에 발행됐고 제목·요약에 종목명이 나오는 기사를 고릅니다.
 * 검색어마다 이유를 설명하는 기사, 제목에 종목명이 있는 기사, 관련도가 높은 기사 순으로 최대 2건을 고르고,
 * 앞선 검색어부터 limit건을 채운 뒤 발행일 순으로 반환합니다.
 */
export function selectArticlesBetween(
  resultsByQuery: NaverNewsItem[][],
  stockName: string,
  beginDate: string,
  endDate: string,
  limit: number,
): NewsArticle[] {
  const seen = new Set<string>();
  const picked: Omit<NewsArticle, 'id'>[] = [];

  for (const items of resultsByQuery) {
    const candidates = filterArticlesBetween(items, stockName, beginDate, endDate).filter(
      (article) => !seen.has(article.url),
    );
    const best = candidates
      .map((article, relevance) => ({ article, relevance, ...rankArticle(article, stockName) }))
      .sort((a, b) => Number(b.explains) - Number(a.explains) || Number(b.titleMatch) - Number(a.titleMatch) || a.relevance - b.relevance)
      .slice(0, MAX_ARTICLES_PER_QUERY)
      .map(({ article }) => article);

    for (const article of best) {
      if (picked.length >= limit) break;
      seen.add(article.url);
      picked.push(article);
    }
  }

  return picked
    .sort((a, b) => a.publishedDate.localeCompare(b.publishedDate))
    .map((article, index) => ({ id: index + 1, ...article }));
}

function rankArticle(article: Omit<NewsArticle, 'id'>, stockName: string) {
  return {
    explains: EXPLANATION_PATTERN.test(article.description),
    titleMatch: normalize(article.title).includes(normalize(stockName)),
  };
}

/** 기간 안에 발행됐고, 종목명이 나오며, 시세 자동 기사가 아닌 기사. 검색 결과(관련도) 순서를 유지합니다. */
function filterArticlesBetween(
  items: NaverNewsItem[],
  stockName: string,
  beginDate: string,
  endDate: string,
): Omit<NewsArticle, 'id'>[] {
  const name = normalize(stockName);
  const seen = new Set<string>();
  const articles: Omit<NewsArticle, 'id'>[] = [];

  for (const item of items) {
    const published = new Date(item.pubDate);
    if (Number.isNaN(published.getTime())) continue;

    const publishedDate = toKstDate(published);
    if (publishedDate < beginDate || publishedDate > endDate) continue;

    const url = item.originallink || item.link;
    const title = stripHtml(item.title);
    const description = stripHtml(item.description);
    if (seen.has(url) || PRICE_TICKER_TITLE_PATTERN.test(title)) continue;
    if (!normalize(`${title} ${description}`).includes(name)) continue;

    seen.add(url);
    articles.push({ title, description, url, publishedDate });
  }

  return articles;
}

@Injectable()
export class NaverNewsClient {
  isConfigured(): boolean {
    return Boolean(
      process.env.NAVER_API_HUB_CLIENT_ID &&
        process.env.NAVER_API_HUB_CLIENT_SECRET,
    );
  }

  async searchStockNews(
    stockName: string,
    baseDate: string,
  ): Promise<NewsArticle[]> {
    if (!this.isConfigured()) {
      throw new Error(
        'NAVER_API_HUB_CLIENT_ID 또는 NAVER_API_HUB_CLIENT_SECRET이 설정되지 않았습니다.',
      );
    }

    // 급등 배경은 "특징주" 기사에 가장 잘 정리되어 있어 먼저 검색하고, 일반 주가 기사로 보완합니다.
    const results = await Promise.all(
      SEARCH_QUERIES.map((suffix) => this.search(`${stockName} ${suffix}`)),
    );

    return selectArticles(results.flat(), baseDate, stockName);
  }

  /**
   * 지난 기간(YYYY-MM-DD ~ YYYY-MM-DD)의 기사를 찾습니다. 검색 API에 기간 조건이 없어서
   * 관련도순으로 넉넉히 받은 뒤 발행일로 거릅니다. 최신순이면 오래전 기간의 기사가 밀려납니다.
   */
  async searchNewsBetween(
    stockName: string,
    queries: string[],
    beginDate: string,
    endDate: string,
    limit: number,
  ): Promise<NewsArticle[]> {
    const results = await Promise.all(
      queries.map((query) => this.search(query, { display: PERIOD_SEARCH_DISPLAY, sort: 'sim' })),
    );

    return selectArticlesBetween(results, stockName, beginDate, endDate, limit);
  }

  private async search(
    query: string,
    { display = SEARCH_DISPLAY, sort = 'date' }: { display?: number; sort?: 'date' | 'sim' } = {},
  ): Promise<NaverNewsItem[]> {
    const response = await axios.get<{ items?: NaverNewsItem[] }>(
      NAVER_NEWS_SEARCH_URL,
      {
        params: { query, display, sort },
        headers: {
          'X-NCP-APIGW-API-KEY-ID': process.env.NAVER_API_HUB_CLIENT_ID,
          'X-NCP-APIGW-API-KEY': process.env.NAVER_API_HUB_CLIENT_SECRET,
        },
        timeout: 10_000,
      },
    );

    return response.data.items ?? [];
  }
}
