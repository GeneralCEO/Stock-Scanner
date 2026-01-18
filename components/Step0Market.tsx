
import React, { useState, useEffect } from 'react';
import { analyzeMarketTrends } from '../services/geminiService';
import { Radar, TrendingUp, ArrowRight, Search, AlertCircle, Globe, Zap, ShieldCheck, BarChart3, Crown, Rocket, Info } from 'lucide-react';
import { FormattedText, processBold } from './FormattedText';

interface Recommendation {
    ticker: string;
    name: string;
    category: "BlueChip" | "Growth";
    sector: string;
    currentPrice: string;
    reason: string;
}

interface IndexData {
    name: string;
    value: string;
    change: string;
    color: "red" | "blue" | "gray";
}

interface Props {
    onSelectTicker: (ticker: string) => void;
    cache: any;
    onCacheUpdate: (data: any) => void;
}

export const Step0Market: React.FC<Props> = ({ onSelectTicker, cache, onCacheUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [marketData, setMarketData] = useState<any>(cache ? cache.state : null);
    const [manualTicker, setManualTicker] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (cache) {
            setMarketData(cache.state);
        }
    }, [cache]);

    const handleScan = async () => {
        const now = Date.now();
        if (cache && (now - cache.timestamp < 6 * 60 * 60 * 1000)) {
            setMarketData(cache.state);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const result = await analyzeMarketTrends();
            if ((!result.recommendations || result.recommendations.length === 0) && result.marketStatus === "데이터 확인 불가") {
                setError("현재 실시간 데이터를 수집하는 데 어려움이 있습니다. 잠시 후 다시 시도해 주세요.");
            } else {
                setMarketData(result);
                onCacheUpdate(result);
            }
        } catch (err) {
            setError("시장 데이터를 분석하는 도중 예기치 않은 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualTicker.trim()) {
            onSelectTicker(manualTicker.trim().toUpperCase());
        }
    };

    const getScoreDescription = (score: number) => {
        if (score >= 80) return "🚀 강력 매수 구간: 적극적인 비중 확대가 유리한 시점입니다.";
        if (score >= 60) return "📈 상승 추세: 매수 우위의 긍정적인 시장 분위기입니다.";
        if (score >= 40) return "👀 중립/관망: 변동성에 유의하며 방향성을 탐색하세요.";
        if (score >= 20) return "📉 하락 추세: 리스크 관리에 집중하며 보수적으로 접근하세요.";
        return "💎 과매도 구간: 기술적 반등 가능성이 있으나 바닥 확인이 필요합니다.";
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
                <div>
                    <h2 className="text-3xl font-bold text-[#191F28] mb-1 tracking-tight">
                        오병이어 스캐너
                    </h2>
                    <p className="text-[#6B7684] font-medium text-[17px]">
                        주요 지수, 주도 섹터, 그리고 엄선된 6가지 <span className="text-[#3182F6] font-bold">국내 유망 종목</span>을 확인하세요.
                    </p>
                </div>
                
                <form onSubmit={handleManualSubmit} className="flex items-center bg-white p-2 rounded-[20px] shadow-sm border border-gray-100 focus-within:ring-2 focus-within:ring-blue-100 transition-all w-full md:w-auto">
                    <input 
                        type="text" 
                        value={manualTicker}
                        onChange={(e) => setManualTicker(e.target.value)}
                        placeholder="종목명 또는 티커"
                        className="bg-transparent border-none outline-none text-[#191F28] px-4 py-2 w-full md:w-64 placeholder-gray-400 font-medium text-[16px]"
                    />
                    <button type="submit" className="bg-[#3182F6] hover:bg-[#1B64DA] text-white p-3 rounded-[16px] transition-colors shadow-md shadow-blue-100">
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </form>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-[20px] flex items-start space-x-3">
                <Info className="w-5 h-5 text-[#3182F6] flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-[#4E5968] font-medium leading-relaxed">
                    오병이어 스캐너는 <strong>네이버 증권</strong> 실시간 크롤링 데이터를 사용합니다. 해외 주식은 시장 분석 자료로만 활용되며, 최종 추천 종목은 <strong>국내 주식(KOSPI/KOSDAQ)</strong>으로만 구성됩니다.
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 p-5 rounded-[24px] flex items-center space-x-3 text-red-600 text-sm font-medium">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                    <button onClick={handleScan} className="underline font-bold ml-auto">재시도</button>
                </div>
            )}

            {!marketData && !loading && (
                <div className="toss-card p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                    <div className="bg-blue-50 p-6 rounded-[32px] mb-8">
                        <Radar className="w-16 h-16 text-[#3182F6]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#191F28] mb-3">시장 분석을 시작해보세요</h3>
                    <p className="text-[#8B95A1] mb-10 max-w-lg leading-relaxed text-[17px]">
                        AI가 주요 지수, 주도 섹터, 그리고 국내 유망 종목 6선을 분석하여<br/> 투자 전략 수립을 돕습니다.
                    </p>
                    <button 
                        onClick={handleScan}
                        className="bg-[#3182F6] hover:bg-[#1B64DA] text-white font-semibold py-4 px-8 w-full md:w-auto md:px-12 rounded-[20px] shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center justify-center space-x-2 text-[17px]"
                    >
                        <Search className="w-5 h-5" />
                        <span>시장 정밀 스캔 시작</span>
                    </button>
                </div>
            )}

            {loading && (
                <div className="toss-card p-12 flex flex-col items-center justify-center min-h-[400px]">
                    <div className="relative mb-8">
                        <div className="w-20 h-20 border-4 border-[#F2F4F6] border-t-[#3182F6] rounded-full animate-spin"></div>
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold text-[#191F28]">유의미한 시장 신호를 찾는 중...</h3>
                        <p className="text-[#8B95A1]">
                            네이버 증권 실시간 데이터를 취합하고 있습니다. (약 30초 소요)
                        </p>
                    </div>
                </div>
            )}

            {marketData && (
                <div className="space-y-6">
                    {cache && (
                        <div className="bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <ShieldCheck className="w-4 h-4 text-[#3182F6]" />
                                <span className="text-xs font-bold text-[#3182F6]">일관된 분석 결과가 유지되는 데이터입니다.</span>
                            </div>
                            <span className="text-[10px] text-[#8B95A1] font-bold uppercase">
                                Expires at {new Date(cache.timestamp + 6 * 60 * 60 * 1000).toLocaleTimeString()}
                            </span>
                        </div>
                    )}

                    {/* Indices Section */}
                    {marketData.indices && marketData.indices.length > 0 && (
                        <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                            <div className="flex space-x-4 min-w-max">
                                {marketData.indices.map((idx: IndexData, i: number) => (
                                    <div key={i} className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100 min-w-[160px] flex flex-col">
                                        <span className="text-[12px] font-bold text-[#8B95A1] mb-1">{idx.name}</span>
                                        <div className="text-[18px] font-bold text-[#191F28] mb-1">{idx.value}</div>
                                        <span className={`text-[13px] font-bold ${idx.color === 'red' ? 'text-red-500' : idx.color === 'blue' ? 'text-blue-500' : 'text-gray-500'}`}>
                                            {idx.change}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                        <div className="toss-card p-6 flex flex-col justify-between h-full">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[#8B95A1] text-[13px] font-bold uppercase tracking-wider">Market Status</span>
                                <TrendingUp className={`w-6 h-6 ${marketData.timingScore >= 60 ? 'text-[#3182F6]' : 'text-[#FFB800]'}`} />
                            </div>
                            <div className="text-[22px] font-bold text-[#191F28] mb-4 leading-tight break-keep">
                                {processBold(marketData.marketStatus)}
                            </div>
                            <div>
                                <div className="w-full bg-[#F2F4F6] h-2 rounded-full overflow-hidden mb-2">
                                    <div className="bg-[#3182F6] h-full transition-all duration-1000" style={{ width: `${marketData.timingScore}%` }}></div>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-[#8B95A1] font-medium">Timing Score</span>
                                    <span className="text-[#3182F6] text-sm font-bold">{marketData.timingScore}</span>
                                </div>
                                <div className="mt-3 text-[13px] text-[#4E5968] font-medium bg-[#F9FAFB] p-3 rounded-xl border border-[#F2F4F6] break-keep leading-snug">
                                    {getScoreDescription(marketData.timingScore)}
                                </div>
                            </div>
                        </div>

                        <div className="toss-card p-6 flex flex-col justify-between h-full">
                             <div className="flex justify-between items-start mb-4">
                                <span className="text-[#8B95A1] text-[13px] font-bold uppercase tracking-wider">Global Trend</span>
                                <Globe className="w-6 h-6 text-[#3182F6]" />
                            </div>
                            <p className="text-[15px] text-[#4E5968] font-medium leading-relaxed break-keep">
                                {processBold(marketData.liquidityComment)}
                            </p>
                        </div>

                         <div className="toss-card p-6 flex flex-col justify-between h-full">
                             <div className="flex justify-between items-start mb-4">
                                <span className="text-[#8B95A1] text-[13px] font-bold uppercase tracking-wider">Leading Sectors</span>
                                <Zap className="w-6 h-6 text-[#3182F6]" />
                            </div>
                            <div className="text-[15px] text-[#4E5968] font-medium leading-relaxed break-keep mb-4">
                                현재 시장을 주도하는 핵심 테마입니다.
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {marketData.leadingSectors && marketData.leadingSectors.map((sector: string, i: number) => (
                                    <span key={i} className="bg-blue-50 text-[#3182F6] px-3 py-1.5 rounded-[12px] text-[13px] font-bold border border-blue-100">
                                        #{sector}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {marketData.recommendations && marketData.recommendations.length > 0 && (
                         <div className="space-y-4">
                            <div className="flex items-center space-x-2 px-1">
                                <BarChart3 className="w-5 h-5 text-[#191F28]" />
                                <h3 className="text-xl font-bold text-[#191F28]">AI 선정 국내 유망 종목 6선</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                                {marketData.recommendations.map((rec: Recommendation, idx: number) => (
                                    <div 
                                        key={idx}
                                        onClick={() => onSelectTicker(rec.ticker)}
                                        className="toss-card p-6 cursor-pointer hover:-translate-y-1 hover:shadow-toss-hover group border border-transparent hover:border-blue-100 h-full flex flex-col"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="bg-[#F2F4F6] text-[#333D4B] font-bold px-3 py-1.5 rounded-[10px] text-[13px] group-hover:bg-[#3182F6] group-hover:text-white transition-colors">
                                                    {rec.ticker}
                                                </div>
                                                {rec.category === 'BlueChip' ? (
                                                    <span className="flex items-center space-x-1 bg-blue-50 text-[#3182F6] font-bold px-2 py-1 rounded-[8px] text-[10px] border border-blue-100">
                                                        <Crown className="w-3 h-3" />
                                                        <span>우량주</span>
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center space-x-1 bg-purple-50 text-purple-600 font-bold px-2 py-1 rounded-[8px] text-[10px] border border-purple-100">
                                                        <Rocket className="w-3 h-3" />
                                                        <span>급등주</span>
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[12px] text-[#8B95A1] font-bold uppercase tracking-wide break-keep text-right">{rec.sector}</span>
                                        </div>
                                        
                                        <div className="flex items-baseline space-x-2 mb-2">
                                            <h4 className="text-[18px] font-bold text-[#191F28] break-keep">{rec.name}</h4>
                                            <span className="text-[14px] font-bold text-[#3182F6]">{rec.currentPrice}</span>
                                        </div>

                                        <p className="text-[14px] text-[#6B7684] leading-relaxed break-keep mb-4 flex-grow">
                                            {processBold(rec.reason)}
                                        </p>
                                        
                                        <div className="mt-auto pt-4 border-t border-[#F2F4F6] flex items-center justify-between text-[#3182F6] text-sm font-bold">
                                            <span>분석 보기</span>
                                            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="toss-card p-10">
                         <div className="flex items-center space-x-3 mb-8">
                            <div className="w-1.5 h-6 bg-[#3182F6] rounded-full"></div>
                            <h4 className="text-xl font-bold text-[#191F28]">오병이어 통합 분석 리포트</h4>
                         </div>
                         <div className="text-[#333D4B]">
                            <FormattedText text={marketData.summary} />
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};
