import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Award, ShieldCheck, CheckCircle2, Clock, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { CampaignCard } from '../components/CampaignCard';

export const CreatorProfile = () => {
  const { account, campaigns } = useWeb3();

  const creatorAddress = account || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const creatorCampaigns = campaigns.filter(c => c.creator?.toLowerCase() === creatorAddress.toLowerCase());

  // Reputation Stats (Calculated on-chain simulation)
  const reputation = {
    score: 4.65,
    tier: "Gold",
    onTimeDeliveries: 5,
    lateDeliveries: 1,
    failedVotes: 0,
    disputes: 0,
    onTimeRate: 83.3,
    totalCampaigns: creatorCampaigns.length || 2
  };

  const outcomeHistory = [
    { campaign: "Decentralized AI Inference Network", milestone: "M1: Compute Node Protocol", outcome: "OnTime", reward: "+25 pts", date: "Aug 2026" },
    { campaign: "Decentralized AI Inference Network", milestone: "M2: ZK Verification Engine", outcome: "OnTime", reward: "+25 pts", date: "Aug 2026" },
    { campaign: "Zero-Knowledge State Channel Protocol", milestone: "M1: Core EVM Bridge", outcome: "OnTime", reward: "+25 pts", date: "Jul 2026" },
    { campaign: "Solar Energy Microgrid IoT", milestone: "M1: ESP32 Firmware", outcome: "Late", reward: "-10 pts", date: "Jun 2026" },
    { campaign: "Autonomous Compute Mesh", milestone: "M1: Consensus Alpha", outcome: "OnTime", reward: "+25 pts", date: "May 2026" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Profile Header */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-extrabold text-2xl">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-extrabold text-white">Creator Reputation Ledger</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {reputation.tier} Tier Verified
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-1">{creatorAddress}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-mono">
              On-Chain Ledger: ReputationRegistry.sol
            </span>
          </div>
        </div>

        {/* Reputation Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <p className="text-xs text-slate-400 font-semibold">Trust Score</p>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">{reputation.score} / 5.0</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Tier Threshold: &gt;4.5 (Gold)</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <p className="text-xs text-slate-400 font-semibold">On-Time Delivery Rate</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">{reputation.onTimeRate}%</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{reputation.onTimeDeliveries} on-time / {reputation.lateDeliveries} late</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <p className="text-xs text-slate-400 font-semibold">Failed Milestone Votes</p>
            <p className="text-2xl font-extrabold text-slate-100 mt-1">{reputation.failedVotes}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">0 refund triggers</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <p className="text-xs text-slate-400 font-semibold">Disputes / Penalties</p>
            <p className="text-2xl font-extrabold text-slate-100 mt-1">{reputation.disputes}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Clean dispute record</p>
          </div>
        </div>
      </div>

      {/* Append-Only Outcome Ledger History */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-brand-400" />
          <span>Append-Only Milestone Outcome Log</span>
        </h2>
        <p className="text-xs text-slate-400">
          Recorded automatically on-chain after every milestone vote outcome in `ReputationRegistry.sol`.
        </p>

        <div className="space-y-2 pt-2">
          {outcomeHistory.map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/70 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                {item.outcome === 'OnTime' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <div>
                  <p className="font-bold text-slate-200">{item.campaign}</p>
                  <p className="text-slate-400">{item.milestone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-slate-400 font-mono">{item.date}</span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                  item.outcome === 'OnTime'
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                }`}>
                  {item.reward}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Creator's Campaigns */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100">Creator's Managed Campaigns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      </div>
    </div>
  );
};
