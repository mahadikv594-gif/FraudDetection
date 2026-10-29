import React, { useState, useMemo } from 'react';
import { motion, type Variants } from 'motion/react';
import { useTransactions } from '../context/TransactionContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Zap,
  Activity,
  Sparkles,
  Database,
  Trash2,
  BellRing,
  Search,
  Filter,
  Eye,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { RiskTier, PredictionStatus, TransactionRecord } from '../types';

interface DashboardViewProps {
  onNavigateToDetect: () => void;
  onNavigateToHistory: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToDetect,
  onNavigateToHistory,
}) => {
  const {
    stats,
    seedDemoTransactions,
    clearAllTransactions,
    clearDemoTransactions,
    transactions,
  } = useTransactions();

  // Color Palette Constants
  const COLOR_SAFE = '#10b981';   // Emerald / Low Risk
  const COLOR_REVIEW = '#f59e0b'; // Amber / Medium Risk
  const COLOR_FRAUD = '#ef4444';  // Rose / High Risk

  // Search & Filter State for Recent Transactions Table
  const [tableSearch, setTableSearch] = useState('');
  const [tableFilter, setTableFilter] = useState<'ALL' | RiskTier>('ALL');

  // 1. Pie Chart Data: Transaction Risk Categories
  const riskPieData = useMemo(() => {
    return [
      { name: 'Low Risk', value: stats.risk_distribution.low, color: COLOR_SAFE, range: '0–39' },
      { name: 'Medium Risk', value: stats.risk_distribution.medium, color: COLOR_REVIEW, range: '40–69' },
      { name: 'High Risk', value: stats.risk_distribution.high, color: COLOR_FRAUD, range: '70–100' },
    ].filter((item) => item.value > 0);
  }, [stats.risk_distribution]);

  // 2. Bar Chart Data: Transaction Counts by Risk Category
  const riskBarData = useMemo(() => {
    return [
      { name: 'Low Risk (0–39)', count: stats.risk_distribution.low, fill: COLOR_SAFE },
      { name: 'Medium Risk (40–69)', count: stats.risk_distribution.medium, fill: COLOR_REVIEW },
      { name: 'High Risk (70–100)', count: stats.risk_distribution.high, fill: COLOR_FRAUD },
    ];
  }, [stats.risk_distribution]);

  // 3. Category Volume & Threat Bar Data
  const categoryBarData = useMemo(() => {
    return Object.entries(stats.category_distribution).map(([cat, data]) => ({
      category: cat,
      total: data.count,
      fraud: data.fraud_count,
      amount: data.total_amount,
    }));
  }, [stats.category_distribution]);

  // 4. Recent Transactions Table Filtering (Latest 10)
  const recentFilteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        if (tableFilter !== 'ALL' && tx.risk_tier !== tableFilter) return false;
        if (tableSearch.trim() !== '') {
          const term = tableSearch.toLowerCase();
          const matchId = tx.transaction_id.toLowerCase().includes(term);
          const matchCat = tx.category.toLowerCase().includes(term);
          const matchLoc = tx.location.toLowerCase().includes(term);
          const matchDev = tx.device.toLowerCase().includes(term);
          return matchId || matchCat || matchLoc || matchDev;
        }
        return true;
      })
      .slice(0, 10);
  }, [transactions, tableFilter, tableSearch]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
              LIVE RISK SURVEILLANCE & METRICS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Space_Grotesk'] mt-1">
            Fraud Detection Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time aggregate analytics, risk category distributions, alerts, and live transaction ledger.
          </p>
        </div>

        {/* Database Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {stats.total_transactions > 0 && (
            <>
              <button
                type="button"
                onClick={clearDemoTransactions}
                className="px-3 py-1.5 rounded-xl text-xs font-mono text-slate-400 hover:text-amber-300 bg-slate-900 border border-slate-800 hover:border-amber-500/30 transition-colors"
                title="Clear only demonstration sample records"
              >
                Clear Demo Records
              </button>
              <button
                type="button"
                onClick={clearAllTransactions}
                className="px-3 py-1.5 rounded-xl text-xs font-mono text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 hover:border-rose-500/30 transition-colors flex items-center gap-1.5"
                title="Clear all transactions from ledger"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Ledger</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={seedDemoTransactions}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 text-cyan-300 border border-cyan-500/40 transition-all flex items-center gap-1.5 shadow-sm shadow-cyan-950"
            title="Seed the 6 official sample transactions"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Load 6 Official Samples</span>
          </button>
        </div>
      </div>

      {/* Empty State Guard */}
      {stats.total_transactions === 0 ? (
        <motion.div
          variants={cardVariants}
          className="glass-panel rounded-3xl p-12 border border-slate-800 text-center space-y-5 my-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Database className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
              No transactions analyzed yet.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your transaction database is empty. Load the 6 official sample records or navigate to the Detect Fraud page to test custom transactions.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onNavigateToDetect}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <Zap className="w-4 h-4" />
              <span>Go to Detect Fraud</span>
            </button>
            <button
              onClick={seedDemoTransactions}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Load 6 Official Sample Test Cases</span>
            </button>
          </div>
        </motion.div>
      ) : (
        /* Real Connected Dashboard Analytics */
        <div className="space-y-8">
          {/* Top 5 Primary Metric Cards (Prompt Requirement #3) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* 1. Total Transactions Analyzed */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -3 }}
              className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 relative overflow-hidden group shadow-sm"
            >
              <span className="text-[11px] font-mono text-slate-400 uppercase block tracking-wider">
                Total Analyzed
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-1">
                <AnimatedCounter value={stats.total_transactions} />
              </div>
              <div className="text-[11px] text-cyan-400 font-mono mt-2 flex items-center gap-1">
                <Database className="w-3 h-3" />
                <span>Live Transaction Ledger</span>
              </div>
            </motion.div>

            {/* 2. Low-Risk Transactions */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -3 }}
              className="glass-panel rounded-2xl p-4 sm:p-5 border border-emerald-500/30 bg-emerald-500/5 relative overflow-hidden group shadow-sm shadow-emerald-950/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-emerald-400 uppercase font-semibold block tracking-wider">
                  Low-Risk (0–39)
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 mt-1">
                <AnimatedCounter value={stats.risk_distribution.low} />
              </div>
              <div className="text-[11px] text-emerald-300 font-mono mt-2">
                Normal Transactions ({stats.total_transactions > 0 ? Math.round((stats.risk_distribution.low / stats.total_transactions) * 100) : 0}%)
              </div>
            </motion.div>

            {/* 3. Medium-Risk Transactions */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -3 }}
              className="glass-panel rounded-2xl p-4 sm:p-5 border border-amber-500/30 bg-amber-500/5 relative overflow-hidden group shadow-sm shadow-amber-950/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-amber-400 uppercase font-semibold block tracking-wider">
                  Medium-Risk (40–69)
                </span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400 mt-1">
                <AnimatedCounter value={stats.risk_distribution.medium} />
              </div>
              <div className="text-[11px] text-amber-300 font-mono mt-2">
                Requires Verification ({stats.total_transactions > 0 ? Math.round((stats.risk_distribution.medium / stats.total_transactions) * 100) : 0}%)
              </div>
            </motion.div>

            {/* 4. High-Risk Transactions */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -3 }}
              className="glass-panel rounded-2xl p-4 sm:p-5 border border-rose-500/30 bg-rose-500/5 relative overflow-hidden group shadow-sm shadow-rose-950/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-rose-400 uppercase font-semibold block tracking-wider">
                  High-Risk (70–100)
                </span>
                <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-400 mt-1">
                <AnimatedCounter value={stats.risk_distribution.high} />
              </div>
              <div className="text-[11px] text-rose-300 font-mono mt-2">
                Suspicious ({stats.total_transactions > 0 ? Math.round((stats.risk_distribution.high / stats.total_transactions) * 100) : 0}%)
              </div>
            </motion.div>

            {/* 5. Fraud Alerts Generated */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -3 }}
              className="glass-panel rounded-2xl p-4 sm:p-5 border border-cyan-500/30 bg-cyan-500/5 col-span-2 md:col-span-1 relative overflow-hidden group shadow-sm shadow-cyan-950/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-cyan-400 uppercase font-semibold block tracking-wider">
                  Fraud Alerts
                </span>
                <BellRing className="w-4 h-4 text-cyan-400 animate-bounce" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-300 mt-1">
                <AnimatedCounter value={stats.fraud_alerts_count} />
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-2 truncate">
                Total Value: <strong className="text-slate-200">₹{stats.total_amount.toLocaleString()}</strong>
              </div>
            </motion.div>
          </div>

          {/* Charts Row: Pie Chart of Risk Categories & Bar Chart of Counts by Risk Category */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Pie Chart: Transaction Risk Categories */}
            <motion.div
              variants={cardVariants}
              className="lg:col-span-6 glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
                    Transaction Risk Categories (Pie Chart)
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-cyan-400">
                    LOW / MED / HIGH
                  </span>
                </div>

                <div className="h-64 w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        animationDuration={1000}
                      >
                        {riskPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any, name: any) => [`${val} transactions`, name]}
                        contentStyle={{
                          backgroundColor: '#0d1527',
                          borderColor: '#1e293b',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => (
                          <span className="text-xs font-mono text-slate-300">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mx-auto mb-1 animate-pulse" />
                  <span className="text-[10px] text-slate-400 block font-mono">Low Risk</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    <AnimatedCounter value={stats.risk_distribution.low} /> tx
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 block font-mono">Medium Risk</span>
                  <span className="font-bold text-amber-400 font-mono">
                    <AnimatedCounter value={stats.risk_distribution.medium} /> tx
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="w-2 h-2 rounded-full bg-rose-400 mx-auto mb-1 animate-ping" />
                  <span className="text-[10px] text-slate-400 block font-mono">High Risk</span>
                  <span className="font-bold text-rose-400 font-mono">
                    <AnimatedCounter value={stats.risk_distribution.high} /> tx
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Bar Chart: Counts by Risk Category */}
            <motion.div
              variants={cardVariants}
              className="lg:col-span-6 glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
                    Transaction Counts by Risk Category (Bar Chart)
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">REALTIME VOLUME</span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskBarData} barSize={42}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        formatter={(val: any) => [`${val} transactions`, 'Count']}
                        contentStyle={{
                          backgroundColor: '#0d1527',
                          borderColor: '#1e293b',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={1000}>
                        {riskBarData.map((entry, index) => (
                          <Cell key={`bar-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Average Risk Score: <strong className="text-cyan-400">{stats.avg_risk_score}/100</strong></span>
                <span>Suspicious Rate: <strong className="text-rose-400">{stats.fraud_rate_pct}%</strong></span>
              </div>
            </motion.div>
          </div>

          {/* Recent Transactions Table with Search & Filter (Prompt Requirement #3) */}
          <motion.div
            variants={cardVariants}
            className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl"
          >
            {/* Table Header with Search & Filter */}
            <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <span>Recent Transactions Table</span>
                  <span className="text-xs font-mono text-slate-400 lowercase font-normal">
                    (showing latest {recentFilteredTransactions.length} records)
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live updating ledger showing transactions analyzed by the fraud detection engine.
                </p>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="Search ID, type, city..."
                    className="bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono w-44 sm:w-56"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={tableFilter}
                    onChange={(e) => setTableFilter(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="ALL">All Risk Tiers</option>
                    <option value="LOW">Low Risk</option>
                    <option value="MEDIUM">Medium Risk</option>
                    <option value="HIGH">High Risk</option>
                  </select>
                </div>

                <button
                  onClick={onNavigateToHistory}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 font-mono whitespace-nowrap ml-1"
                >
                  <span>Full Ledger</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Table Content */}
            {recentFilteredTransactions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-mono">
                No transactions match the selected search or risk filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4 font-semibold">Transaction ID</th>
                      <th className="py-3 px-4 font-semibold">Amount (₹)</th>
                      <th className="py-3 px-4 font-semibold">Transaction Type</th>
                      <th className="py-3 px-4 font-semibold">Location</th>
                      <th className="py-3 px-4 font-semibold text-center">Risk Score</th>
                      <th className="py-3 px-4 font-semibold">Risk Level</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold">Date / Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {recentFilteredTransactions.map((tx) => {
                      const isHigh = tx.risk_tier === 'HIGH';
                      const isMed = tx.risk_tier === 'MEDIUM';

                      return (
                        <tr
                          key={tx.id}
                          className="hover:bg-slate-800/30 transition-colors font-mono"
                        >
                          {/* Transaction ID */}
                          <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                            <span>{tx.transaction_id}</span>
                            {tx.isSample ? (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono">
                                Sample
                              </span>
                            ) : (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                                Custom
                              </span>
                            )}
                          </td>

                          {/* Amount */}
                          <td className="py-3 px-4 text-slate-100 font-bold">
                            ₹{tx.amount.toLocaleString()}
                          </td>

                          {/* Category / Type */}
                          <td className="py-3 px-4 text-slate-300 font-sans">
                            {tx.category}
                          </td>

                          {/* Location */}
                          <td className="py-3 px-4 text-slate-400">
                            {tx.location}
                          </td>

                          {/* Risk Score */}
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`font-bold ${
                                isHigh ? 'text-rose-400' : isMed ? 'text-amber-400' : 'text-emerald-400'
                              }`}
                            >
                              {tx.risk_score}/100
                            </span>
                          </td>

                          {/* Risk Level Badge */}
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                isHigh
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                  : isMed
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              }`}
                            >
                              {isHigh ? 'High Risk' : isMed ? 'Medium Risk' : 'Low Risk'}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <span
                              className={`text-[11px] font-semibold ${
                                isHigh ? 'text-rose-400' : isMed ? 'text-amber-400' : 'text-emerald-400'
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>

                          {/* Date / Time */}
                          <td className="py-3 px-4 text-slate-400 text-[11px]">
                            {tx.time || new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
