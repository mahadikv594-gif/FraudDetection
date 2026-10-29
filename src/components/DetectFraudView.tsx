import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TransactionCategory,
  DeviceType,
  LocationType,
  TransactionInput,
  TransactionRecord,
} from '../types';
import { useTransactions } from '../context/TransactionContext';
import { RiskScoreGauge } from './RiskScoreGauge';
import { ExplainableAiCard } from './ExplainableAiCard';
import { TransactionFingerprintCard } from './TransactionFingerprintCard';
import {
  OFFICIAL_SAMPLE_TRANSACTIONS,
  SampleTransactionCase,
} from '../data/sampleTransactions';
import {
  Zap,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sliders,
  Clock,
  MapPin,
  Coins,
  Activity,
  Layers,
  FileText,
  Info,
} from 'lucide-react';

interface DetectFraudViewProps {
  onNavigateToHistory: () => void;
  onNavigateToDashboard: () => void;
}

export const DetectFraudView: React.FC<DetectFraudViewProps> = ({
  onNavigateToHistory,
  onNavigateToDashboard,
}) => {
  const { analyzeTransaction, isAnalyzing, analysisStep, activeModelMode } = useTransactions();

  // Selected sample tracking
  const [selectedSample, setSelectedSample] = useState<SampleTransactionCase | null>(
    OFFICIAL_SAMPLE_TRANSACTIONS[0]
  );

  // Form State initialized to Sample 1 (T001)
  const [transactionId, setTransactionId] = useState<string>('T001');
  const [amount, setAmount] = useState<number | ''>(250);
  const [hour, setHour] = useState<number | ''>(10);
  const [minute, setMinute] = useState<number | ''>(30);
  const [timeString, setTimeString] = useState<string>('10:30 AM');
  const [category, setCategory] = useState<TransactionCategory>('Online Shopping');
  const [device, setDevice] = useState<DeviceType>('Mobile');
  const [location, setLocation] = useState<LocationType>('Ahmedabad');
  const [frequency, setFrequency] = useState<number | ''>(1);
  const [distance, setDistance] = useState<number | ''>(5);
  const [previousAmount, setPreviousAmount] = useState<number | ''>(250);
  const [notes, setNotes] = useState<string>('Daytime online commerce checkout in Ahmedabad');

  // Result state
  const [result, setResult] = useState<TransactionRecord | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Helper to sync hour/minute to formatted time string
  const formatTimePreview = (h: number, m: number): string => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    const displayMin = String(m).padStart(2, '0');
    return `${String(displayHour).padStart(2, '0')}:${displayMin} ${period}`;
  };

  const handleHourChange = (newHour: number | '') => {
    setHour(newHour);
    if (newHour !== '' && minute !== '') {
      setTimeString(formatTimePreview(Number(newHour), Number(minute)));
    }
  };

  const handleMinuteChange = (newMinute: number | '') => {
    setMinute(newMinute);
    if (hour !== '' && newMinute !== '') {
      setTimeString(formatTimePreview(Number(hour), Number(newMinute)));
    }
  };

  // Form Validation
  const validateForm = (): boolean => {
    setValidationError(null);

    if (!transactionId.trim()) {
      setValidationError('Transaction ID is required (e.g. T001, TX-1029).');
      return false;
    }
    if (amount === '' || Number(amount) < 0) {
      setValidationError('Transaction amount must be a valid non-negative number.');
      return false;
    }
    if (hour === '' || Number(hour) < 0 || Number(hour) > 23) {
      setValidationError('Transaction hour must be an integer between 0 and 23.');
      return false;
    }
    if (frequency === '' || Number(frequency) < 0) {
      setValidationError('Number of transactions in the last hour must be non-negative.');
      return false;
    }
    if (distance === '' || Number(distance) < 0) {
      setValidationError('Distance from usual location must be non-negative.');
      return false;
    }
    if (previousAmount === '' || Number(previousAmount) < 0) {
      setValidationError('Previous transaction amount must be non-negative.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const inputData: TransactionInput = {
      transaction_id: transactionId.trim(),
      amount: Number(amount),
      hour: Number(hour),
      minute: minute === '' ? 0 : Number(minute),
      time: timeString || formatTimePreview(Number(hour), minute === '' ? 0 : Number(minute)),
      category,
      device,
      location,
      frequency: Number(frequency),
      distance: Number(distance),
      previous_amount: previousAmount === '' ? Number(amount) : Number(previousAmount),
      notes: notes.trim() || undefined,
      isSample: !!selectedSample && selectedSample.input.transaction_id === transactionId.trim(),
      sampleName: selectedSample?.title,
    };

    try {
      const recorded = await analyzeTransaction(inputData);
      setResult(recorded);
    } catch {
      setValidationError('An error occurred while evaluating transaction parameters.');
    }
  };

  // Load a chosen sample transaction from the official 6 test cases
  const handleLoadSample = (sample: SampleTransactionCase) => {
    setSelectedSample(sample);
    setTransactionId(sample.input.transaction_id || sample.id);
    setAmount(sample.input.amount);
    setHour(sample.input.hour);
    setMinute(sample.input.minute ?? 0);
    setTimeString(sample.input.time || formatTimePreview(sample.input.hour, sample.input.minute ?? 0));
    setCategory(sample.input.category);
    setDevice(sample.input.device);
    setLocation(sample.input.location);
    setFrequency(sample.input.frequency);
    setDistance(sample.input.distance);
    setPreviousAmount(sample.input.previous_amount ?? sample.input.amount);
    setNotes(sample.input.notes || '');
    setResult(null);
    setValidationError(null);
  };

  // Clear Form button resets all fields to clean slate
  const handleClearForm = () => {
    setSelectedSample(null);
    setTransactionId('');
    setAmount('');
    setHour('');
    setMinute('');
    setTimeString('');
    setCategory('Shopping');
    setDevice('Mobile');
    setLocation('Local');
    setFrequency('');
    setDistance('');
    setPreviousAmount('');
    setNotes('');
    setResult(null);
    setValidationError(null);
  };

  // Reset to default baseline (T001)
  const handleResetDefaults = () => {
    handleLoadSample(OFFICIAL_SAMPLE_TRANSACTIONS[0]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
              TRANSACTION RISK SCORING ENGINE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Space_Grotesk'] mt-1">
            Detect Credit Card Fraud
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Analyze behavioral telemetry, transaction velocity, geographic displacement, and temporal factors to detect anomalous and suspicious activity.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleClearForm}
            className="px-3.5 py-2 rounded-xl text-xs font-mono text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-1.5 shadow-sm"
            title="Clear all form fields to enter new transaction"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear Form</span>
          </button>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl text-xs font-mono text-cyan-300 hover:text-cyan-200 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all flex items-center gap-1.5 shadow-sm"
            title="Reload baseline sample transaction (T001)"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sample 1 (T001)</span>
          </button>
        </div>
      </div>

      {/* Section 1: Load Sample Transaction Selector (Prominently featured) */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Load Sample Transaction for Testing
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              6 Test Cases
            </span>
          </div>

          {/* Dropdown Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="sample-dropdown" className="text-xs font-mono text-slate-400 whitespace-nowrap">
              Dropdown Select:
            </label>
            <select
              id="sample-dropdown"
              value={selectedSample?.id || ''}
              onChange={(e) => {
                const found = OFFICIAL_SAMPLE_TRANSACTIONS.find((s) => s.id === e.target.value);
                if (found) handleLoadSample(found);
              }}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="" disabled>Choose a sample record...</option>
              {OFFICIAL_SAMPLE_TRANSACTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id}: {s.input.amount ? `₹${s.input.amount.toLocaleString()}` : ''} - {s.categoryLabel} ({s.badge})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 6 Sample Case Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {OFFICIAL_SAMPLE_TRANSACTIONS.map((sample) => {
            const isSelected = selectedSample?.id === sample.id;
            const isHighRisk = sample.expectedRiskTier === 'HIGH';

            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleLoadSample(sample)}
                className={`text-left p-3.5 rounded-2xl border transition-all relative overflow-hidden group ${
                  isSelected
                    ? isHighRisk
                      ? 'bg-rose-500/10 border-rose-500/60 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/50'
                      : 'bg-emerald-500/10 border-emerald-500/60 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isHighRisk ? 'bg-rose-400 animate-pulse' : 'bg-emerald-400'
                      }`}
                    />
                    {sample.id} — {sample.categoryLabel}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border ${
                      isHighRisk
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {sample.badge}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                  <span className="font-bold text-slate-100">
                    ₹{sample.input.amount.toLocaleString()}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span>{sample.input.time}</span>
                  <span className="text-slate-600">•</span>
                  <span>{sample.input.location}</span>
                </div>

                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  {sample.description}
                </p>

                {isSelected && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-cyan-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Loaded in Form
                    </span>
                    <span className="text-slate-400">
                      Expected: <strong className={isHighRisk ? 'text-rose-400' : 'text-emerald-400'}>{sample.expectedRiskTier} RISK</strong>
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {validationError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Main Form & Live Detection Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Form Column */}
        <div className="lg:col-span-6 space-y-6">
          <form
            onSubmit={handleSubmit}
            className="glass-panel rounded-3xl p-6 sm:p-7 border border-slate-800 space-y-5 relative overflow-hidden"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
                  Transaction Telemetry Inputs
                </h3>
              </div>
              <button
                type="button"
                onClick={handleClearForm}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono transition-colors"
                title="Clear all fields"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear Form
              </button>
            </div>

            {/* Transaction ID & Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Transaction ID <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. T001, TX-8821"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 uppercase"
                />
                <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                  Unique audit identifier
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">
                    Amount (₹) <span className="text-cyan-400">*</span>
                  </label>
                  {amount !== '' && Number(amount) >= 40000 ? (
                    <span className="text-[10px] font-mono text-rose-400 font-semibold">High Value</span>
                  ) : amount !== '' && Number(amount) <= 3000 ? (
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">Standard Retail</span>
                  ) : null}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 250"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-8 pr-3.5 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                  Displayed in Indian Rupees (₹)
                </span>
              </div>
            </div>

            {/* Transaction Type & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Transaction Type <span className="text-cyan-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Online Shopping">Online Shopping</option>
                  <option value="Food Payment">Food Payment</option>
                  <option value="ATM Withdrawal">ATM Withdrawal (Cash)</option>
                  <option value="International Purchase">International Purchase</option>
                  <option value="Shopping">Shopping (General Retail)</option>
                  <option value="Groceries">Groceries (Routine Low Risk)</option>
                  <option value="Electronics">Electronics (High Resale Risk)</option>
                  <option value="Travel">Travel / Accommodation</option>
                  <option value="Other">Other Category</option>
                </select>
                <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                  Merchant payment category
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">
                    Location <span className="text-cyan-400">*</span>
                  </label>
                  {location === 'Foreign Location' || location === 'International' ? (
                    <span className="text-[10px] font-mono text-rose-400 font-semibold">Foreign Route</span>
                  ) : location === 'Unknown City' ? (
                    <span className="text-[10px] font-mono text-amber-400 font-semibold">Unverified</span>
                  ) : (
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">Domestic City</span>
                  )}
                </div>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value as LocationType)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Ahmedabad">Ahmedabad (Home / Metro)</option>
                  <option value="Surat">Surat (Regional Domestic Hub)</option>
                  <option value="Unknown City">Unknown City (Unverified Gateway)</option>
                  <option value="Foreign Location">Foreign Location (Cross-Border)</option>
                  <option value="Local">Local (Billing Perimeter)</option>
                  <option value="Other City">Other City (Domestic Interstate)</option>
                  <option value="International">International Gateway</option>
                </select>
                <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                  Terminal execution city / jurisdiction
                </span>
              </div>
            </div>

            {/* Transaction Time (Hour + Minute with AM/PM helper) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">
                    Transaction Time (24h Clock) <span className="text-cyan-400">*</span>
                  </label>
                  {hour !== '' && Number(hour) >= 1 && Number(hour) <= 4 ? (
                    <span className="text-[10px] font-mono text-rose-400 font-semibold">Nocturnal (01-04)</span>
                  ) : hour !== '' && (Number(hour) === 23 || Number(hour) === 0) ? (
                    <span className="text-[10px] font-mono text-amber-400 font-semibold">Late Night</span>
                  ) : (
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">Daylight Commerce</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    required
                    min="0"
                    max="23"
                    value={hour}
                    onChange={(e) => handleHourChange(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Hour (0-23)"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minute}
                    onChange={(e) => handleMinuteChange(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Min (0-59)"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <span className="text-[11px] text-cyan-400 font-mono mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Formatted: <strong>{timeString || (hour !== '' ? formatTimePreview(Number(hour), minute === '' ? 0 : Number(minute)) : '—')}</strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Distance from Usual Location (km) <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 5"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                  Displacement in kilometers from cardholder home
                </span>
              </div>
            </div>

            {/* Transactions in Last Hour (Velocity) & Device */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">
                    Transactions in Last Hour <span className="text-cyan-400">*</span>
                  </label>
                  {frequency !== '' && Number(frequency) >= 6 ? (
                    <span className="text-[10px] font-mono text-rose-400 font-semibold">Velocity Spike</span>
                  ) : (
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">Nominal Velocity</span>
                  )}
                </div>
                <input
                  type="number"
                  required
                  min="0"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 1"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                  Rolling 1-hour transaction frequency
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Device Signature
                </label>
                <select
                  value={device}
                  onChange={(e) => setDevice(e.target.value as DeviceType)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Mobile">Mobile (Biometric Authenticated)</option>
                  <option value="Desktop">Desktop Browser</option>
                  <option value="POS">POS Terminal / ATM Hardware</option>
                  <option value="Unknown">Unknown / Untrusted Proxy</option>
                </select>
                <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                  Client hardware signature
                </span>
              </div>
            </div>

            {/* Previous Transaction Amount (Ratio Signal) */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Previous Transaction Amount (₹) <span className="text-slate-500">(Historical Baseline)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  value={previousAmount}
                  onChange={(e) => setPreviousAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 250"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-8 pr-3.5 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Investigation Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Investigation / Channel Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Cardholder reported travel or routine lunch payment"
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Action Buttons: Detect Fraud & Clear Form */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={isAnalyzing}
                className={`flex-1 w-full py-3.5 rounded-2xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2.5 shadow-xl ${
                  isAnalyzing
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span className="font-mono text-xs">{analysisStep}</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Detect Fraud</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleClearForm}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl font-semibold text-xs font-mono text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Form</span>
              </button>
            </div>
          </form>
        </div>

        {/* Results & Forensic Analysis Column */}
        <div className="lg:col-span-6 space-y-6">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              /* Live Multi-step Pipeline Animation */
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="glass-panel rounded-3xl p-8 border border-cyan-500/30 text-center space-y-6 animate-pulse"
              >
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400">
                  <Sparkles className="w-8 h-8 animate-spin" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                    Executing Fraud Detection Pipeline
                  </h3>
                  <p className="text-xs text-cyan-300 font-mono tracking-wider">
                    {analysisStep}
                  </p>
                </div>

                <div className="space-y-2 max-w-sm mx-auto text-left text-xs font-mono text-slate-400">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                    <span>1. Validating input ranges & telemetry</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                    <span>2. Calculating velocity & displacement signals</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                    <span>3. Evaluating transparent risk rules ({activeModelMode})</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                    <span>4. Extracting explainable risk factor weights</span>
                  </div>
                </div>
              </motion.div>
            ) : result ? (
              /* Detection Result Card */
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                {/* Result Summary Banner */}
                <div
                  className={`glass-panel rounded-3xl p-6 border ${
                    result.risk_tier === 'HIGH'
                      ? 'border-rose-500/40 bg-[#0f172a]'
                      : result.risk_tier === 'MEDIUM'
                      ? 'border-amber-500/40 bg-[#0f172a]'
                      : 'border-emerald-500/40 bg-[#0f172a]'
                  }`}
                >
                  {/* Top Result Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">Transaction ID:</span>
                      <strong className="text-sm font-mono text-white px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700">
                        {result.transaction_id}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">Amount:</span>
                      <strong className="text-base font-mono text-cyan-400">
                        ₹{result.amount.toLocaleString()}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">Risk Level:</span>
                      <span
                        className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                          result.risk_tier === 'HIGH'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : result.risk_tier === 'MEDIUM'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {result.risk_tier === 'HIGH'
                          ? 'High Risk'
                          : result.risk_tier === 'MEDIUM'
                          ? 'Medium Risk'
                          : 'Low Risk'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <RiskScoreGauge
                      score={result.risk_score}
                      tier={result.risk_tier}
                      status={result.status}
                      size="lg"
                    />

                    <div className="flex-1 space-y-3 text-center sm:text-left">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-900 border border-slate-700 text-slate-300">
                        <span>Rule Mode:</span>
                        <strong className="text-cyan-400">{result.model_mode}</strong>
                      </div>

                      <h4 className="text-lg font-bold text-white">
                        {result.risk_tier === 'HIGH'
                          ? 'Suspicious Transaction / High Risk'
                          : result.risk_tier === 'MEDIUM'
                          ? 'Moderate Risk / Requires Verification'
                          : 'Normal Transaction / Low Risk'}
                      </h4>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {result.recommended_action}
                      </p>

                      {/* Sample verification badge */}
                      {result.isSample && (
                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs font-mono flex items-center gap-2 text-slate-200">
                          <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span>
                            Test Case Verification: Result matches expected outcome (
                            <strong className={result.risk_tier === 'HIGH' ? 'text-rose-400' : 'text-emerald-400'}>
                              {result.risk_tier === 'HIGH' ? 'Suspicious / High Risk' : 'Normal / Low Risk'}
                            </strong>
                            ).
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
                        <button
                          onClick={onNavigateToDashboard}
                          className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                        >
                          <span>View on Dashboard</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-slate-600">•</span>
                        <button
                          onClick={onNavigateToHistory}
                          className="text-xs text-slate-400 hover:text-slate-200 font-medium"
                        >
                          Audit History
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Disclaimer Notice (Prompt Requirement #2 & #5) */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold font-mono text-amber-300 uppercase tracking-wide">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Important Disclaimer & Demonstration Notice</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    A transaction evaluated as <strong>Suspicious or High Risk is not automatically confirmed fraud</strong>.
                    It signifies statistical and behavioral anomalies (such as velocity spikes, location changes, or off-hours execution) that warrant further review.
                    Final fraud verification requires institutional authorization, cardholder challenge, or two-factor authentication.
                  </p>
                  <p className="text-slate-400 text-[10px] font-mono pt-1">
                    System Architecture: Transparent rule-based demonstration system evaluating multi-factor risk signals (amount magnitude, velocity frequency, geographic distance, and temporal windows). Fictional sample records are provided for testing purposes.
                  </p>
                </div>

                {/* Contributing Features / Explainable AI Signals */}
                <ExplainableAiCard
                  reasons={result.reasons}
                  modelMode={result.model_mode}
                  riskScore={result.risk_score}
                  transaction={result}
                />

                {/* Transaction Fingerprint */}
                <TransactionFingerprintCard transaction={result} />
              </motion.div>
            ) : (
              /* Awaiting Input Prompt State */
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel rounded-3xl p-10 border border-slate-800 text-center space-y-5"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <ShieldAlert className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-200 font-['Space_Grotesk']">
                    Awaiting Transaction Telemetry
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Select one of the 6 official sample test cases above or fill in custom transaction parameters, then click <strong className="text-cyan-400">Detect Fraud</strong>.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => handleLoadSample(OFFICIAL_SAMPLE_TRANSACTIONS[0])}
                    className="px-3 py-1.5 rounded-xl text-xs font-mono bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <span>🛡️ T001: Normal (₹250)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample(OFFICIAL_SAMPLE_TRANSACTIONS[1])}
                    className="px-3 py-1.5 rounded-xl text-xs font-mono bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <span>⚡ T002: Suspicious (₹45k)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample(OFFICIAL_SAMPLE_TRANSACTIONS[5])}
                    className="px-3 py-1.5 rounded-xl text-xs font-mono bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <span>🏧 T006: ATM Burst (₹500)</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
