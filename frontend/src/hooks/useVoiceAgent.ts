import { useState, useRef, useCallback, useEffect } from 'react';
import {
  OrbState,
  Message,
  AgentStep,
  WsMessage,
  WsOutgoing,
  TOOL_STEP_MAP,
  TOOL_LABEL_MAP,
  INITIAL_STEPS,
} from '../types';
import { useAudioPlayer } from './useAudioPlayer';

// ── Config ────────────────────────────────────────────────────────
const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';
const SESSION_ID  = `session_${Date.now()}`;
const SAMPLE_RATE = 16000;
const BUFFER_SIZE = 4096;

export function useVoiceAgent() {
  // ── Connection state ──────────────────────────────────────────
  const [isConnected,  setIsConnected]  = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [orbState,     setOrbState]     = useState<OrbState>('idle');
  const [isListening,  setIsListening]  = useState(false);

  // ── UI state ──────────────────────────────────────────────────
  const [messages,        setMessages]        = useState<Message[]>([]);
  const [steps,           setSteps]           = useState<AgentStep[]>(INITIAL_STEPS);
  const [activeToolLabel, setActiveToolLabel] = useState<string | null>(null);
  const [liveTranscript,  setLiveTranscript]  = useState<{ role: 'user' | 'agent'; text: string } | null>(null);
  const [errorMsg,        setErrorMsg]        = useState<string | null>(null);

  // ── Refs ──────────────────────────────────────────────────────
  const wsRef          = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef    = useRef<AudioContext | null>(null);
  const processorRef   = useRef<ScriptProcessorNode | null>(null);

  const { enqueue: enqueueAudio, clear: clearAudio } = useAudioPlayer();

  // ── Helpers ───────────────────────────────────────────────────
  const addMessage = useCallback((role: Message['role'], text: string) => {
    setMessages(prev => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, role, text, timestamp: new Date() },
    ]);
  }, []);

  const activateStep = useCallback((stepId: number) => {
    setSteps(prev =>
      prev.map(s => ({
        ...s,
        status: s.id < stepId ? 'done' : s.id === stepId ? 'active' : 'pending',
      }))
    );
  }, []);

  const resetSteps = useCallback(() => {
    setSteps(INITIAL_STEPS.map(s => ({ ...s, status: 'pending' })));
  }, []);

  // ── Handle messages from backend ──────────────────────────────
  const handleWsMessage = useCallback((raw: MessageEvent) => {
    const msg: WsMessage = JSON.parse(raw.data);

    switch (msg.type) {

      case 'audio':
        // Gemini sends raw PCM base64 — enqueue for playback
        if (msg.data) {
          enqueueAudio(msg.data);
          setOrbState('speaking');
        }
        break;

      case 'agent_transcript':
        if (msg.text) {
          setLiveTranscript({ role: 'agent', text: msg.text });
          addMessage('agent', msg.text);
        }
        break;

      case 'user_transcript':
        if (msg.text) {
          setLiveTranscript({ role: 'user', text: msg.text });
          addMessage('user', msg.text);
        }
        break;

      case 'tool_use':
        if (msg.tool) {
          const stepId = TOOL_STEP_MAP[msg.tool];
          if (stepId) activateStep(stepId);
          setActiveToolLabel(TOOL_LABEL_MAP[msg.tool] ?? `Using ${msg.tool}...`);
          addMessage('tool', `Tool called: ${msg.tool}`);
        }
        break;

      case 'turn_complete':
        setOrbState(prev => prev === 'speaking' ? 'listening' : prev);
        setActiveToolLabel(null);
        setSteps(prev => prev.map(s => ({ ...s, status: 'done' as const })));
        break;

      case 'error':
        setErrorMsg(msg.message ?? 'Agent error occurred.');
        break;
    }
  }, [addMessage, activateStep, enqueueAudio]);

  // ── WebSocket connect ─────────────────────────────────────────
  const connect = useCallback(() => {
    setIsConnecting(true);
    setErrorMsg(null);

    const url = `${WS_BASE_URL}/ws/voice/${SESSION_ID}`;
    const ws  = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setIsConnecting(false);
      console.log('✅ WebSocket connected');
    };

    ws.onmessage = handleWsMessage;

    ws.onclose = () => {
      setIsConnected(false);
      setIsConnecting(false);
      setIsListening(false);
      setOrbState('idle');
      clearAudio();
      console.log('🔌 WebSocket disconnected');
    };

    ws.onerror = (e) => {
      console.error('WebSocket error:', e);
      setErrorMsg('Cannot reach backend. Make sure Python server is running on port 8080.');
      setIsConnecting(false);
      setIsConnected(false);
    };
  }, [handleWsMessage, clearAudio]);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    stopMic();
    resetSteps();
    setIsConnected(false);
    setOrbState('idle');
    clearAudio();
  }, [clearAudio, resetSteps]);

  // ── Send to backend ───────────────────────────────────────────
  const sendWs = useCallback((msg: WsOutgoing) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  // ── Microphone ────────────────────────────────────────────────
  const startMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      mediaStreamRef.current = stream;

      const ctx       = new AudioContext({ sampleRate: SAMPLE_RATE });
      const source    = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(BUFFER_SIZE, 1, 1);

      processor.onaudioprocess = (e: AudioProcessingEvent) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        const float32 = e.inputBuffer.getChannelData(0);

        // Float32 → Int16 PCM (Gemini Live expects 16-bit signed PCM)
        const int16 = new Int16Array(float32.length);
        for (let i = 0; i < float32.length; i++) {
          int16[i] = Math.max(-32768, Math.min(32767, float32[i] * 32768));
        }

        // Int16 bytes → base64
        const bytes = new Uint8Array(int16.buffer);
        let binary  = '';
        bytes.forEach(b => (binary += String.fromCharCode(b)));
        sendWs({ type: 'audio', data: btoa(binary) });
      };

      source.connect(processor);
      processor.connect(ctx.destination);

      audioCtxRef.current  = ctx;
      processorRef.current = processor;

      setIsListening(true);
      setOrbState('listening');
      setErrorMsg(null);
      resetSteps();
      console.log('🎙️ Mic started');
    } catch (err) {
      console.error('Mic error:', err);
      setErrorMsg('Microphone access denied. Please allow mic permissions and try again.');
    }
  }, [sendWs, resetSteps]);

  const stopMic = useCallback(() => {
    processorRef.current?.disconnect();
    processorRef.current = null;
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    mediaStreamRef.current = null;
    setIsListening(false);
    setOrbState('idle');
    console.log('🎙️ Mic stopped');
  }, []);

  // ── Toggle mic on orb click ───────────────────────────────────
  const toggleListening = useCallback(async () => {
    if (!isConnected) return;
    if (isListening) stopMic();
    else await startMic();
  }, [isConnected, isListening, startMic, stopMic]);

  // ── Text fallback — Shift+Enter to test without mic ───────────
  const sendTextMessage = useCallback((text: string) => {
    if (!isConnected) return;
    sendWs({ type: 'text', text });
    addMessage('user', text);
  }, [isConnected, sendWs, addMessage]);

  // ── Cleanup on unmount ────────────────────────────────────────
  useEffect(() => {
    return () => {
      wsRef.current?.close();
      stopMic();
    };
  }, [stopMic]);

  return {
    isConnected,
    isConnecting,
    isListening,
    orbState,
    messages,
    steps,
    activeToolLabel,
    liveTranscript,
    errorMsg,
    connect,
    disconnect,
    toggleListening,
    sendTextMessage,
  };
}
