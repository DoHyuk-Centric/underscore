import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { unzipSync } from 'fflate';

const DART_API_BASE_URL = 'https://opendart.fss.or.kr/api';
const DART_VIEWER_URL = 'https://dart.fss.or.kr/dsaf001/main.do';
const DAY_MS = 24 * 60 * 60 * 1000;
const CORP_CODE_TTL_MS = DAY_MS;
// 기준일 사흘 전부터 사흘 뒤까지 접수된 공시를 급등 근거 후보로 봅니다.
// 조회공시 답변처럼 급등 배경을 밝히는 공시는 급등 다음 날 이후에 나오는 경우가 많습니다.
const DISCLOSURE_LOOKBACK_DAYS = 3;
const DISCLOSURE_LOOKAHEAD_DAYS = 3;
const MAX_DISCLOSURES = 3;
const DISCLOSURE_EXCERPT_LENGTH = 1_200;
const BUSINESS_OVERVIEW_LENGTH = 900;
// 지분 변동 신고처럼 급등 배경과 거리가 먼 정형 공시는 제외합니다.
const NOISE_REPORT_PATTERN =
  /소유상황보고서|거래계획보고서|기업설명회|자기주식취득결과보고서/;

export interface DartCompanyProfile {
  corpName: string;
  /** YYYY-MM-DD */
  establishedDate: string | null;
  homepage: string | null;
  /** 최근 정기보고서 "사업의 개요" 발췌 */
  businessOverview: string | null;
}

export interface DartDisclosure {
  id: number;
  title: string;
  /** YYYY-MM-DD */
  receivedDate: string;
  url: string;
  excerpt: string;
}

interface DartListItem {
  report_nm: string;
  rcept_no: string;
  rcept_dt: string;
}

interface DartListResponse {
  status: string;
  message: string;
  list?: DartListItem[];
}

interface DartCompanyResponse {
  status: string;
  message: string;
  corp_name?: string;
  est_dt?: string;
  hm_url?: string;
}

const XML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&nbsp;': ' ',
};

/** DART 문서 XML에서 태그를 걷어내고 공백을 정리한 본문 텍스트를 만듭니다. */
export function xmlToText(xml: string): string {
  return xml
    .replace(/<\?xml[^>]*>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(style|script)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(TR|P|BR|TITLE|SECTION-\d)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (entity) => XML_ENTITIES[entity])
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/[ \t ]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim();
}

const OVERVIEW_TITLE = '사업의 개요';
// 목차에서는 "사업의 개요" 바로 뒤에 "2. 주요 제품 및 서비스"가 이어집니다.
const TABLE_OF_CONTENTS_PATTERN = /^[\s\-.·0-9]*2\.\s*주요\s*제품/;

/** 정기보고서 본문에서 "사업의 개요" 이후 내용을 발췌합니다. 목차에 나온 제목은 건너뜁니다. */
export function extractBusinessOverview(text: string): string | null {
  const businessSection = text.indexOf('사업의 내용');
  let overview = text.indexOf(
    OVERVIEW_TITLE,
    businessSection >= 0 ? businessSection : 0,
  );

  while (overview >= 0) {
    const start = overview + OVERVIEW_TITLE.length;
    const excerpt = text
      .slice(start, start + BUSINESS_OVERVIEW_LENGTH)
      .replace(/\n+/g, ' ')
      .trim();

    if (excerpt && !TABLE_OF_CONTENTS_PATTERN.test(excerpt)) return excerpt;

    overview = text.indexOf(OVERVIEW_TITLE, start);
  }

  return null;
}

/** corpCode.xml의 종목코드 → 고유번호 매핑을 만듭니다. 비상장사는 제외합니다. */
export function parseCorpCodes(xml: string): Map<string, string> {
  const corpCodes = new Map<string, string>();

  for (const [, block] of xml.matchAll(/<list>([\s\S]*?)<\/list>/g)) {
    const corpCode = /<corp_code>\s*(\d+)\s*<\/corp_code>/.exec(block)?.[1];
    const stockCode = /<stock_code>\s*([0-9A-Z]{6})\s*<\/stock_code>/.exec(block)?.[1];

    if (corpCode && stockCode) corpCodes.set(stockCode, corpCode);
  }

  return corpCodes;
}

function toDartDate(date: Date): string {
  return date.toISOString().slice(0, 10).replaceAll('-', '');
}

function formatDartDate(value: string): string {
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function decodeXml(bytes: Uint8Array): string {
  const head = new TextDecoder('ascii').decode(bytes.slice(0, 200));
  const encoding = /encoding="([^"]+)"/i.exec(head)?.[1]?.toLowerCase();

  return new TextDecoder(encoding === 'euc-kr' ? 'euc-kr' : 'utf-8').decode(bytes);
}

@Injectable()
export class DartClient {
  private readonly logger = new Logger(DartClient.name);
  private corpCodes: Map<string, string> | null = null;
  private corpCodesLoadedAt = 0;
  private readonly profiles = new Map<string, DartCompanyProfile>();

  isConfigured(): boolean {
    return Boolean(process.env.DART_API_KEY);
  }

  async findCorpCode(stockCode: string): Promise<string | null> {
    if (!this.corpCodes || Date.now() - this.corpCodesLoadedAt > CORP_CODE_TTL_MS) {
      const files = unzipSync(await this.getBinary('corpCode.xml', {}));
      const xml = Object.values(files).map(decodeXml).join('');
      this.corpCodes = parseCorpCodes(xml);
      this.corpCodesLoadedAt = Date.now();
      this.logger.log(`DART 고유번호 ${this.corpCodes.size}건 로드`);
    }

    return this.corpCodes.get(stockCode) ?? null;
  }

  /** 회사 기본 정보와 최근 정기보고서의 사업 개요. 회사 정보는 자주 바뀌지 않아 메모리에 보관합니다. */
  async getCompanyProfile(corpCode: string): Promise<DartCompanyProfile> {
    const cached = this.profiles.get(corpCode);
    if (cached) return cached;

    const company = await this.getJson<DartCompanyResponse>('company.json', {
      corp_code: corpCode,
    });

    const profile: DartCompanyProfile = {
      corpName: company.corp_name ?? '',
      establishedDate: company.est_dt ? formatDartDate(company.est_dt) : null,
      homepage: company.hm_url || null,
      businessOverview: await this.getBusinessOverview(corpCode),
    };

    this.profiles.set(corpCode, profile);
    return profile;
  }

  /** 기준일(YYYYMMDD) 사흘 전부터 사흘 뒤(오늘을 넘지 않음)까지 접수된 공시 원문 발췌 */
  async getRecentDisclosures(
    corpCode: string,
    baseDate: string,
  ): Promise<DartDisclosure[]> {
    const base = new Date(`${formatDartDate(baseDate)}T00:00:00Z`);
    const begin = new Date(base.getTime() - DISCLOSURE_LOOKBACK_DAYS * DAY_MS);
    const end = new Date(
      Math.min(
        base.getTime() + DISCLOSURE_LOOKAHEAD_DAYS * DAY_MS,
        Date.now(),
      ),
    );
    const items = (
      await this.listDisclosures({
        corp_code: corpCode,
        bgn_de: toDartDate(begin),
        end_de: toDartDate(end),
      })
    )
      .filter((item) => !NOISE_REPORT_PATTERN.test(item.report_nm))
      .slice(0, MAX_DISCLOSURES);

    const disclosures: DartDisclosure[] = [];

    for (const item of items) {
      const text = await this.getDocumentText(item.rcept_no);

      disclosures.push({
        id: disclosures.length + 1,
        title: item.report_nm.trim(),
        receivedDate: formatDartDate(item.rcept_dt),
        url: `${DART_VIEWER_URL}?rcpNo=${item.rcept_no}`,
        excerpt: text.replace(/\n+/g, ' ').slice(0, DISCLOSURE_EXCERPT_LENGTH),
      });
    }

    return disclosures;
  }

  private async getBusinessOverview(corpCode: string): Promise<string | null> {
    // 사업·반기·분기보고서(정기공시) 중 가장 최근 것의 "사업의 개요"를 씁니다.
    const now = new Date();
    const [latest] = await this.listDisclosures({
      corp_code: corpCode,
      bgn_de: toDartDate(new Date(now.getTime() - 400 * DAY_MS)),
      end_de: toDartDate(now),
      pblntf_ty: 'A',
    });

    if (!latest) return null;

    return extractBusinessOverview(await this.getDocumentText(latest.rcept_no));
  }

  private async listDisclosures(
    params: Record<string, string>,
  ): Promise<DartListItem[]> {
    const response = await this.getJson<DartListResponse>('list.json', {
      ...params,
      page_count: '20',
    });

    return response.list ?? [];
  }

  private async getDocumentText(rceptNo: string): Promise<string> {
    const files = unzipSync(
      await this.getBinary('document.xml', { rcept_no: rceptNo }),
    );

    // 본문이 여러 파일(본문, 첨부)로 나뉘어 있을 수 있어 가장 큰 파일을 본문으로 봅니다.
    const [main] = Object.values(files).sort((a, b) => b.length - a.length);
    return main ? xmlToText(decodeXml(main)) : '';
  }

  private async getJson<T extends { status: string; message: string }>(
    path: string,
    params: Record<string, string>,
  ): Promise<T> {
    const response = await axios.get<T>(`${DART_API_BASE_URL}/${path}`, {
      params: { crtfc_key: this.apiKey(), ...params },
      timeout: 15_000,
    });

    // 013: 조회된 데이터가 없음
    if (response.data.status !== '000' && response.data.status !== '013') {
      throw new Error(`DART ${path} 오류 ${response.data.status}: ${response.data.message}`);
    }

    return response.data;
  }

  private async getBinary(
    path: string,
    params: Record<string, string>,
  ): Promise<Uint8Array> {
    const response = await axios.get<ArrayBuffer>(`${DART_API_BASE_URL}/${path}`, {
      params: { crtfc_key: this.apiKey(), ...params },
      responseType: 'arraybuffer',
      timeout: 60_000,
    });
    const bytes = new Uint8Array(response.data);

    // 오류일 때는 zip 대신 상태 코드가 담긴 XML/JSON이 옵니다. zip은 "PK"로 시작합니다.
    if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
      const body = new TextDecoder('utf-8').decode(bytes.slice(0, 300));
      throw new Error(`DART ${path} 응답이 zip이 아닙니다: ${body}`);
    }

    return bytes;
  }

  private apiKey(): string {
    const apiKey = process.env.DART_API_KEY;

    if (!apiKey) {
      throw new Error('DART_API_KEY가 설정되지 않았습니다.');
    }

    return apiKey;
  }
}
