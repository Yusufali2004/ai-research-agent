import { OrbState } from '../types';
import styles from './VoiceOrb.module.css';

interface Props {
  state:       OrbState;
  isConnected: boolean;
  onToggle:    () => void;
  toolLabel:   string | null;
  errorMsg:    string | null;
}

const STATUS_LABELS: Record<OrbState, string> = {
  idle:      'CLICK TO SPEAK',
  listening: 'LISTENING...',
  speaking:  'AGENT SPEAKING',
};

/**
 * VoiceOrb
 *
 * The centrepiece of the UI. A layered animated orb with:
 * - Three spinning ring decorations
 * - A central button with animated waveform bars
 * - State-driven colour & animation changes
 * - Tool activity indicator below
 */
export function VoiceOrb({ state, isConnected, onToggle, toolLabel, errorMsg }: Props) {
  return (
    <div className={styles.wrapper}>

      {/* ── Spinning decorative rings ── */}
      <div className={styles.orbContainer}>
        <div className={`${styles.ring} ${styles.ring3}`} />
        <div className={`${styles.ring} ${styles.ring1}`} />
        <div className={`${styles.ring} ${styles.ring2}`} />

        {/* ── Main orb button ── */}
        <button
          className={`${styles.orb} ${styles[state]} ${!isConnected ? styles.disabled : ''}`}
          onClick={onToggle}
          disabled={!isConnected}
          aria-label={STATUS_LABELS[state]}
          title={isConnected ? STATUS_LABELS[state] : 'Connect first'}
        >
          <div className={styles.waves}>
            {[0, 1, 2, 3, 4].map(i => (
              <span
                key={i}
                className={styles.bar}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </button>
      </div>

      {/* ── Status label ── */}
      <p className={`${styles.statusLabel} ${styles[state]}`}>
        {isConnected ? STATUS_LABELS[state] : 'CONNECT TO START'}
      </p>

      {/* ── Active tool indicator ── */}
      <div className={`${styles.toolBadge} ${toolLabel ? styles.toolVisible : ''}`}>
        <span className={styles.toolDot} />
        <span>{toolLabel ?? ''}</span>
      </div>

      {/* ── Error message ── */}
      {errorMsg && (
        <div className={styles.errorBanner}>{errorMsg}</div>
      )}

      {/* ── Hint text ── */}
      <p className={styles.hint}>
        {isConnected
          ? <>Click orb to <span>talk</span> · Interrupt <span>anytime</span> · Agent uses <span>live web search</span></>
          : 'Press Connect in the top-right to begin'}
      </p>
    </div>
  );
}
