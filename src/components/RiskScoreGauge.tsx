import React from 'react';
import { motion } from 'motion/react';
import { RiskTier, PredictionStatus } from '../types';
import { AnimatedCounter } from './AnimatedCounter';

interface RiskScoreGaugeProps {
  score: number;
  tier: RiskTier;
  status: PredictionStatus;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const RiskScoreGauge: React.FC<RiskScoreGaugeProps> = ({
  score,
  tier,
  status,
  size = 'md',
}) => {
  const radius = size === 'sm' ? 38 : size === 'lg' ? 80 : 58;
  const strokeWidth = size === 'sm' ? 7 : size === 'lg' ? 12 : 9;
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = '#10b981'; // green
  let glowClass = 'glow-safe';
  let badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

  if (tier === 'HIGH') {
    strokeColor = '#ef4444'; // red
    glowClass = 'glow-danger';
    badgeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  } else if (tier === 'MEDIUM') {
    strokeColor = '#f59e0b'; // amber
    glowClass = 'glow-amber';
    badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  }

  const dimension = radius * 2 + 20;

  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 140 }}
      className="flex flex-col items-center justify-center text-center relative"
    >
      <div className={`relative flex items-center justify-center rounded-full p-2 ${glowClass}`}>
        {/* Animated outer pulsing ring */}
        <motion.div
          animate={{
            scale: [1, 1.06, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full"
          style={{
            border: `1px solid ${strokeColor}40`,
            boxShadow: `0 0 20px ${strokeColor}30`,
          }}
        />

        <svg
          height={dimension}
          width={dimension}
          className="transform -rotate-90 transition-all duration-700 ease-out"
        >
          {/* Background track circle */}
          <circle
            stroke="rgba(255, 255, 255, 0.08)"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={dimension / 2}
            cy={dimension / 2}
          />

          {/* Animated score stroke */}
          <motion.circle
            stroke={strokeColor}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={dimension / 2}
            cy={dimension / 2}
          />
        </svg>

        {/* Inner animated score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-mono font-extrabold tracking-tight ${
              size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-5xl' : 'text-3xl'
            }`}
            style={{ color: strokeColor }}
          >
            <AnimatedCounter value={score} duration={1100} />
          </span>
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
            / 100
          </span>
        </div>
      </div>

      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mt-3.5 flex flex-col items-center gap-1.5"
      >
        <motion.span
          whileHover={{ scale: 1.05 }}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${badgeBg}`}
        >
          <span
            className="w-2 h-2 rounded-full animate-ping"
            style={{ backgroundColor: strokeColor }}
          />
          {status}
        </motion.span>
        <span className="text-xs text-slate-400 font-mono">
          Tier: <strong className="text-slate-200">{tier} RISK</strong>
        </span>
      </motion.div>
    </motion.div>
  );
};
