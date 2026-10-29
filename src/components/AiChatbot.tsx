import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Bot,
  Send,
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Maximize2,
  Minimize2,
  Trash2,
  Copy,
  Check,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import {
  VOICE_PERSONAS,
  VoicePersona,
  speakTextWithAi,
  stopAllSpeech,
  createSpeechRecognizer,
} from '../lib/voiceEngine';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AiChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  onNavigateToDetect?: () => void;
  onNavigateToSimulation?: () => void;
}

export const AiChatbot: React.FC<AiChatbotProps> = ({
  isOpen,
  onClose,
  onOpen,
}) => {
  const { user } = useAuth();
  const { transactions, stats, activeModelMode, alerts } = useTransactions();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `👋 **Greetings, ${user?.name || 'Investigator'}.** I am **Sentinel AI**, your dedicated Fraud Intelligence & Forensic Copilot.\n\nI can analyze suspicious transactions, explain anomaly risk scores, diagnose velocity spikes, recommend 3D-Secure remediation rules, or audit telemetry logs in real time.\n\n*How can I assist your fraud investigation today?*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAutoVoiceEnabled, setIsAutoVoiceEnabled] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<VoicePersona>(VOICE_PERSONAS[0]);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Clean speech when closing or unmounting
  useEffect(() => {
    return () => {
      stopAllSpeech();
    };
  }, []);

  // Prepare Real-time Intelligence Context
  const generateSessionContext = () => {
    const flaggedList = transactions
      .filter((t) => t.status === 'POTENTIAL FRAUD')
      .slice(0, 5)
      .map((t) => `#${t.transaction_id} (₹${t.amount}, ${t.category}, ${t.location}, Score: ${t.risk_score})`);

    const unreadAlerts = alerts.slice(0, 3).map((a) => `${a.transactionId}: ₹${a.amount} (${a.reason})`);

    return `
Authenticated Investigator: ${user?.name || 'Analyst'} (${user?.role || 'Risk Analyst'} at ${user?.organization || 'FinTech Security Ops'})
Active ML Model Engine: ${activeModelMode}
Database Summary:
- Total Scrutinized Transactions: ${stats.total_transactions}
- Potential Frauds Detected: ${stats.potential_fraud}
- Transactions Requiring Review: ${stats.review}
- Total Monitored Volume: ₹${stats.total_amount.toLocaleString()}
- Fraud Rate: ${stats.fraud_rate_pct}%
- Average System Risk Score: ${stats.avg_risk_score}/100
Recent Flagged Threats: ${flaggedList.length > 0 ? flaggedList.join(', ') : 'None yet'}
Active Live Alerts: ${unreadAlerts.length > 0 ? unreadAlerts.join('; ') : 'No pending alerts'}
`;
  };

  // Send Message Handler
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setSpeechError(null);

    try {
      const historyPayload = messages.concat(userMessage).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          systemContext: generateSessionContext(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to reach Sentinel AI risk server.');
      }

      const data = await res.json();
      const assistantText = data.text || 'Analysis complete. No additional threats noted.';

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: assistantText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // If Auto Voice is turned on, speak immediately
      if (isAutoVoiceEnabled) {
        handleSpeakMessage(assistantMessage.id, assistantText);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackMessage: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        role: 'assistant',
        content: `⚠️ **Communication Warning**: ${err?.message || 'Unable to contact neural analysis service'}. Please verify system connectivity or configure GEMINI_API_KEY in the Secrets panel.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice Playback for Specific Message
  const handleSpeakMessage = async (msgId: string, text: string) => {
    if (currentlySpeakingId === msgId) {
      stopAllSpeech();
      setCurrentlySpeakingId(null);
      return;
    }

    setCurrentlySpeakingId(msgId);
    await speakTextWithAi(text, selectedPersona, (isPlaying) => {
      if (!isPlaying) {
        setCurrentlySpeakingId(null);
      }
    });
  };

  // Speech Recognition (Voice to text)
  const toggleVoiceInput = () => {
    setSpeechError(null);

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    stopAllSpeech();

    const recognizer = createSpeechRecognizer(
      (interim) => {
        setInput(interim);
      },
      (final) => {
        setInput(final);
        setIsListening(false);
        // Automatically submit voice query if desired
        handleSendMessage(final);
      },
      (listening) => {
        setIsListening(listening);
      },
      (err) => {
        setSpeechError(err);
        setIsListening(false);
      }
    );

    if (!recognizer) {
      setSpeechError('Speech recognition is not supported in this browser environment.');
      return;
    }

    recognitionRef.current = recognizer;
    try {
      recognizer.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChatHistory = () => {
    stopAllSpeech();
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: `Conversation refreshed. Standing by for transaction telemetry, anomaly queries, or mitigation rules.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Quick Prompt Chips
  const promptSuggestions = [
    '🚨 Audit flagged transactions',
    '🔍 Explain 3 AM nocturnal spikes',
    '⚡ How to prevent carding attacks?',
    '📊 Random Forest vs Logistic Regression',
  ];

  if (!isOpen) {
    return (
      <button
        onClick={onOpen}
        id="ai-chatbot-launcher"
        className="fixed bottom-6 right-6 z-40 p-3.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300 flex items-center gap-2.5 border border-cyan-400/40 group"
        aria-label="Open Sentinel AI Copilot"
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-cyan-200 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#070b14] animate-pulse" />
        </div>
        <span className="hidden sm:inline text-xs font-bold tracking-wide font-['Space_Grotesk']">
          Sentinel AI Copilot
        </span>
        <span className="hidden md:inline-block px-1.5 py-0.5 rounded bg-black/30 text-[10px] font-mono text-cyan-200 border border-cyan-400/20">
          Voice AI
        </span>
      </button>
    );
  }

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isExpanded
          ? 'inset-3 md:inset-8 max-w-5xl mx-auto'
          : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[440px] h-[640px] max-h-[85vh]'
      } flex flex-col rounded-3xl bg-[#0b1220]/95 backdrop-blur-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-950/80 overflow-hidden font-sans`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#0b1220] rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight font-['Space_Grotesk'] flex items-center gap-1.5">
                Sentinel AI
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Gemini 3.7
                </span>
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Fraud Risk Copilot • Online</span>
            </div>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-1.5">
          {/* Persona Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700 transition-colors"
              title="Select AI Voice Persona"
            >
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline text-[11px] font-mono">
                {selectedPersona.geminiVoice}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showPersonaMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  AI Voice Persona
                </div>
                {VOICE_PERSONAS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPersona(p);
                      setShowPersonaMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs flex flex-col gap-0.5 transition-colors ${
                      selectedPersona.id === p.id
                        ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-200'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="font-semibold flex items-center justify-between">
                      <span>{p.name}</span>
                      <span className="text-[10px] font-mono text-cyan-400">
                        {p.geminiVoice}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">{p.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auto-Voice Narration Toggle */}
          <button
            onClick={() => {
              setIsAutoVoiceEnabled(!isAutoVoiceEnabled);
              if (isAutoVoiceEnabled) stopAllSpeech();
            }}
            className={`p-1.5 rounded-lg transition-colors border ${
              isAutoVoiceEnabled
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
            }`}
            title={isAutoVoiceEnabled ? 'Auto-Voice Enabled' : 'Enable Auto-Voice'}
          >
            {isAutoVoiceEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Clear history */}
          <button
            onClick={clearChatHistory}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Expand / Minimize */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors hidden sm:block"
            title={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button
            onClick={() => {
              stopAllSpeech();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition-colors"
            title="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';
          const isSpeaking = currentlySpeakingId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              {isAssistant && (
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-1">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-[13px] leading-relaxed relative group ${
                  isAssistant
                    ? 'bg-slate-900/90 text-slate-200 border border-slate-800'
                    : 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-br-none shadow-md shadow-cyan-900/30'
                }`}
              >
                {/* Markdown content */}
                <div className="prose prose-invert prose-xs max-w-none space-y-2 prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-cyan-300">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>

                {/* Footer Controls for Message */}
                <div
                  className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] font-mono ${
                    isAssistant
                      ? 'border-slate-800/80 text-slate-400'
                      : 'border-white/20 text-cyan-100'
                  }`}
                >
                  <span>{msg.timestamp}</span>

                  <div className="flex items-center gap-1.5">
                    {/* Read Aloud Voice Button */}
                    <button
                      onClick={() => handleSpeakMessage(msg.id, msg.content)}
                      className={`px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors ${
                        isSpeaking
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse'
                          : isAssistant
                          ? 'hover:bg-slate-800 text-slate-400 hover:text-cyan-300'
                          : 'hover:bg-white/10 text-cyan-100'
                      }`}
                      title={isSpeaking ? 'Stop Voice' : 'Read Aloud with AI Voice'}
                    >
                      {isSpeaking ? (
                        <>
                          <div className="flex items-center gap-0.5">
                            <span className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse" />
                            <span className="w-1 h-2 bg-cyan-400 rounded-full animate-pulse delay-75" />
                            <span className="w-1 h-4 bg-cyan-400 rounded-full animate-pulse delay-150" />
                          </div>
                          <span>Speaking...</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>Voice</span>
                        </>
                      )}
                    </button>

                    {/* Copy text */}
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className={`p-1 rounded transition-colors ${
                        isAssistant ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-white/10 text-cyan-100'
                      }`}
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-1">
              <Bot className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 rounded-tl-none flex items-center gap-2 text-xs font-mono text-cyan-300">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Analyzing fraud indicators & querying risk models...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {promptSuggestions.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-xl text-[11px] font-mono whitespace-nowrap bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-cyan-300 border border-slate-700/60 hover:border-cyan-500/30 transition-all shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Speech error indicator if any */}
      {speechError && (
        <div className="px-4 py-1.5 bg-rose-500/10 border-t border-rose-500/30 text-rose-300 text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{speechError}</span>
          </div>
          <button onClick={() => setSpeechError(null)} className="text-rose-400 hover:text-rose-200">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Listening Banner */}
      {isListening && (
        <div className="px-4 py-2 bg-cyan-500/10 border-t border-cyan-500/30 flex items-center justify-between text-xs text-cyan-300 font-mono animate-pulse">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-cyan-400 animate-bounce" />
            <span>Listening to voice query... Speak now</span>
          </div>
          <button
            onClick={toggleVoiceInput}
            className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px]"
          >
            Stop Listening
          </button>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-slate-900 border-t border-slate-800/80 flex items-center gap-2 shrink-0"
      >
        {/* Voice Input Microphone Button */}
        <button
          type="button"
          onClick={toggleVoiceInput}
          className={`p-2.5 rounded-xl border transition-all ${
            isListening
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-cyan-400'
          }`}
          title={isListening ? 'Stop Voice Recording' : 'Speak to Sentinel AI (Speech-to-Text)'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? 'Listening...' : 'Ask about risk scores, fraud rules, or models...'}
          disabled={isLoading}
          className="flex-1 bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-sans"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`p-2.5 rounded-xl text-white font-medium transition-all ${
            !input.trim() || isLoading
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-md shadow-cyan-500/25'
          }`}
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
