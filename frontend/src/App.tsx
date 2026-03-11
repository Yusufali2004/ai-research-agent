import { useEffect } from 'react';
import { StarfieldCanvas }      from './components/StarfieldCanvas';
import { StatusBar }            from './components/StatusBar';
import { VoiceOrb }             from './components/VoiceOrb';
import { TranscriptPanel }      from './components/TranscriptPanel';
import { ConversationHistory }  from './components/ConversationHistory';
import { AgentSteps }           from './components/AgentSteps';
import { useVoiceAgent }        from './hooks/useVoiceAgent';
import styles from './App.module.css';

/**
 * App
 *
 * Root component. Owns the layout grid and wires the
 * useVoiceAgent hook into all child components.
 *
 * Layout:
 *   ┌──────────────────────────────┐
 *   │         StatusBar            │  ← header row
 *   ├────────────────┬─────────────┤
 *   │   VoicePanel   │   Sidebar   │  ← main row
 *   │  (orb + live   │  (history + │
 *   │   transcript)  │   steps)    │
 *   └────────────────┴─────────────┘
 */
export default function App() {
  const {
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
  } = useVoiceAgent();

  // Keyboard shortcut: Shift+Enter → text fallback for testing
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.shiftKey && isConnected) {
        const text = prompt('Send text to agent (test mode):');
        if (text?.trim()) sendTextMessage(text.trim());
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isConnected, sendTextMessage]);

  return (
    <>
      {/* Animated star background — sits at z-index 0 */}
      <StarfieldCanvas />

      <div className={styles.layout}>

        {/* ── Top header ── */}
        <StatusBar
          isConnected={isConnected}
          isConnecting={isConnecting}
          onConnect={connect}
          onDisconnect={disconnect}
        />

        {/* ── Main voice panel ── */}
        <main className={styles.voicePanel}>
          <VoiceOrb
            state={orbState}
            isConnected={isConnected}
            onToggle={toggleListening}
            toolLabel={activeToolLabel}
            errorMsg={errorMsg}
          />

          <TranscriptPanel liveTranscript={liveTranscript} />
        </main>

        {/* ── Right sidebar ── */}
        <aside className={styles.sidebar}>
          <ConversationHistory messages={messages} />
          <AgentSteps steps={steps} />
        </aside>

      </div>
    </>
  );
}
