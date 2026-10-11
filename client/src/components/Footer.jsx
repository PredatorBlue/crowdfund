import React from 'react';
import { ShieldCheck, Github, ExternalLink, Cpu } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-950/80 py-10 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-200 text-sm">Trust-Aware Crowdfunding Protocol</p>
            <p className="text-slate-400">Milestone Governance • Gradient-Boosted Risk Classifier • Hardhat Escrows</p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-slate-400">
            <Cpu className="w-4 h-4 text-brand-400" />
            <span>AI Risk Model: GBR v1.0</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Sepolia / Hardhat Testnet</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
