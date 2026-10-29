import React from 'react';
import { Shield, Lock, Code2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenExportModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenExportModal }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#050811] text-slate-400 text-xs mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5">
                <div className="w-full h-full bg-[#050811] rounded-[10px] flex items-center justify-center">
                  <Shield className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="font-bold text-sm tracking-tight text-white font-['Space_Grotesk']">
                FraudShield<span className="text-cyan-400 font-extrabold">.AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              AI-Powered Credit Card Fraud Detection & Risk Intelligence Platform.
              Engineered with Random Forest machine learning classification, real-time behavioral telemetry, Explainable AI (XAI) feature attribution, and isolated forensic audit ledgers.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>College Diploma in Information Technology Capstone Project</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              Core Modules
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('detect')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Detect & Scrutinize Transaction
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('simulation')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Fraud Simulation Lab
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Risk Intelligence Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('history')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Immutable Audit Ledger
                </button>
              </li>
            </ul>
          </div>

          {/* Research & Source Code */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              Academic Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('models')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Model Evaluation & ROC-AUC
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Viva Defense & Architecture
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenExportModal}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 font-mono"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Python / Flask Package</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Project Contact & Inquiries
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
          <div>
            © 2026 FraudShield AI. Designed for Academic & FinTech Cyber Intelligence.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-cyan-400">STATUS: OPERATIONAL</span>
            <span>XAI Engine v2.4</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
