import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { ShieldAlert, X, ArrowRight, MapPin, Smartphone, Volume2, VolumeX } from 'lucide-react';
import { VOICE_PERSONAS, speakTextWithAi, stopAllSpeech } from '../lib/voiceEngine';

interface RealTimeAlertBannerProps {
  onInspectTransaction?: (transactionId: string) => void;
  onNavigateToHistory?: () => void;
}

export const RealTimeAlertBanner: React.FC<RealTimeAlertBannerProps> = ({
  onNavigateToHistory,
}) => {
  const { latestAlert, dismissLatestAlert } = useTransactions();
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!latestAlert) return null;

  const handleSpeakAlert = async () => {
    if (isSpeaking) {
      stopAllSpeech();
      setIsSpeaking(false);
      return;
    }

    const alertText = `Urgent Fraud Alert: Transaction ${latestAlert.transactionId} flagged with high risk score ${latestAlert.riskScore} out of 100. Amount ${latestAlert.amount} rupees. Reason: ${latestAlert.reason}.`;
    setIsSpeaking(true);
    await speakTextWithAi(alertText, VOICE_PERSONAS[2], (playing) => {
      setIsSpeaking(playing);
    });
  };

  return (
    <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-40 max-w-md w-[calc(100vw-2rem)] sm:w-full animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="glass-panel border border-rose-500/50 bg-[#0d1527]/95 rounded-2xl p-4 shadow-2xl shadow-rose-950/50 glow-danger relative overflow-hidden">
        {/* Top danger accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 animate-pulse" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                  🚨 REAL-TIME FRAUD DETECTED
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Risk: <strong className="text-rose-400">{latestAlert.riskScore}/100</strong>
                </span>
              </div>

              <h4 className="font-bold text-sm text-slate-100 mt-1 font-mono">
                {latestAlert.transactionId} • ₹{latestAlert.amount.toLocaleString()}
              </h4>

              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {latestAlert.reason}
              </p>

              <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  {latestAlert.location}
                </span>
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-slate-500" />
                  {latestAlert.category}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              stopAllSpeech();
              dismissLatestAlert();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Voice Alert Readout Button */}
            <button
              onClick={handleSpeakAlert}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition-colors border ${
                isSpeaking
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                  : 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 border-slate-700'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3 h-3 text-rose-400" />
                  <span>Stop Voice</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3 h-3 text-cyan-400" />
                  <span>Voice Alert</span>
                </>
              )}
            </button>
            <span className="text-[11px] font-mono text-slate-500">
              {new Date(latestAlert.timestamp).toLocaleTimeString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                stopAllSpeech();
                dismissLatestAlert();
                if (onNavigateToHistory) onNavigateToHistory();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-all shadow-md shadow-rose-950"
            >
              <span>Investigate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
