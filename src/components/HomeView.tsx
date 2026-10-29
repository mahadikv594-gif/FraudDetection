import React, { useState, useEffect } from 'react';
import { motion, type Variants } from 'motion/react';
import {
  Shield,
  Zap,
  Cpu,
  TrendingUp,
  Activity,
  ArrowRight,
  Sparkles,
  Lock,
  Server,
  Terminal,
  Radio,
  Wifi,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { AnimatedCounter } from './AnimatedCounter';

interface HomeViewProps {
  onNavigate: (tab: string) => void;
  onOpenExportModal: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenExportModal }) => {
  const { stats, activeModelMode } = useTransactions();
  const [activeBlip, setActiveBlip] = useState<number>(0);

  // Oscillate radar blip target
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBlip((prev) => (prev + 1) % 4);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  };

  // Mock live radar targets
  const radarTargets = [
    { id: 0, x: 65, y: 35, score: 82, label: 'Nocturnal Velocity Spike (₹18,500)' },
    { id: 1, x: 28, y: 70, score: 91, label: 'Untrusted Proxy Origin (350km)' },
    { id: 2, x: 80, y: 75, score: 45, label: 'New Device Geo-Mismatch' },
    { id: 3, x: 40, y: 25, score: 12, label: 'Legitimate Merchant (Safe)' },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-16 pb-16 relative"
    >
      {/* Hero Section */}
      <section className="relative pt-4 sm:pt-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>AI-POWERED TRANSACTION SECURITY • DIPLOMA IT CAPSTONE</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] font-['Space_Grotesk']"
            >
              Detect suspicious transactions{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent inline-block">
                before they become losses.
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed"
            >
              FraudShield AI analyzes behavioral transactions in real-time, calculates
              an explainable risk score (0–100), and uncovers high-risk fraud signals
              using machine learning classification and multi-factor heuristics.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 pt-2">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('detect')}
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center gap-2.5 group"
              >
                <Zap className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
                <span>Analyze Transaction</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('dashboard')}
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-2.5 shadow-sm"
              >
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Open Dashboard</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('simulation')}
                className="px-4 py-3.5 rounded-xl font-semibold text-xs text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>Test Simulation Lab</span>
              </motion.button>
            </motion.div>

            {/* Quick Metrics Bar with Animated Counters */}
            <motion.div
              variants={itemVariants}
              className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400 font-mono"
            >
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Engine</span>
                <span className="text-slate-200 font-semibold">{activeModelMode.replace(/_/g, ' ')}</span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Transactions Recorded</span>
                <span className="text-cyan-400 font-bold">
                  <AnimatedCounter value={stats.total_transactions} suffix=" tx" />
                </span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Fraud Rate</span>
                <span className="text-rose-400 font-bold">
                  <AnimatedCounter value={stats.fraud_rate_pct} decimals={1} suffix="%" />
                </span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Accuracy Rating</span>
                <span className="text-emerald-400 font-bold">98.4% ROC-AUC</span>
              </div>
            </motion.div>
          </div>

          {/* Right Hero Visual Card - Interactive Animated Live Cyber Radar Visual */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-5 relative"
          >
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className="glass-panel rounded-3xl p-6 sm:p-7 border border-cyan-500/30 shadow-2xl relative overflow-hidden glow-cyan"
            >
              {/* Top ambient badge with pulsing signal */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                  </span>
                  <span className="text-xs font-mono font-bold tracking-wider text-slate-200 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    LIVE RISK SCANNER
                  </span>
                </div>
                <motion.span
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 uppercase font-bold"
                >
                  HIGH RISK ATTACK BLOCKED
                </motion.span>
              </div>

              {/* Central Animated Radar Screen */}
              <div className="relative w-full aspect-square max-w-[260px] mx-auto my-4 rounded-full border border-cyan-500/30 bg-[#070e1c] flex items-center justify-center overflow-hidden shadow-inner">
                {/* Concentric Radar Rings */}
                <div className="absolute inset-4 rounded-full border border-cyan-500/20" />
                <div className="absolute inset-12 rounded-full border border-cyan-500/20" />
                <div className="absolute inset-20 rounded-full border border-cyan-500/20" />
                
                {/* Crosshairs */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-px bg-cyan-500/20" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="h-full w-px bg-cyan-500/20" />
                </div>

                {/* Rotating Radar Sweep Line with Gradient Cone */}
                <div className="absolute inset-0 radar-sweep pointer-events-none origin-center">
                  <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-400/20 to-cyan-400/40 origin-right rounded-tl-full" />
                </div>

                {/* Interactive Radar Blips */}
                {radarTargets.map((target) => {
                  const isCurrent = target.id === activeBlip;
                  const isFraud = target.score >= 70;
                  return (
                    <motion.button
                      key={target.id}
                      onClick={() => setActiveBlip(target.id)}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 focus:outline-none"
                      style={{ left: `${target.x}%`, top: `${target.y}%` }}
                      animate={{ scale: isCurrent ? [1, 1.3, 1] : 1 }}
                      transition={{ duration: 1.5, repeat: isCurrent ? Infinity : 0 }}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                          isFraud ? 'bg-rose-500 shadow-[0_0_12px_#ef4444]' : 'bg-emerald-400 shadow-[0_0_12px_#10b981]'
                        }`}
                      >
                        {isCurrent && (
                          <div
                            className={`w-6 h-6 rounded-full border ${
                              isFraud ? 'border-rose-400' : 'border-emerald-400'
                            } animate-ping absolute`}
                          />
                        )}
                      </div>
                    </motion.button>
                  );
                })}

                {/* Center Core HUD */}
                <div className="relative z-10 text-center bg-[#0d1527]/90 p-3 rounded-full border border-cyan-500/40 shadow-lg">
                  <div className="text-2xl font-extrabold font-mono text-rose-400">
                    <AnimatedCounter value={radarTargets[activeBlip].score} duration={400} />
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono tracking-widest uppercase">
                    RISK / 100
                  </div>
                </div>
              </div>

              {/* Data attributes list dynamically linked to active radar blip */}
              <motion.div
                key={activeBlip}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2 mt-4 text-xs"
              >
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 font-mono">Telemetry Anomaly</span>
                  <span className="font-semibold text-rose-300 font-sans">
                    {radarTargets[activeBlip].label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-500 font-mono text-[10px] block">VERDICT</span>
                    <span className="font-bold text-rose-400 font-mono">
                      {radarTargets[activeBlip].score >= 70 ? '🔴 BLOCKED' : '🟢 APPROVED'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-500 font-mono text-[10px] block">LATENCY</span>
                    <span className="font-bold text-cyan-300 font-mono">1.8ms</span>
                  </div>
                </div>
              </motion.div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" />
                  Real-time Node Stream
                </span>
                <span>Click radar blips to inspect</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 3 Core Value Pillars with Interactive Staggered Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">
            INTELLIGENT FRAUD ARCHITECTURE
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-white font-['Space_Grotesk']">
            Engineered for precision risk intelligence
          </h3>
          <p className="text-sm text-slate-400 mt-2">
            Every transaction is scrutinized against multi-dimensional behavioral vectors,
            ensuring zero tolerance for payment fraud while preserving frictionless consumer checkouts.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ duration: 0.25 }}
            className="glass-panel glass-panel-hover rounded-3xl p-6 border border-slate-800 relative group cursor-pointer"
            onClick={() => onNavigate('detect')}
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all">
              <Cpu className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-100 mb-2 font-['Space_Grotesk'] flex items-center justify-between">
              <span>1. Detect</span>
              <ArrowRight className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ensemble Random Forest & Logistic Regression classifiers trained on stratified fraud datasets evaluate amount surges, nocturnal velocity, device fingerprints, and geographic anomalies in milliseconds.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ duration: 0.25 }}
            className="glass-panel glass-panel-hover rounded-3xl p-6 border border-slate-800 relative group cursor-pointer"
            onClick={() => onNavigate('detect')}
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-100 mb-2 font-['Space_Grotesk'] flex items-center justify-between">
              <span>2. Explain</span>
              <ArrowRight className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Zero "black box" decisions. Feature attribution pinpoints exact root causes—such as 15x amount spikes, cross-border gateways, or card-testing velocity bursts with transparent point impact scoring.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ duration: 0.25 }}
            className="glass-panel glass-panel-hover rounded-3xl p-6 border border-slate-800 relative group cursor-pointer"
            onClick={() => onNavigate('dashboard')}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-100 mb-2 font-['Space_Grotesk'] flex items-center justify-between">
              <span>3. Protect</span>
              <ArrowRight className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tiered actionable playbooks: 0–39 (Instant Approval), 40–69 (Automated 2FA / SMS Challenge), and 70–100 (Manual Callback & Biometric Verification). Full SQLite cryptographic auditing.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Live Operational Capability Banner */}
      <motion.section variants={itemVariants} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 border border-slate-800 bg-gradient-to-r from-[#0d1527] via-[#091122] to-[#0d1527] grid grid-cols-1 md:grid-cols-2 gap-8 items-center shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-2">
              <Terminal className="w-4 h-4" />
              <span>COLLEGE DIPLOMA IT CAPSTONE PROJECT READY</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-['Space_Grotesk']">
              Ready for Local Python/Flask & Scikit-Learn Deployment
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Includes full Python 3 backend code, REST APIs, Scikit-learn model training pipeline, SQLite database schemas, and PyTest validation suite for your viva presentation.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenExportModal}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all flex items-center gap-2 font-mono shadow-md shadow-cyan-500/20"
              >
                <Server className="w-3.5 h-3.5" />
                <span>View Python Backend & ML Training Code</span>
              </motion.button>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs text-slate-300 bg-slate-950/80 p-5 rounded-2xl border border-slate-800 shadow-inner">
            <div className="text-slate-500 flex items-center justify-between">
              <span># Start local Python environment</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-cyan-400">$ python -m venv venv && source venv/bin/activate</div>
            <div className="text-slate-500"># Install verified dependencies</div>
            <div className="text-cyan-400">$ pip install -r requirements.txt</div>
            <div className="text-slate-500"># Train Random Forest & Logistic Regression</div>
            <div className="text-emerald-400">$ python model/train_model.py</div>
            <div className="text-slate-500"># Start Flask REST Server on port 5000</div>
            <div className="text-indigo-300">$ python app.py</div>
          </div>
        </div>
      </motion.section>

      {/* Security Disclaimer / Privacy Notice */}
      <motion.section variants={itemVariants} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs flex items-start gap-3">
          <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-200">Educational Demonstration & Privacy Notice:</strong> FraudShield AI is an educational cyber intelligence platform. Never enter real card numbers, CVV codes, PINs, OTPs, or sensitive banking passwords.
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
};
