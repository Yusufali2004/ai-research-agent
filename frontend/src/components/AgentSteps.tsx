import { AgentStep } from '../types';
import styles from './AgentSteps.module.css';

interface Props {
  steps: AgentStep[];
}

/**
 * AgentSteps
 *
 * Shows the 5-step research workflow with live status indicators.
 * Each step can be: pending | active | done
 */
export function AgentSteps({ steps }: Props) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Agent Workflow</h3>

      <ol className={styles.list}>
        {steps.map(step => (
          <li key={step.id} className={`${styles.item} ${styles[step.status]}`}>
            <span className={styles.icon}>
              {step.status === 'done'   && '✓'}
              {step.status === 'active' && '▶'}
              {step.status === 'pending' && step.id}
            </span>
            <span className={styles.label}>{step.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
