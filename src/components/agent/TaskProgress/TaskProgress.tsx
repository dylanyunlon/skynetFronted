/**
 * TaskProgress — Task progress visualization
 * v22: Migrated from CSS Modules to Tailwind cn() utilities
 */
import React from 'react';
import { cn } from '@/lib/cn';
import type { TodoStatus } from '@/types/agentic';

interface TaskProgressProps {
  turns: number;
  maxTurns?: number;
  totalToolCalls: number;
  elapsed: number;
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

const StatItem: React.FC<{ label: string; value: string | number; icon?: string; accent?: string }> = ({ label, value, icon, accent }) => (
  <div className="flex items-center gap-1">
    {icon && <span className="text-sm">{icon}</span>}
    <span className="text-sm font-semibold tabular-nums" style={accent ? { color: accent } : undefined}>{value}</span>
    <span className="text-xs text-[var(--sky-text-tertiary)]">{label}</span>
  </div>
);

const TodoBar: React.FC<{ todo: TodoStatus }> = ({ todo }) => {
  const pct = todo.total > 0 ? Math.round((todo.completed / todo.total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex-1 h-1.5 rounded-full bg-[var(--sky-bg-tertiary)] overflow-hidden">
        <div className="h-full rounded-full bg-[var(--sky-success)] transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-[var(--sky-text-secondary)] tabular-nums shrink-0">{todo.completed}/{todo.total} ({pct}%)</span>
    </div>
  );
};

const TaskProgress: React.FC<TaskProgressProps> = ({
  turns, maxTurns, totalToolCalls, elapsed, inputTokens, outputTokens, totalCost, todoStatus, isRunning, stopReason, className,
}) => (
  <div className={cn(
    'rounded-xl border px-4 py-3',
    isRunning ? 'border-amber-400/30 bg-amber-50/5' : 'border-emerald-400/30 bg-emerald-50/5',
    className,
  )}>
    <div className="flex items-center gap-2 mb-2">
      {isRunning ? (
        <>
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-sm font-medium text-[var(--sky-text)]">Running…</span>
        </>
      ) : (
        <>
          <span className="text-emerald-500 font-bold">✓</span>
          <span className="text-sm font-medium text-[var(--sky-text)]">Done</span>
          {stopReason && <span className="text-xs text-[var(--sky-text-tertiary)]">({stopReason})</span>}
        </>
      )}
    </div>
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <StatItem label={maxTurns ? `/ ${maxTurns}` : 'turns'} value={turns} icon="🔄" />
      <StatItem label="tool calls" value={totalToolCalls} icon="⚡" />
      <StatItem label="elapsed" value={formatElapsed(elapsed)} icon="⏱" />
      {inputTokens !== undefined && <StatItem label="in" value={formatTokens(inputTokens)} icon="📥" />}
      {outputTokens !== undefined && <StatItem label="out" value={formatTokens(outputTokens)} icon="📤" />}
      {totalCost !== undefined && <StatItem label="cost" value={formatCost(totalCost)} icon="💰" accent="var(--sky-success)" />}
    </div>
    {todoStatus && todoStatus.total > 0 && <TodoBar todo={todoStatus} />}
  </div>
);

export default TaskProgress;
export { TaskProgress };
