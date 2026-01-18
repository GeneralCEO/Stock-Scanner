
import React, { useState } from 'react';
import { analyzeDayTrading } from '../services/geminiService';
import { Zap, Activity, ArrowRight, CheckCircle2, AlertTriangle, Clock, ShieldCheck, Crown, Rocket, BarChart2, TrendingUp, AlertOctagon, XCircle } from 'lucide-react';
import { DayTradingResult, DayTradingStock } from '../types';
import { FormattedText } from './FormattedText';

interface Props {
    data: DayTradingResult | null;
    cache: any;
    setData: (data: DayTradingResult) => void;
    onSelectTicker: (ticker: string) => void;
}

export const StepDayTrading: React.FC<Props> = ({ data, cache, setData, onSelectTicker }) => {
    const [loading, setLoading] = useState(false);

    const handleScan = async () => {
        const now = Date.now();
        if (cache && (now - cache.timestamp < 6 * 60 * 60 * 1000)) {
            setData(cache.state.dayTradingResult);
            return;
        }

        setLoading(true);
        const result = await analyzeDayTrading();
        setData(result);
        setLoading(false);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Buy Signal': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'Already Passed': return <Clock className="w-5 h-5 text-[#3182F6]" />;
            default: return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'Buy Signal': return 'bg-green-50 border-green-100';
            case 'Already Passed': return 'bg-blue-50 border-blue-100';
            default: return 'bg-yellow-50 border-yellow-100';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
                <div>
                    <h2 className="text-3xl font-bold text-[#191F28] mb-1 tracking-tight">
                        실전 단타 스캐너
                    </h2>
                    <p className="text-[#6B7684] font-medium text-[17px]">
                        가짜 돌파(Fake Breakout)를 방지하는 5대 필터링 시스템 적용 완료
                    </p>
                </div>
                
                <button 
                    onClick={handleScan}
                    disabled={loading}
                    className={`flex items-center justify-center space-x-2 bg-[#191F28] hover:bg-black text-white font-bold py-3.5 px-8 rounded-[18px] shadow-xl transition-all active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>정밀 필터링 중...</span>
                        </>
                    ) : (
                        <>
                            <Zap className="w-5 h-5 text-yellow-400" />
                            <span>단타 종목 6선 발굴</span>
                        </>
                    )}
                </button>
            </div>

            {cache && (
                <div className="bg-white px-5 py-3 rounded-2xl border border-blue-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center space-x-2">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-bold text-[#333D4B]">다중 소스 교차 검증이 완료된 확정 시세입니다.</span>
                    </div>
                    <span className="text-[11px] text-[#8B95A1] font-bold">
                        UPDATED {new Date(cache.timestamp).toLocaleTimeString()}
                    </span>
                </div>
            )}

            {!data && !loading && (
                <div className="toss-card p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                    <div className="bg-blue-50 p-6 rounded-[32px] mb-8">
                        <Zap className="w-16 h-16 text-[#3182F6]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#191F28] mb-3">단타 기회를 포착하세요</h3>
                    <p className="text-[#8B95A1] mb-10 max-w-lg leading-relaxed text-[17px]">
                        노이즈 비율, 거래량, 이격도 등 5가지 지표를 분석하여<br/>
                        가짜 돌파를 걸러낸 고승률 타점을 제공합니다.
                    </p>
                </div>
            )}

            {data && (
                <div className="space-y-8">
                    <div className="bg-[#F9FAFB] p-6 rounded-[24px] border border-[#F2F4F6] h-auto">
                         <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <Activity className="w-5 h-5 text-[#3182F6]" />
                                <h4 className="font-bold text-[#191F28]">실시간 트레이딩 전황</h4>
                            </div>
                         </div>
                         <div className="text-sm text-[#333D4B]">
                            <FormattedText text={data.summary} />
                         </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        {data.recommendations?.map((stock: DayTradingStock, idx: number) => (
                            <div key={idx} className="toss-card p-0 overflow-hidden border border-[#F2F4F6] hover:border-blue-200 transition-all flex flex-col h-auto">
                                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 h-auto">
                                    <div className="w-full md:w-1/3 flex flex-col border-b md:border-b-0 md:border-r border-[#F2F4F6] pb-6 md:pb-0 md:pr-8">
                                        <div className="mb-6">
                                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                                <span className="bg-[#191F28] text-white font-bold px-3 py-1 rounded-[8px] text-xs">
                                                    {stock.ticker}
                                                </span>
                                                {stock.category === 'BlueChip' ? (
                                                    <span className="flex items-center space-x-1 bg-blue-100 text-[#3182F6] font-bold px-2 py-1 rounded-full text-[11px]">
                                                        <Crown className="w-3 h-3" />
                                                        <span>우량 대장주</span>
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center space-x-1 bg-purple-100 text-purple-600 font-bold px-2 py-1 rounded-full text-[11px]">
                                                        <Rocket className="w-3 h-3" />
                                                        <span>급등 유망주</span>
                                                    </span>
                                                )}
                                                <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${(stock.momentum || '').includes('Continuation') ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                                    {stock.momentum === 'Breakout Continuation' ? '🚀 추세 지속' : '📉 눌림목'}
                                                </span>
                                            </div>
                                            <h3 className="text-2xl font-bold text-[#191F28] mb-2">{stock.name}</h3>
                                            <div className="text-3xl font-black text-[#3182F6]">{stock.currentPrice}</div>
                                        </div>

                                        <div className={`p-4 rounded-2xl border ${getStatusBg(stock.larryWilliams?.status || 'Wait')} mb-6 h-auto`}>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-[12px] font-bold text-[#4E5968]">래리 윌리엄스 전략 (Dynamic K)</span>
                                                {getStatusIcon(stock.larryWilliams?.status || 'Wait')}
                                            </div>
                                            <div className="space-y-2 mb-4">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-[#8B95A1]">돌파 목표가</span>
                                                    <span className="font-bold text-[#191F28]">{stock.larryWilliams?.breakoutPrice || '-'}</span>
                                                </div>
                                                <div className="flex justify-between text-xs items-center">
                                                    <span className="text-[#8B95A1]">동적 K값 (노이즈 반영)</span>
                                                    <span className="font-bold bg-white border px-1.5 py-0.5 rounded text-[#3182F6]">{stock.larryWilliams?.kValue || 0.5}</span>
                                                </div>
                                            </div>
                                            <div className="text-[13px] font-bold text-[#333D4B] leading-tight">
                                                {stock.larryWilliams?.status === 'Buy Signal' ? '🔥 진입 신호 발생!' : 
                                                 stock.larryWilliams?.status === 'Already Passed' ? '✅ 이미 돌파 성공' : '⌛ 돌파 대기 중'}
                                            </div>
                                        </div>
                                        
                                        <button 
                                            onClick={() => onSelectTicker(stock.ticker)}
                                            className="mt-6 w-full py-3.5 bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[#4E5968] rounded-[16px] font-bold text-sm transition-all flex items-center justify-center gap-2"
                                        >
                                            <span>심층 리포트 보기</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex-1 flex flex-col h-auto">
                                        <div className="mb-6">
                                            <div className="flex items-center space-x-2 mb-3">
                                                <ShieldCheck className="w-5 h-5 text-[#3182F6]" />
                                                <h5 className="text-[14px] font-bold text-[#191F28]">가짜 돌파(Fake Breakout) 방지 필터</h5>
                                            </div>
                                            {stock.fakeBreakoutFilters && (
                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                                    {/* Filter 1: Noise Ratio */}
                                                    <div className={`p-3 rounded-xl border ${stock.fakeBreakoutFilters.noiseRatio <= 0.6 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                                                        <span className="text-[11px] font-bold text-[#8B95A1] block mb-1">노이즈 비율</span>
                                                        <div className="flex items-center space-x-1.5">
                                                            <Activity className={`w-4 h-4 ${stock.fakeBreakoutFilters.noiseRatio <= 0.6 ? 'text-green-600' : 'text-orange-500'}`} />
                                                            <span className={`text-[13px] font-bold ${stock.fakeBreakoutFilters.noiseRatio <= 0.6 ? 'text-green-700' : 'text-orange-600'}`}>
                                                                {stock.fakeBreakoutFilters.noiseRatio.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Filter 2: MA Trend */}
                                                    <div className={`p-3 rounded-xl border ${stock.fakeBreakoutFilters.maTrend ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                                        <span className="text-[11px] font-bold text-[#8B95A1] block mb-1">이평선 추세</span>
                                                        <div className="flex items-center space-x-1.5">
                                                            {stock.fakeBreakoutFilters.maTrend ? 
                                                                <TrendingUp className="w-4 h-4 text-green-600" /> : 
                                                                <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
                                                            }
                                                            <span className={`text-[13px] font-bold ${stock.fakeBreakoutFilters.maTrend ? 'text-green-700' : 'text-red-600'}`}>
                                                                {stock.fakeBreakoutFilters.maTrend ? '정배열' : '역배열 주의'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Filter 3: Volume */}
                                                    <div className={`p-3 rounded-xl border ${stock.fakeBreakoutFilters.volumeSpike ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                                        <span className="text-[11px] font-bold text-[#8B95A1] block mb-1">거래량 강도</span>
                                                        <div className="flex items-center space-x-1.5">
                                                            <BarChart2 className={`w-4 h-4 ${stock.fakeBreakoutFilters.volumeSpike ? 'text-green-600' : 'text-gray-400'}`} />
                                                            <span className={`text-[13px] font-bold ${stock.fakeBreakoutFilters.volumeSpike ? 'text-green-700' : 'text-gray-500'}`}>
                                                                {stock.fakeBreakoutFilters.volumeSpike ? '폭발적' : '보통'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Filter 4: Disparity & PinBar */}
                                                    <div className={`p-3 rounded-xl border ${stock.fakeBreakoutFilters.disparity === 'Safe' && !stock.fakeBreakoutFilters.pinBarWarning ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                                                        <span className="text-[11px] font-bold text-[#8B95A1] block mb-1">과열/패턴</span>
                                                        <div className="flex items-center space-x-1.5">
                                                            {stock.fakeBreakoutFilters.pinBarWarning ? 
                                                                <AlertOctagon className="w-4 h-4 text-red-500" /> : 
                                                                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                                            }
                                                            <span className={`text-[13px] font-bold ${stock.fakeBreakoutFilters.pinBarWarning ? 'text-red-600' : 'text-blue-600'}`}>
                                                                {stock.fakeBreakoutFilters.pinBarWarning ? '윗꼬리 위험' : stock.fakeBreakoutFilters.disparity}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-6 p-4 bg-gray-50 rounded-2xl border-l-4 border-blue-500 h-auto">
                                            <h5 className="text-[13px] font-bold text-[#191F28] mb-2">필터링 종합 코멘트</h5>
                                            <div className="text-[14px] text-[#4E5968] font-medium leading-relaxed italic break-keep">
                                                <FormattedText text={stock.larryWilliams?.reason || ''} />
                                            </div>
                                        </div>

                                        <div className="text-[15px] text-[#4E5968] leading-relaxed h-auto">
                                            <h5 className="text-[14px] font-bold text-[#191F28] mb-3">기술적 상세 분석</h5>
                                            <FormattedText text={stock.technicalAnalysis || ''} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
