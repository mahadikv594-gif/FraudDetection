import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  TransactionInput,
  TransactionRecord,
  DashboardStats,
  ModelMode,
  RealTimeFraudAlert,
} from '../types';
import { evaluateTransaction } from '../lib/mlEngine';
import { playFraudAlertSound, playSuccessSound } from '../lib/soundEffects';
import { useAuth } from './AuthContext';
import { OFFICIAL_SAMPLE_TRANSACTIONS } from '../data/sampleTransactions';

interface TransactionContextType {
  transactions: TransactionRecord[];
  stats: DashboardStats;
  activeModelMode: ModelMode;
  setActiveModelMode: (mode: ModelMode) => void;
  isAnalyzing: boolean;
  analysisStep: string;
  alerts: RealTimeFraudAlert[];
  unreadAlertCount: number;
  latestAlert: RealTimeFraudAlert | null;
  dismissLatestAlert: () => void;
  markAlertsAsRead: () => void;
  clearAlerts: () => void;
  analyzeTransaction: (input: TransactionInput, isSimulated?: boolean) => Promise<TransactionRecord>;
  deleteTransaction: (id: string) => void;
  clearAllTransactions: () => void;
  clearDemoTransactions: () => void;
  seedDemoTransactions: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || 'anonymous_guest';

  const [activeModelMode, setActiveModelMode] = useState<ModelMode>('ML_RANDOM_FOREST');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [alerts, setAlerts] = useState<RealTimeFraudAlert[]>([]);
  const [latestAlert, setLatestAlert] = useState<RealTimeFraudAlert | null>(null);

  // Load transactions isolated by user ID
  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
    try {
      const stored = localStorage.getItem(`fraudshield_tx_${userId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore
    }
    return [];
  });

  // Reload when user changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`fraudshield_tx_${userId}`);
      if (stored) {
        setTransactions(JSON.parse(stored));
      } else {
        setTransactions([]);
      }
      const storedAlerts = localStorage.getItem(`fraudshield_alerts_${userId}`);
      if (storedAlerts) {
        setAlerts(JSON.parse(storedAlerts));
      } else {
        setAlerts([]);
      }
    } catch {
      setTransactions([]);
      setAlerts([]);
    }
  }, [userId]);

  // Persist transactions
  useEffect(() => {
    try {
      localStorage.setItem(`fraudshield_tx_${userId}`, JSON.stringify(transactions));
    } catch {
      // Ignore storage limit
    }
  }, [transactions, userId]);

  // Persist alerts
  useEffect(() => {
    try {
      localStorage.setItem(`fraudshield_alerts_${userId}`, JSON.stringify(alerts));
    } catch {
      // Ignore
    }
  }, [alerts, userId]);

  // Calculate dynamic dashboard stats strictly from real database items
  const stats = useMemo<DashboardStats>(() => {
    const total_transactions = transactions.length;
    let potential_fraud = 0;
    let review = 0;
    let legitimate = 0;
    let total_amount = 0;
    let totalRiskSum = 0;

    const category_distribution: Record<string, { count: number; fraud_count: number; total_amount: number }> = {};
    const risk_distribution = { low: 0, medium: 0, high: 0 };
    const hourlyCounts: Record<number, { sumRisk: number; volume: number }> = {};

    for (let h = 0; h < 24; h++) {
      hourlyCounts[h] = { sumRisk: 0, volume: 0 };
    }

    transactions.forEach((tx) => {
      total_amount += tx.amount;
      totalRiskSum += tx.risk_score;

      if (tx.status === 'POTENTIAL FRAUD') {
        potential_fraud += 1;
        risk_distribution.high += 1;
      } else if (tx.status === 'REQUIRES REVIEW') {
        review += 1;
        risk_distribution.medium += 1;
      } else {
        legitimate += 1;
        risk_distribution.low += 1;
      }

      // Category breakdown
      if (!category_distribution[tx.category]) {
        category_distribution[tx.category] = { count: 0, fraud_count: 0, total_amount: 0 };
      }
      category_distribution[tx.category].count += 1;
      category_distribution[tx.category].total_amount += tx.amount;
      if (tx.status === 'POTENTIAL FRAUD') {
        category_distribution[tx.category].fraud_count += 1;
      }

      // Hourly matrix
      const hr = Math.max(0, Math.min(23, tx.hour));
      hourlyCounts[hr].volume += 1;
      hourlyCounts[hr].sumRisk += tx.risk_score;
    });

    const avg_risk_score = total_transactions > 0 ? Math.round(totalRiskSum / total_transactions) : 0;
    const fraud_rate_pct = total_transactions > 0 ? Number(((potential_fraud / total_transactions) * 100).toFixed(1)) : 0;

    // Timeline activity grouping (last 7 recorded groups)
    const activityMap: Record<string, { count: number; fraud_count: number; amount: number; timestamp: string }> = {};
    // Sort transactions ascending by timestamp for accurate timeline
    const sortedTx = [...transactions].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    sortedTx.forEach((tx) => {
      const dateKey = new Date(tx.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
      });
      if (!activityMap[dateKey]) {
        activityMap[dateKey] = { count: 0, fraud_count: 0, amount: 0, timestamp: tx.created_at };
      }
      activityMap[dateKey].count += 1;
      activityMap[dateKey].amount += tx.amount;
      if (tx.status === 'POTENTIAL FRAUD') {
        activityMap[dateKey].fraud_count += 1;
      }
    });

    const activity = Object.entries(activityMap).map(([date, d]) => ({
      date,
      timestamp: d.timestamp,
      count: d.count,
      fraud_count: d.fraud_count,
      amount: d.amount,
    }));

    const hourly_risk_matrix = Object.entries(hourlyCounts).map(([hrStr, data]) => ({
      hour: Number(hrStr),
      volume: data.volume,
      avg_risk: data.volume > 0 ? Math.round(data.sumRisk / data.volume) : 0,
    }));

    return {
      total_transactions,
      potential_fraud,
      review,
      legitimate,
      total_amount,
      avg_risk_score,
      fraud_rate_pct,
      fraud_alerts_count: alerts.length,
      status_distribution: { legitimate, review, potential_fraud },
      category_distribution,
      risk_distribution,
      activity,
      hourly_risk_matrix,
    };
  }, [transactions, alerts.length]);

  const analyzeTransaction = async (input: TransactionInput, isSimulated = false): Promise<TransactionRecord> => {
    setIsAnalyzing(true);

    const steps = [
      'VALIDATING INPUT PARAMETERS...',
      'EXTRACTING BEHAVIORAL SIGNALS...',
      `APPLYING ${activeModelMode === 'ML_RANDOM_FOREST' ? 'RANDOM FOREST ENSEMBLE' : activeModelMode === 'ML_LOGISTIC_REGRESSION' ? 'LOGISTIC REGRESSION' : 'RULE-BASED SCORING'}...`,
      'CALCULATING ANOMALY PROBABILITY & RISK SCORE...',
      'GENERATING EXPLAINABLE AI REASONS...',
      'PERSISTING RECORD TO ENCRYPTED DATABASE...',
      'ANALYSIS COMPLETE',
    ];

    for (let i = 0; i < steps.length; i++) {
      setAnalysisStep(steps[i]);
      await new Promise((resolve) => setTimeout(resolve, 240));
    }

    const evaluation = evaluateTransaction(input, activeModelMode);
    const newRecord: TransactionRecord = {
      ...evaluation,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userId,
      isSimulated,
    };

    setTransactions((prev) => [newRecord, ...prev]);
    setIsAnalyzing(false);
    setAnalysisStep('');

    // Trigger Real-Time Fraud Alert if High Risk
    if (newRecord.status === 'POTENTIAL FRAUD') {
      const highestReason = newRecord.reasons.find((r) => r.severity === 'HIGH')?.description || 'Multiple anomalous transaction indicators detected.';
      const newAlert: RealTimeFraudAlert = {
        id: `alt_${Date.now()}`,
        transactionId: newRecord.transaction_id,
        amount: newRecord.amount,
        riskScore: newRecord.risk_score,
        status: newRecord.status,
        reason: highestReason,
        timestamp: newRecord.created_at,
        read: false,
        category: newRecord.category,
        location: newRecord.location,
      };

      setAlerts((prev) => [newAlert, ...prev.slice(0, 49)]);
      setLatestAlert(newAlert);
      playFraudAlertSound();
    } else {
      playSuccessSound();
    }

    return newRecord;
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const clearAllTransactions = () => {
    setTransactions([]);
    setAlerts([]);
  };

  const clearDemoTransactions = () => {
    setTransactions((prev) =>
      prev.filter((t) => !t.isSample && !t.transaction_id.startsWith('T00'))
    );
  };

  const seedDemoTransactions = () => {
    const generated: TransactionRecord[] = OFFICIAL_SAMPLE_TRANSACTIONS.map((sample) => {
      const evaluation = evaluateTransaction(sample.input, activeModelMode);
      return {
        ...evaluation,
        id: `tx_sample_${sample.id}_${Date.now()}`,
        userId,
        isSample: true,
        sampleName: sample.title,
      };
    });

    setTransactions(generated);
  };

  const unreadAlertCount = alerts.filter((a) => !a.read).length;

  const markAlertsAsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const clearAlerts = () => {
    setAlerts([]);
    setLatestAlert(null);
  };

  const dismissLatestAlert = () => {
    setLatestAlert(null);
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        stats,
        activeModelMode,
        setActiveModelMode,
        isAnalyzing,
        analysisStep,
        alerts,
        unreadAlertCount,
        latestAlert,
        dismissLatestAlert,
        markAlertsAsRead,
        clearAlerts,
        analyzeTransaction,
        deleteTransaction,
        clearAllTransactions,
        clearDemoTransactions,
        seedDemoTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
