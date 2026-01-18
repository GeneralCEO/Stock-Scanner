
import React, { useState } from 'react';
import { analyzeLegends } from '../services/geminiService';
import { Quote, Trophy, ArrowRight, UserPlus, Info, RefreshCw } from 'lucide-react';
import { LegendScores } from '../types';
import { FormattedText, processBold } from './FormattedText';

interface Props {
    ticker: string;
    analysis: string;
    scores: LegendScores;
    insiderSummary: string;
    setAnalysis: (text: string) => void;
    setScores: (scores: LegendScores) => void;
    setInsiderSummary: (text: string) => void;
    onNext: () => void;
}

export const Step4Legends: React.FC<Props> = ({ 
    ticker, 
    analysis, 
    scores,
    insiderSummary,
    setAnalysis, 
    setScores, 
    setInsiderSummary,
    onNext 
}) => {
    const [loading, setLoading] = useState(false);

    const handleConsult = async () => {
        setLoading(true);
        const result = await analyzeLegends(ticker);
        setAnalysis(result.analysis);
        setScores(result.scores);
        setInsiderSummary(result.insiderSummary);
        setLoading(false);
    };

    const LEGENDS = [
        { id: 'buffett', name: "워런 버핏", role: "가치 & ROE (100점)", color: "text-[#333D4B]", bg: "bg-[#F2F4F6]" },
        { id: 'lynch', name: "피터 린치", role: "성장 & PEG (100점)", color: "text-[#333D4B]", bg: "bg-[#E8F3FF]" },
        { id: 'oneil', name: "윌리엄 오닐", role: "모멘텀 & CANSLIM (100점)", color: "text-[#333D4B]", bg: "bg-[#E5F9E8]" },
    ];

    const hasData = analysis && scores && scores.total > 0;

    return (
        <div className="space-y-6 animate-fade-in h-full flex flex-col">
             <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-[#191F28] mb-1 tracking-tight">3대 투자 대가 위원회</h2>
                    <p className="text-[#6B7684] font-medium text-[17px]">
                        거장들의 투자 원칙을 실시간 데이터에 대입하여 개별 채점합니다.
                    </p>
                </div>
                {hasData && (
                    <button 
                        onClick={handleConsult}
                        disabled={loading}
                        className="flex items-center space-x-2 text-[#8B95A1] hover:text-[#3182F6] bg-white hover:bg-blue-50 px-4 py-2 rounded-xl transition-all border border-[#F2F4F6]"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="text-sm font-bold">재채점</span>
                    </button>
                )}
            </div>

            {!hasData && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center toss-card p-12 min-h-[400px]">
                    <div className="p-6 bg-[#FFF8DD] rounded-[32px] mb-8">
                        <Trophy className="w-14 h-14 text-[#FFB800] animate-bounce" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#191F28] mb-3">{ticker} 점수 산정하기</h3>
                    <p className="text-[#8B95A1] mb-10 text-center max-w-md leading-relaxed text-[16px]">
                        거장들의 눈으로 실시간 지표를 분석합니다.<br/>각 대가별 100점 만점으로 평가한 종합 점수를 확인하세요.
                    </p>
                    <button 
                        onClick={handleConsult}
                        className="bg-[#3182F6] hover:bg-[#1B64DA] text-white font-bold py-4 px-12 rounded-[20px] shadow-lg shadow-blue-100 transform hover:scale-105 active:scale-95 transition-all"
                    >
                        알고리즘 채점 시작
                    </button>
                </div>
            )}

            {loading && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-8 min-h-[400px] toss-card">
                     <div className="flex space-x-3">
                        <div className="w-4 h-4 bg-[#3182F6] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-4 h-4 bg-[#3182F6] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-4 h-4 bg-[#3182F6] rounded-full animate-bounce"></div>
                     </div>
                     <div className="text-center">
                        <p className="text-[#191F28] font-bold mb-2 text-lg">거장들의 눈으로 시장을 읽는 중...</p>
                        <p className="text-[#8B95A1] text-sm">재무 데이터 및 내부자 동향 분석 중</p>
                     </div>
                </div>
            )}

            {hasData && !loading && (
                <div className="flex flex-col space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {LEGENDS.map((legend) => (
                            <div key={legend.id} className={`${legend.bg} p-6 rounded-[24px] flex flex-col items-center justify-center transition-all hover:scale-105`}>
                                <span className={`text-[11px] font-bold uppercase ${legend.color} mb-2 opacity-60 tracking-wider`}>{legend.role}</span>
                                <span className="text-[#191F28] text-sm mb-1 font-bold">{legend.name}</span>
                                <span className="text-[32px] font-bold text-[#191F28] tracking-tight">
                                    {/* @ts-ignore */}
                                    {scores[legend.id] || 0}
                                </span>
                            </div>
                        ))}
                        <div className="bg-[#191F28] p-6 rounded-[24px] flex flex-col items-center justify-center col-span-2 md:col-span-1 shadow-lg">
                            <span className="text-[11px] font-bold uppercase text-gray-400 mb-2 tracking-wider">위원회 평균</span>
                             <span className="text-[40px] font-bold text-white tracking-tight">
                                {scores.total}
                            </span>
                        </div>
                    </div>

                    {insiderSummary && (
                        <div className="bg-white border border-[#F2F4F6] rounded-[24px] p-8 shadow-sm flex flex-col md:flex-row items-center gap-6">
                            <div className="bg-[#F9FAFB] p-4 rounded-[20px] flex-shrink-0">
                                <UserPlus className="w-8 h-8 text-[#3182F6]" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                                    <h4 className="text-lg font-bold text-[#191F28]">내부자 매매 동향</h4>
                                </div>
                                <p className="text-[15px] text-[#4E5968] leading-relaxed font-medium">
                                    {processBold(insiderSummary)}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="toss-card p-10">
                        <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-[#F2F4F6]">
                             <div className="p-2 bg-[#F2F4F6] rounded-xl">
                                <Quote className="w-5 h-5 text-[#8B95A1]" />
                             </div>
                             <h3 className="font-bold text-xl text-[#191F28]">상세 채점 근거</h3>
                        </div>
                        <FormattedText text={analysis} />
                    </div>

                    <div className="flex justify-end">
                        <button onClick={onNext} className="group flex items-center space-x-2 text-[#3182F6] font-bold hover:bg-blue-50 transition-colors px-6 py-3 rounded-[16px]">
                            <span>다음: 최종 투자 전략</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
