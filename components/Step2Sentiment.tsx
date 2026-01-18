
import React, { useState } from 'react';
import { analyzeSentiment } from '../services/geminiService';
import { Youtube, Search, Info, ArrowRight, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { FormattedText } from './FormattedText';

interface Props {
    ticker: string;
    analysis: string;
    score: number;
    setAnalysis: (text: string, score: number) => void;
    onNext: () => void;
}

export const Step2Sentiment: React.FC<Props> = ({ ticker, analysis, score, setAnalysis, onNext }) => {
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        setLoading(true);
        const result = await analyzeSentiment(ticker);
        setAnalysis(result.summary, result.score);
        setLoading(false);
    };

    const sentimentData = [
        { name: 'Score', value: score },
        { name: 'Remaining', value: 100 - score },
    ];
    
    // Toss Blue for high, soft grey for remaining
    const scoreColor = score >= 60 ? '#3182F6' : score >= 40 ? '#FFB800' : '#F04452'; 
    const COLORS = [scoreColor, '#F2F4F6']; 

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-[#191F28] mb-1 tracking-tight">전략적 콘텐츠 디코더</h2>
                    <p className="text-[#6B7684] font-medium text-[17px]">
                         <span className="font-bold text-[#191F28]">{ticker}</span> 뉴스/유튜브 실시간 시그널
                    </p>
                </div>
                <div className="flex items-center space-x-2 bg-[#F2F4F6] px-4 py-2 rounded-[16px]">
                    <Info className="w-4 h-4 text-[#8B95A1]" />
                    <span className="text-[13px] font-bold text-[#6B7684]">상위 200개 핵심 시그널 분석</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="toss-card p-10 min-h-[400px]">
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#F2F4F6]">
                             <div className="flex items-center space-x-3">
                                <div className="p-2 bg-red-50 rounded-[16px]">
                                    <Youtube className="w-6 h-6 text-red-500" />
                                </div>
                                <h3 className="font-bold text-xl text-[#191F28]">실시간 여론 분석</h3>
                             </div>
                             
                            <button 
                                onClick={handleAnalyze} 
                                disabled={loading}
                                className={`font-semibold rounded-[18px] transition-all flex items-center space-x-2 ${
                                    loading 
                                    ? 'bg-[#F2F4F6] text-[#B0B8C1] px-6 py-3 cursor-not-allowed'
                                    : analysis 
                                        ? 'bg-[#F2F4F6] text-[#4E5968] hover:bg-[#E5E8EB] px-5 py-2.5 text-[14px]'
                                        : 'bg-[#3182F6] hover:bg-[#1B64DA] text-white shadow-md shadow-blue-100 px-6 py-3 text-[15px]'
                                }`}
                            >
                                {loading ? (
                                    <span>스캔 중...</span>
                                ) : analysis ? (
                                    <>
                                        <RefreshCw className="w-4 h-4" />
                                        <span>재분석</span>
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-4 h-4" />
                                        <span>뉴스/영상 스캔</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {loading ? (
                            <div className="space-y-6 py-10">
                                <div className="h-4 bg-[#F2F4F6] rounded w-3/4 animate-pulse"></div>
                                <div className="h-4 bg-[#F2F4F6] rounded w-full animate-pulse"></div>
                                <div className="h-4 bg-[#F2F4F6] rounded w-5/6 animate-pulse"></div>
                                <div className="text-center text-sm text-[#8B95A1] mt-12 font-medium">최상위 100개 뉴스 & 영상 데이터를 분석하고 있습니다...</div>
                            </div>
                        ) : analysis ? (
                            <div className="max-w-none">
                                <FormattedText text={analysis} />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-[#B0B8C1]">
                                <p className="font-medium">스캔 버튼을 눌러 시장의 목소리를 들어보세요.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="toss-card p-8 flex flex-col items-center justify-center relative h-fit lg:sticky lg:top-6">
                    <h3 className="text-[13px] font-bold text-[#8B95A1] uppercase tracking-wide mb-8">시장 심리 지수</h3>
                    
                    <div className="h-48 w-full relative">
                        {analysis ? (
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sentimentData}
                                        cx="50%"
                                        cy="50%"
                                        startAngle={180}
                                        endAngle={0}
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={0}
                                        dataKey="value"
                                        stroke="none"
                                        cornerRadius={10}
                                    >
                                        {sentimentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="w-32 h-16 border-t-[12px] border-[#F2F4F6] rounded-t-full"></div>
                            </div>
                        )}
                        
                        {analysis && (
                            <div className="absolute top-2/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-[-15px]">
                                <span className="text-5xl font-bold text-[#191F28] tracking-tighter">{score}</span>
                            </div>
                        )}
                    </div>
                    
                    {analysis && (
                        <div className="text-center mt-6 p-4 bg-[#F9FAFB] rounded-[20px] w-full">
                            <p className={`text-[17px] font-bold ${
                                score >= 70 ? "text-[#3182F6]" : 
                                score >= 40 ? "text-[#FFB800]" :
                                "text-[#F04452]"
                            }`}>
                                {score >= 80 ? "확신적 매수세" : 
                                 score >= 60 ? "낙관적 흐름" :
                                 score >= 40 ? "신중한 대기" :
                                 score >= 20 ? "불안 확산" : "극도의 패닉"}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {analysis && (
                <div className="flex justify-end pt-4">
                    <button onClick={onNext} className="group flex items-center space-x-2 text-[#3182F6] font-bold hover:bg-blue-50 transition-colors px-6 py-3 rounded-[16px]">
                        <span>다음: 경쟁사 비교</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            )}
        </div>
    );
};
