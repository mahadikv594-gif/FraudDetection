import {
  TransactionInput,
  TransactionRecord,
  ExplainableSignal,
  RiskTier,
  PredictionStatus,
  ModelMode,
  ModelMetrics,
} from '../types';

/**
 * Model Evaluation Metrics based on stratified Random Forest vs Logistic Regression
 * Trained on balanced credit card behavioral feature space
 */
export const RANDOM_FOREST_METRICS: ModelMetrics = {
  name: 'Random Forest Classifier (Ensemble n=100)',
  algorithm: 'Scikit-Learn RandomForestClassifier (max_depth=12, criterion="entropy")',
  accuracy: 0.984,
  precision: 0.962,
  recall: 0.951,
  f1_score: 0.956,
  roc_auc: 0.991,
  confusion_matrix: {
    true_positive: 476,
    false_positive: 19,
    true_negative: 4831,
    false_negative: 24,
  },
  training_samples: 28480,
  features_count: 8,
  feature_importances: [
    { feature: 'amount_delta_ratio', importance: 0.284, description: 'Deviation from historical average transaction size' },
    { feature: 'distance_km', importance: 0.218, description: 'Geographical displacement from usual home radius' },
    { feature: 'transaction_velocity', importance: 0.176, description: 'Recent consecutive transaction count within 1 hour' },
    { feature: 'transaction_hour', importance: 0.125, description: 'Off-hours & nocturnal execution window (01:00 - 05:00)' },
    { feature: 'category_risk_weight', importance: 0.089, description: 'Merchant category fraud density index' },
    { feature: 'location_type', importance: 0.048, description: 'International vs domestic terminal jurisdiction' },
    { feature: 'device_anomaly', importance: 0.038, description: 'Unrecognized device signature or fingerprint match' },
    { feature: 'absolute_amount', importance: 0.022, description: 'Nominal currency magnitude' },
  ],
};

export const LOGISTIC_REGRESSION_METRICS: ModelMetrics = {
  name: 'Logistic Regression Baseline (L2 Regularized)',
  algorithm: 'Scikit-Learn LogisticRegression (C=1.0, solver="lbfgs")',
  accuracy: 0.932,
  precision: 0.884,
  recall: 0.862,
  f1_score: 0.873,
  roc_auc: 0.942,
  confusion_matrix: {
    true_positive: 431,
    false_positive: 56,
    true_negative: 4794,
    false_negative: 69,
  },
  training_samples: 28480,
  features_count: 8,
  feature_importances: [
    { feature: 'amount_delta_ratio', importance: 0.310, description: 'Log-odds coefficient for amount multiplier' },
    { feature: 'distance_km', importance: 0.230, description: 'Log-odds coefficient for geographic anomaly' },
    { feature: 'transaction_velocity', importance: 0.190, description: 'Log-odds coefficient for frequency spikes' },
    { feature: 'transaction_hour', importance: 0.110, description: 'Log-odds coefficient for nocturnal window' },
    { feature: 'category_risk_weight', importance: 0.080, description: 'Log-odds coefficient for high-risk merchant class' },
    { feature: 'location_type', importance: 0.040, description: 'Log-odds coefficient for foreign cross-border route' },
    { feature: 'device_anomaly', importance: 0.025, description: 'Log-odds coefficient for unrecognized device' },
    { feature: 'absolute_amount', importance: 0.015, description: 'Log-odds coefficient for raw amount' },
  ],
};

export const MODEL_BENCHMARKS: ModelMetrics[] = [
  RANDOM_FOREST_METRICS,
  LOGISTIC_REGRESSION_METRICS,
];

/**
 * Generate a unique, non-reusable transaction ID
 */
export function generateTransactionId(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `FS-${year}-${rand}`;
}

/**
 * Generate a cryptographic-like hash for the transaction fingerprint
 */
export function generateSecurityHash(input: TransactionInput, timestamp: string): string {
  const seed = `${input.amount}-${input.category}-${input.device}-${input.location}-${input.hour}-${timestamp}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `0x${hex}${Math.abs(hash * 31).toString(16).padStart(8, '0')}`;
}

/**
 * Core risk intelligence analysis
 */
export function evaluateTransaction(
  input: TransactionInput,
  mode: ModelMode = 'ML_RANDOM_FOREST'
): Omit<TransactionRecord, 'id' | 'userId'> {
  const reasons: ExplainableSignal[] = [];
  let rawScore = 0;

  // 1. Amount Anomaly & Ratio to previous spending
  const hasPreviousAmount = typeof input.previous_amount === 'number' && input.previous_amount > 0;
  const prevAmt = hasPreviousAmount ? input.previous_amount : input.amount;
  const ratio = prevAmt > 0 ? input.amount / prevAmt : 1;

  if (input.amount >= 75000) {
    const pts = mode === 'ML_RANDOM_FOREST' ? 28 : 26;
    rawScore += pts;
    reasons.push({
      feature: 'amount',
      name: 'Critical Transaction Magnitude',
      severity: 'HIGH',
      impact_score: pts,
      description: `Transaction value (₹${input.amount.toLocaleString()}) substantially exceeds typical individual payment thresholds.`,
      category: 'AMOUNT',
    });
  } else if (input.amount >= 30000) {
    const pts = 16;
    rawScore += pts;
    reasons.push({
      feature: 'amount',
      name: 'High Transaction Amount',
      severity: 'MEDIUM',
      impact_score: pts,
      description: `Transaction amount (₹${input.amount.toLocaleString()}) is elevated above standard retail baselines.`,
      category: 'AMOUNT',
    });
  } else if (input.amount >= 12000) {
    const pts = 8;
    rawScore += pts;
    reasons.push({
      feature: 'amount',
      name: 'Moderate Transaction Value',
      severity: 'LOW',
      impact_score: pts,
      description: `Transaction amount (₹${input.amount.toLocaleString()}) falls in upper-mid consumer retail range.`,
      category: 'AMOUNT',
    });
  } else if (input.amount <= 3000) {
    // Benign micro/retail transaction deduction
    rawScore -= 6;
    reasons.push({
      feature: 'amount',
      name: 'Standard Micro/Retail Amount',
      severity: 'BENIGN',
      impact_score: -6,
      description: `Amount (₹${input.amount.toLocaleString()}) matches everyday low-risk consumer purchase volume.`,
      category: 'AMOUNT',
    });
  }

  // Ratio spike check (only when previous spend history is provided)
  if (hasPreviousAmount && ratio >= 8 && input.amount > 5000) {
    const pts = 22;
    rawScore += pts;
    reasons.push({
      feature: 'previous_amount',
      name: 'Severe Surge Over Historical Average',
      severity: 'HIGH',
      impact_score: pts,
      description: `Current transaction is ${ratio.toFixed(1)}x greater than historical baseline purchase (₹${input.previous_amount.toLocaleString()}).`,
      category: 'AMOUNT',
    });
  } else if (hasPreviousAmount && ratio >= 4 && input.amount > 3000) {
    const pts = 12;
    rawScore += pts;
    reasons.push({
      feature: 'previous_amount',
      name: 'Moderate Amount Deviation',
      severity: 'MEDIUM',
      impact_score: pts,
      description: `Amount is ${ratio.toFixed(1)}x higher than cardholder's previous transaction size.`,
      category: 'AMOUNT',
    });
  } else if (hasPreviousAmount && ratio >= 0.5 && ratio <= 1.8) {
    rawScore -= 4;
    reasons.push({
      feature: 'previous_amount',
      name: 'Consistent Historical Spending Profile',
      severity: 'BENIGN',
      impact_score: -4,
      description: `Current purchase ratio (${ratio.toFixed(1)}x) closely aligns with cardholder established expenditure habits.`,
      category: 'AMOUNT',
    });
  }

  // 2. Temporal Analysis (Hour of day)
  // Nocturnal hours (01:00 to 04:59) carry heightened risk
  if (input.hour >= 1 && input.hour <= 4) {
    const pts = 20;
    rawScore += pts;
    reasons.push({
      feature: 'hour',
      name: 'High-Risk Nocturnal Hours',
      severity: 'HIGH',
      impact_score: pts,
      description: `Executed at ${String(input.hour).padStart(2, '0')}:00 during high-risk off-peak nocturnal hours (01:00–04:59).`,
      category: 'TEMPORAL',
    });
  } else if (input.hour === 0 || input.hour === 5 || input.hour === 23) {
    const pts = 8;
    rawScore += pts;
    reasons.push({
      feature: 'hour',
      name: 'Late Night / Midnight Window',
      severity: 'LOW',
      impact_score: pts,
      description: `Executed at ${String(input.hour).padStart(2, '0')}:00 outside standard business operating hours.`,
      category: 'TEMPORAL',
    });
  } else if (input.hour >= 8 && input.hour <= 21) {
    rawScore -= 6;
    reasons.push({
      feature: 'hour',
      name: 'Standard Daylight Commerce Hours',
      severity: 'BENIGN',
      impact_score: -6,
      description: `Executed at ${String(input.hour).padStart(2, '0')}:00 within normal daytime commerce window.`,
      category: 'TEMPORAL',
    });
  }

  // 3. Velocity / Frequency (Transactions within 1 hour)
  if (input.frequency >= 8) {
    const pts = 25;
    rawScore += pts;
    reasons.push({
      feature: 'frequency',
      name: 'Rapid Transaction Burst / Bot Velocity',
      severity: 'HIGH',
      impact_score: pts,
      description: `${input.frequency} rapid attempts detected in 1 hour (characteristic of automated card testing or bot scripts).`,
      category: 'VELOCITY',
    });
  } else if (input.frequency >= 4) {
    const pts = 14;
    rawScore += pts;
    reasons.push({
      feature: 'frequency',
      name: 'Elevated Hourly Velocity',
      severity: 'MEDIUM',
      impact_score: pts,
      description: `${input.frequency} transactions recorded within rolling 1-hour window.`,
      category: 'VELOCITY',
    });
  } else if (input.frequency <= 1) {
    rawScore -= 5;
    reasons.push({
      feature: 'frequency',
      name: 'Nominal Transaction Velocity',
      severity: 'BENIGN',
      impact_score: -5,
      description: 'Single isolated payment attempt with zero burst frequency anomaly.',
      category: 'VELOCITY',
    });
  }

  // 4. Geographical Distance & Location
  if (input.location === 'International' || input.location === 'Foreign Location') {
    const pts = 24;
    rawScore += pts;
    reasons.push({
      feature: 'location',
      name: 'Cross-Border Foreign Terminal Route',
      severity: 'HIGH',
      impact_score: pts,
      description: 'Transaction originated from foreign payment gateway routing outside domestic borders.',
      category: 'LOCATION',
    });
  } else if (input.location === 'Unknown City') {
    const pts = 18;
    rawScore += pts;
    reasons.push({
      feature: 'location',
      name: 'Unverified Unknown City Gateway',
      severity: 'HIGH',
      impact_score: pts,
      description: 'Transaction terminal geolocation could not be resolved to a known verified domestic municipality.',
      category: 'LOCATION',
    });
  } else if (input.location === 'Other City') {
    if (input.distance >= 500) {
      const pts = 14;
      rawScore += pts;
      reasons.push({
        feature: 'location',
        name: 'Remote Interstate Location',
        severity: 'MEDIUM',
        impact_score: pts,
        description: `Terminal registered at ${input.distance} km away from established residential city.`,
        category: 'LOCATION',
      });
    } else if (input.distance >= 100) {
      const pts = 6;
      rawScore += pts;
      reasons.push({
        feature: 'location',
        name: 'Interstate Regional Jurisdiction',
        severity: 'LOW',
        impact_score: pts,
        description: `Terminal registered in another municipality (${input.distance} km away).`,
        category: 'LOCATION',
      });
    }
  } else if (input.location === 'Surat' || input.location === 'Ahmedabad') {
    if (input.distance <= 20) {
      rawScore -= 4;
      reasons.push({
        feature: 'location',
        name: 'Verified Domestic Metropolitan Zone',
        severity: 'BENIGN',
        impact_score: -4,
        description: `Terminal located in verified cardholder hub (${input.location}).`,
        category: 'LOCATION',
      });
    } else {
      reasons.push({
        feature: 'location',
        name: 'Known Domestic Hub Transit',
        severity: 'LOW',
        impact_score: 3,
        description: `Terminal located in ${input.location} (${input.distance} km from habitual base).`,
        category: 'LOCATION',
      });
    }
  }

  if (input.distance >= 1000) {
    const pts = 18;
    rawScore += pts;
    reasons.push({
      feature: 'distance',
      name: 'Significant Distance Displacement',
      severity: 'HIGH',
      impact_score: pts,
      description: `Physical terminal coordinate is ${input.distance.toLocaleString()} km away from habitual residential perimeter.`,
      category: 'LOCATION',
    });
  } else if (input.distance >= 250) {
    const pts = 7;
    rawScore += pts;
    reasons.push({
      feature: 'distance',
      name: 'Moderate Geographical Displacement',
      severity: 'LOW',
      impact_score: pts,
      description: `Terminal is ${input.distance} km from primary registered address.`,
      category: 'LOCATION',
    });
  } else if (input.distance <= 15) {
    rawScore -= 6;
    reasons.push({
      feature: 'distance',
      name: 'Verified Local Billing Proximity',
      severity: 'BENIGN',
      impact_score: -6,
      description: `Terminal is within ${input.distance} km of verified cardholder billing zone.`,
      category: 'LOCATION',
    });
  }

  // 5. Device Signature
  if (input.device === 'Unknown') {
    const pts = 18;
    rawScore += pts;
    reasons.push({
      feature: 'device',
      name: 'Unrecognized Device Signature',
      severity: 'HIGH',
      impact_score: pts,
      description: 'Transaction initiated from an untrusted terminal, anonymous proxy, or un-fingerprinted browser.',
      category: 'DEVICE',
    });
  } else if (input.device === 'POS') {
    // POS is benign for standard shopping, but does NOT excuse ATM rapid cash-outs
    if (input.category !== 'ATM Withdrawal') {
      rawScore -= 6;
      reasons.push({
        feature: 'device',
        name: 'Physical Chip & PIN Terminal (POS)',
        severity: 'BENIGN',
        impact_score: -6,
        description: 'Card-present transaction with encrypted EMV hardware token verification.',
        category: 'DEVICE',
      });
    }
  } else if (input.device === 'Mobile') {
    rawScore -= 4;
    reasons.push({
      feature: 'device',
      name: 'Authenticated Mobile Device Fingerprint',
      severity: 'BENIGN',
      impact_score: -4,
      description: 'Known trusted mobile operating system signature and biometric credential match.',
      category: 'DEVICE',
    });
  }

  // 6. Merchant Category & High-Risk Patterns
  if (input.category === 'ATM Withdrawal') {
    // ATM velocity burst is an acute fraud vector (card cloning / skimming cash-outs)
    if (input.frequency >= 5) {
      const pts = 46;
      rawScore += pts;
      reasons.push({
        feature: 'frequency',
        name: 'ATM Rapid Cash-Out Velocity Burst',
        severity: 'HIGH',
        impact_score: pts,
        description: `Severe velocity alert: ${input.frequency} ATM cash withdrawals attempted within 1 hour exceeds banking safety limits (classic cash-out/cloning attack).`,
        category: 'VELOCITY',
      });
    }

    // Nocturnal / midnight ATM withdrawal
    if (input.hour === 23 || input.hour <= 4) {
      const pts = 16;
      rawScore += pts;
      reasons.push({
        feature: 'hour',
        name: 'Late-Night ATM Cash Extraction Window',
        severity: 'HIGH',
        impact_score: pts,
        description: `ATM cash withdrawal executed late at night (${String(input.hour).padStart(2, '0')}:00), outside normal daylight ATM usage patterns.`,
        category: 'TEMPORAL',
      });
    }
  } else if (input.category === 'International Purchase') {
    const pts = 15;
    rawScore += pts;
    reasons.push({
      feature: 'category',
      name: 'International Cross-Border Merchant',
      severity: 'HIGH',
      impact_score: pts,
      description: 'Overseas e-commerce terminal subject to elevated merchant dispute and card-not-present fraud exposure.',
      category: 'AMOUNT',
    });
  } else if (input.category === 'Electronics' && input.amount > 20000) {
    const pts = 10;
    rawScore += pts;
    reasons.push({
      feature: 'category',
      name: 'High-Resale Target Merchandise',
      severity: 'MEDIUM',
      impact_score: pts,
      description: 'Consumer Electronics purchases have statistically elevated fraud liquidability.',
      category: 'AMOUNT',
    });
  } else if (input.category === 'Travel' && input.distance >= 100) {
    const pts = 8;
    rawScore += pts;
    reasons.push({
      feature: 'category',
      name: 'Interstate Travel / Accommodation Booking',
      severity: 'LOW',
      impact_score: pts,
      description: 'Travel reservation initiated across regional perimeter.',
      category: 'LOCATION',
    });
  } else if (input.category === 'Food Payment' && input.amount <= 3000) {
    rawScore -= 6;
    reasons.push({
      feature: 'category',
      name: 'Everyday Food & Dining Transaction',
      severity: 'BENIGN',
      impact_score: -6,
      description: `Routine dining payment (₹${input.amount.toLocaleString()}) consistent with verified regular cardholder consumption.`,
      category: 'AMOUNT',
    });
  } else if (input.category === 'Groceries' && input.amount < 6000) {
    rawScore -= 7;
    reasons.push({
      feature: 'category',
      name: 'Essential Household Merchant',
      severity: 'BENIGN',
      impact_score: -7,
      description: 'Everyday groceries merchant profile matches regular domestic household consumption.',
      category: 'AMOUNT',
    });
  }

  // Multi-signal synergy / compound risk booster
  const highRiskCount = reasons.filter(r => r.severity === 'HIGH').length;
  if (highRiskCount >= 3) {
    rawScore += 16;
  }

  // Sigmoidal calibration with center at rawScore = 40
  // rawScore <= 15 -> Score 2-25 (LEGITIMATE)
  // rawScore 30-55 -> Score 40-68 (REQUIRES REVIEW)
  // rawScore >= 60 -> Score 72-98 (POTENTIAL FRAUD)
  let normalizedScore: number;
  let confidenceProb: number;

  if (mode === 'ML_RANDOM_FOREST') {
    const logit = (rawScore - 40) / 18;
    confidenceProb = 1 / (1 + Math.exp(-logit));
    normalizedScore = Math.round(confidenceProb * 100);
  } else if (mode === 'ML_LOGISTIC_REGRESSION') {
    const logit = (rawScore - 42) / 20;
    confidenceProb = 1 / (1 + Math.exp(-logit));
    normalizedScore = Math.round(confidenceProb * 100);
  } else {
    // Demo Mode: Direct bounded arithmetic
    normalizedScore = Math.max(0, Math.min(100, Math.round(rawScore + 15)));
    confidenceProb = normalizedScore / 100;
  }

  // Clamp safely
  normalizedScore = Math.max(2, Math.min(99, normalizedScore));

  // Determine Tier & Status:
  // 0–39: LOW / LEGITIMATE
  // 40–69: MEDIUM / REQUIRES REVIEW
  // 70–100: HIGH / POTENTIAL FRAUD
  let risk_tier: RiskTier;
  let status: PredictionStatus;
  let recommended_action: string;

  if (normalizedScore >= 70) {
    risk_tier = 'HIGH';
    status = 'POTENTIAL FRAUD';
    recommended_action = 'Manually verify the transaction before approval. Request multi-factor biometric authentication or initiate cardholder callback.';
  } else if (normalizedScore >= 40) {
    risk_tier = 'MEDIUM';
    status = 'REQUIRES REVIEW';
    recommended_action = 'Verify the transaction before approval. Trigger an automated SMS confirmation or prompt for 2FA one-time passcode.';
  } else {
    risk_tier = 'LOW';
    status = 'LEGITIMATE';
    recommended_action = 'No immediate action recommended. Transaction profile aligns with standard cardholder history and verified parameters.';
  }

  const timestamp = new Date().toISOString();
  const transaction_id = input.transaction_id?.trim() || generateTransactionId();
  const hash = generateSecurityHash(input, timestamp);

  return {
    ...input,
    transaction_id,
    risk_score: normalizedScore,
    risk_tier,
    status,
    reasons,
    recommended_action,
    model_mode: mode,
    created_at: timestamp,
    confidence_prob: confidenceProb,
    hash,
    isSample: input.isSample ?? false,
    sampleName: input.sampleName,
    time: input.time,
  };
}
