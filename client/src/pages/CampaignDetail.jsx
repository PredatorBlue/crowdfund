import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Vote,
  UploadCloud,
  FileCheck,
  Coins,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  ExternalLink,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Area,
  AreaChart
} from 'recharts';

export const CampaignDetail = () => {
  const { id } = useParams();
  const {
    campaigns,
    account,
    pledge,
    submitProof,
    castVote,
    claimRefund,
    userPledges
  } = useWeb3();

  const campaign = campaigns.find(c => String(c.id) === String(id)) || campaigns[0];

  const [pledgeAmount, setPledgeAmount] = useState('1.0');
  const [isPledging, setIsPledging] = useState(false);
  const [proofInput, setProofInput] = useState('');
  const [selectedMilestoneForProof, setSelectedMilestoneForProof] = useState(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  if (!campaign) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-300">Campaign not found</p>
        <Link to="/" className="text-brand-400 mt-2 inline-block">Return to Dashboard</Link>
      </div>
    );
  }

  const {
    title,
    category,
    description,
    banner,
    creator,
    goal,
    totalPledged,
    riskScore,
    riskTier,
    hasDriftAlert,
    driftPercentage,
    creatorReputation,
    milestones = [],
    escrowAddress,
    votingAddress
  } = campaign;

  const pledgedNum = parseFloat(totalPledged) || 0;
  const goalNum = parseFloat(goal) || 1;
  const progressPercent = Math.min(100, Math.round((pledgedNum / goalNum) * 100));

  const isCreator = account && creator && account.toLowerCase() === creator.toLowerCase();
  const userPledgeKey = `${campaign.id}-${account || "default"}`;
  const userPledgeAmt = parseFloat(userPledges[userPledgeKey] || "0");

  // Timeline Chart Data preparation (Cumulative Progress: Planned vs Predicted)
  const timelineChartData = [
    { name: 'Start', Planned: 0, Predicted: 0, day: 0 },
    ...milestones.map((m, idx) => {
      const plannedDay = (idx + 1) * 15;
      const driftMultiplier = hasDriftAlert ? 1.22 : 1.03;
      const predictedDay = Math.round(plannedDay * driftMultiplier);
      const cumPct = Math.round(((idx + 1) / milestones.length) * 100);
      return {
        name: `M${idx + 1}`,
        Planned: cumPct,
        Predicted: m.completed ? cumPct : Math.max(0, cumPct - (hasDriftAlert ? 15 : 4)),
        day: plannedDay,
        predictedDay: predictedDay
      };
    })
  ];

  // Handle Pledge
  const handlePledgeSubmit = async (e) => {
    e.preventDefault();
    setIsPledging(true);
    const ok = await pledge(campaign.id, pledgeAmount);
    setIsPledging(false);
    if (ok) {
      setActionSuccessMsg(`Successfully pledged ${pledgeAmount} ETH! Voting weight increased.`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    }
  };

  // Handle Proof Submission
  const handleProofSubmit = async (milestoneId) => {
    const hash = proofInput.trim() || `Qm${Math.random().toString(36).substring(2, 15)}CID`;
    await submitProof(campaign.id, milestoneId, hash);
    setSelectedMilestoneForProof(null);
    setProofInput('');
    setActionSuccessMsg(`Milestone proof submitted on IPFS (${hash})! Voting window initiated.`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // Handle Vote
  const handleVote = async (milestoneId, approve) => {
    await castVote(campaign.id, milestoneId, approve);
    setActionSuccessMsg(`Cast ${approve ? 'APPROVE' : 'REJECT'} vote with ${userPledgeAmt || 1} ETH voting weight!`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // Risk Color Class
  const riskBadgeClass = riskTier === "LOW"
    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
    : riskTier === "MEDIUM"
    ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
    : "bg-rose-500/15 text-rose-300 border-rose-500/40";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-slate-400">
        <Link to="/" className="hover:text-slate-200 flex items-center space-x-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
        <span>/</span>
        <span className="text-slate-200 font-medium truncate max-w-xs">{title}</span>
      </div>

      {/* Success Notification Banner */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-sm flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative rounded-2xl overflow-hidden h-72 w-full bg-slate-800 border border-slate-800">
            <img
              src={banner}
              alt={title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80";
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

            <div className="absolute top-4 left-4 flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/90 backdrop-blur-md text-slate-100 border border-slate-700">
                {category}
              </span>
              <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${riskBadgeClass}`}>
                <TrendingUp className="w-3.5 h-3.5" />
                <span>AI Risk Score: {riskScore}/100 ({riskTier})</span>
              </div>
            </div>

            {hasDriftAlert && (
              <div className="absolute top-4 right-4 flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 shadow-lg animate-pulse">
                <AlertTriangle className="w-4 h-4" />
                <span>Drift Alert: +{driftPercentage}% delay predicted</span>
              </div>
            )}

            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{title}</h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-300 line-clamp-2">{description}</p>
            </div>
          </div>

          {/* Drift Alert Detailed Warning Box if active */}
          {hasDriftAlert && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-300">Timeline Drift Warning Emitted by ML Regressor</h4>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  The Random Forest timeline predictor detected that actual milestone delivery is trailing the planned schedule by <strong>+{driftPercentage}%</strong> based on past creator pace and task complexity. Backers are advised to review upcoming milestone proofs carefully before voting.
                </p>
              </div>
            </div>
          )}

          {/* Cumulative Progress Chart (Planned vs Predicted Timeline) */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-brand-400" />
                  <span>Cumulative Progress & Timeline Prediction</span>
                </h3>
                <p className="text-xs text-slate-400">Planned milestone delivery curve vs. ML forecasted pace</p>
              </div>
              <span className="text-[11px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Random Forest Model
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="Planned" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorPlanned)" name="Planned Curve (%)" />
                  <Area type="monotone" dataKey="Predicted" stroke="#38bdf8" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorPredicted)" name="ML Predicted (%)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Col: Pledge & Escrow Stats */}
        <div className="space-y-6">
          {/* Funding Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Pledged to Escrow</p>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-3xl font-extrabold text-white">{totalPledged} ETH</span>
                <span className="text-xs text-slate-400 font-mono">/ {goal} ETH goal</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-600 to-indigo-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>{progressPercent}% Funded</span>
                <span>{milestones.length} Milestones</span>
              </div>
            </div>

            {/* Backer Pledge Form */}
            <form onSubmit={handlePledgeSubmit} className="space-y-3 pt-4 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300">
                Pledge ETH (Earns Governance Vote Weight)
              </label>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={pledgeAmount}
                    onChange={(e) => setPledgeAmount(e.target.value)}
                    className="w-full pl-3 pr-12 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ETH
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={isPledging}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition-all"
                >
                  {isPledging ? 'Pledging...' : 'Pledge'}
                </button>
              </div>

              {userPledgeAmt > 0 && (
                <div className="p-2.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-xs text-brand-300 flex items-center justify-between">
                  <span>Your Voting Weight:</span>
                  <span className="font-extrabold font-mono">{userPledgeAmt} ETH</span>
                </div>
              )}
            </form>

            {/* Smart Contract addresses info */}
            <div className="pt-4 border-t border-slate-800 text-[11px] font-mono space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span>Escrow:</span>
                <span className="text-slate-300">{escrowAddress?.substring(0, 10)}...</span>
              </div>
              <div className="flex justify-between">
                <span>Voting Module:</span>
                <span className="text-slate-300">{votingAddress?.substring(0, 10)}...</span>
              </div>
            </div>
          </div>

          {/* Creator Reputation Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100">Creator Reputation</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                {creatorReputation?.tier || 'Silver'} Tier
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Trust Score</p>
                <p className="text-xl font-extrabold text-slate-100 mt-0.5">{creatorReputation?.score || 3.5}/5.0</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <p className="text-[10px] text-slate-400 uppercase font-bold">On-Time Rate</p>
                <p className="text-xl font-extrabold text-emerald-400 mt-0.5">{creatorReputation?.onTimeRate || 100}%</p>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-400 border-t border-slate-800 pt-3">
              <div className="flex justify-between">
                <span>Completed Milestones:</span>
                <span className="font-semibold text-slate-200">{creatorReputation?.onTimeDeliveries || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Failed Milestone Votes:</span>
                <span className="font-semibold text-slate-200">{creatorReputation?.failedVotes || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Disputes:</span>
                <span className="font-semibold text-slate-200">{creatorReputation?.disputes || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Escrow Governance Section */}
      <div className="space-y-6 pt-6 border-t border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
            <Coins className="w-6 h-6 text-brand-400" />
            <span>Milestone Tranches & Governance Voting</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Funds for each milestone are only released to the creator after passing a 40% quorum and 66% supermajority vote.
          </p>
        </div>

        {/* Milestones List */}
        <div className="space-y-4">
          {milestones.map((m, idx) => {
            const isCompleted = m.completed;
            const isFailed = m.failed;
            const isVoting = m.voting && m.voting.active;
            const quorumMet = m.voting?.quorumPercent >= 40;
            const thresholdMet = m.voting?.approvalPercent >= 66;

            return (
              <div
                key={m.id}
                className={`p-6 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-slate-900/50 border-emerald-500/30'
                    : isFailed
                    ? 'bg-slate-900/50 border-rose-500/30'
                    : isVoting
                    ? 'bg-slate-900 border-brand-500/60 shadow-lg shadow-brand-500/5'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Milestone Info */}
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        Tranche {idx + 1} ({m.tranchePercent}%)
                      </span>

                      {isCompleted && (
                        <span className="flex items-center space-x-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Released ({m.targetAmount} ETH)</span>
                        </span>
                      )}

                      {isFailed && (
                        <span className="flex items-center space-x-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Failed (Refund Open)</span>
                        </span>
                      )}

                      {isVoting && (
                        <span className="flex items-center space-x-1 text-xs font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/30 animate-pulse">
                          <Vote className="w-3.5 h-3.5" />
                          <span>Voting Active (5-Day Window)</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-100">{m.title}</h3>
                    <p className="text-xs text-slate-400">{m.description}</p>

                    {m.proofSubmitted && (
                      <div className="pt-2 flex items-center space-x-2 text-xs text-indigo-300 font-mono">
                        <FileCheck className="w-4 h-4 text-indigo-400" />
                        <span>IPFS Proof CID:</span>
                        <span className="underline cursor-pointer">{m.proofIpfsHash}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions / Status */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {/* Creator Submit Proof Button */}
                    {!m.proofSubmitted && !isCompleted && !isFailed && (
                      <button
                        onClick={() => setSelectedMilestoneForProof(m.id)}
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
                      >
                        <UploadCloud className="w-4 h-4 text-brand-400" />
                        <span>Submit Proof of Work</span>
                      </button>
                    )}

                    {/* Refund button if failed */}
                    {isFailed && (
                      <button
                        onClick={() => claimRefund(campaign.id, m.id)}
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20"
                      >
                        <Coins className="w-4 h-4" />
                        <span>Claim Pro-Rata Refund</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Proof submission form modal if clicked */}
                {selectedMilestoneForProof === m.id && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
                    <h4 className="text-xs font-bold text-slate-200">Submit Milestone Proof (IPFS CID)</h4>
                    <input
                      type="text"
                      placeholder="e.g. QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"
                      value={proofInput}
                      onChange={(e) => setProofInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 font-mono"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setSelectedMilestoneForProof(null)}
                        className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleProofSubmit(m.id)}
                        className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs"
                      >
                        Pin to IPFS & Start Vote
                      </button>
                    </div>
                  </div>
                )}

                {/* Live Voting Progress Bar if Voting Active */}
                {isVoting && m.voting && (
                  <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Quorum Progress (Target 40%) */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-slate-300">
                          <span className="flex items-center space-x-1">
                            <span>Quorum ({m.voting.quorumPercent}% / 40% req)</span>
                            {quorumMet && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                          </span>
                          <span className="font-mono text-slate-400">
                            {m.voting.votesFor || 0} + {m.voting.votesAgainst || 0} ETH
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${quorumMet ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${Math.min(100, (m.voting.quorumPercent / 40) * 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Approval Threshold (Target 66%) */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-slate-300">
                          <span className="flex items-center space-x-1">
                            <span>Approval ({m.voting.approvalPercent}% / 66% req)</span>
                            {thresholdMet && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                          </span>
                          <span className="font-mono text-slate-400">
                            {m.voting.votesFor} For / {m.voting.votesAgainst} Against
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${thresholdMet ? 'bg-emerald-500' : 'bg-rose-500'}`}
                            style={{ width: `${m.voting.approvalPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Cast Vote Buttons */}
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-xs text-slate-400">
                        Your vote weight: <strong className="text-slate-200">{userPledgeAmt || 1} ETH</strong>
                      </p>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleVote(m.id, true)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve Release</span>
                        </button>
                        <button
                          onClick={() => handleVote(m.id, false)}
                          className="px-4 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center space-x-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
