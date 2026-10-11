import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { Plus, Trash2, ShieldCheck, Sparkles, AlertCircle, CheckCircle2, TrendingUp, ArrowRight } from 'lucide-react';

export const CreateCampaign = () => {
  const navigate = useNavigate();
  const { createCampaign, getAIRiskScore, getAITimelinePrediction, account } = useWeb3();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Artificial Intelligence');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('10.0');
  const [banner, setBanner] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80');

  const [milestones, setMilestones] = useState([
    {
      title: 'Milestone 1: Prototype & Testnet Scaffolding',
      description: 'Deliver initial working prototype with smart contract scaffolding and integration tests.',
      targetDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      tranchePercent: 35
    },
    {
      title: 'Milestone 2: Security Audit & Optimization',
      description: 'Complete comprehensive external security audit and gas optimizations.',
      targetDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      tranchePercent: 35
    },
    {
      title: 'Milestone 3: Production Deployment & SDK',
      description: 'Deploy production contracts on Sepolia/Mainnet with developer SDK and documentation.',
      targetDate: new Date(Date.now() + 50 * 86400000).toISOString().split('T')[0],
      tranchePercent: 30
    }
  ]);

  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const totalTranchePercent = milestones.reduce((acc, m) => acc + (parseInt(m.tranchePercent) || 0), 0);

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: `Milestone ${milestones.length + 1}`,
        description: '',
        targetDate: new Date(Date.now() + (milestones.length + 1) * 20 * 86400000).toISOString().split('T')[0],
        tranchePercent: 0
      }
    ]);
  };

  const removeMilestone = (idx) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const updateMilestone = (idx, field, value) => {
    const updated = [...milestones];
    updated[idx][field] = value;
    setMilestones(updated);
  };

  // Run AI Pre-Screening
  const handlePreScreenAI = async () => {
    if (!title || !description) {
      setErrorMsg('Please enter campaign title and description before running AI pre-screen.');
      return;
    }
    setErrorMsg('');
    setIsAnalyzing(true);

    try {
      const combinedDescriptions = `${description} ${milestones.map(m => m.description).join(' ')}`;
      const result = await getAIRiskScore({
        creator_completion_rate: 0.90,
        milestone_description: combinedDescriptions,
        wallet_age_days: 380,
        wallet_tx_count: 145,
        funding_velocity_ratio: 1.1,
        backer_sentiment_score: 0.85
      });
      setAiAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (totalTranchePercent !== 100) {
      setErrorMsg(`Milestone tranches must sum to exactly 100% (currently ${totalTranchePercent}%).`);
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const newId = await createCampaign({
        title,
        category,
        description,
        goal,
        banner,
        milestones,
        aiRiskScore: aiAnalysis ? aiAnalysis.risk_score_int : 24,
        aiRiskTier: aiAnalysis ? aiAnalysis.risk_tier : 'LOW',
        hasDriftAlert: false,
        driftPercentage: 3.5
      });

      navigate(`/campaign/${newId}`);
    } catch (err) {
      setErrorMsg(`Error deploying campaign: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Create Trust-Aware Campaign</h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure milestone tranches and run AI pre-screening before deploying on-chain escrows.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Campaign Details */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-brand-600/30 border border-brand-500/40 text-brand-400 text-xs flex items-center justify-center font-extrabold">1</span>
            <span>Campaign Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Project Title</label>
              <input
                type="text"
                placeholder="e.g. Zero-Knowledge State Channel Protocol"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
              >
                <option>Artificial Intelligence</option>
                <option>CleanTech / DePIN</option>
                <option>DeFi / Smart Contracts</option>
                <option>Zero Knowledge Proofs</option>
                <option>Open Source Hardware</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Funding Goal (ETH)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Banner Image URL</label>
              <input
                type="url"
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description & Value Proposition</label>
              <textarea
                rows={3}
                placeholder="Explain the problem, technical architecture, and value proposition..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Milestone Tranches */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-brand-600/30 border border-brand-500/40 text-brand-400 text-xs flex items-center justify-center font-extrabold">2</span>
              <span>Milestone Escrow Tranches</span>
            </h2>
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg border ${
                totalTranchePercent === 100
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                Total: {totalTranchePercent}% / 100%
              </span>
              <button
                type="button"
                onClick={addMilestone}
                className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Milestone</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {milestones.map((m, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                    Milestone Tranche #{idx + 1}
                  </span>
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMilestone(idx)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Milestone Title"
                      value={m.title}
                      onChange={(e) => updateMilestone(idx, 'title', e.target.value)}
                      required
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="Tranche %"
                        value={m.tranchePercent}
                        onChange={(e) => updateMilestone(idx, 'tranchePercent', parseInt(e.target.value) || 0)}
                        required
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Specific deliverables and proof artifacts..."
                      value={m.description}
                      onChange={(e) => updateMilestone(idx, 'description', e.target.value)}
                      required
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      value={m.targetDate}
                      onChange={(e) => updateMilestone(idx, 'targetDate', e.target.value)}
                      required
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: AI Real-time Pre-Screening */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-brand-400" />
              <h2 className="text-base font-bold text-slate-100">AI Risk Pre-Screening & Specificity Check</h2>
            </div>
            <button
              type="button"
              onClick={handlePreScreenAI}
              disabled={isAnalyzing}
              className="px-4 py-1.5 rounded-xl bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 text-xs font-bold transition-all"
            >
              {isAnalyzing ? 'Evaluating Signals...' : 'Run AI Pre-Screen'}
            </button>
          </div>

          {aiAnalysis && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200">
                    Predicted Risk Score: <strong>{aiAnalysis.risk_score}/100</strong> ({aiAnalysis.risk_tier} Risk)
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  NLP Specificity: {(aiAnalysis.specificity_score_used * 100).toFixed(0)}%
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {aiAnalysis.signals_breakdown.map((sig, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px]">
                    <p className="text-slate-400 truncate">{sig.feature}</p>
                    <p className="font-semibold text-slate-200 mt-0.5">{sig.risk_impact}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || totalTranchePercent !== 100}
            className="flex items-center space-x-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-brand-500/20 disabled:opacity-50 transition-all"
          >
            <span>{isSubmitting ? 'Deploying Smart Contracts...' : 'Deploy Campaign on Sepolia / Local'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
