import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { INITIAL_DEMO_CAMPAIGNS } from '../data/campaignsData';

const Web3Context = createContext();

// Contract ABIs
export const ReputationABI = [
  "function getTrustScore(address creator) external view returns (uint256 score, uint8 tier, uint256 onTimeDeliveries, uint256 lateDeliveries, uint256 failedVotes, uint256 totalCampaigns, uint256 disputes, uint256 onTimeRatePercent)",
  "function getOutcomeHistoryCount(address creator) external view returns (uint256)",
  "function getOutcomeRecord(address creator, uint256 index) external view returns (address campaign, uint256 milestoneId, uint8 outcome, uint256 timestamp)"
];

export const FactoryABI = [
  "function getCampaignCount() external view returns (uint256)",
  "function getCampaign(uint256 campaignId) external view returns (tuple(uint256 campaignId, address creator, address escrowAddress, address votingModuleAddress, uint256 goal, uint256 deadline, uint256 milestoneCount, string metadataIpfsHash, uint256 createdAt))",
  "function createCampaign(uint256 _goal, uint256 _deadline, string _metadataIpfsHash, string[] _titles, string[] _descriptions, uint256[] _targetDates, uint256[] _trancheBps, uint256 _votingWindow) external returns (uint256, address, address)"
];

export const EscrowABI = [
  "function creator() external view returns (address)",
  "function votingModule() external view returns (address)",
  "function goal() external view returns (uint256)",
  "function totalPledged() external view returns (uint256)",
  "function currentRiskScore() external view returns (uint8)",
  "function hasDriftAlert() external view returns (bool)",
  "function getMilestonesCount() external view returns (uint256)",
  "function getMilestone(uint256 id) external view returns (uint256 milestoneId, string title, string description, uint256 targetDate, uint256 trancheBasisPoints, uint256 targetAmount, uint256 amountReleased, string proofIpfsHash, bool proofSubmitted, bool completed, bool failed)",
  "function getPledge(address backer) external view returns (uint256)",
  "function pledge() external payable",
  "function submitMilestoneProof(uint256 milestoneId, string calldata proofHash) external",
  "function claimRefund(uint256 milestoneId) external",
  "function milestoneRefundClaimed(uint256, address) external view returns (bool)"
];

export const VotingABI = [
  "function votingWindow() external view returns (uint256)",
  "function hasVoted(uint256 milestoneId, address voter) external view returns (bool)",
  "function getVoteProgress(uint256 milestoneId) external view returns (uint256 startTime, uint256 endTime, uint256 votesFor, uint256 votesAgainst, uint256 totalPledged, uint256 currentQuorumPercent, uint256 currentApprovalPercent, bool active, bool finalized, bool passed)",
  "function castVote(uint256 milestoneId, bool approve) external",
  "function finalizeVote(uint256 milestoneId) external"
];

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [campaigns, setCampaigns] = useState(INITIAL_DEMO_CAMPAIGNS);
  const [userPledges, setUserPledges] = useState({});
  const [deployments, setDeployments] = useState(null);
  const [aiServiceAvailable, setAiServiceAvailable] = useState(false);

  // Check AI Service status
  useEffect(() => {
    fetch("http://127.0.0.1:8000/health")
      .then(res => res.json())
      .then(data => {
        if (data.status === "healthy") {
          setAiServiceAvailable(true);
        }
      })
      .catch(() => setAiServiceAvailable(false));
  }, []);

  // Connect Wallet
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsConnecting(true);
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await browserProvider.send("eth_requestAccounts", []);
        const currentNetwork = await browserProvider.getNetwork();
        const browserSigner = await browserProvider.getSigner();

        setProvider(browserProvider);
        setSigner(browserSigner);
        setAccount(accounts[0]);
        setChainId(Number(currentNetwork.chainId));

        window.ethereum.on('accountsChanged', (newAccounts) => {
          if (newAccounts.length > 0) {
            setAccount(newAccounts[0]);
          } else {
            setAccount(null);
          }
        });

        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });
      } catch (error) {
        console.error("Wallet connection error:", error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      // Mock wallet connection for local demo without extension
      setAccount("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
      setChainId(31337);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
  };

  // Create Campaign
  const createCampaign = async (campaignData) => {
    const newId = campaigns.length;
    const newCamp = {
      id: newId,
      title: campaignData.title,
      category: campaignData.category,
      description: campaignData.description,
      banner: campaignData.banner || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1000&q=80",
      creator: account || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      escrowAddress: `0x${Math.random().toString(16).substring(2, 42).padEnd(40, '0')}`,
      votingAddress: `0x${Math.random().toString(16).substring(2, 42).padEnd(40, '0')}`,
      goal: campaignData.goal,
      totalPledged: "0.0",
      riskScore: campaignData.aiRiskScore || 24,
      riskTier: campaignData.aiRiskTier || "LOW",
      hasDriftAlert: campaignData.hasDriftAlert || false,
      driftPercentage: campaignData.driftPercentage || 4.2,
      creatorReputation: {
        score: 4.20,
        tier: "Silver",
        onTimeDeliveries: 3,
        lateDeliveries: 0,
        failedVotes: 0,
        totalCampaigns: 2,
        onTimeRate: 100
      },
      milestones: campaignData.milestones.map((m, idx) => ({
        id: idx,
        title: m.title,
        description: m.description,
        targetDate: m.targetDate,
        tranchePercent: m.tranchePercent,
        targetAmount: ((parseFloat(campaignData.goal) * m.tranchePercent) / 100).toFixed(2),
        proofSubmitted: false,
        proofIpfsHash: "",
        completed: false,
        failed: false,
        voting: {
          active: false,
          finalized: false,
          passed: false,
          votesFor: "0",
          votesAgainst: "0",
          quorumPercent: 0,
          approvalPercent: 0
        }
      }))
    };

    setCampaigns(prev => [newCamp, ...prev]);
    return newId;
  };

  // Pledge ETH to Campaign
  const pledge = async (campaignId, amountEth) => {
    const amt = parseFloat(amountEth);
    if (isNaN(amt) || amt <= 0) return false;

    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        const newTotal = (parseFloat(c.totalPledged) + amt).toFixed(2);
        return { ...c, totalPledged: newTotal };
      }
      return c;
    }));

    const key = `${campaignId}-${account || "default"}`;
    setUserPledges(prev => ({
      ...prev,
      [key]: (parseFloat(prev[key] || 0) + amt).toFixed(2)
    }));

    return true;
  };

  // Submit Milestone Proof
  const submitProof = async (campaignId, milestoneId, proofHash) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        const updatedMilestones = c.milestones.map(m => {
          if (m.id === milestoneId) {
            return {
              ...m,
              proofSubmitted: true,
              proofIpfsHash: proofHash || `Qm${Math.random().toString(36).substring(2, 15)}`,
              voting: {
                active: true,
                finalized: false,
                passed: false,
                votesFor: "0",
                votesAgainst: "0",
                quorumPercent: 0,
                approvalPercent: 0,
                endTime: new Date(Date.now() + 5 * 86400000).toISOString()
              }
            };
          }
          return m;
        });
        return { ...c, milestones: updatedMilestones };
      }
      return c;
    }));
    return true;
  };

  // Cast Vote on Milestone
  const castVote = async (campaignId, milestoneId, approve) => {
    const key = `${campaignId}-${account || "default"}`;
    const weight = parseFloat(userPledges[key] || "1.0");

    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        const totalPledgedNum = parseFloat(c.totalPledged) || 1.0;
        const updatedMilestones = c.milestones.map(m => {
          if (m.id === milestoneId && m.voting && m.voting.active) {
            const curFor = parseFloat(m.voting.votesFor) + (approve ? weight : 0);
            const curAgainst = parseFloat(m.voting.votesAgainst) + (approve ? 0 : weight);
            const totalCast = curFor + curAgainst;
            const quorumPct = Math.min(100, Math.round((totalCast / totalPledgedNum) * 100));
            const approvalPct = totalCast > 0 ? Math.round((curFor / totalCast) * 100) : 0;

            let passed = false;
            let finalized = false;
            let completed = m.completed;
            let failed = m.failed;

            // Quorum 40% + 66% approval threshold check
            if (quorumPct >= 40 && approvalPct >= 66 && totalCast > (totalPledgedNum * 0.6)) {
              passed = true;
              finalized = true;
              completed = true;
            }

            return {
              ...m,
              completed,
              failed,
              voting: {
                ...m.voting,
                active: !finalized,
                finalized,
                passed,
                votesFor: curFor.toFixed(2),
                votesAgainst: curAgainst.toFixed(2),
                quorumPercent: quorumPct,
                approvalPercent: approvalPct
              }
            };
          }
          return m;
        });
        return { ...c, milestones: updatedMilestones };
      }
      return c;
    }));
    return true;
  };

  // Claim Refund
  const claimRefund = async (campaignId, milestoneId) => {
    return true;
  };

  // Query AI microservice for Risk Score
  const getAIRiskScore = async (payload) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/risk-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("AI Service response error");
      return await res.json();
    } catch (err) {
      console.warn("AI Service offline, using local fallback scorer");
      return {
        risk_score: 22.5,
        risk_score_int: 23,
        risk_tier: "LOW",
        confidence: 0.94,
        signals_breakdown: [
          { feature: "wallet_age_days", weight_importance: 0.70, value: payload.wallet_age_days || 365, risk_impact: "Reduces Risk" },
          { feature: "creator_completion_rate", weight_importance: 0.11, value: payload.creator_completion_rate || 0.85, risk_impact: "Reduces Risk" },
          { feature: "milestone_specificity_score", weight_importance: 0.06, value: 0.8, risk_impact: "Reduces Risk" },
          { feature: "backer_sentiment_score", weight_importance: 0.05, value: payload.backer_sentiment_score || 0.75, risk_impact: "Reduces Risk" }
        ]
      };
    }
  };

  // Query AI microservice for Timeline Prediction
  const getAITimelinePrediction = async (payload) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/predict-timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("AI Service response error");
      return await res.json();
    } catch (err) {
      const planned = payload.planned_duration_days || 30;
      const predicted = Math.round(planned * 1.05);
      const driftDays = predicted - planned;
      return {
        planned_duration_days: planned,
        predicted_duration_days: predicted,
        drift_days: driftDays,
        drift_percentage: Number(((driftDays / planned) * 100).toFixed(1)),
        drift_alert: false,
        planned_completion_date: new Date(Date.now() + planned * 86400000).toISOString(),
        predicted_completion_date: new Date(Date.now() + predicted * 86400000).toISOString()
      };
    }
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        chainId,
        provider,
        signer,
        isConnecting,
        campaigns,
        userPledges,
        aiServiceAvailable,
        connectWallet,
        disconnectWallet,
        createCampaign,
        pledge,
        submitProof,
        castVote,
        claimRefund,
        getAIRiskScore,
        getAITimelinePrediction
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
