import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MODEL_BENCHMARKS } from '../lib/mlEngine';
import { ModelMetrics } from '../types';
import {
  BrainCircuit,
  Layers,
  BarChart2,
  Info,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { AnimatedCounter } from './AnimatedCounter';

export const ModelEvaluationView: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<ModelMetrics>(MODEL_BENCHMARKS[0]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
    >
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
            SCIENTIFIC MODEL BENCHMARKS & VALIDATION
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Space_Grotesk'] mt-1">
          Machine Learning Model Evaluation
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Comparative empirical performance of Random Forest ensemble vs. baseline Logistic Regression classifiers.
        </p>
      </div>

      {/* Model Selection Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MODEL_BENCHMARKS.map((m) => {
          const isSelected = selectedModel.name === m.name;
          return (
            <motion.button
              key={m.name}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedModel(m)}
              className={`text-left p-5 rounded-3xl border transition-all relative ${
                isSelected
                  ? 'bg-slate-900/90 border-cyan-500 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-500/40'
                  : 'glass-panel border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white font-['Space_Grotesk']">
                      {m.name}
                    </h3>
                    <span className="text-[10px] font-mono text-cyan-300">
                      {m.algorithm}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {(m.roc_auc * 100).toFixed(1)}% ROC-AUC
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-800/80">
                <span>Samples: {m.training_samples.toLocaleString()}</span>
                <span>Features: {m.features_count}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Selected Model Performance Matrix with Animated Numbers */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedModel.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-5 gap-3.5"
        >
          <div className="glass-panel rounded-2xl p-4 border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Overall Accuracy
            </span>
            <div className="text-2xl font-mono font-bold text-white mt-1">
              <AnimatedCounter value={selectedModel.accuracy * 100} decimals={2} suffix="%" />
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Stratified Test Split</span>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Precision (PPV)
            </span>
            <div className="text-2xl font-mono font-bold text-cyan-400 mt-1">
              <AnimatedCounter value={selectedModel.precision * 100} decimals={1} suffix="%" />
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Low False Positives</span>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Recall (Sensitivity)
            </span>
            <div className="text-2xl font-mono font-bold text-indigo-400 mt-1">
              <AnimatedCounter value={selectedModel.recall * 100} decimals={1} suffix="%" />
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Fraud Capture Rate</span>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              F1-Harmonic Score
            </span>
            <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
              <AnimatedCounter value={selectedModel.f1_score * 100} decimals={1} suffix="%" />
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Precision-Recall Balance</span>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-cyan-500/30 col-span-2 sm:col-span-1 bg-cyan-500/5">
            <span className="text-[10px] font-mono uppercase text-cyan-400 font-semibold block">
              ROC-AUC Score
            </span>
            <div className="text-2xl font-mono font-bold text-cyan-300 mt-1">
              <AnimatedCounter value={selectedModel.roc_auc * 100} decimals={1} suffix="%" />
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Discrimination Index</span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Confusion Matrix & Feature Importance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Confusion Matrix */}
        <div className="lg:col-span-6 glass-panel rounded-3xl p-6 sm:p-7 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Confusion Matrix ({selectedModel.name.split(' ')[0]} {selectedModel.name.split(' ')[1]})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              N = {selectedModel.training_samples.toLocaleString()}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Evaluated on holdout validation data with synthetic minority oversampling (SMOTE):
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* True Negative */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center cursor-default shadow-sm"
            >
              <span className="text-[10px] font-mono uppercase text-emerald-400 block font-semibold">
                True Negatives (TN)
              </span>
              <div className="text-xl font-mono font-bold text-white mt-1">
                <AnimatedCounter value={selectedModel.confusion_matrix.true_negative} />
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Legitimate accurately cleared
              </span>
            </motion.div>

            {/* False Positive */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center cursor-default shadow-sm"
            >
              <span className="text-[10px] font-mono uppercase text-amber-400 block font-semibold">
                False Positives (FP)
              </span>
              <div className="text-xl font-mono font-bold text-white mt-1">
                <AnimatedCounter value={selectedModel.confusion_matrix.false_positive} />
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Legitimate flagged by mistake
              </span>
            </motion.div>

            {/* False Negative */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center cursor-default shadow-sm"
            >
              <span className="text-[10px] font-mono uppercase text-rose-400 block font-semibold">
                False Negatives (FN)
              </span>
              <div className="text-xl font-mono font-bold text-white mt-1">
                <AnimatedCounter value={selectedModel.confusion_matrix.false_negative} />
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Missed fraudulent charges
              </span>
            </motion.div>

            {/* True Positive */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-center cursor-default shadow-sm"
            >
              <span className="text-[10px] font-mono uppercase text-cyan-300 block font-semibold">
                True Positives (TP)
              </span>
              <div className="text-xl font-mono font-bold text-white mt-1">
                <AnimatedCounter value={selectedModel.confusion_matrix.true_positive} />
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Fraud caught successfully
              </span>
            </motion.div>
          </div>
        </div>

        {/* Feature Importance Bar Chart */}
        <div className="lg:col-span-6 glass-panel rounded-3xl p-6 sm:p-7 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Gini Feature Importance Rankings
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">XAI WEIGHTS</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={selectedModel.feature_importances}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={10} domain={[0, 0.4]} />
                <YAxis
                  dataKey="feature"
                  type="category"
                  stroke="#94a3b8"
                  fontSize={10}
                  width={140}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d1527',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="importance" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Importance Weight" animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Real Kaggle/ULB Dataset Explanation Box */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 font-mono font-semibold">
          <Info className="w-4 h-4" />
          <span>DATASET COMPATIBILITY & CLASS IMBALANCE HANDLING (V1–V28 vs. HUMAN TELEMETRY)</span>
        </div>
        <p className="leading-relaxed text-slate-400">
          The Kaggle/ULB Credit Card Fraud dataset contains 284,807 European cardholder transactions with only 492 frauds (0.172% class imbalance). Features V1 through V28 represent anonymized PCA principal components. Our Random Forest pipeline incorporates SMOTE (Synthetic Minority Over-sampling Technique) to balance decision boundaries, while translating PCA weights into actionable human telemetry: velocity frequency, nocturnal timing, geographic radius, and expenditure spikes.
        </p>
      </div>
    </motion.div>
  );
};
