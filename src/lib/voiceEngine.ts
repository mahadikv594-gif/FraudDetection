/**
 * FraudShield AI - Advanced Voice Engine
 * Handles high-fidelity 24kHz Gemini TTS audio playback, browser fallback synthesis,
 * and Speech-to-Text (Voice Recognition) for two-way conversational AI.
 */

// Voice Persona Definitions
export interface VoicePersona {
  id: string;
  name: string;
  description: string;
  geminiVoice: 'Kore' | 'Zephyr' | 'Puck' | 'Fenrir' | 'Charon';
  pitch: number;
  rate: number;
}

export const VOICE_PERSONAS: VoicePersona[] = [
  {
    id: 'kore',
    name: 'Kore (Chief Risk Officer)',
    description: 'Crisp, authoritative cybersecurity executive voice',
    geminiVoice: 'Kore',
    pitch: 1.0,
    rate: 1.05,
  },
  {
    id: 'zephyr',
    name: 'Zephyr (Senior Threat Analyst)',
    description: 'Calm, methodical, and analytical tone',
    geminiVoice: 'Zephyr',
    pitch: 0.95,
    rate: 1.0,
  },
  {
    id: 'puck',
    name: 'Puck (Rapid Alert Dispatcher)',
    description: 'Dynamic, rapid-response alert dispatcher',
    geminiVoice: 'Puck',
    pitch: 1.1,
    rate: 1.15,
  },
  {
    id: 'fenrir',
    name: 'Fenrir (Forensic Auditor)',
    description: 'Deep, assertive anti-money laundering specialist',
    geminiVoice: 'Fenrir',
    pitch: 0.85,
    rate: 0.95,
  },
];

let globalAudioCtx: AudioContext | null = null;
let currentSourceNode: AudioBufferSourceNode | null = null;

function getAudioContext(): AudioContext {
  if (!globalAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    globalAudioCtx = new AudioContextClass({ sampleRate: 24000 });
  }
  if (globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume();
  }
  return globalAudioCtx;
}

/**
 * Decodes base64 raw 16-bit PCM little-endian audio at 24kHz and plays via AudioContext
 */
export async function playPcmBase64Audio(
  base64Data: string,
  sampleRate = 24000,
  onEnded?: () => void
): Promise<void> {
  stopAllSpeech();

  try {
    const ctx = getAudioContext();
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Convert 16-bit PCM (little-endian) to Float32Array (-1.0 to 1.0)
    const numSamples = Math.floor(bytes.length / 2);
    const float32Data = new Float32Array(numSamples);
    const dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

    for (let i = 0; i < numSamples; i++) {
      const int16 = dataView.getInt16(i * 2, true);
      float32Data[i] = int16 / 32768;
    }

    const audioBuffer = ctx.createBuffer(1, numSamples, sampleRate);
    audioBuffer.copyToChannel(float32Data, 0);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    currentSourceNode = source;

    source.onended = () => {
      currentSourceNode = null;
      if (onEnded) onEnded();
    };

    source.start(0);
  } catch (error) {
    console.error('Failed to play PCM base64 audio:', error);
    if (onEnded) onEnded();
  }
}

/**
 * Fallback to browser SpeechSynthesis when Gemini TTS is not available
 */
export function playBrowserSpeech(
  text: string,
  persona: VoicePersona = VOICE_PERSONAS[0],
  onEnded?: () => void
): void {
  stopAllSpeech();

  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    if (onEnded) onEnded();
    return;
  }

  // Clean Markdown
  const clean = text
    .replace(/[*#_`~[\]()]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .trim();

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate = persona.rate;
  utterance.pitch = persona.pitch;

  // Try picking high quality voice
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(
    (v) => (v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))) || v.lang === 'en-US'
  );
  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  utterance.onend = () => {
    if (onEnded) onEnded();
  };
  utterance.onerror = (e) => {
    console.warn('SpeechSynthesis error:', e);
    if (onEnded) onEnded();
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Stops all currently active speech output (both Web Audio PCM and SpeechSynthesis)
 */
export function stopAllSpeech(): void {
  if (currentSourceNode) {
    try {
      currentSourceNode.stop();
      currentSourceNode.disconnect();
    } catch {
      // Ignore
    }
    currentSourceNode = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Synthesizes speech via server-side Gemini TTS `/api/tts` with automatic fallback
 */
export async function speakTextWithAi(
  text: string,
  persona: VoicePersona = VOICE_PERSONAS[0],
  onStateChange?: (isPlaying: boolean) => void
): Promise<void> {
  if (onStateChange) onStateChange(true);

  const clean = text
    .replace(/[*#_`~[\]()]/g, '')
    .substring(0, 800);

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: clean,
        voice: persona.geminiVoice,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audio) {
        await playPcmBase64Audio(data.audio, data.sampleRate || 24000, () => {
          if (onStateChange) onStateChange(false);
        });
        return;
      }
    }
  } catch (error) {
    console.warn('Server TTS unavailable, falling back to browser synthesis:', error);
  }

  // Fallback to browser synthesis
  playBrowserSpeech(clean, persona, () => {
    if (onStateChange) onStateChange(false);
  });
}

/**
 * Speech-To-Text Voice Listener
 */
export interface SpeechRecognitionResultState {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  error: string | null;
  startListening: (onFinalResult: (text: string) => void) => void;
  stopListening: () => void;
}

export function createSpeechRecognizer(
  onTranscriptUpdate: (text: string) => void,
  onFinalTranscript: (text: string) => void,
  onListeningState: (isListening: boolean) => void,
  onError: (err: string) => void
) {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    onListeningState(true);
  };

  recognition.onresult = (event: any) => {
    let interim = '';
    let final = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final += event.results[i][0].transcript;
      } else {
        interim += event.results[i][0].transcript;
      }
    }

    if (final) {
      onFinalTranscript(final.trim());
    } else if (interim) {
      onTranscriptUpdate(interim);
    }
  };

  recognition.onerror = (event: any) => {
    console.warn('Speech recognition error:', event.error);
    onError(event.error === 'not-allowed' ? 'Microphone permission denied.' : 'Voice recognition error.');
    onListeningState(false);
  };

  recognition.onend = () => {
    onListeningState(false);
  };

  return recognition;
}
