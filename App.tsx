
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Step0Market } from './components/Step0Market';
import { StepDayTrading } from './components/StepDayTrading';
import { Step1Financials } from './components/Step1Financials';
import { Step2Sentiment } from './components/Step2Sentiment';
import { Step3Screener } from './components/Step3Screener';
import { Step4Legends } from './components/Step4Legends';
import { Step5Strategy } from './components/Step5Strategy';
import { Step, StockData, INITIAL_STOCK_DATA, AnalysisState } from './types';

// 10 minutes cache to ensure fresh real-time data while avoiding excessive API calls
const CACHE_DURATION = 10 * 60 * 1000; 
const CACHE_KEY = 'invest_ai_persistent_cache_v4';

function App() {
  const [currentStep, setCurrentStep] = useState<Step>(Step.Market);
  const [stockData, setStockData] = useState<StockData>(INITIAL_STOCK_DATA);
  
  // Centralized persistent cache
  const [analysisCache, setAnalysisCache] = useState<Record<string, { timestamp: number, state: any }>>(() => {
    const saved = localStorage.getItem(CACHE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clean up expired entries on load
        const now = Date.now();
        const cleaned: Record<string, any> = {};
        Object.keys(parsed).forEach(key => {
          if (now - parsed[key].timestamp < CACHE_DURATION) {
            cleaned[key] = parsed[key];
          }
        });
        return cleaned;
      } catch (e) {
        return {};
      }
    }
    return {};
  });
  
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    ticker: INITIAL_STOCK_DATA.ticker,
    marketAnalysis: "",
    financialAnalysis: "",
    sentimentAnalysis: "",
    sentimentScore: 50,
    peerComparison: "",
    legendAnalysis: "",
    legendScores: { buffett: 0, lynch: 0, oneil: 0, total: 0 },
    insiderSummary: "",
    finalStrategy: "",
    dayTradingResult: null
  });

  // Sync cache to localStorage
  useEffect(() => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(analysisCache));
  }, [analysisCache]);

  const updateAnalysis = (key: keyof AnalysisState, value: any) => {
    setAnalysisState(prev => {
        const newState = { ...prev, [key]: value };
        const cacheKey = key === 'dayTradingResult' ? 'GLOBAL_DAY_TRADING' : newState.ticker;
        
        setAnalysisCache(prevCache => ({
            ...prevCache,
            [cacheKey]: {
                timestamp: Date.now(),
                state: newState
            }
        }));
        return newState;
    });
  };

  const handleTickerSelection = (ticker: string) => {
      const normalizedTicker = ticker.toUpperCase();
      setStockData({ ...INITIAL_STOCK_DATA, ticker: normalizedTicker });

      const cached = analysisCache[normalizedTicker];
      const now = Date.now();
      const isCacheValid = cached && (now - cached.timestamp < CACHE_DURATION);

      if (isCacheValid) {
          setAnalysisState(cached.state);
      } else {
          setAnalysisState({
              ticker: normalizedTicker,
              marketAnalysis: "",
              financialAnalysis: "",
              sentimentAnalysis: "",
              sentimentScore: 50,
              peerComparison: "",
              legendAnalysis: "",
              legendScores: { buffett: 0, lynch: 0, oneil: 0, total: 0 },
              insiderSummary: "",
              finalStrategy: "",
              dayTradingResult: null
          });
      }
      setCurrentStep(Step.Financials);
  };

  const renderStep = () => {
    switch (currentStep) {
      case Step.Market:
        return (
            <Step0Market 
                onSelectTicker={handleTickerSelection} 
                cache={analysisCache['GLOBAL_MARKET']}
                onCacheUpdate={(data) => {
                    setAnalysisCache(prev => ({
                        ...prev,
                        ['GLOBAL_MARKET']: { timestamp: Date.now(), state: data }
                    }));
                }}
            />
        );
      case Step.DayTrading:
        return (
            <StepDayTrading 
                data={analysisState.dayTradingResult}
                cache={analysisCache['GLOBAL_DAY_TRADING']}
                setData={(result) => updateAnalysis('dayTradingResult', result)}
                onSelectTicker={handleTickerSelection}
            />
        );
      case Step.Financials:
        return (
          <Step1Financials 
            stock={stockData} 
            onTickerChange={handleTickerSelection}
            analysis={analysisState.financialAnalysis}
            setAnalysis={(text) => updateAnalysis('financialAnalysis', text)}
            onNext={() => setCurrentStep(Step.Sentiment)}
          />
        );
      case Step.Sentiment:
        return (
            <Step2Sentiment 
                ticker={stockData.ticker}
                analysis={analysisState.sentimentAnalysis}
                score={analysisState.sentimentScore}
                setAnalysis={(text, score) => {
                    updateAnalysis('sentimentAnalysis', text);
                    updateAnalysis('sentimentScore', score);
                }}
                onNext={() => setCurrentStep(Step.Screener)}
            />
        );
      case Step.Screener:
        return (
            <Step3Screener 
                ticker={stockData.ticker}
                analysis={analysisState.peerComparison}
                setAnalysis={(text) => updateAnalysis('peerComparison', text)}
                onNext={() => setCurrentStep(Step.Legends)}
            />
        );
      case Step.Legends:
        return (
            <Step4Legends 
                ticker={stockData.ticker}
                analysis={analysisState.legendAnalysis}
                scores={analysisState.legendScores}
                insiderSummary={analysisState.insiderSummary}
                setAnalysis={(text) => updateAnalysis('legendAnalysis', text)}
                setScores={(scores) => updateAnalysis('legendScores', scores)}
                setInsiderSummary={(text) => updateAnalysis('insiderSummary', text)}
                onNext={() => setCurrentStep(Step.Strategy)}
            />
        );
      case Step.Strategy:
        return (
            <Step5Strategy 
                data={analysisState}
                setFinalStrategy={(text) => updateAnalysis('finalStrategy', text)}
            />
        );
      default:
        return null;
    }
  };

  return (
    <Layout currentStep={currentStep} setStep={setCurrentStep}>
        {renderStep()}
    </Layout>
  );
}

export default App;
