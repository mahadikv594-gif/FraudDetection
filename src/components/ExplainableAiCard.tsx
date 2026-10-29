import React, { useState } from 'react';
import { ExplainableSignal, ModelMode, TransactionRecord } from '../types';
import { AlertTriangle, CheckCircle, Info, ShieldAlert, Cpu, Sparkles, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { VOICE_PERSONAS, speakTextWithAi, stopAllSpeech, playPcmBase64Audio } from '../lib/voiceEngine';

interface ExplainableAiCardProps {
  reasons: ExplainableSignal[];
  modelMode: ModelMode;
  riskScore: number;
  transaction?: TransactionRecord;
}

export const ExplainableAiCard: React.FC<ExplainableAiCardProps> = ({
  reasons,
  modelMode,
  riskScore,
  transaction,
}) => {
  const isMlMode = modelMode.startsWith('ML_');
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [voiceScript, setVoiceScript] = useState<string | null>(null);

  const handleToggleVoiceBriefing = async () => {
    if (isPlayingVoice) {
      stopAllSpeech();
      setIsPlayingVoice(false);
      return;
    }

    setIsLoadingAudio(true);
    try {
      if (transaction) {
        const res = await fetch('/api/voice-briefing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transaction,
            voice: 'Kore',
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.script) setVoiceScript(data.script);

          if (data.audio) {
            setIsLoadingAudio(false);
            setIsPlayingVoice(true);
            await playPcmBase64Audio(data.audio, data.sampleRate || 24000, () => {
              setIsPlayingVoice(false);
            });
            return;
          } else if (data.script) {
            setIsLoadingAudio(false);
            setIsPlayingVoice(true);
            await speakTextWithAi(data.script, VOICE_PERSONAS[0], (playing) => {
              setIsPlayingVoice(playing);
            });
            return;
          }
        }
      }

      // Fallback verbal summary from reasons
      const topReasons = reasons.filter(r => r.severity === 'HIGH' || r.severity === 'MEDIUM').map(r => r.name).join(', ');
      const fallbackScript = `Transaction risk score is ${riskScore} out of 100. Primary risk factors detected: ${topReasons || 'Nominal baseline activity'}. Evaluation model is ${modelMode}.`;
      setVoiceScript(fallbackScript);
      setIsLoadingAudio(false);
      setIsPlayingVoice(true);
      await speakTextWithAi(fallbackScript, VOICE_PERSONAS[0], (playing) => {
        setIsPlayingVoice(playing);
      });
    } catch (err) {
      console.warn('Voice briefing error:', err);
      setIsLoadingAudio(false);
      setIsPlayingVoice(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden border border-slate-800">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              Explainable AI (XAI) Risk Signals
            </h3>
            <p className="text-xs text-slate-400">
              Feature attribution & anomaly decomposition
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Voice Briefing Button */}
          <button
            onClick={handleToggleVoiceBriefing}
            disabled={isLoadingAudio}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center gap-2 transition-all border ${
              isPlayingVoice
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-lg shadow-cyan-500/20 animate-pulse'
                : 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 hover:text-cyan-300 border-slate-700 hover:border-cyan-500/30'
            }`}
            title="Listen to AI Voice Risk Synopsis"
          >
            {isLoadingAudio ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : isPlayingVoice ? (
              <>
                <div className="flex items-center gap-0.5">
                  <span className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse" />
                  <span className="w-1 h-2 bg-cyan-400 rounded-full animate-pulse delay-75" />
                  <span className="w-1 h-4 bg-cyan-400 rounded-full animate-pulse delay-150" />
                </div>
                <span>Stop Voice</span>
                <VolumeX className="w-3.5 h-3.5 text-cyan-400 ml-0.5" />
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Voice Briefing</span>
              </>
            )}
          </button>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-mono bg-slate-800/80 text-cyan-300 border border-cyan-500/20">
            <Cpu className="w-3 h-3" />
            {isMlMode ? 'Model-Derived Engine' : 'Heuristic Engine'}
          </span>
        </div>
      </div>

      {voiceScript && (
        <div className="mb-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-xs text-cyan-200 flex items-start gap-2.5 animate-in fade-in">
          <Volume2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 font-bold block">
              AI Voice Executive Synopsis
            </span>
            <p className="text-slate-200 leading-relaxed font-sans">{voiceScript}</p>
          </div>
        </div>
      )}

      <div className="mb-4">
        <p className="text-xs font-medium text-slate-300">
          Why was this transaction assigned a risk score of <strong className="text-cyan-400">{riskScore}/100</strong>?
        </p>
      </div>

      {reasons.length === 0 ? (
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>No anomalous risk vectors detected. Transaction exhibits nominal baseline parameters.</span>
        </div>
      ) : (
        <div className="space-y-3">
          {reasons.map((signal, idx) => {
            let badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';
            let icon = <Info className="w-4 h-4 text-slate-400" />;

            if (signal.severity === 'HIGH') {
              badgeStyle = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
              icon = <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />;
            } else if (signal.severity === 'MEDIUM') {
              badgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
              icon = <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
            } else if (signal.severity === 'BENIGN') {
              badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
              icon = <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />;
            }

            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{icon}</div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-200">
                        {signal.name}
                      </span>
                      <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${badgeStyle}`}>
                        {signal.severity}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        [{signal.category}]
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {signal.description}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`font-mono text-xs font-bold ${
                      signal.impact_score > 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {signal.impact_score > 0 ? `+${signal.impact_score}` : signal.impact_score} pts
                  </span>
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Impact</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>Transparent Explainability Guarantee</span>
        <span className="text-slate-500 font-mono">XAI-Engine v2.4</span>
      </div>
    </div>
  );
};
