
import React from 'react';
import { Step } from '../types';
import { 
  LineChart, 
  Youtube, 
  Filter, 
  UserCheck, 
  Target, 
  TrendingUp,
  Menu,
  Radar,
  Zap
} from 'lucide-react';

interface LayoutProps {
  currentStep: Step;
  setStep: (step: Step) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentStep, setStep, children }) => {
  const steps = [
    { id: Step.Market, label: '오병이어 스캐너', icon: Radar },
    { id: Step.DayTrading, label: '단타/트레이딩', icon: Zap },
    { id: Step.Financials, label: '퀀트/차트 분석', icon: LineChart },
    { id: Step.Sentiment, label: '심리 & 뉴스', icon: Youtube },
    { id: Step.Screener, label: '경쟁사 비교', icon: Filter },
    { id: Step.Legends, label: '거장의 평가', icon: UserCheck },
    { id: Step.Strategy, label: '최종 전략', icon: Target },
  ];

  return (
    <div className="flex h-screen bg-[#F2F4F6] text-[#191F28] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-[280px] bg-white hidden md:flex flex-col z-10 m-4 rounded-[32px] shadow-toss border border-gray-100">
        <div className="p-8 flex items-center space-x-3">
          <div className="p-2 bg-blue-500 rounded-2xl shadow-lg shadow-blue-200">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#191F28]">
            오병<span className="text-[#3182F6]">이어</span>
          </span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {steps.map((item) => {
            const Icon = item.icon;
            const isActive = currentStep === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setStep(item.id)}
                className={`w-full flex items-center space-x-4 px-5 py-4 rounded-[20px] transition-all duration-200 font-semibold text-[17px] ${
                  isActive 
                    ? 'bg-[#F2F4F6] text-[#191F28]' 
                    : 'text-[#8B95A1] hover:bg-gray-50 hover:text-[#333D4B]'
                }`}
              >
                <div className={`relative ${isActive ? 'text-[#3182F6]' : 'text-[#B0B8C1]'}`}>
                   <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-8">
            <div className="bg-[#F9FAFB] rounded-2xl p-4 text-center">
                <p className="text-[12px] text-[#8B95A1] font-bold uppercase tracking-wider">
                    Five Breads & Two Fishes
                </p>
                <p className="text-[10px] text-[#B0B8C1] mt-1">v2.5.0 DayTrading</p>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="md:hidden h-16 bg-white flex items-center px-5 justify-between sticky top-0 z-20 shadow-sm">
           <div className="flex items-center space-x-2">
             <div className="p-1.5 bg-[#3182F6] rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
             </div>
             <span className="font-bold text-lg text-[#191F28]">오병<span className="text-[#3182F6]">이어</span></span>
           </div>
           <Menu className="w-6 h-6 text-[#4E5968]" />
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 relative custom-scrollbar">
            <div className="max-w-4xl mx-auto pb-24 md:pt-4">
                {children}
            </div>
        </div>
      </main>
    </div>
  );
};
