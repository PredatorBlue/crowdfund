// Comprehensive initial dataset of diverse Web3 campaigns with realistic milestones, risk scores, and reputation data

export const INITIAL_DEMO_CAMPAIGNS = [
  {
    id: 0,
    title: "Decentralized AI Inference Network",
    category: "Artificial Intelligence",
    description: "High-performance peer-to-peer compute layer enabling trustless inference for open-weights LLMs with Halo2 zk-verification.",
    banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80",
    creator: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    escrowAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    votingAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    goal: "5.0",
    totalPledged: "5.0",
    riskScore: 18,
    riskTier: "LOW",
    hasDriftAlert: false,
    driftPercentage: 2.4,
    creatorReputation: {
      score: 4.65,
      tier: "Gold",
      onTimeDeliveries: 4,
      lateDeliveries: 0,
      failedVotes: 0,
      totalCampaigns: 2,
      onTimeRate: 100
    },
    milestones: [
      {
        id: 0,
        title: "Compute Node Protocol & Testnet",
        description: "Implement worker node discovery and heartbeat consensus with telemetry validation.",
        targetDate: new Date(Date.now() + 10 * 86400000).toISOString(),
        tranchePercent: 30,
        targetAmount: "1.5",
        proofSubmitted: true,
        proofIpfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
        completed: true,
        failed: false,
        voting: {
          active: false,
          finalized: true,
          passed: true,
          votesFor: "4.5",
          votesAgainst: "0.5",
          quorumPercent: 100,
          approvalPercent: 90
        }
      },
      {
        id: 1,
        title: "Zero-Knowledge Verification Engine",
        description: "Integrate Halo2 zk-SNARK verifier contract for decentralized proof of compute inference.",
        targetDate: new Date(Date.now() + 20 * 86400000).toISOString(),
        tranchePercent: 40,
        targetAmount: "2.0",
        proofSubmitted: true,
        proofIpfsHash: "QmPZ9gcCEpqKTo6aq61g2nXGUhM49wbdukMb3oQhBoPrY8",
        completed: false,
        failed: false,
        voting: {
          active: true,
          finalized: false,
          passed: false,
          votesFor: "2.8",
          votesAgainst: "0.2",
          quorumPercent: 60,
          approvalPercent: 93,
          endTime: new Date(Date.now() + 3 * 86400000).toISOString()
        }
      },
      {
        id: 2,
        title: "Mainnet Launch & Developer SDK",
        description: "Deploy production smart contracts, audited bridge, and TypeScript client SDK.",
        targetDate: new Date(Date.now() + 35 * 86400000).toISOString(),
        tranchePercent: 30,
        targetAmount: "1.5",
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
      }
    ]
  },
  {
    id: 1,
    title: "Solar Energy Microgrid IoT Network",
    category: "CleanTech / DePIN",
    description: "Autonomous IoT smart meters trading surplus solar energy across local neighborhood nodes via Layer-2 microtransactions.",
    banner: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80",
    creator: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    escrowAddress: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    votingAddress: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    goal: "8.0",
    totalPledged: "6.2",
    riskScore: 56,
    riskTier: "MEDIUM",
    hasDriftAlert: true,
    driftPercentage: 18.5,
    creatorReputation: {
      score: 3.80,
      tier: "Silver",
      onTimeDeliveries: 2,
      lateDeliveries: 1,
      failedVotes: 0,
      totalCampaigns: 1,
      onTimeRate: 67
    },
    milestones: [
      {
        id: 0,
        title: "Smart Meter Hardware Prototype & Firmware",
        description: "Design ESP32 hardware schematic and energy measurement firmware with signed ECDSA telemetry.",
        targetDate: new Date(Date.now() + 12 * 86400000).toISOString(),
        tranchePercent: 35,
        targetAmount: "2.8",
        proofSubmitted: true,
        proofIpfsHash: "QmRAQB6YaCyidP37UdDnjFY5QQuiBrcqdyWPW1bZnUWum4",
        completed: false,
        failed: false,
        voting: {
          active: true,
          finalized: false,
          passed: false,
          votesFor: "2.1",
          votesAgainst: "1.4",
          quorumPercent: 56,
          approvalPercent: 60,
          endTime: new Date(Date.now() + 2 * 86400000).toISOString()
        }
      },
      {
        id: 1,
        title: "Local Grid P2P Settlement Layer",
        description: "Build state channel engine for high-frequency energy kilowatt/hour settlements.",
        targetDate: new Date(Date.now() + 28 * 86400000).toISOString(),
        tranchePercent: 35,
        targetAmount: "2.8",
        proofSubmitted: false,
        proofIpfsHash: "",
        completed: false,
        failed: false,
        voting: { active: false, finalized: false, passed: false }
      },
      {
        id: 2,
        title: "50-Home Community Pilot Deployment",
        description: "Install physical meters in 50 pilot residential homes and verify real-time solar trading.",
        targetDate: new Date(Date.now() + 50 * 86400000).toISOString(),
        tranchePercent: 30,
        targetAmount: "2.4",
        proofSubmitted: false,
        proofIpfsHash: "",
        completed: false,
        failed: false,
        voting: { active: false, finalized: false, passed: false }
      }
    ]
  },
  {
    id: 2,
    title: "Zero-Knowledge Private Credit Protocol",
    category: "Zero Knowledge Proofs",
    description: "Compliant on-chain private debt underwriting using recursive zk-SNARKs for verified off-chain revenue streams.",
    banner: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1000&q=80",
    creator: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    escrowAddress: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
    votingAddress: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
    goal: "12.0",
    totalPledged: "12.0",
    riskScore: 21,
    riskTier: "LOW",
    hasDriftAlert: false,
    driftPercentage: 1.8,
    creatorReputation: {
      score: 4.85,
      tier: "Gold",
      onTimeDeliveries: 6,
      lateDeliveries: 0,
      failedVotes: 0,
      totalCampaigns: 3,
      onTimeRate: 100
    },
    milestones: [
      {
        id: 0,
        title: "Recursive Circom Credit Circuits",
        description: "Develop zero-knowledge circuits proving financial solvency and credit score without revealing underlying transactions.",
        targetDate: new Date(Date.now() + 15 * 86400000).toISOString(),
        tranchePercent: 30,
        targetAmount: "3.6",
        proofSubmitted: true,
        proofIpfsHash: "QmZKCircuitProofVerified998",
        completed: true,
        failed: false,
        voting: {
          active: false,
          finalized: true,
          passed: true,
          votesFor: "11.2",
          votesAgainst: "0.2",
          quorumPercent: 95,
          approvalPercent: 98
        }
      },
      {
        id: 1,
        title: "Decentralized Liquidity Pool Contracts",
        description: "Implement permissionless lending pools with dynamic interest rate curves and liquidator vaults.",
        targetDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        tranchePercent: 40,
        targetAmount: "4.8",
        proofSubmitted: true,
        proofIpfsHash: "QmLiquidityPoolAuditPassed441",
        completed: true,
        failed: false,
        voting: {
          active: false,
          finalized: true,
          passed: true,
          votesFor: "10.5",
          votesAgainst: "0.5",
          quorumPercent: 92,
          approvalPercent: 95
        }
      },
      {
        id: 2,
        title: "Institutional Underwriting Portal & Mainnet",
        description: "Ship web portal with biometric passkey authentication and launch on Ethereum Mainnet.",
        targetDate: new Date(Date.now() + 45 * 86400000).toISOString(),
        tranchePercent: 30,
        targetAmount: "3.6",
        proofSubmitted: false,
        proofIpfsHash: "",
        completed: false,
        failed: false,
        voting: { active: false, finalized: false, passed: false }
      }
    ]
  },
  {
    id: 3,
    title: "Quantum-Resistant Layer-2 Rollup",
    category: "DeFi / Smart Contracts",
    description: "Post-quantum state validity rollup utilizing lattice-based cryptographic signatures (Dilithium & Kyber) to secure against quantum attacks.",
    banner: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1000&q=80",
    creator: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    escrowAddress: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
    votingAddress: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
    goal: "15.0",
    totalPledged: "11.5",
    riskScore: 42,
    riskTier: "MEDIUM",
    hasDriftAlert: false,
    driftPercentage: 6.2,
    creatorReputation: {
      score: 3.90,
      tier: "Silver",
      onTimeDeliveries: 3,
      lateDeliveries: 1,
      failedVotes: 0,
      totalCampaigns: 2,
      onTimeRate: 75
    },
    milestones: [
      {
        id: 0,
        title: "CRYSTALS-Dilithium EVM Precompile Engine",
        description: "Benchmarked EVM precompile implementation for lattice signature verification.",
        targetDate: new Date(Date.now() + 20 * 86400000).toISOString(),
        tranchePercent: 35,
        targetAmount: "5.25",
        proofSubmitted: true,
        proofIpfsHash: "QmQuantumDilithiumPrecompileBench1",
        completed: true,
        failed: false,
        voting: {
          active: false,
          finalized: true,
          passed: true,
          votesFor: "9.0",
          votesAgainst: "0.8",
          quorumPercent: 85,
          approvalPercent: 91
        }
      },
      {
        id: 1,
        title: "Rollup Sequencer & State Transition Circuit",
        description: "Build decentralized sequencer nodes and generate state transition validity proofs.",
        targetDate: new Date(Date.now() + 40 * 86400000).toISOString(),
        tranchePercent: 35,
        targetAmount: "5.25",
        proofSubmitted: true,
        proofIpfsHash: "QmSequencerTestnetRollupV2",
        completed: false,
        failed: false,
        voting: {
          active: true,
          finalized: false,
          passed: false,
          votesFor: "5.5",
          votesAgainst: "1.2",
          quorumPercent: 58,
          approvalPercent: 82,
          endTime: new Date(Date.now() + 4 * 86400000).toISOString()
        }
      },
      {
        id: 2,
        title: "Public Testnet & Bug Bounty Audit",
        description: "Launch incentivized public testnet with 50,000 tx/day stress testing.",
        targetDate: new Date(Date.now() + 65 * 86400000).toISOString(),
        tranchePercent: 30,
        targetAmount: "4.5",
        proofSubmitted: false,
        proofIpfsHash: "",
        completed: false,
        failed: false,
        voting: { active: false, finalized: false, passed: false }
      }
    ]
  },
  {
    id: 4,
    title: "Carbon Removal Satellite Constellation",
    category: "CleanTech / DePIN",
    description: "CubeSat constellation carrying multispectral LiDAR to independently verify forest biomass and carbon sequestered on-chain.",
    banner: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80",
    creator: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4df",
    escrowAddress: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
    votingAddress: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
    goal: "20.0",
    totalPledged: "18.0",
    riskScore: 78,
    riskTier: "HIGH",
    hasDriftAlert: true,
    driftPercentage: 26.4,
    creatorReputation: {
      score: 2.85,
      tier: "Bronze",
      onTimeDeliveries: 1,
      lateDeliveries: 2,
      failedVotes: 1,
      totalCampaigns: 2,
      onTimeRate: 33
    },
    milestones: [
      {
        id: 0,
        title: "CubeSat Optical Sensor Payload Integration",
        description: "Payload vibration testing and optics calibration failed hardware tolerances in lab tests.",
        targetDate: new Date(Date.now() - 5 * 86400000).toISOString(),
        tranchePercent: 30,
        targetAmount: "6.0",
        proofSubmitted: true,
        proofIpfsHash: "QmFailedHardwareVibrationLog98",
        completed: false,
        failed: true, // Failed milestone with active refund!
        voting: {
          active: false,
          finalized: true,
          passed: false,
          votesFor: "3.0",
          votesAgainst: "11.0",
          quorumPercent: 77,
          approvalPercent: 21
        }
      },
      {
        id: 1,
        title: "Orbital Launch Slot Procurement",
        description: "Contracting rideshare slot with SpaceX Falcon 9 Transporter mission.",
        targetDate: new Date(Date.now() + 60 * 86400000).toISOString(),
        tranchePercent: 40,
        targetAmount: "8.0",
        proofSubmitted: false,
        proofIpfsHash: "",
        completed: false,
        failed: false,
        voting: { active: false, finalized: false, passed: false }
      },
      {
        id: 2,
        title: "Ground Station Ingestion & Biomass dApp",
        description: "Real-time automated oracle emitting verified carbon credit tokens upon satellite flyover.",
        targetDate: new Date(Date.now() + 90 * 86400000).toISOString(),
        tranchePercent: 30,
        targetAmount: "6.0",
        proofSubmitted: false,
        proofIpfsHash: "",
        completed: false,
        failed: false,
        voting: { active: false, finalized: false, passed: false }
      }
    ]
  },
  {
    id: 5,
    title: "Decentralized Synthetic Biology Bioreactor",
    category: "Open Source Hardware",
    description: "Affordable, open-hardware benchtop fermentation bioreactor with cryptographically verified gene sequence logging.",
    banner: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1000&q=80",
    creator: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
    escrowAddress: "0x610178dA211FEF764be7BC3ed3E24710873999cd",
    votingAddress: "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
    goal: "6.5",
    totalPledged: "6.5",
    riskScore: 32,
    riskTier: "LOW",
    hasDriftAlert: false,
    driftPercentage: 3.1,
    creatorReputation: {
      score: 4.30,
      tier: "Silver",
      onTimeDeliveries: 4,
      lateDeliveries: 1,
      failedVotes: 0,
      totalCampaigns: 2,
      onTimeRate: 80
    },
    milestones: [
      {
        id: 0,
        title: "CAD & Microfluidics Schematic Release",
        description: "Open-source STL files and BOM component list under CERN-OHL-S v2 license.",
        targetDate: new Date(Date.now() + 14 * 86400000).toISOString(),
        tranchePercent: 30,
        targetAmount: "1.95",
        proofSubmitted: true,
        proofIpfsHash: "QmOpenSourceHardwareCADBioStl",
        completed: true,
        failed: false,
        voting: {
          active: false,
          finalized: true,
          passed: true,
          votesFor: "5.8",
          votesAgainst: "0.2",
          quorumPercent: 92,
          approvalPercent: 96
        }
      },
      {
        id: 1,
        title: "pH & Dissolved Oxygen Sensor Array",
        description: "Calibrated precision telemetry sensor board with BLE and MQTT integration.",
        targetDate: new Date(Date.now() + 28 * 86400000).toISOString(),
        tranchePercent: 35,
        targetAmount: "2.27",
        proofSubmitted: true,
        proofIpfsHash: "QmSensorBoardTelemetryCalibrated",
        completed: false,
        failed: false,
        voting: {
          active: true,
          finalized: false,
          passed: false,
          votesFor: "3.8",
          votesAgainst: "0.4",
          quorumPercent: 64,
          approvalPercent: 90,
          endTime: new Date(Date.now() + 2 * 86400000).toISOString()
        }
      },
      {
        id: 2,
        title: "10-Unit Alpha Production Run",
        description: "Assemble and ship initial units to community university labs for validation.",
        targetDate: new Date(Date.now() + 50 * 86400000).toISOString(),
        tranchePercent: 35,
        targetAmount: "2.28",
        proofSubmitted: false,
        proofIpfsHash: "",
        completed: false,
        failed: false,
        voting: { active: false, finalized: false, passed: false }
      }
    ]
  },
  {
    id: 6,
    title: "Cross-Chain Intent Liquidity Mesh",
    category: "DeFi / Smart Contracts",
    description: "Decentralized solver network matching cross-chain swaps without bridges via zero-knowledge state proofs and threshold ECDSA.",
    banner: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=1000&q=80",
    creator: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
    escrowAddress: "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
    votingAddress: "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82",
    goal: "10.0",
    totalPledged: "10.0",
    riskScore: 14,
    riskTier: "LOW",
    hasDriftAlert: false,
    driftPercentage: 0.9,
    creatorReputation: {
      score: 4.95,
      tier: "Gold",
      onTimeDeliveries: 8,
      lateDeliveries: 0,
      failedVotes: 0,
      totalCampaigns: 4,
      onTimeRate: 100
    },
    milestones: [
      {
        id: 0,
        title: "Solver Auction Engine & Intent Parsing",
        description: "Deploy English auction contract for solver order matching with MEV-resistant batching.",
        targetDate: new Date(Date.now() + 10 * 86400000).toISOString(),
        tranchePercent: 30,
        targetAmount: "3.0",
        proofSubmitted: true,
        proofIpfsHash: "QmSolverIntentEngineAudit001",
        completed: true,
        failed: false,
        voting: {
          active: false,
          finalized: true,
          passed: true,
          votesFor: "9.8",
          votesAgainst: "0.1",
          quorumPercent: 99,
          approvalPercent: 99
        }
      },
      {
        id: 1,
        title: "Ethereum-to-Solana ZK Light Client",
        description: "Deploy SP1 zkVM based light client verifier for trustless state attestation.",
        targetDate: new Date(Date.now() + 25 * 86400000).toISOString(),
        tranchePercent: 40,
        targetAmount: "4.0",
        proofSubmitted: true,
        proofIpfsHash: "QmSp1ZkLightClientVerification",
        completed: true,
        failed: false,
        voting: {
          active: false,
          finalized: true,
          passed: true,
          votesFor: "9.2",
          votesAgainst: "0.3",
          quorumPercent: 95,
          approvalPercent: 96
        }
      },
      {
        id: 2,
        title: "Mainnet Go-Live & Liquidity Incentives",
        description: "Open cross-chain intent routing to aggregators (UniswapX, CoW Swap).",
        targetDate: new Date(Date.now() + 40 * 86400000).toISOString(),
        tranchePercent: 30,
        targetAmount: "3.0",
        proofSubmitted: false,
        proofIpfsHash: "",
        completed: false,
        failed: false,
        voting: { active: false, finalized: false, passed: false }
      }
    ]
  },
  {
    id: 7,
    title: "Autonomous Drone Delivery Logistics Protocol",
    category: "Open Source Hardware",
    description: "Decentralized airspace corridor booking and encrypted telemetry blackbox for commercial cargo delivery drones.",
    banner: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1000&q=80",
    creator: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
    escrowAddress: "0x0B306BF915C4d645ff596e518fAf3F9669b97016",
    votingAddress: "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1",
    goal: "9.0",
    totalPledged: "7.2",
    riskScore: 68,
    riskTier: "HIGH",
    hasDriftAlert: true,
    driftPercentage: 19.8,
    creatorReputation: {
      score: 3.20,
      tier: "Bronze",
      onTimeDeliveries: 1,
      lateDeliveries: 2,
      failedVotes: 0,
      totalCampaigns: 1,
      onTimeRate: 33
    },
    milestones: [
      {
        id: 0,
        title: "Airspace Spatial Quadtree Smart Contract",
        description: "On-chain spatial reservation system preventing drone collisions in 3D flight paths.",
        targetDate: new Date(Date.now() + 18 * 86400000).toISOString(),
        tranchePercent: 35,
        targetAmount: "3.15",
        proofSubmitted: true,
        proofIpfsHash: "QmAirspaceSpatialQuadtreeSol",
        completed: false,
        failed: false,
        voting: {
          active: true,
          finalized: false,
          passed: false,
          votesFor: "2.4",
          votesAgainst: "2.0",
          quorumPercent: 61,
          approvalPercent: 54, // Under 66% threshold!
          endTime: new Date(Date.now() + 1 * 86400000).toISOString()
        }
      },
      {
        id: 1,
        title: "Cryptographic Telemetry Transponder",
        description: "Ruggedized RTK-GPS receiver module with hardware-backed private keys.",
        targetDate: new Date(Date.now() + 38 * 86400000).toISOString(),
        tranchePercent: 35,
        targetAmount: "3.15",
        proofSubmitted: false,
        proofIpfsHash: "",
        completed: false,
        failed: false,
        voting: { active: false, finalized: false, passed: false }
      },
      {
        id: 2,
        title: "FAA Beyond Visual Line of Sight (BVLOS) Field Pilot",
        description: "Execute 100 autonomous package delivery flights across rural test corridor.",
        targetDate: new Date(Date.now() + 60 * 86400000).toISOString(),
        tranchePercent: 30,
        targetAmount: "2.70",
        proofSubmitted: false,
        proofIpfsHash: "",
        completed: false,
        failed: false,
        voting: { active: false, finalized: false, passed: false }
      }
    ]
  },
  {
    id: 8,
    title: "Fully Homomorphic Encryption EVM Engine",
    category: "Zero Knowledge Proofs",
    description: "Confidential smart contracts executing arbitrary arithmetic directly over encrypted ciphertexts via TFHE precompiles.",
    banner: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80",
    creator: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
    escrowAddress: "0x9A676e781A523b5d0C0e43731313A708CB607508",
    votingAddress: "0x0B306BF915C4d645ff596e518fAf3F9669b97016",
    goal: "16.0",
    totalPledged: "16.0",
    riskScore: 25,
    riskTier: "LOW",
    hasDriftAlert: false,
    driftPercentage: 3.8,
    creatorReputation: {
      score: 4.70,
      tier: "Gold",
      onTimeDeliveries: 5,
      lateDeliveries: 0,
      failedVotes: 0,
      totalCampaigns: 2,
      onTimeRate: 100
    },
    milestones: [
      {
        id: 0,
        title: "TFHE Rust Micro-Kernel & WASM Compiler",
        description: "High performance homomorphic integer addition and bootstrapping engine compiled to WebAssembly.",
        targetDate: new Date(Date.now() + 15 * 86400000).toISOString(),
        tranchePercent: 30,
        targetAmount: "4.8",
        proofSubmitted: true,
        proofIpfsHash: "QmTfheRustKernelBootstrapBench44",
        completed: true,
        failed: false,
        voting: {
          active: false,
          finalized: true,
          passed: true,
          votesFor: "15.0",
          votesAgainst: "0.2",
          quorumPercent: 95,
          approvalPercent: 98
        }
      },
      {
        id: 1,
        title: "Encrypted ERC-20 Confidential Token Standard",
        description: "Reference implementation of confidential balances and encrypted transfer amounts on EVM.",
        targetDate: new Date(Date.now() + 35 * 86400000).toISOString(),
        tranchePercent: 40,
        targetAmount: "6.4",
        proofSubmitted: true,
        proofIpfsHash: "QmEncryptedErc20StandardFormalAudit",
        completed: false,
        failed: false,
        voting: {
          active: true,
          finalized: false,
          passed: false,
          votesFor: "12.4",
          votesAgainst: "0.8",
          quorumPercent: 82,
          approvalPercent: 93,
          endTime: new Date(Date.now() + 3 * 86400000).toISOString()
        }
      },
      {
        id: 2,
        title: "Confidential DeFi Lending Protocol",
        description: "Deploy private lending market where collateralization ratios are evaluated inside FHE ciphertexts.",
        targetDate: new Date(Date.now() + 55 * 86400000).toISOString(),
        tranchePercent: 30,
        targetAmount: "4.8",
        proofSubmitted: false,
        proofIpfsHash: "",
        completed: false,
        failed: false,
        voting: { active: false, finalized: false, passed: false }
      }
    ]
  }
];
