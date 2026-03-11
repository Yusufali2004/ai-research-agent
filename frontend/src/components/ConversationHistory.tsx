import { useEffect, useRef } from 'react';
import { Message } from '../types';
import styles from './ConversationHistory.module.css';

interface Props {
  messages: Message[];
}

const ROLE_LABEL: Record<Message['role'], string> = {
  user:  'YOU',
  agent: 'RESEARCHAI',
  tool:  'TOOL',
};

/**
 * ConversationHistory
 *
 * Scrollable log of every message in the session.
 * Auto-scrolls to the bottom on new messages.
 */
export function ConversationHistory({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={styles.container}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <span>Conversation</span>
        <span className={styles.count}>{messages.length}</span>
      </div>

      {/* ── Message list ── */}
      <div className={styles.list}>
        {messages.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🎙️</span>
            <p>No messages yet</p>
            <p className={styles.emptyHint}>Start talking to begin</p>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`${styles.msg} ${styles[msg.role]}`}
            >
              <span className={styles.roleTag}>{ROLE_LABEL[msg.role]}</span>
              <p className={styles.msgText}>{msg.text}</p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}