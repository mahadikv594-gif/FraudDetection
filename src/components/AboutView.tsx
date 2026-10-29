import React, { useState } from 'react';
import {
  Info,
  ShieldCheck,
  Cpu,
  Layers,
  Award,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileCode,
  Users,
  Sparkles,
  Server,
  Database,
  CheckCircle2,
} from 'lucide-react';

interface AboutViewProps {
  onOpenExportModal?: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onOpenExportModal }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const vivaQuestions = [
    {
      q: '1. What problem does FraudShield AI solve in modern financial infrastructure?',
      a: 'Traditional rule-based fraud detection relies on rigid static thresholds (e.g. "flag transactions > ₹50,000") which produce massive false positive rates and fail to catch sophisticated, multi-step velocity attacks. FraudShield AI uses multi-dimensional machine learning (Random Forest & Logistic Regression) combined with Explainable AI (XAI) to score transactions probabilistically and output exact attribution reasons.',
    },
    {
      q: '2. Why was Random Forest chosen over a single Decision Tree or Deep Neural Network?',
      a: 'Random Forest operates as an ensemble of 100 decorrelated decision trees using bagging (bootstrap aggregating). This significantly reduces variance and overfitting compared to a single decision tree. Additionally, tabular credit card fraud data features non-linear boundaries that Random Forest excels at without requiring the massive compute or black-box opacity of deep neural networks.',
    },
    {
      q: '3. How does the system handle severe class imbalance in fraud datasets?',
      a: 'In real-world credit card transactions, fraud accounts for less than 0.2% of data. FraudShield AI accounts for this via SMOTE (Synthetic Minority Over-sampling Technique) and class-weight balancing (assigning higher penalty weights to False Negatives vs False Positives). Standard accuracy is misleading; hence we optimize for Precision, Recall, and the harmonic F1-score.',
    },
    {
      q: '4. How does Explainable AI (XAI) work in this platform?',
      a: 'Each input feature is measured against historical baseline expectations (e.g., velocity frequency vs hourly norm, amount delta ratio against previous transaction, geographical displacement in kilometers). The system computes feature contribution points and maps them into clear natural language explanations and risk tiers so analysts understand why a flag occurred.',
    },
    {
      q: '5. What is the difference between ML Model Active and Demo Mode?',
      a: 'ML Model Active executes probabilistic Random Forest or Logistic Regression inference with calibrated weights. Demo Mode executes transparent heuristic rule scoring to guarantee seamless demonstration even in disconnected offline environments.',
    },
    {
      q: '6. How does user data isolation work in FraudShield AI?',
      a: 'Each investigator or risk analyst registers a unique profile. All transaction ledgers, fraud alerts, and dashboard aggregates are partitioned and keyed by the authenticated user ID in encrypted browser storage / cloud persistence, preventing cross-user data leakage.',
    },
  ];

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fadeIn">
      {/* Header Banner */}
      <div className="pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-['Space_Grotesk']">
            About FraudShield AI &amp; Viva Defense
          </h1>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            College IT Micro-Project
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Comprehensive project architecture, technology breakdown, and academic viva presentation cheat-sheet.
        </p>
      </div>

      {/* Project Overview & Vision */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 rounded-2xl bg-[#0d1527]/90 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              Project Mission: Detect &bull; Explain &bull; Protect
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong>FraudShield AI</strong> is an end-to-end cybersecurity SaaS platform designed to detect fraudulent credit card transactions, explain the underlying behavioral anomalies, and protect consumers and financial institutions from synthetic and credential-stuffing identity threats.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Built as a flagship college diploma IT micro-project, FraudShield AI combines real-time machine learning inference, isolated investigator profiles, interactive simulation sandboxes, and explainable threat attribution into a single unified command center.
            </p>
          </div>

          {/* Architecture Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white">Dual ML Pipeline</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Trained Random Forest ensemble and Logistic Regression benchmark with full confusion matrix metrics.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white">Explainable AI (XAI)</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Transparent attribution signals pinpointing velocity, amount delta, nocturnal hours, and geo-hops.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white">Simulation Sandbox</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                5 standardized synthetic attack scenarios for stress-testing model responses safely.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white">Isolated Ledger DB</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Strict multi-tenant investigator workspace with zero financial credential storage policy.
              </p>
            </div>
          </div>
        </div>

        {/* Tech Stack Specs */}
        <div className="lg:col-span-5 bg-[#0d1527]/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            Technology Stack Specifications
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Frontend Framework:</span>
              <span className="font-mono font-bold text-white">React 19 + TypeScript (Strict)</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Styling &amp; Design:</span>
              <span className="font-mono font-bold text-cyan-300">Tailwind CSS + Glassmorphism</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Data Visualization:</span>
              <span className="font-mono font-bold text-indigo-300">Recharts (SVG Responsive)</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Audio Telemetry:</span>
              <span className="font-mono font-bold text-purple-300">Web Audio API Synth</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">ML Intelligence Engine:</span>
              <span className="font-mono font-bold text-emerald-300">Random Forest Ensemble</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Data Storage:</span>
              <span className="font-mono font-bold text-amber-300">Isolated IndexedDB / LocalDB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Viva Presentation Defense Q&A Accordion */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">
            Academic Viva &amp; Project Defense Cheat-Sheet
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Frequently asked viva examination questions regarding system architecture, ML algorithms, and data security.
        </p>

        <div className="space-y-3">
          {vivaQuestions.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                id={`viva-faq-${idx}`}
                className="rounded-xl bg-[#0d1527]/90 border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-white">
                    {item.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-900/30">
                    {item.a}
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
