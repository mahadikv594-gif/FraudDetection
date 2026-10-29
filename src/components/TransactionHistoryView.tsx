import React, { useState, useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { TransactionRecord, PredictionStatus, RiskTier } from '../types';
import { ExplainableAiCard } from './ExplainableAiCard';
import { TransactionFingerprintCard } from './TransactionFingerprintCard';
import { RiskScoreGauge } from './RiskScoreGauge';
import {
  History,
  Search,
  Filter,
  Trash2,
  Download,
  Eye,
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowUpDown,
  Sparkles,
  Layers,
  Calendar,
} from 'lucide-react';

export const TransactionHistoryView: React.FC<{ onNavigateToDetect: () => void }> = ({
  onNavigateToDetect,
}) => {
  const {
    transactions,
    deleteTransaction,
    seedDemoTransactions,
    clearAllTransactions,
    clearDemoTransactions,
  } = useTransactions();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskTier, setSelectedRiskTier] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSource, setSelectedSource] = useState<'ALL' | 'SAMPLE' | 'CUSTOM'>('ALL');
  const [sortBy, setSortBy] = useState<
    'newest' | 'oldest' | 'risk_desc' | 'risk_asc' | 'amount_desc' | 'amount_asc'
  >('newest');
  const [inspectingTx, setInspectingTx] = useState<TransactionRecord | null>(null);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Risk tier / status filter
        if (selectedRiskTier !== 'ALL' && tx.risk_tier !== selectedRiskTier) return false;

        // Category filter
        if (selectedCategory !== 'ALL' && tx.category !== selectedCategory) return false;

        // Source filter: Sample vs Custom
        if (selectedSource === 'SAMPLE' && !tx.isSample && !tx.transaction_id.startsWith('T00')) return false;
        if (selectedSource === 'CUSTOM' && (tx.isSample || tx.transaction_id.startsWith('T00'))) return false;

        // Search query
        if (searchTerm.trim() !== '') {
          const term = searchTerm.toLowerCase();
          const matchId = tx.transaction_id.toLowerCase().includes(term);
          const matchCategory = tx.category.toLowerCase().includes(term);
          const matchLocation = tx.location.toLowerCase().includes(term);
          const matchDevice = tx.device.toLowerCase().includes(term);
          const matchHash = tx.hash.toLowerCase().includes(term);
          const matchReason = tx.reasons.some((r) => r.description.toLowerCase().includes(term));
          return matchId || matchCategory || matchLocation || matchDevice || matchHash || matchReason;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (sortBy === 'risk_desc') return b.risk_score - a.risk_score;
        if (sortBy === 'risk_asc') return a.risk_score - b.risk_score;
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, selectedRiskTier, selectedCategory, selectedSource, searchTerm, sortBy]);

  // Export CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) return;

    const headers = [
      'Transaction ID',
      'Amount (INR)',
      'Transaction Type',
      'Time',
      'Location',
      'Distance (km)',
      'Velocity (1hr)',
      'Device',
      'Risk Score',
      'Risk Level',
      'Status',
      'Record Type',
      'Created At',
      'Hash',
    ];

    const rows = transactions.map((t) => [
      t.transaction_id,
      t.amount,
      t.category,
      t.time || `${t.hour}:00`,
      t.location,
      t.distance,
      t.frequency,
      t.device,
      t.risk_score,
      t.risk_tier,
      t.status,
      t.isSample || t.transaction_id.startsWith('T00') ? 'Sample Record' : 'Custom Transaction',
      t.created_at,
      t.hash,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FraudDetection_Audit_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRiskBadge = (tier: RiskTier) => {
    if (tier === 'HIGH') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30">
          <ShieldAlert className="w-3 h-3" />
          High Risk
        </span>
      );
    }
    if (tier === 'MEDIUM') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <AlertTriangle className="w-3 h-3" />
          Medium Risk
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
        <ShieldCheck className="w-3 h-3" />
        Low Risk
      </span>
    );
  };

  const getStatusBadge = (status: PredictionStatus) => {
    if (status === 'POTENTIAL FRAUD') {
      return (
        <span className="text-[11px] font-semibold text-rose-400">
          POTENTIAL FRAUD
        </span>
      );
    }
    if (status === 'REQUIRES REVIEW') {
      return (
        <span className="text-[11px] font-semibold text-amber-400">
          REQUIRES REVIEW
        </span>
      );
    }
    return (
      <span className="text-[11px] font-semibold text-emerald-400">
        LEGITIMATE
      </span>
    );
  };

  const sampleCount = transactions.filter(
    (t) => t.isSample || t.transaction_id.startsWith('T00')
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
              TRANSACTION AUDIT LEDGER
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Space_Grotesk'] mt-1">
            Transaction History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse, search, and filter all analyzed credit card transactions with risk scores and forensic details.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {sampleCount > 0 && (
            <button
              onClick={clearDemoTransactions}
              className="px-3.5 py-1.5 rounded-xl text-xs font-mono bg-slate-900 hover:bg-amber-500/10 text-amber-300 border border-slate-800 hover:border-amber-500/40 transition-colors flex items-center gap-1.5"
              title="Remove sample demonstration records while keeping custom transactions"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Demo Records ({sampleCount})</span>
            </button>
          )}

          {transactions.length > 0 && (
            <>
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                title="Export ledger as CSV"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={clearAllTransactions}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition-colors flex items-center gap-1.5"
                title="Wipe entire ledger"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </>
          )}

          {transactions.length === 0 && (
            <button
              onClick={seedDemoTransactions}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Load 6 Sample Records</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters Bar (Prompt Requirement #4) */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative lg:col-span-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search ID, city, type..."
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        {/* Risk Level Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          <select
            value={selectedRiskTier}
            onChange={(e) => setSelectedRiskTier(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
          </select>
        </div>

        {/* Source Filter: Sample vs Custom */}
        <div>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value as any)}
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">All Records (Sample & Custom)</option>
            <option value="SAMPLE">Sample / Demonstration Only</option>
            <option value="CUSTOM">Custom Transactions Only</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">All Categories</option>
            <option value="Online Shopping">Online Shopping</option>
            <option value="Food Payment">Food Payment</option>
            <option value="ATM Withdrawal">ATM Withdrawal</option>
            <option value="International Purchase">International Purchase</option>
            <option value="Shopping">Shopping</option>
            <option value="Groceries">Groceries</option>
            <option value="Electronics">Electronics</option>
            <option value="Travel">Travel</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="risk_desc">Sort: Highest Risk</option>
            <option value="risk_asc">Sort: Lowest Risk</option>
            <option value="amount_desc">Sort: Highest Amount</option>
            <option value="amount_asc">Sort: Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Transactions Table / List */}
      {filteredTransactions.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200 font-['Space_Grotesk']">
            No matching transactions found.
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {transactions.length === 0
              ? 'No transactions have been recorded yet in your active session.'
              : 'Try clearing your search query or adjusting your status filters.'}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={onNavigateToDetect}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
            >
              Analyze Transaction
            </button>
            {transactions.length === 0 && (
              <button
                onClick={seedDemoTransactions}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Load 6 Sample Records
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Transaction ID</th>
                  <th className="py-3.5 px-4 font-semibold">Amount (₹)</th>
                  <th className="py-3.5 px-4 font-semibold">Transaction Type</th>
                  <th className="py-3.5 px-4 font-semibold">Date / Time</th>
                  <th className="py-3.5 px-4 font-semibold">Location & Distance</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Risk Score</th>
                  <th className="py-3.5 px-4 font-semibold">Risk Level</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredTransactions.map((tx) => {
                  const isSample = tx.isSample || tx.transaction_id.startsWith('T00');

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setInspectingTx(tx)}
                    >
                      {/* Transaction ID & Badge */}
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                        <div className="flex items-center gap-2">
                          <span>{tx.transaction_id}</span>
                          {isSample ? (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono font-normal">
                              Sample
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono font-normal">
                              Custom
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Amount in Rupees */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-100">
                        ₹{tx.amount.toLocaleString()}
                      </td>

                      {/* Transaction Type */}
                      <td className="py-3.5 px-4 text-slate-300 font-sans">
                        <div>{tx.category}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {tx.device} terminal
                        </div>
                      </td>

                      {/* Date / Time */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        <div>{tx.time || new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(tx.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                      </td>

                      {/* Location & Distance */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="font-sans text-xs">{tx.location}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {tx.distance} km • {tx.frequency} tx/hr
                        </div>
                      </td>

                      {/* Risk Score */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`font-mono font-bold text-sm ${
                            tx.risk_tier === 'HIGH'
                              ? 'text-rose-400'
                              : tx.risk_tier === 'MEDIUM'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {tx.risk_score}
                        </span>
                        <span className="text-[10px] text-slate-500 block font-mono">/ 100</span>
                      </td>

                      {/* Risk Level Badge */}
                      <td className="py-3.5 px-4">
                        {getRiskBadge(tx.risk_tier)}
                      </td>

                      {/* Prediction Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(tx.status)}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectingTx(tx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                            title="Inspect full forensic breakdown"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTransaction(tx.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Delete record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-slate-400">
            <span>
              Displaying <strong>{filteredTransactions.length}</strong> of{' '}
              <strong>{transactions.length}</strong> records (
              <strong className="text-cyan-400">{sampleCount}</strong> sample records,{' '}
              <strong className="text-slate-200">{transactions.length - sampleCount}</strong> custom tests)
            </span>
            <span className="text-slate-500">ISO-20022 Audit Ledger</span>
          </div>
        </div>
      )}

      {/* Forensic Inspection Modal */}
      {inspectingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setInspectingTx(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <span className="w-3 h-3 rounded-full bg-cyan-400" />
              <div>
                <h3 className="text-lg font-bold text-white font-mono">
                  Forensic Record: {inspectingTx.transaction_id}
                </h3>
                <p className="text-xs text-slate-400">
                  {inspectingTx.isSample ? 'Official Sample Test Case' : 'Custom User Transaction Telemetry'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <RiskScoreGauge
                score={inspectingTx.risk_score}
                tier={inspectingTx.risk_tier}
                status={inspectingTx.status}
                size="md"
              />
              <div className="space-y-1.5 text-xs font-mono">
                <div>Amount: <strong className="text-white text-sm">₹{inspectingTx.amount.toLocaleString()}</strong></div>
                <div>Category: <strong className="text-slate-200">{inspectingTx.category}</strong></div>
                <div>Location: <strong className="text-slate-200">{inspectingTx.location} ({inspectingTx.distance} km)</strong></div>
                <div>Velocity: <strong className="text-slate-200">{inspectingTx.frequency} tx in last hour</strong></div>
                <div>Time: <strong className="text-slate-200">{inspectingTx.time || `${inspectingTx.hour}:00`}</strong></div>
                <div>Model Mode: <strong className="text-cyan-400">{inspectingTx.model_mode}</strong></div>
              </div>
            </div>

            {/* Contributing Feature Signals */}
            <ExplainableAiCard
              reasons={inspectingTx.reasons}
              modelMode={inspectingTx.model_mode}
              riskScore={inspectingTx.risk_score}
              transaction={inspectingTx}
            />

            {/* Fingerprint Card */}
            <TransactionFingerprintCard transaction={inspectingTx} />
          </div>
        </div>
      )}
    </div>
  );
};
