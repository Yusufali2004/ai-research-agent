import { useEffect, useState } from 'react';
import styles from './TranscriptPanel.module.css';

interface Props {
  liveTranscript: { role: 'user' | 'agent'; text: string } | null;
}

/**
 * TranscriptPanel
 *
 * Displays the most recent spoken exchange in large readable text.
 * Fades out after 5 seconds of inactivity.
 */
export function TranscriptPanel({ liveTranscript }: Props) {
  const [visible, setVisible] = useState(false);
  const [displayed, setDisplayed] = useState<typeof liveTranscript>(null);

  useEffect(() => {
    if (!liveTranscript) return;

    setDisplayed(liveTranscript);
    setVisible(true);

    // Auto-hide after 5s
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [liveTranscript]);

  return (
    <div className={`${styles.panel} ${visible ? styles.visible : ''}`}>
      {displayed ? (
        <>
          <span className={`${styles.roleTag} ${styles[displayed.role]}`}>
            {displayed.role === 'user' ? 'YOU' : 'RESEARCHAI'}
          </span>
          <p className={styles.text}>{displayed.text}</p>
        </>
      ) : (
        <p className={styles.placeholder}>
          Your conversation will appear here in real time
        </p>
      )}
    </div>
  );
}
