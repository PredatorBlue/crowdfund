import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, CheckCircle, Clock, ArrowRight, Award, TrendingUp } from 'lucide-react';

export const CampaignCard = ({ campaign }) => {
  const {
    id,
    title,
    category,
    description,
    banner,
    goal,
    totalPledged,
    riskScore,
    riskTier,
    hasDriftAlert,
    driftPercentage,
    creatorReputation,
    milestones = []
  } = campaign;

  const pledgedNum = parseFloat(totalPledged) || 0;
  const goalNum = parseFloat(goal) || 1;
  const progressPercent = Math.min(100, Math.round((pledgedNum / goalNum) * 100));

  const completedMilestones = milestones.filter(m => m.completed).length;
  const activeMilestones = milestones.filter(m => m.voting && m.voting.active).length;

  // Tier Colors
  const tierColor = {
    Gold: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    Silver: "bg-slate-300/10 text-slate-200 border-slate-400/30",
    Bronze: "bg-amber-800/10 text-amber-400 border-amber-700/30"
  }[creatorReputation?.tier || "Silver"];

  // Risk Colors
  const riskColor = riskTier === "LOW"
    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
    : riskTier === "MEDIUM"
    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
    : "bg-rose-500/10 text-rose-400 border-rose-500/30";

  return (
    <div className="group rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-brand-500/5 transition-all duration-300 flex flex-col">
      {/* Banner Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-800">
        <img
          src={banner}
          alt={title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80";
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-900/80 backdrop-blur-md text-slate-200 border border-slate-700/70">
            {category}
          </span>
        </div>

        {/* Drift Alert Badge */}
        {hasDriftAlert && (
          <div className="absolute top-3 right-3 flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/90 text-slate-950 shadow-md backdrop-blur-md animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Drift Alert (+{driftPercentage}%)</span>
          </div>
        )}

        {/* AI Risk Score Pill */}
        <div className="absolute bottom-3 left-3 flex items-center space-x-2">
          <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border backdrop-blur-md ${riskColor}`}>
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Risk Score: {riskScore}/100</span>
            <span className="text-[10px] uppercase font-mono opacity-80">({riskTier})</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Creator Trust Badge */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${tierColor}`}>
                {creatorReputation?.tier || 'Silver'} Tier
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Trust: {creatorReputation?.score || 3.5}/5.0
              </span>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {completedMilestones}/{milestones.length} Milestones
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-100 group-hover:text-brand-400 transition-colors line-clamp-1">
            {title}
          </h3>
          <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Funding Progress Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex justify-between items-baseline mb-1.5">
            <div className="flex items-baseline space-x-1">
              <span className="text-base font-extrabold text-slate-100">{totalPledged} ETH</span>
              <span className="text-xs text-slate-400">pledged</span>
            </div>
            <span className="text-xs font-mono text-slate-400 font-medium">{progressPercent}% of {goal} ETH</span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-600 to-indigo-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          {/* Action CTA */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-1 text-xs text-slate-400">
              {activeMilestones > 0 ? (
                <span className="flex items-center space-x-1 text-indigo-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                  <span>Voting Active</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Next milestone in progress</span>
                </span>
              )}
            </div>

            <Link
              to={`/campaign/${id}`}
              className="flex items-center space-x-1 text-xs font-bold text-brand-400 hover:text-brand-300 group-hover:translate-x-0.5 transition-transform"
            >
              <span>View Campaign</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
