
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisState } from '../types';

// Initialize the Google GenAI SDK with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getCurrentTime = () => new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

/**
 * [CORE FUNCTION] Fetch Real-time Data from Naver Finance
 * Enhanced with robust selectors to ensure accurate data retrieval for Korean stocks.
 */
async function fetchNaverStockData(code: string) {
    if (!/^\d{6}$/.test(code)) {
        return null;
    }

    try {
        const targetUrl = `https://finance.naver.com/item/main.naver?code=${code}`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error("Network response was not ok");

        const html = await response.text();
        if (!html) throw new Error("No HTML data received");

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const noTodayElement = doc.getElementById('_nowVal') || doc.querySelector('.no_today .blind') || doc.querySelector('.no_today strong');
        const nameElement = doc.querySelector('.wrap_company h2 a') || doc.querySelector('.wrap_company h2') || doc.querySelector('.h_company h2');
        const noExdayElements = doc.querySelectorAll('.no_exday .blind');

        if (!noTodayElement) return null;

        const price = parseInt(noTodayElement.textContent?.replace(/,/g, '') || "0", 10);
        const name = nameElement?.textContent?.trim() || "";

        let changeAmount = 0;
        let changeRate = 0;

        if (noExdayElements.length >= 2) {
            changeAmount = parseInt(noExdayElements[0].textContent?.replace(/,/g, '') || "0", 10);
            changeRate = parseFloat(noExdayElements[1].textContent?.replace(/,/g, '') || "0");

            const isDown = doc.querySelector('.no_today .no_down') || doc.querySelector('.no_exday .no_down') || doc.querySelector('.ico.down');
            if (isDown) {
                changeAmount = -Math.abs(changeAmount);
                changeRate = -Math.abs(changeRate);
            }
        }

        const getTextById = (id: string) => {
            const el = doc.getElementById(id);
            return el ? el.innerText.trim() : 'N/A';
        };

        const marketCap = getTextById('_market_sum').replace(/\n/g, '').replace(/\t/g, '');
        const per = getTextById('_per');
        const eps = getTextById('_eps');
        const pbr = getTextById('_pbr');
        const dividendYield = getTextById('_dvr');

        return {
            code,
            name,
            price,
            changeAmount,
            changeRate: changeRate.toFixed(2),
            timestamp: new Date().toLocaleTimeString(),
            marketCap,
            per,
            eps,
            pbr,
            dividendYield
        };
    } catch (err) {
        console.warn(`Real data fetch failed for ${code}:`, err);
        return null;
    }
}

const DATA_INTEGRITY_RULES = `
[데이터 분석 및 추천 지침 - 엄격 모드]
1. **[데이터 소스]** 개별 종목 데이터는 **네이버 증권** 데이터를, 지수(KOSPI 등)는 **Google 검색 결과**를 절대적 기준으로 삼는다.
2. **[할루시네이션 금지]** AI 모델의 내부 지식(Cut-off date 이전 데이터)을 사용하여 현재 수치를 추측하지 마라. **반드시 도구(Google Search)를 통해 확인된 실시간 수치만 표기하라.**
3. **[검색 필수]** KOSPI, KOSDAQ 지수와 환율은 반드시 '현재 KOSPI 지수', '현재 환율' 키워드로 검색 후 결과를 반영하라. 검색 결과가 없으면 수치를 창작하지 말고 "N/A"로 표기하라.
4. **[추천 제한]** 추천 종목 6선은 반드시 **국내 주식(KOSPI/KOSDAQ)**으로만 구성하라. 해외 주식은 절대 추천 리스트에 포함하지 마라.
5. **[장마감 대응]** 시장이 닫힌 경우(주말/야간 등) 가장 최근 마감된 종가를 기준으로 분석하고 이를 명시하라.
`;

const MARKDOWN_RULES = `
- 모든 응답은 **한국어(Korean)**로 작성하라.
- 핵심 수치와 중요한 키워드는 볼드체(**)를 사용하여 강조하라.
- 각 섹션의 제목은 '### '을 붙여서 마크다운 헤더로 작성하라.
`;

export const analyzeDayTrading = async () => {
    const prompt = `
    ## 역할: 한국 주식 실전 데이트레이딩 전문가
    ## 분석 기준 시각: ${getCurrentTime()}
    ## Mission: 가짜 돌파를 차단한 국내 주식 필승 종목 6선 발굴
    
    ${DATA_INTEGRITY_RULES}

    **[Step 1]** Google Search를 사용하여 '오늘 한국 증시 상한가 종목', '오늘 거래량 급증 종목', '현재 국내 주식 주도주'를 검색하라.
    **[Step 2]** 검색된 종목 중 재무 상태가 양호하고 기술적 위치가 좋은 6종목을 선정하라.
    **[Step 3]** 각 종목에 대해 아래 스키마에 맞춰 상세 전략을 수립하라.

    ${MARKDOWN_RULES}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        recommendations: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    ticker: { type: Type.STRING },
                                    name: { type: Type.STRING },
                                    category: { type: Type.STRING, enum: ["BlueChip", "Growth"] },
                                    currentPrice: { type: Type.STRING },
                                    targetPrice: { type: Type.STRING },
                                    stopLoss: { type: Type.STRING },
                                    momentum: { type: Type.STRING },
                                    technicalAnalysis: { type: Type.STRING },
                                    indicators: {
                                        type: Type.OBJECT,
                                        properties: {
                                            bollinger: { type: Type.STRING },
                                            macd: { type: Type.STRING },
                                            rsi: { type: Type.STRING },
                                            ma: { type: Type.STRING }
                                        },
                                        required: ["bollinger", "macd", "rsi", "ma"]
                                    },
                                    larryWilliams: {
                                        type: Type.OBJECT,
                                        properties: {
                                            range: { type: Type.STRING },
                                            kValue: { type: Type.NUMBER },
                                            breakoutPrice: { type: Type.STRING },
                                            status: { type: Type.STRING },
                                            reason: { type: Type.STRING }
                                        },
                                        required: ["range", "kValue", "breakoutPrice", "status", "reason"]
                                    },
                                    fakeBreakoutFilters: {
                                        type: Type.OBJECT,
                                        properties: {
                                            noiseRatio: { type: Type.NUMBER },
                                            maTrend: { type: Type.BOOLEAN },
                                            volumeSpike: { type: Type.BOOLEAN },
                                            disparity: { type: Type.STRING },
                                            pinBarWarning: { type: Type.BOOLEAN }
                                        },
                                        required: ["noiseRatio", "maTrend", "volumeSpike", "disparity", "pinBarWarning"]
                                    }
                                },
                                required: ["ticker", "name", "category", "currentPrice", "targetPrice", "stopLoss", "momentum", "technicalAnalysis", "indicators", "larryWilliams", "fakeBreakoutFilters"]
                            }
                        }
                    },
                    required: ["summary", "recommendations"]
                }
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (error) {
        console.error("DayTrading API Error:", error);
        return { summary: "분석 중 오류 발생", recommendations: [] };
    }
};

export const analyzeMarketTrends = async () => {
    const prompt = `
    ## 역할: 오병이어 시장 스캐너 전문가
    ## 분석 기준 시각: ${getCurrentTime()}
    ## Mission: 국내 주도주 6선 추천 및 글로벌 시황 브리핑

    ${DATA_INTEGRITY_RULES}

    **[필수 실행 명령]**
    1. **반드시 Google Search Tool을 사용하여 다음 키워드를 검색하라:**
       - "현재 KOSPI 지수"
       - "현재 KOSDAQ 지수"
       - "현재 원/달러 환율"
       - "오늘 한국 증시 주도 섹터"
    2. **절대 규칙:** AI 모델의 예측값이나 과거 기억을 사용하지 말고, **오직 검색 결과(Grounding Source)**에 있는 수치만 입력하라. 검색 결과가 2600이면 2600이라고 적어라. 거짓 수치(예: 4500)를 입력하면 시스템 오류로 간주된다.
    3. 추천 종목은 현재 검색된 뉴스 및 시황을 바탕으로 **국내 주식** 중에서 선정하라.

    ${MARKDOWN_RULES}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        marketStatus: { type: Type.STRING },
                        timingScore: { type: Type.NUMBER },
                        liquidityComment: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        indices: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    value: { type: Type.STRING },
                                    change: { type: Type.STRING },
                                    color: { type: Type.STRING, enum: ["red", "blue", "gray"] }
                                },
                                required: ["name", "value", "change", "color"]
                            }
                        },
                        leadingSectors: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        recommendations: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    ticker: { type: Type.STRING },
                                    name: { type: Type.STRING },
                                    category: { type: Type.STRING, enum: ["BlueChip", "Growth"] },
                                    sector: { type: Type.STRING },
                                    currentPrice: { type: Type.STRING },
                                    reason: { type: Type.STRING }
                                },
                                required: ["ticker", "name", "category", "sector", "currentPrice", "reason"]
                            }
                        }
                    },
                    required: ["marketStatus", "timingScore", "liquidityComment", "summary", "indices", "leadingSectors", "recommendations"]
                }
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (error) {
        console.error("MarketTrends API Error:", error);
        return { recommendations: [], indices: [], leadingSectors: [], marketStatus: "분석 불가", timingScore: 50, liquidityComment: "분석 실패", summary: "분석 실패" };
    }
};

export const analyzeFinancials = async (ticker: string) => {
    const realData = await fetchNaverStockData(ticker);
    let systemInjection = realData ?
        `[SYSTEM INJECTED REAL-TIME DATA]
         종목명: ${realData.name} (${ticker})
         현재가: ${realData.price}
         등락률: ${realData.changeRate}%
         시가총액: ${realData.marketCap}
         PER: ${realData.per}
         PBR: ${realData.pbr}
         배당수익률: ${realData.dividendYield}` : "";

    const prompt = `
    - 너는 나의 전담 투자 분석 AI 사령탑이다. 분석 대상 기업은 **${ticker}** 이다.
    - 아래 항목에 따라 간단한 리포트 형식으로만 답변하라.
    * 모든 사실·수치·평가는 최근 12개월 이내 공시, 실적 발표, 기업 공식 자료, 주요 언론 기사 등 확인 가능한 정보 기준으로만 판단하라.
    * 재무 지표(PER, PBR, ROE 등)는
      ① 최근 12개월 기준 TTM 수치를 최우선으로 사용하고,
      ② TTM이 없는 경우에만 Forward 또는 추정치를 사용하라.
      ③ 서로 다른 기준 수치는 혼합하지 말고, 사용한 기준을 명시하라.
    * 루머성·추정성 정보는 제외하라.
    * 각 섹션의 제목은 '### '을 붙여서 마크다운 헤더로 작성하라.

    ${systemInjection}
    ${DATA_INTEGRITY_RULES}

    ### [1] 기업 한눈 요약
    이 기업이 속한 섹터와 핵심 사업 구조를 2줄 이내로 요약하라.
    사업의 본질과 실제 수익원 중심으로 정리하고, 과장된 성장 표현은 사용하지 말 것.

    ### [2] 최근 1년 주요 이벤트
    주가에 의미 있을 수 있는 이벤트만 선별하여 아래 3가지로 구분하라.
    각 이벤트는 하나의 분류에만 포함시키고, 중복 서술하지 말 것.
    * Fact: 이미 공시·확정된 사건
    * Expectation: 시장이 기대 중이나 아직 실현되지 않은 요소
    * Risk: 일정 지연, 실적 부담, 정책·산업 리스크
    각 항목은 bullet 형식으로 간결하게 작성하라.

    ### [3] 기초 체력·저평가 여부
    최근 3년 재무 추이를 기준으로 (매출·영업이익·부채 구조를 중심으로) 다음 항목을 요약 평가하라.
    단, PER·PBR·ROE 등 밸류에이션 지표는 최근 12개월 TTM 기준을 사용하라.
    * 매출 및 영업이익 추이: 증가 / 정체 / 감소
    * 부채 수준: (부채비율 100% 미만: 무난 / 100~200%: 주의 / 200% 이상: 위험)
    * 밸류에이션: 동종 업계 평균 대비 ±20% 이상 차이가 있는 경우에만 ‘비싸다 / 저렴하다’로 판단하라.
    * 결론: 현재 밸류에이션 상태를 ‘저평가 / 적정 / 고평가’ 중 하나로 한 줄 결론으로 정리하라.

    ### [4] 주가 위치·패턴 (최근 3~6개월)
    최근 3~6개월 주가 흐름을 아래 중 하나로 분류하라.
    (계속 하락 / 박스권 / 완만한 우상향 / 계단식 상승)
    * 가격 흐름과 함께 거래량 변화 여부를 반드시 고려하여, 선택 이유를 2줄 이내로 설명하라.
    * 이 종목이 ‘바닥권에서 반등을 시도 중인 후보’인지 여부를 O / X로 표시하고, 그 근거를 2줄 이내로 제시하라.

    ### [5] 내 포트폴리오 관점 정리
    아래 항목을 각각 한 줄로만 정리하라.
    ① 성장 섹터 또는 구조적 전환 후보로서의 의미
    ② 단기 테마성인지, 중장기 구조적 성장 스토리인지
    ③ 현재 시점에서의 적절한 위치를 선택 후 이유를 제시하기
       * 선택지: 관찰 / 관심(조건부 가능) / 관심 목록 편입 / 주의(투자 제외)
       * ‘관심(조건부 가능)’ 선택 시: 충족되어야 할 확인 조건(실적/이벤트 등) 명시.
       * ‘관심 목록 편입’ 선택 시: 이 기업이 아니면 안 되는 이유 1가지 명시.
    ④ 비교 대상이 명시되지 않은 경우, 동종 업계 대표 기업 대비 자금 유입 효율성을 평가하라.

    ### [6] 안전관리 관점 체크포인트
    ① 매수·매도에 대한 직접적인 행동 지시는 하지 말고, 추가 판단해야 할 리스크·확인 요소만 bullet 형식으로 정리하라.
    ② "본 분석 결과만으로 행동 판단을 내리지 말고, 반드시 3단계 ‘매수·매도 행동 결정 안전관리 프롬프트’를 통해 최종 판단하라"고 명시하라.

    ${MARKDOWN_RULES}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] }
        });
        return response.text || "데이터를 불러올 수 없습니다.";
    } catch (error) {
        return "분석 실패";
    }
};

export const analyzeSentiment = async (ticker: string) => {
    const prompt = `
    ## 역할: ${ticker} 전담 투자 심리 및 뉴스 분석관
    ## 분석 대상: ${ticker}
    ## 현재 시각: ${getCurrentTime()}

    ${DATA_INTEGRITY_RULES}

    **[필수 수행 과제]**
    1. **Google Search Tool**을 사용하여 다음 내용을 정밀 검색하라:
       - "${ticker} 최근 주요 뉴스" (최근 24~48시간)
       - "${ticker} 증권사 리포트 목표가"
       - "${ticker} 관련 유튜브 영상 반응"
       - "${ticker} 종목 토론방 주요 키워드"
    
    2. **분석 제한**:
       - 검색 결과가 다른 종목(예: 삼성전자를 검색했는데 SK하이닉스 뉴스)이 나오면 제외하고, **오직 ${ticker}에 관련된 내용만 분석하라.**
       - 일반적인 시장 시황(코스피 등락 등)은 ${ticker}에 직접적인 영향을 주는 경우에만 언급하라.

    3. **심리 점수(Score) 산정 기준 (0~100)**:
       - 80~100: 강력한 호재 발생, 매수세 폭발, 목표가 상향
       - 60~79: 긍정적 뉴스 우세, 완만한 상승 기대
       - 40~59: 호재와 악재 혼재, 관망세, 별다른 이슈 없음
       - 20~39: 악재 발생, 실적 우려, 목표가 하향
       - 0~19: 심각한 악재, 투매 조짐, 경영 리스크

    4. **요약(Summary) 작성 포맷**:
       - **[핵심 뉴스]**: 주가에 가장 큰 영향을 미치는 최신 기사 2~3개 요약
       - **[투자자 여론]**: 유튜브/커뮤니티의 매수/매도 심리 분위기 (구체적 키워드 언급)
       - **[종합 진단]**: 현재 점수를 부여한 결정적 이유 한 줄

    ${MARKDOWN_RULES}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { 
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        score: { type: Type.NUMBER }
                    },
                    required: ["summary", "score"]
                }
            }
        });
        return JSON.parse(response.text || '{"summary": "데이터 없음", "score": 50}');
    } catch (error) {
        return { summary: "실패", score: 50 };
    }
};

export const screenPeers = async (ticker: string) => {
    const prompt = `
    ## 역할: ${ticker} 경쟁사 비교 분석 전문가
    ## 분석 기준 시각: ${getCurrentTime()}

    ${DATA_INTEGRITY_RULES}

    **[필수 실행 명령]**
    1. **Google Search**를 사용하여 다음을 반드시 검색하라:
       - "${ticker} 경쟁사" 또는 "${ticker} 관련주"
       - "${ticker} 및 경쟁사 시가총액, PER, PBR 비교"
       - "최근 ${ticker} 경쟁사 주가 등락률"
    
    2. **분석 지침**:
       - 검색 결과에 기반하여, 가장 강력한 경쟁사 2~3곳을 선정하라.
       - 각 경쟁사와 ${ticker}의 **시가총액, PER, PBR, 최근 주가 추이**를 비교하는 표를 작성하라.
       - **절대 규칙**: AI 내부 지식으로 수치를 창작하지 마라. 검색 결과가 없으면 'N/A'로 표기하라.
       - ${ticker}가 경쟁사 대비 저평가인지 고평가인지, 시장 지배력은 어떠한지 논리적으로 서술하라.

    ${MARKDOWN_RULES}
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] }
        });
        return response.text || "데이터 없음";
    } catch (error) {
        return "비교 분석 중 오류 발생";
    }
};

export const analyzeLegends = async (ticker: string) => {
    const realData = await fetchNaverStockData(ticker);
    let systemInjection = realData ? `[SYSTEM DATA] Price: ${realData.price}, PER: ${realData.per}` : "";
    const prompt = `## 분석 대상: ${ticker} 거장 위원회 평가\n${systemInjection}\n${DATA_INTEGRITY_RULES}\n${MARKDOWN_RULES}`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { 
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        analysis: { type: Type.STRING },
                        scores: {
                            type: Type.OBJECT,
                            properties: {
                                buffett: { type: Type.NUMBER },
                                lynch: { type: Type.NUMBER },
                                oneil: { type: Type.NUMBER },
                                total: { type: Type.NUMBER }
                            }
                        },
                        insiderSummary: { type: Type.STRING }
                    },
                    required: ["analysis", "scores", "insiderSummary"]
                }
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (error) {
        return { analysis: "오류", scores: { buffett: 0, lynch: 0, oneil: 0, total: 0 }, insiderSummary: "없음" };
    }
};

export const generateStrategy = async (ticker: string, data: AnalysisState) => {
    const realData = await fetchNaverStockData(ticker);
    let systemInjection = realData ? `[SYSTEM DATA] 현재가: ${realData.price}, 등락률: ${realData.changeRate}%, PER: ${realData.per}, PBR: ${realData.pbr}` : "";
    
    const prompt = `
    ## 역할: ${ticker} 실전 매매 전략가 (기술적 분석 심화)
    ## 분석 기준 시각: ${getCurrentTime()}
    
    ${systemInjection}
    ${DATA_INTEGRITY_RULES}

    **[필수 실행 명령]**
    1. **Google Search**를 사용하여 "${ticker} 기술적 분석", "${ticker} 차트 분석", "${ticker} 볼린저밴드 RSI MACD" 등을 검색하여 최신 지표 값을 확보하라.
    2. **절대 규칙**: 다른 종목을 추천하지 말고, **오직 ${ticker} 한 종목**에 대한 매매 전략만 수립하라.
    
    **[상세 분석 항목]**
    아래 4가지 기술적 지표를 반드시 포함하여 분석하라:
    
    1. **볼린저 밴드 (Bollinger Bands)**
       - 밴드 폭(Bandwidth)의 변화: 확장(변동성 확대) vs 수축(에너지 응축/스퀴즈) 단계인지?
       - 현재 주가 위치: 상단 밴드 근처(과열/돌파 시도) vs 하단 밴드 근처(반등 시도) vs 중심선(추세 중심)?
       
    2. **이동평균선 (Moving Averages)**
       - 정배열(상승 추세) vs 역배열(하락 추세) 여부
       - 주가가 주요 이평선(5일, 20일, 60일)의 상위에 있는지 하위에 있는지?
       - 골든크로스/데드크로스 발생 여부 또는 가능성
       
    3. **RSI (상대강도지수)**
       - 현재 수치 확인 (예: 30 이하, 70 이상, 50 중립)
       - 과매수(매도 고려) vs 과매도(매수 기회) vs 중립 구간 판단
       - 다이버전스(주가와 지표의 괴리) 출현 여부
       
    4. **MACD (이동평균 수렴확산)**
       - MACD 선과 시그널 선의 교차 상태 (골든크로스/데드크로스)
       - 오실레이터(Histogram)의 증감 추이 (상승 모멘텀 강화/약화)

    **[최종 매매 시나리오]**
    - 위 기술적 분석과 펀더멘털(재무)을 종합하여 **매수 / 매도 / 관망** 중 하나의 포지션을 명확히 제시하라.
    - **진입 가격대(Buy Zone)**, **목표가(Target Price)**, **손절가(Stop Loss)**를 구체적인 수치로 제안하라. (검색된 현재가 ${realData?.price || '검색 필요'}원 기준)
    
    ${MARKDOWN_RULES}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] }
        });
        return response.text || "전략 생성 실패";
    } catch (error) {
        return "전략 생성 중 오류 발생";
    }
};
