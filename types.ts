
export enum Step {
    Market = 1,
    DayTrading = 7,
    Financials = 2,
    Sentiment = 3,
    Screener = 4,
    Legends = 5,
    Strategy = 6
}

export interface StockData {
    ticker: string;
    companyName: string;
    price: number;
    change: number;
    peRatio: number;
    marketCap: string;
    revenue: string;
    netIncome: string;
}

export interface LegendScores {
    buffett: number;
    lynch: number;
    oneil: number;
    total: number;
}

export interface DayTradingStock {
    ticker: string;
    name: string;
    category: "BlueChip" | "Growth"; // 우량주(시총4000억↑) vs 유망주(급등)
    currentPrice: string;
    targetPrice: string;
    stopLoss: string;
    technicalAnalysis: string; 
    momentum: "Profit-taking Risk" | "Breakout Continuation";
    indicators: {
        bollinger: string;
        macd: string;
        rsi: string;
        ma: string;
    };
    larryWilliams: {
        range: string; // (전일고가 - 전일저가)
        kValue: number; // 동적 K (노이즈 비율 기반)
        breakoutPrice: string; // 시가 + (Range * K)
        status: "Buy Signal" | "Wait" | "Already Passed";
        reason: string;
    };
    // 가짜 돌파 방지 필터 데이터
    fakeBreakoutFilters: {
        noiseRatio: number; // 최근 평균 노이즈 비율 (0~1)
        maTrend: boolean; // 주가 > 이동평균선 여부
        volumeSpike: boolean; // 거래량 급증 여부
        disparity: "Safe" | "Overheated"; // 이격도 상태
        pinBarWarning: boolean; // 윗꼬리(핀바) 발생 여부
    };
}

export interface DayTradingResult {
    summary: string;
    recommendations: DayTradingStock[];
}

export interface AnalysisState {
    ticker: string;
    marketAnalysis: string; 
    financialAnalysis: string;
    sentimentAnalysis: string;
    sentimentScore: number; 
    peerComparison: string;
    legendAnalysis: string;
    legendScores: LegendScores;
    insiderSummary: string;
    finalStrategy: string;
    dayTradingResult: DayTradingResult | null;
}

export const INITIAL_STOCK_DATA: StockData = {
    ticker: "AAPL",
    companyName: "Apple Inc.",
    price: 0,
    change: 0,
    peRatio: 0,
    marketCap: "-",
    revenue: "-",
    netIncome: "-"
};
