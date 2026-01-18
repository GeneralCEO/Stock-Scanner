import React, { useState } from 'react';
import { StockData } from '../types';
import { analyzeFinancials } from '../services/geminiService';
import { Search, BrainCircuit, TrendingUp, ArrowRight, RefreshCw } from 'lucide-react';
import { FormattedText } from './FormattedText';

interface Props {
    stock: StockData;
    onTickerChange: (ticker: string) => void;
    analysis: string;
    setAnalysis: (text: string) => void;
    onNext: () => void;
}

export const Step1Financials: React.FC<Props> = ({ stock, onTickerChange, analysis, setAnalysis, onNext }) => {
    const [loading, setLoading] = useState(false);
    const [tickerInput, setTickerInput] = useState(stock.ticker);

    const handleSearch = () => {
        if (tickerInput.trim()) {
            onTickerChange(tickerInput.trim().toUpperCase());
        }
    };

    const handleAnalyze = async () => {
        setLoading(true);
        const result = await analyzeFinancials(stock.ticker);
        setAnalysis(result);
        setLoading(false);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-[#191F28] mb-1 tracking-tight">퀀트 & 기술적 진단</h2>
                    <p className="text-[#6B7684] font-medium text-[17px]">
                        <span className="font-bold text-[#333D4B] bg-blue-50 px-2 py-0.5 rounded-lg text-[#3182F6]">{stock.ticker}</span> 실시간 분석
                    </p>
                </div>
                <div className="flex items-center bg-white p-2 rounded-[20px] shadow-sm border border-gray-100 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B95A1]" />
                        <input 
                            type="text" 
                            value={tickerInput}
                            onChange={(e) => setTickerInput(e.target.value)}
                            className="bg-transparent border-none outline-none text-[#191F28] pl-10 pr-4 py-2 w-32 placeholder-gray-400 font-bold uppercase text-[15px]"
                            placeholder="TICKER"
                        />
                    </div>
                    <button 
                        onClick={handleSearch}
                        className="bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[#4E5968] text-xs font-bold px-4 py-2.5 rounded-[14px] transition-colors"
                    >
                        변경
                    </button>
                </div>
            </div>

            <div className="toss-card p-10 min-h-[500px]">
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-[#F2F4F6]">
                    <div className="flex items-center space-x-4">
                        <div className="bg-blue-50 p-3 rounded-[18px]">
                            <BrainCircuit className="w-6 h-6 text-[#3182F6]" />
                        </div>
                        <div>
                             <h3 className="font-bold text-xl text-[#191F28]">AI 분석 리포트</h3>
                             <p className="text-[13px] text-[#8B95A1] font-semibold mt-0.5">Naver Finance Synced</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleAnalyze}
                        disabled={loading}
                        className={`px-5 py-2.5 rounded-[16px] font-semibold text-[14px] transition-all flex items-center space-x-2 ${
                            loading 
                            ? 'bg-[#F2F4F6] text-[#B0B8C1] cursor-not-allowed' 
                            : analysis 
                                ? 'bg-[#F2F4F6] text-[#4E5968] hover:bg-[#E5E8EB]' 
                                : 'bg-[#3182F6] hover:bg-[#1B64DA] text-white shadow-lg shadow-blue-100 px-8 py-3.5'
                        }`}
                    >
                        {loading ? (
                            <span>데이터 검증 중...</span>
                        ) : analysis ? (
                            <>
                                <RefreshCw className="w-4 h-4" />
                                <span>재분석</span>
                            </>
                        ) : (
                            <span>분석 시작</span>
                        )}
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-6">
                        <div className="w-12 h-12 border-4 border-[#F2F4F6] border-t-[#3182F6] rounded-full animate-spin"></div>
                        <div className="text-center space-y-2">
                             <p className="text-[#191F28] font-bold text-lg">데이터를 불러오고 있어요</p>
                             <p className="text-[#8B95A1] text-sm">재무제표와 차트를 비교 분석합니다.</p>
                        </div>
                    </div>
                ) : analysis ? (
                    <div className="max-w-none">
                        <FormattedText text={analysis} />
                    </div>
                ) : (
                     <div className="flex flex-col items-center justify-center py-24 text-[#B0B8C1] bg-[#F9FAFB] rounded-[24px]">
                        <TrendingUp className="w-12 h-12 mb-4 opacity-50" />
                        <p className="font-semibold">분석 시작 버튼을 눌러주세요.</p>
                    </div>
                )}
            </div>
            
            {analysis && (
                <div className="flex justify-end">
                    <button onClick={onNext} className="group flex items-center space-x-2 text-[#3182F6] font-bold hover:bg-blue-50 transition-colors px-6 py-3 rounded-[16px]">
                        <span>다음: 뉴스 & 심리 분석</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            )}
        </div>
    );
};