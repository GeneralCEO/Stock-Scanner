
import React, { useState } from 'react';
import { screenPeers } from '../services/geminiService';
import { Layers, ArrowRight, RefreshCw } from 'lucide-react';
import { FormattedText } from './FormattedText';

interface Props {
    ticker: string;
    analysis: string;
    setAnalysis: (text: string) => void;
    onNext: () => void;
}

export const Step3Screener: React.FC<Props> = ({ ticker, analysis, setAnalysis, onNext }) => {
    const [loading, setLoading] = useState(false);

    const handleScreen = async () => {
        setLoading(true);
        const result = await screenPeers(ticker);
        setAnalysis(result);
        setLoading(false);
    };

    return (
        <div className="space-y-6 animate-fade-in">
             <div>
                <h2 className="text-3xl font-bold text-[#191F28] mb-1 tracking-tight">섹터 스크리너</h2>
                <p className="text-[#6B7684] font-medium text-[17px]">
                    <span className="font-bold text-[#191F28] border-b-2 border-blue-200">{ticker}</span> 실시간 피어 그룹 비교
                </p>
            </div>

            <div className="toss-card p-2 overflow-hidden bg-[#F2F4F6]">
                <div className="bg-white rounded-[24px] p-10 min-h-[400px]">
                    <div className="flex flex-col items-center justify-center mb-8 relative">
                         {analysis && (
                            <div className="absolute top-0 right-0">
                                <button 
                                    onClick={handleScreen}
                                    disabled={loading}
                                    className="text-[#8B95A1] hover:text-[#3182F6] bg-[#F2F4F6] hover:bg-blue-50 p-2.5 rounded-full transition-all"
                                    title="재분석"
                                >
                                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        )}
                        <div className="p-4 bg-[#F2F4F6] rounded-[24px] mb-4">
                            <Layers className="w-10 h-10 text-[#3182F6]" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#191F28] text-center max-w-lg mb-2">
                            누가 진정한 대장주인가?
                        </h3>
                         {!analysis && (
                            <button 
                                onClick={handleScreen}
                                disabled={loading}
                                className="mt-6 bg-[#3182F6] hover:bg-[#1B64DA] text-white px-8 py-4 rounded-[20px] font-semibold transition-all shadow-lg shadow-blue-100"
                            >
                                {loading ? '데이터 매칭 중...' : '피어 그룹 분석 시작'}
                            </button>
                        )}
                    </div>

                    {loading && (
                        <div className="space-y-6 max-w-2xl mx-auto py-8">
                            <div className="h-4 bg-[#F2F4F6] rounded-full w-3/4 animate-pulse"></div>
                            <div className="h-4 bg-[#F2F4F6] rounded-full w-full animate-pulse"></div>
                            <div className="h-4 bg-[#F2F4F6] rounded-full w-5/6 animate-pulse"></div>
                        </div>
                    )}

                    {analysis && !loading && (
                        <div className="bg-[#F9FAFB] rounded-[24px] p-8 md:p-10 border border-[#F2F4F6] max-w-5xl mx-auto">
                            <FormattedText text={analysis} />
                        </div>
                    )}
                </div>
            </div>

             {analysis && (
                <div className="flex justify-end pt-4">
                    <button onClick={onNext} className="group flex items-center space-x-2 text-[#3182F6] font-bold hover:bg-blue-50 transition-colors px-6 py-3 rounded-[16px]">
                        <span>다음: 거장의 평가</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            )}
        </div>
    );
};
