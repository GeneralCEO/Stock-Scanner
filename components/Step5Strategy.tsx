
import React, { useEffect, useState } from 'react';
import { AnalysisState } from '../types';
import { generateStrategy } from '../services/geminiService';
import { Target, ShieldAlert, Download, Cpu, RefreshCw } from 'lucide-react';
import { FormattedText } from './FormattedText';

interface Props {
    data: AnalysisState;
    setFinalStrategy: (text: string) => void;
}

export const Step5Strategy: React.FC<Props> = ({ data, setFinalStrategy }) => {
    const [loading, setLoading] = useState(false);

    const fetchStrategy = async () => {
        setLoading(true);
        const result = await generateStrategy(data.ticker, data);
        setFinalStrategy(result);
        setLoading(false);
    };

    useEffect(() => {
        if (!data.finalStrategy && !loading) {
            fetchStrategy();
        }
    }, [data.ticker]);

    return (
        <div className="space-y-6 animate-fade-in pb-10">
             <div>
                <h2 className="text-3xl font-bold text-[#191F28] mb-1 tracking-tight">최종 투자 전략</h2>
                <p className="text-[#6B7684] font-medium text-[17px]">
                    실시간 데이터 종합 기반 매매 타점 및 리스크 관리
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="toss-card p-6 border border-[#F2F4F6]">
                    <div className="text-[12px] text-[#8B95A1] uppercase font-bold mb-3 tracking-wide">데이터 검증</div>
                    <div className={`text-lg font-bold truncate ${data.financialAnalysis ? 'text-[#3182F6]' : 'text-gray-300'}`}>
                        {data.financialAnalysis ? '실시간 연동 완료' : '대기 중'}
                    </div>
                </div>
                <div className="toss-card p-6 border border-[#F2F4F6]">
                    <div className="text-[12px] text-[#8B95A1] uppercase font-bold mb-3 tracking-wide">시장 심리</div>
                    <div className="flex items-center space-x-3">
                        <div className={`h-3 w-3 rounded-full ${data.sentimentScore > 50 ? 'bg-[#3182F6]' : 'bg-[#F04452]'}`}></div>
                        <span className="text-[20px] font-bold text-[#191F28]">{data.sentimentScore}/100</span>
                    </div>
                </div>
                <div className="toss-card p-6 border border-[#F2F4F6]">
                    <div className="text-[12px] text-[#8B95A1] uppercase font-bold mb-3 tracking-wide">거장 점수</div>
                    <div className={`text-[20px] font-bold truncate ${data.legendAnalysis ? 'text-[#191F28]' : 'text-gray-300'}`}>
                         {data.legendScores?.total ? `${data.legendScores.total}점` : '대기 중'}
                    </div>
                </div>
            </div>

            <div className="toss-card overflow-hidden">
                <div className="bg-[#F9FAFB] p-10 border-b border-[#F2F4F6] flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-[#3182F6] rounded-[18px] shadow-md shadow-blue-100">
                            <Target className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="font-bold text-2xl text-[#191F28]">최종 매매 시나리오</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                        {data.finalStrategy && (
                             <button 
                                onClick={fetchStrategy}
                                disabled={loading}
                                className="text-[#8B95A1] hover:text-[#3182F6] transition-colors p-3 hover:bg-[#F2F4F6] rounded-full"
                                title="전략 재생성"
                            >
                                <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        )}
                        {data.finalStrategy && (
                             <button className="text-[#8B95A1] hover:text-[#3182F6] transition-colors p-3 hover:bg-[#F2F4F6] rounded-full">
                                <Download className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-10 md:p-14 min-h-[400px]">
                    {loading ? (
                        <div className="space-y-10 py-10">
                            <div className="flex items-center space-x-5 text-[#3182F6] animate-pulse">
                                <div className="w-14 h-14 bg-blue-50 rounded-[20px] flex items-center justify-center">
                                    <Cpu className="w-8 h-8" />
                                </div>
                                <span className="font-bold text-xl">최적의 투자 시나리오 계산 중...</span>
                            </div>
                            <div className="h-2 bg-[#F2F4F6] rounded-full w-full overflow-hidden">
                                <div className="h-full bg-[#3182F6] w-1/2 animate-[progress_2s_ease-in-out_infinite]"></div>
                            </div>
                            <p className="text-[#8B95A1] text-sm font-bold uppercase tracking-wide text-center">Calculating R/R Ratio based on Naver Finance</p>
                        </div>
                    ) : data.finalStrategy ? (
                         <div className="max-w-none">
                            <FormattedText text={data.finalStrategy} />
                        </div>
                    ) : (
                        <div className="text-center text-[#B0B8C1] py-24 font-bold">
                            모든 분석 단계가 완료되면 최종 전략 리포트가 여기에 표시됩니다.
                        </div>
                    )}
                </div>
            </div>
            
             <div className="bg-[#F9FAFB] p-6 rounded-[24px] flex items-start space-x-4 mt-8">
                <ShieldAlert className="w-6 h-6 text-[#8B95A1] flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-[#6B7684] leading-relaxed font-medium">
                    <strong className="block text-[#4E5968] mb-1">InvestAI Disclosure</strong>
                    본 서비스는 실시간 공개 데이터를 AI가 가공하여 제공하는 보조 도구입니다. 모든 투자의 결정과 결과에 대한 책임은 투자자 본인에게 있습니다.
                </p>
            </div>
        </div>
    );
};
