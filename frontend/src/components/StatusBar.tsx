import styles from './StatusBar.module.css';

interface Props {
  isConnected:  boolean;
  isConnecting: boolean;
  onConnect:    () => void;
  onDisconnect: () => void;
}

/**
 * StatusBar
 * Top navigation bar. Shows the logo, API badges, and
 * a connect/disconnect button.
 */
export function StatusBar({ isConnected, isConnecting, onConnect, onDisconnect }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <span className={`${styles.logoDot} ${isConnected ? styles.dotConnected : ''}`} />
        ResearchAI
      </div>

      <div className={styles.right}>
        <span className={`${styles.badge} ${styles.badgeModel}`}>
          Gemini Live API
        </span>
        <span className={`${styles.badge} ${isConnected ? styles.badgeLive : styles.badgeOff}`}>
          {isConnected ? '● LIVE' : isConnecting ? '◌ CONNECTING' : '● OFFLINE'}
        </span>

        <button
          className={`${styles.connectBtn} ${isConnected ? styles.connectedBtn : ''}`}
          onClick={isConnected ? onDisconnect : onConnect}
          disabled={isConnecting}
        >
          {isConnected ? 'Disconnect' : isConnecting ? 'Connecting...' : 'Connect'}
        </button>
      </div>
    </header>
  );
}