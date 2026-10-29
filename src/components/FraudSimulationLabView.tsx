import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SIMULATION_SCENARIOS } from '../data/scenarios';
import { SimulationScenario, TransactionRecord } from '../types';
import { useTransactions } from '../context/TransactionContext';
import { RiskScoreGauge } from './RiskScoreGauge';
import { ExplainableAiCard } from './ExplainableAiCard';
import { TransactionFingerprintCard } from './TransactionFingerprintCard';
import {
  Activity,
  Play,
  Sparkles,
  Flame,
  HelpCircle,
  Radio,
  Server,
  Shield,
  ArrowRight,
  Zap,
} from 'lucide-react';

export const FraudSimulationLabView: React.FC = () => {
  const { analyzeTransaction, isAnalyzing, analysisStep, activeModelMode } = useTransactions();
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario>(SIMULATION_SCENARIOS[0]);
  const [simulationResult, setSimulationResult] = useState<TransactionRecord | null>(null);

  const handleSelectScenario = (scenario: SimulationScenario) => {
    setSelectedScenario(scenario);
    setSimulationResult(null);
  };

  const handleRunSimulation = async () => {
    try {
      const result = await analyzeTransaction(selectedScenario.data, true);
      setSimulationResult(result);
    } catch {
      // Handled in context
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
            CONTROLLED THREAT SIMULATION ENVIRONMENT
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Space_Grotesk'] mt-1">
          Fraud Simulation Lab
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Safely simulate adversarial attack patterns, payment anomalies, and legitimate merchant traffic without real financial risk.
        </p>
      </div>

      {/* Interactive Simulation Transmission Node Pipeline */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 overflow-hidden relative">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-3 px-2">
          <span className="flex items-center gap-1.5 text-cyan-300">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            SYNTHETIC ATTACK INJECTION PIPELINE
          </span>
          <span>LATENCY: ~1.2ms</span>
        </div>

        <div className="grid grid-cols-4 gap-2 relative items-center text-center">
          {/* Node 1: Origin */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 relative z-10">
            <div className="text-[10px] font-mono text-slate-500 uppercase">1. Origin Node</div>
            <div className="text-xs font-bold text-slate-200 truncate mt-0.5">
              {selectedScenario.data.location}
            </div>
            <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
              {selectedScenario.data.device}
            </div>
          </div>

          {/* Node 2: Network / Velocity */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 relative z-10">
            <div className="text-[10px] font-mono text-slate-500 uppercase">2. Velocity Signal</div>
            <div className="text-xs font-bold text-amber-300 truncate mt-0.5">
              {selectedScenario.data.frequency} tx/hr
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              {selectedScenario.data.distance} km away
            </div>
          </div>

          {/* Node 3: AI Classifier */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/40 relative z-10">
            <div className="text-[10px] font-mono text-cyan-400 uppercase flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 animate-spin" />
              <span>3. FraudShield AI</span>
            </div>
            <div className="text-xs font-bold text-cyan-200 truncate mt-0.5">
              {activeModelMode}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              8 Heuristic Vectors
            </div>
          </div>

          {/* Node 4: Verdict */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 relative z-10">
            <div className="text-[10px] font-mono text-slate-500 uppercase">4. Outcome</div>
            <div className="text-xs font-bold font-mono mt-0.5 truncate text-slate-300">
              {simulationResult ? simulationResult.status : selectedScenario.badge}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              {simulationResult ? `Score: ${simulationResult.risk_score}/100` : 'Pending Trigger'}
            </div>
          </div>

          {/* Animated Traveling Packet Beam */}
          <motion.div
            className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-rose-500 -translate-y-1/2 z-0 opacity-40"
          />
        </div>
      </div>

      {/* Scenario Picker Carousel / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {SIMULATION_SCENARIOS.map((scenario) => {
          const isSelected = selectedScenario.id === scenario.id;
          let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';

          if (scenario.badgeColor === 'red') {
            badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
          } else if (scenario.badgeColor === 'amber') {
            badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
          } else if (scenario.badgeColor === 'emerald') {
            badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
          }

          return (
            <motion.button
              key={scenario.id}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectScenario(scenario)}
              className={`text-left p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900/90 border-cyan-500/80 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/40'
                  : 'glass-panel border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
              }`}
            >
              <div>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase border mb-2 ${badgeColor}`}>
                  {scenario.badge}
                </span>
                <h4 className="text-xs font-bold text-slate-100 line-clamp-2">
                  {scenario.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-3">
                  {scenario.description}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>₹{scenario.data.amount.toLocaleString()}</span>
                <span>{scenario.data.hour}:00 HR</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Interactive Simulation Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Scenario Telemetry Inspector */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-slate-100 font-mono uppercase tracking-wider">
                  Active Scenario: {selectedScenario.title}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                SYNTHETIC
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedScenario.description}
            </p>

            {/* Synthetic attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 block">Amount</span>
                <span className="font-mono font-bold text-slate-100 text-sm">
                  ₹{selectedScenario.data.amount.toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 block">Execution Time</span>
                <span className="font-mono font-bold text-slate-100 text-sm">
                  {String(selectedScenario.data.hour).padStart(2, '0')}:00 HRS
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 block">Category</span>
                <span className="font-semibold text-slate-200">
                  {selectedScenario.data.category}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 block">Device</span>
                <span className="font-semibold text-slate-200">
                  {selectedScenario.data.device}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 block">Location</span>
                <span className="font-semibold text-slate-200 truncate block">
                  {selectedScenario.data.location} ({selectedScenario.data.distance} km)
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 block">Burst Velocity</span>
                <span className="font-mono font-bold text-slate-100">
                  {selectedScenario.data.frequency} tx / hr
                </span>
              </div>
            </div>

            {/* Expected Forensic Hypotheses */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <span className="text-[11px] font-mono uppercase text-cyan-300 font-semibold flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                Expected Forensic Flags
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {selectedScenario.expectedOutcome.keyFlags.map((flag, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{flag}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Run Button with motion spring */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRunSimulation}
              disabled={isAnalyzing}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2.5 shadow-xl ${
                isAnalyzing
                  ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/25 hover:shadow-cyan-500/40'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span className="font-mono text-xs">{analysisStep}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Simulation ({selectedScenario.title})</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Simulation Output Column */}
        <div className="lg:col-span-6 space-y-6">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="glass-panel rounded-3xl p-8 border border-cyan-500/30 text-center space-y-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400">
                  <Sparkles className="w-8 h-8 animate-spin" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                    Simulating Attack Vector Telemetry
                  </h3>
                  <p className="text-xs text-cyan-300 font-mono tracking-wider">
                    {analysisStep}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
                  SCANNING ➔ ANALYZING ➔ RISK EVALUATION ➔ RESULT
                </div>
              </motion.div>
            ) : simulationResult ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Output Summary Card */}
                <div
                  className={`glass-panel rounded-3xl p-6 border ${
                    simulationResult.status === 'POTENTIAL FRAUD'
                      ? 'border-rose-500/40'
                      : simulationResult.status === 'REQUIRES REVIEW'
                      ? 'border-amber-500/40'
                      : 'border-emerald-500/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <RiskScoreGauge
                      score={simulationResult.risk_score}
                      tier={simulationResult.risk_tier}
                      status={simulationResult.status}
                      size="lg"
                    />

                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-900 border border-slate-700 text-slate-300">
                        <span>Engine:</span>
                        <strong className="text-cyan-400">{activeModelMode}</strong>
                      </div>

                      <h4 className="text-base font-bold text-white">
                        Simulation Result: {simulationResult.status}
                      </h4>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {simulationResult.recommended_action}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Explainable Signals */}
                <ExplainableAiCard
                  reasons={simulationResult.reasons}
                  modelMode={simulationResult.model_mode}
                  riskScore={simulationResult.risk_score}
                />

                {/* Fingerprint */}
                <TransactionFingerprintCard transaction={simulationResult} />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel rounded-3xl p-10 border border-slate-800 text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <Activity className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-slate-200 font-['Space_Grotesk']">
                  Simulation Sandbox Ready
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Select one of the 5 synthetic attack or baseline scenarios above and click <strong className="text-cyan-400">Run Simulation</strong> to observe how the AI evaluates the anomaly.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
