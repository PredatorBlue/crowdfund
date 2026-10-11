import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { CampaignCard } from '../components/CampaignCard';
import { Search, Filter, ShieldCheck, Sparkles, TrendingUp, Cpu, Award } from 'lucide-react';

export const Dashboard = () => {
  const { campaigns } = useWeb3();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedRiskTier, setSelectedRiskTier] = useState('ALL');

  const categories = ['ALL', 'Artificial Intelligence', 'CleanTech / DePIN', 'DeFi / Smart Contracts', 'Zero Knowledge Proofs', 'Open Source Hardware'];

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || c.category === selectedCategory;
    const matchesRisk = selectedRiskTier === 'ALL' || c.riskTier === selectedRiskTier;
    return matchesSearch && matchesCat && matchesRisk;
  });

  const totalEthRaised = campaigns.reduce((acc, c) => acc + (parseFloat(c.totalPledged) || 0), 0).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 p-8 sm:p-12 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Web3 Governance & ML Prediction</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Trust-Aware Decentralized <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
              Milestone Crowdfunding
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Never release 100% of crowdfunding capital upfront. Pledged funds are held in smart contract escrow tranches, governed by backer-weighted voting, on-chain reputation scores, and real-time AI risk classifiers.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80">
            <div>
              <p className="text-xs text-slate-400">Total Pledged</p>
              <p className="text-xl font-extrabold text-slate-100">{totalEthRaised} ETH</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Governance Quorum</p>
              <p className="text-xl font-extrabold text-indigo-400">40% Capital</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Approval Threshold</p>
              <p className="text-xl font-extrabold text-emerald-400">66% Supermajority</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">ML Risk Engine</p>
              <p className="text-xl font-extrabold text-brand-400">GBR v1.0 (95% Acc)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search campaigns, protocols..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Risk Filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <span className="text-xs text-slate-400 font-medium">Risk:</span>
          <select
            value={selectedRiskTier}
            onChange={(e) => setSelectedRiskTier(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="LOW">Low Risk (&lt;35)</option>
            <option value="MEDIUM">Medium Risk (35-65)</option>
            <option value="HIGH">High Risk (&gt;65)</option>
          </select>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-100">
            Active Crowdfunding Campaigns ({filteredCampaigns.length})
          </h2>
          <p className="text-xs text-slate-400">Live Escrow & Milestone Tranches</p>
        </div>

        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800">
            <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-semibold">No campaigns found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or filter settings</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
