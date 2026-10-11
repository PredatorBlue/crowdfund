import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Cpu, TrendingUp, AlertTriangle, CheckCircle2, Sliders, RefreshCw, Send, ArrowRight } from 'lucide-react';

export const OracleSimulator = () => {
  const { getAIRiskScore, getAITimelinePrediction } = useWeb3();

  // Risk Simulator Inputs
  const [completionRate, setCompletionRate] = useState(0.85);
  const [milestoneDesc, setMilestoneDesc] = useState('Deliver production zk-SNARK verifier contract on Sepolia testnet with 100% test coverage by Oct 2026.');
  const [walletAge, setWalletAge] = useState(420);
  const [txCount, setTxCount] = useState(180);
  const [velocityRatio, setVelocityRatio] = useState(1.2);
  const [sentimentScore, setSentimentScore] = useState(0.82);

  const [riskResult, setRiskResult] = useState(null);
  const [isRiskLoading, setIsRiskLoading] = useState(false);

  // Timeline Simulator Inputs
  const [plannedDays, setPlannedDays] = useState(30);
  const [complexity, setComplexity] = useState(7);
  const [paceFactor, setPaceFactor] = useState(0.9);
  const [blockersCount, setBlockersCount] = useState(2);

  const [timeResult, setTimeResult] = useState(null);
  const [isTimeLoading, setIsTimeLoading] = useState(false);

  // Run Risk Scoring
  const handleRunRiskModel = async () => {
    setIsRiskLoading(true);
    try {
      const data = await getAIRiskScore({
        creator_completion_rate: completionRate,
        milestone_description: milestoneDesc,
        wallet_age_days: walletAge,
        wallet_tx_count: txCount,
        funding_velocity_ratio: velocityRatio,
        backer_sentiment_score: sentimentScore
      });
      setRiskResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRiskLoading(false);
    }
  };

  // Run Timeline Prediction
  const handleRunTimelineModel = async () => {
    setIsTimeLoading(true);
    try {
      const data = await getAITimelinePrediction({
        planned_duration_days: plannedDays,
        task_complexity: complexity,
        creator_pace_factor: paceFactor,
        backer_blockers_count: blockersCount
      });
      setTimeResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTimeLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <Cpu className="w-6 h-6 text-brand-400" />
          <h1 className="text-3xl font-extrabold text-white">AI & Oracle Bridge Simulator</h1>
        </div>
        <p className="text-slate-400 text-sm mt-1">
          Test the Python ML services (Gradient Boosting Risk Scorer & Random Forest Timeline Regressor) and inspect real-time feature contributions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ========================================== */}
        {/* 1. RISK MODEL SIMULATOR */}
        {/* ========================================== */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-100">Gradient-Boosted Risk Classifier</h2>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-indigo-300 font-mono border border-slate-700">
              POST /risk-score
            </span>
          </div>

          {/* Form Controls */}
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Creator Past Completion Rate (30% weight)</span>
                <span className="font-mono font-bold text-brand-400">{(completionRate * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={completionRate}
                onChange={(e) => setCompletionRate(parseFloat(e.target.value))}
                className="w-full accent-brand-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">
                Milestone Specificity & Deliverables (20% weight heuristic)
              </label>
              <textarea
                rows={2}
                value={milestoneDesc}
                onChange={(e) => setMilestoneDesc(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Wallet Age (days)</span>
                  <span className="font-mono font-bold text-brand-400">{walletAge}d</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={walletAge}
                  onChange={(e) => setWalletAge(parseInt(e.target.value))}
                  className="w-full accent-brand-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>On-Chain Tx Count</span>
                  <span className="font-mono font-bold text-brand-400">{txCount}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={txCount}
                  onChange={(e) => setTxCount(parseInt(e.target.value))}
                  className="w-full accent-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Funding Velocity Ratio</span>
                  <span className="font-mono font-bold text-brand-400">{velocityRatio}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={velocityRatio}
                  onChange={(e) => setVelocityRatio(parseFloat(e.target.value))}
                  className="w-full accent-brand-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Backer Sentiment Score</span>
                  <span className="font-mono font-bold text-brand-400">{(sentimentScore * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={sentimentScore}
                  onChange={(e) => setSentimentScore(parseFloat(e.target.value))}
                  className="w-full accent-brand-500"
                />
              </div>
            </div>

            <button
              onClick={handleRunRiskModel}
              disabled={isRiskLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center justify-center space-x-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRiskLoading ? 'animate-spin' : ''}`} />
              <span>{isRiskLoading ? 'Calculating Gradient Boosted Inference...' : 'Calculate AI Risk Score'}</span>
            </button>
          </div>

          {/* Risk Results */}
          {riskResult && (
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Output Risk Score</p>
                  <p className="text-2xl font-extrabold text-slate-100">{riskResult.risk_score} / 100</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                  riskResult.risk_tier === "LOW"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : riskResult.risk_tier === "MEDIUM"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                }`}>
                  {riskResult.risk_tier} RISK
                </span>
              </div>

              <div className="pt-2 border-t border-slate-700/60 space-y-1.5">
                <p className="text-[11px] font-bold text-slate-300">Signal Impact Analysis:</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {riskResult.signals_breakdown?.map((s, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-900/60 border border-slate-700/40">
                      <span className="text-slate-400 block truncate">{s.feature}</span>
                      <span className="font-semibold text-slate-200">{s.risk_impact}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* 2. TIMELINE MODEL SIMULATOR */}
        {/* ========================================== */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-slate-100">Random Forest Timeline & Drift Predictor</h2>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-amber-300 font-mono border border-slate-700">
              POST /predict-timeline
            </span>
          </div>

          {/* Form Controls */}
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Planned Milestone Duration</span>
                <span className="font-mono font-bold text-amber-400">{plannedDays} days</span>
              </div>
              <input
                type="range"
                min="7"
                max="90"
                step="1"
                value={plannedDays}
                onChange={(e) => setPlannedDays(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Task Complexity Weighting (1-10)</span>
                <span className="font-mono font-bold text-amber-400">{complexity} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={complexity}
                onChange={(e) => setComplexity(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Historical Creator Pace</span>
                  <span className="font-mono font-bold text-amber-400">{paceFactor}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={paceFactor}
                  onChange={(e) => setPaceFactor(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Backer Blockers Reported</span>
                  <span className="font-mono font-bold text-amber-400">{blockersCount}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={blockersCount}
                  onChange={(e) => setBlockersCount(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            <button
              onClick={handleRunTimelineModel}
              disabled={isTimeLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center space-x-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTimeLoading ? 'animate-spin' : ''}`} />
              <span>{isTimeLoading ? 'Predicting Completion & Drift...' : 'Forecast Milestone Completion'}</span>
            </button>
          </div>

          {/* Timeline Results */}
          {timeResult && (
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Forecasted Duration</p>
                  <p className="text-2xl font-extrabold text-slate-100">
                    {timeResult.predicted_duration_days} days
                    <span className="text-xs font-normal text-slate-400 ml-1.5">
                      (vs {timeResult.planned_duration_days} planned)
                    </span>
                  </p>
                </div>

                {timeResult.drift_alert ? (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-slate-950 flex items-center space-x-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>DRIFT ALERT (+{timeResult.drift_percentage}%)</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ON SCHEDULE</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-700/60">
                <div className="p-2 rounded bg-slate-900/60 border border-slate-700/40">
                  <span className="text-slate-400 block">Delay Estimated</span>
                  <span className="font-bold text-slate-200">{timeResult.drift_days} days</span>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-700/40">
                  <span className="text-slate-400 block">Confidence Interval</span>
                  <span className="font-bold text-slate-200">± {timeResult.confidence_interval_days} days</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
