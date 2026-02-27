/**
 * TaskProgress — Task progress visualization
 * Shows turns, tool calls, elapsed time, token usage, and cost.
 * Matches Claude Code's "Done" summary bar.
 */
import React, { useMemo } from 'react';
import { cn } from '@/lib/cn';
import type { TodoStatus } from '@/types/agentic';
import styles from './TaskProgress.module.css';

interface TaskProgressProps {
  turns: number;
  maxTurns?: number;
  totalToolCalls: number;
  elapsed: number;            // seconds
  inputTokens?: number;
  outputTokens?: number;
  totalCost?: number;
  todoStatus?: TodoStatus;
  isRunning: boolean;
  stopReason?: string;
  className?: string;
}

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

function formatTokens(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1000000) return `${(n / 1000).toFixed(1)}K`;
  return `${(n / 1000000).toFixed(2)}M`;
}

function formatCost(cost: number): string {
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(2)}`;
}

/** Single stat item */
const StatItem: React.FC<{
  label: string;
  value: string | number;
  icon?: string;
  accent?: string;
}> = ({ label, value, icon, accent }) => (
  <div className={styles.stat}>
    {icon && <span className={styles.statIcon}>{icon}</span>}
    <span className={styles.statValue} style={accent ? { color: accent } : undefined}>
      {value}
    </span>
    <span className={styles.statLabel}>{label}</span>
  </div>
);

/** Todo progress bar (if todos exist) */
const TodoBar: React.FC<{ todo: TodoStatus }> = ({ todo }) => {
  const pct = todo.total > 0 ? Math.round((todo.completed / todo.total) * 100) : 0;
  return (
    <div className={styles.todoBar}>
      <div className={styles.todoProgress}>
        <div className={styles.todoFill} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.todoLabel}>
        {todo.completed}/{todo.total} tasks ({pct}%)
      </span>
    </div>
  );
};

const TaskProgress: React.FC<TaskProgressProps> = ({
  turns,
  maxTurns,
  totalToolCalls,
  elapsed,
  inputTokens,
  outputTokens,
  totalCost,
  todoStatus,
  isRunning,
  stopReason,
  className,
}) => {
  return (
    <div className={cn(styles.wrapper, className, {
      [styles.running]: isRunning,
      [styles.done]: !isRunning,
    })}>
      {/* Status header */}
      <div className={styles.header}>
        {isRunning ? (
          <>
            <span className={styles.runningDot} />
            <span className={styles.statusText}>Running…</span>
          </>
        ) : (
          <>
            <span className={styles.doneIcon}>✓</span>
            <span className={styles.statusText}>Done</span>
            {stopReason && (
              <span className={styles.stopReason}>({stopReason})</span>
            )}
          </>
        )}
      </div>

      {/* Stats row */}
      <div className={styles.stats}>
        <StatItem
          label={maxTurns ? `/ ${maxTurns}` : 'turns'}
          value={turns}
          icon="🔄"
        />
        <StatItem
          label="tool calls"
          value={totalToolCalls}
          icon="⚡"
        />
        <StatItem
          label="elapsed"
          value={formatElapsed(elapsed)}
          icon="⏱"
        />
        {inputTokens !== undefined && (
          <StatItem
            label="in"
            value={formatTokens(inputTokens)}
            icon="📥"
          />
        )}
        {outputTokens !== undefined && (
          <StatItem
            label="out"
            value={formatTokens(outputTokens)}
            icon="📤"
          />
        )}
        {totalCost !== undefined && (
          <StatItem
            label="cost"
            value={formatCost(totalCost)}
            icon="💰"
            accent="var(--sky-success)"
          />
        )}
      </div>

      {/* Todo progress (optional) */}
      {todoStatus && todoStatus.total > 0 && (
        <TodoBar todo={todoStatus} />
      )}
    </div>
  );
};

export default TaskProgress;
export { TaskProgress };
