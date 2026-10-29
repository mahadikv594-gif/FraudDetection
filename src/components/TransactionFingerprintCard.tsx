import React, { useState } from 'react';
import { TransactionRecord } from '../types';
import { Fingerprint, Copy, Check, ShieldCheck, ShieldAlert, AlertTriangle, Clock, MapPin, Smartphone, CreditCard } from 'lucide-react';

interface TransactionFingerprintCardProps {
  transaction: TransactionRecord;
}

export const TransactionFingerprintCard: React.FC<TransactionFingerprintCardProps> = ({
  transaction,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(transaction, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusColor =
    transaction.status === 'POTENTIAL FRAUD'
      ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
      : transaction.status === 'REQUIRES REVIEW'
      ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
      : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';

  const statusIcon =
    transaction.status === 'POTENTIAL FRAUD' ? (
      <ShieldAlert className="w-4 h-4 text-rose-400" />
    ) : transaction.status === 'REQUIRES REVIEW' ? (
      <AlertTriangle className="w-4 h-4 text-amber-400" />
    ) : (
      <ShieldCheck className="w-4 h-4 text-emerald-400" />
    );

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 relative">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Fingerprint className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Transaction Fingerprint
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Immutable forensic audit snapshot
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
          title="Copy full JSON record"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          {copied ? 'Copied' : 'Export JSON'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400 font-mono text-[11px] block">Transaction ID</span>
          <span className="font-mono font-bold text-cyan-400 text-sm mt-0.5 block tracking-wide">
            {transaction.transaction_id}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400 font-mono text-[11px] block">Transaction Value</span>
          <span className="font-mono font-bold text-slate-100 text-sm mt-0.5 block">
            ₹{transaction.amount.toLocaleString()}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400 font-mono text-[11px] block">Status Assessment</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${statusColor}`}>
              {statusIcon}
              {transaction.status}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
            <CreditCard className="w-3 h-3 text-slate-400" /> Category
          </span>
          <span className="font-semibold text-slate-200 mt-0.5 block">
            {transaction.category}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
            <Smartphone className="w-3 h-3 text-slate-400" /> Device Signature
          </span>
          <span className="font-semibold text-slate-200 mt-0.5 block">
            {transaction.device}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" /> Location & Radius
          </span>
          <span className="font-semibold text-slate-200 mt-0.5 block truncate">
            {transaction.location} ({transaction.distance} km)
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" /> Time Window
          </span>
          <span className="font-mono text-slate-200 mt-0.5 block">
            {String(transaction.hour).padStart(2, '0')}:00 HRS
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 col-span-2">
          <span className="text-slate-400 font-mono text-[11px] block">Cryptographic Hash</span>
          <span className="font-mono text-[11px] text-slate-400 mt-0.5 block truncate">
            {transaction.hash}
          </span>
        </div>
      </div>

      {/* Recommended Action block */}
      <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800/90">
        <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
          Recommended Security Action
        </span>
        <p className="text-xs text-slate-200 leading-relaxed font-medium">
          {transaction.recommended_action}
        </p>
      </div>
    </div>
  );
};
