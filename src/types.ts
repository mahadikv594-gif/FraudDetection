/**
 * FraudShield AI - Core Type Definitions
 * Strict TypeScript models for transaction risk intelligence & user authentication
 */

export type TransactionCategory =
  | 'Groceries'
  | 'Shopping'
  | 'Online Shopping'
  | 'Electronics'
  | 'Travel'
  | 'Food Payment'
  | 'ATM Withdrawal'
  | 'International Purchase'
  | 'International'
  | 'Other';

export type DeviceType = 'Mobile' | 'Desktop' | 'POS' | 'Unknown';

export type LocationType =
  | 'Local'
  | 'Ahmedabad'
  | 'Surat'
  | 'Unknown City'
  | 'Foreign Location'
  | 'Other City'
  | 'International';

export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH';

export type PredictionStatus = 'LEGITIMATE' | 'REQUIRES REVIEW' | 'POTENTIAL FRAUD';

export type ModelMode = 'ML_RANDOM_FOREST' | 'ML_LOGISTIC_REGRESSION' | 'DEMO_MODE';

export type UserRole =
  | 'Risk Analyst'
  | 'Fraud Investigator'
  | 'Compliance Officer'
  | 'FinTech Engineer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  avatarSeed: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token?: string;
}

export interface TransactionInput {
  transaction_id?: string;
  amount: number;
  hour: number;
  minute?: number;
  time?: string;
  category: TransactionCategory;
  device: DeviceType;
  location: LocationType;
  frequency: number;
  distance: number;
  previous_amount: number;
  notes?: string;
  isSample?: boolean;
  sampleName?: string;
}

export interface ExplainableSignal {
  feature: string;
  name: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'BENIGN';
  impact_score: number; // positive increases risk, negative decreases
  description: string;
  category: 'VELOCITY' | 'AMOUNT' | 'LOCATION' | 'DEVICE' | 'TEMPORAL';
}

export interface TransactionRecord extends TransactionInput {
  id: string;
  userId: string; // Isolated per authenticated user
  transaction_id: string;
  risk_score: number; // 0 to 100
  risk_tier: RiskTier;
  status: PredictionStatus;
  reasons: ExplainableSignal[];
  recommended_action: string;
  model_mode: ModelMode;
  created_at: string;
  confidence_prob: number; // 0.0 - 1.0
  hash: string;
  isSimulated?: boolean;
  isSample?: boolean;
  sampleName?: string;
}

export interface RealTimeFraudAlert {
  id: string;
  transactionId: string;
  amount: number;
  riskScore: number;
  status: PredictionStatus;
  reason: string;
  timestamp: string;
  read: boolean;
  category: TransactionCategory;
  location: LocationType;
}

export interface DashboardStats {
  total_transactions: number;
  potential_fraud: number;
  review: number;
  legitimate: number;
  total_amount: number;
  avg_risk_score: number;
  fraud_rate_pct: number;
  fraud_alerts_count: number;
  status_distribution: {
    legitimate: number;
    review: number;
    potential_fraud: number;
  };
  category_distribution: Record<string, { count: number; fraud_count: number; total_amount: number }>;
  risk_distribution: {
    low: number;     // 0-39
    medium: number;  // 40-69
    high: number;    // 70-100
  };
  activity: Array<{
    date: string;
    timestamp: string;
    count: number;
    fraud_count: number;
    amount: number;
  }>;
  hourly_risk_matrix: Array<{ hour: number; avg_risk: number; volume: number }>;
}

export interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  badge: string;
  badgeColor: 'cyan' | 'red' | 'amber' | 'emerald';
  data: TransactionInput;
  expectedOutcome: {
    tier: RiskTier;
    status: PredictionStatus;
    expectedScoreRange: string;
    keyFlags: string[];
  };
}

export interface ModelMetrics {
  name: string;
  algorithm: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  confusion_matrix: {
    true_positive: number;
    false_positive: number;
    true_negative: number;
    false_negative: number;
  };
  training_samples: number;
  features_count: number;
  feature_importances: Array<{ feature: string; importance: number; description: string }>;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
}
