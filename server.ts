import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Modality } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy-initialized Gemini AI Client
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// 1. Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'FraudShield AI Core API',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// 2. AI Risk Analyst Chatbot Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, systemContext } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback response if API key is not yet set in environment
      const lastMsg = messages[messages.length - 1]?.content || '';
      res.json({
        text: `🛡️ **Sentinel AI (Local Risk Mode)**\n\nI have evaluated your query: "${lastMsg}".\n\n* **Risk Profile:** Monitored\n* **Recommended Action:** Always cross-reference velocity bursts and nocturnal transaction spikes.\n\n*(Note: Attach your GEMINI_API_KEY in the Secrets panel to activate full Gemini 3.7 deep neural risk analysis).*`,
      });
      return;
    }

    const ai = getAi();

    const systemInstruction = `You are "Sentinel AI", the elite AI Fraud & Risk Intelligence Copilot built into the FraudShield AI platform.
You assist financial crime investigators, risk analysts, compliance officers, and fintech engineers.
Your domain expertise includes:
1. Credit card fraud detection, velocity attacks, carding, credential stuffing, nocturnal transaction spikes, geo-velocity mismatches, and synthetic identity theft.
2. Explainable AI (XAI): SHAP values, feature importance in Random Forest and Logistic Regression models.
3. FinTech risk management: 3D-Secure 2.0 step-up authentication, card freezing, chargeback prevention, velocity rate-limiting, SAR (Suspicious Activity Reports) filing guidelines.
4. Mathematical and behavioral fraud signals.

Context for current user session:
${systemContext || 'No additional session context provided.'}

Guidelines:
- Provide authoritative, concise, actionable, and structured insights using markdown (bold headings, bullet points, risk meters, and code/SQL/Python where requested).
- If asked about a specific transaction or anomaly, explain the exact mathematical reasons, risk multiplier vectors, and recommended security remediation.
- Maintain a sharp, professional cybersecurity tone.`;

    // Format conversation history for Gemini API
    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const responseText = response.text || 'No response generated.';
    res.json({ text: responseText });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to process AI chat request.',
    });
  }
});

// 3. AI Text-To-Speech (TTS) Endpoint
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text string is required.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(503).json({
        error: 'GEMINI_API_KEY not configured for neural TTS.',
        useBrowserFallback: true,
      });
      return;
    }

    const ai = getAi();
    const validVoices = ['Kore', 'Zephyr', 'Puck', 'Fenrir', 'Charon'];
    const chosenVoice = validVoices.includes(voice) ? voice : 'Kore';

    // Clean text of heavy markdown symbols for natural speech synthesis
    const cleanText = text
      .replace(/[*#_`~[\]()]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .substring(0, 1000); // Limit length for snappy audio generation

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: cleanText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: chosenVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      res.status(500).json({ error: 'Failed to synthesize audio data.', useBrowserFallback: true });
      return;
    }

    res.json({
      audio: base64Audio,
      mimeType: 'audio/pcm;rate=24000',
      sampleRate: 24000,
      voice: chosenVoice,
    });
  } catch (error: any) {
    console.error('TTS endpoint error:', error);
    res.status(500).json({
      error: error?.message || 'Audio synthesis failed.',
      useBrowserFallback: true,
    });
  }
});

// 4. AI Voice Risk Briefing Generator
app.post('/api/voice-briefing', async (req: Request, res: Response) => {
  try {
    const { transaction, voice } = req.body;

    if (!transaction) {
      res.status(400).json({ error: 'Transaction object is required.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback verbal summary
      const statusText = transaction.status === 'POTENTIAL FRAUD' ? 'High Risk Threat' : transaction.status === 'REQUIRES REVIEW' ? 'Moderate Risk Anomaly' : 'Approved Legitimate Transaction';
      const speechScript = `FraudShield Alert: Transaction ${transaction.transaction_id} flagged as ${statusText} with a risk score of ${transaction.risk_score} out of 100. Amount is ${transaction.amount} rupees under merchant category ${transaction.category}.`;
      res.json({
        script: speechScript,
        useBrowserFallback: true,
      });
      return;
    }

    const ai = getAi();

    // 1. Generate concise, executive spoken brief
    const scriptPrompt = `You are a Chief Risk Officer delivering a crisp 2-to-3 sentence verbal security briefing to an investigator.
Transaction details:
- ID: ${transaction.transaction_id}
- Amount: ₹${transaction.amount}
- Category: ${transaction.category}
- Risk Score: ${transaction.risk_score}/100 (${transaction.risk_tier} tier - ${transaction.status})
- Location: ${transaction.location}, Distance: ${transaction.distance}km
- Hour: ${transaction.hour}:00, Velocity count: ${transaction.frequency}
- Top reasons: ${JSON.stringify(transaction.reasons?.map((r: any) => r.description) || [])}
- Recommended Action: ${transaction.recommended_action}

Write a natural, crisp spoken briefing (under 45 words). Do not use markdown or bullet points. Speak directly and professionally.`;

    const scriptResponse = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: scriptPrompt,
    });

    const script = scriptResponse.text?.trim() || `Transaction ${transaction.transaction_id} evaluated with risk score ${transaction.risk_score} out of 100. Status: ${transaction.status}.`;

    // 2. Synthesize audio with Gemini TTS
    let base64Audio = null;
    try {
      const ttsResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text: script }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
            },
          },
        },
      });
      base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (ttsErr) {
      console.warn('TTS preview failed in voice briefing, falling back to client audio:', ttsErr);
    }

    res.json({
      script,
      audio: base64Audio,
      mimeType: base64Audio ? 'audio/pcm;rate=24000' : undefined,
      sampleRate: 24000,
    });
  } catch (error: any) {
    console.error('Voice briefing error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate voice briefing.' });
  }
});

// Vite Middleware Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FraudShield AI Server active at http://localhost:${PORT}`);
  });
}

startServer();
