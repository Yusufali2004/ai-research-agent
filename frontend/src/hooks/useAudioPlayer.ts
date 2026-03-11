import { useRef, useCallback } from 'react';

/**
 * useAudioPlayer
 *
 * Gemini Live API streams raw 16-bit PCM audio at 24000Hz.
 * We cannot use decodeAudioData() on raw PCM — it expects a file format.
 * Instead we manually build an AudioBuffer from the raw samples.
 */

const GEMINI_SAMPLE_RATE = 24000; // Gemini Live outputs 24kHz PCM

export function useAudioPlayer() {
  const audioCtxRef    = useRef<AudioContext | null>(null);
  const queueRef       = useRef<ArrayBuffer[]>([]);
  const isPlayingRef   = useRef(false);
  const nextStartTime  = useRef(0);

  // Get or create a single shared AudioContext
  const getCtx = useCallback((): AudioContext => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext({ sampleRate: GEMINI_SAMPLE_RATE });
    }
    // Resume if browser suspended it (autoplay policy)
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  /**
   * Convert raw Int16 PCM bytes → Float32 AudioBuffer and schedule playback.
   * We schedule chunks back-to-back using AudioContext.currentTime so there
   * are no gaps or overlaps between chunks.
   */
  const playPCMChunk = useCallback((pcmBuffer: ArrayBuffer) => {
    const ctx = getCtx();

    // Int16 → Float32 conversion
    const int16 = new Int16Array(pcmBuffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768.0; // normalize to -1.0 ... 1.0
    }

    // Create AudioBuffer with the PCM data
    const audioBuffer = ctx.createBuffer(1, float32.length, GEMINI_SAMPLE_RATE);
    audioBuffer.copyToChannel(float32, 0);

    // Schedule it to play right after the previous chunk
    const startTime = Math.max(ctx.currentTime, nextStartTime.current);
    nextStartTime.current = startTime + audioBuffer.duration;

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.start(startTime);

    source.onended = () => {
      // If queue is empty after this chunk, mark as done
      if (queueRef.current.length === 0) {
        isPlayingRef.current = false;
      }
    };
  }, [getCtx]);

  /** Add a base64-encoded PCM chunk to the queue and play it */
  const enqueue = useCallback((b64: string) => {
    // Decode base64 → ArrayBuffer
    const binary  = atob(b64);
    const bytes   = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    isPlayingRef.current = true;
    playPCMChunk(bytes.buffer);
  }, [playPCMChunk]);

  /** Stop all audio and reset */
  const clear = useCallback(() => {
    queueRef.current     = [];
    isPlayingRef.current = false;
    nextStartTime.current = 0;
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  }, []);

  return { enqueue, clear };
}
