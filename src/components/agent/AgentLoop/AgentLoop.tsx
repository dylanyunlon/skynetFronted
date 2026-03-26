/**
 * AgentLoop — Visualizes the tool_use → tool_result cycle
 * v22: Migrated from CSS Modules to Tailwind cn() utilities
 */
import React, { useMemo } from 'react';
import { cn } from '@/lib/cn';
import type { AgenticBlock } from '@/types/agentic';

export type LoopStep = 'prompt' | 'model' | 'tool_use' | 'tool_result' | 'done';

interface AgentLoopProps {
  blocks: AgenticBlock[];
  currentTurn: number;
  isRunning: boolean;
  activeStep?: LoopStep;
  className?: string;
}

const STEP_META: Record<LoopStep, { label: string; icon: string; color: string }> = {
  prompt:      { label: 'Prompt',      icon: '💬', color: 'var(--sky-info)' },
  model:       { label: 'Model',       icon: '🧠', color: 'var(--sky-primary)' },
  tool_use:    { label: 'Tool Use',    icon: '⚡', color: 'var(--sky-warning)' },
  tool_result: { label: 'Result',      icon: '📋', color: 'var(--sky-success)' },
  done:        { label: 'Done',        icon: '✅', color: 'var(--sky-success)' },
};

const STEPS: LoopStep[] = ['prompt', 'model', 'tool_use', 'tool_result'];

function deriveActiveStep(blocks: AgenticBlock[], isRunning: boolean): LoopStep {
  if (!isRunning) return 'done';
  if (blocks.length === 0) return 'prompt';
  const last = blocks[blocks.length - 1];
  switch (last.type) {
    case 'text': case 'thinking': return 'model';
    case 'tool': return last.toolResult !== undefined ? 'tool_result' : 'tool_use';
    case 'turn_summary': return 'prompt';
    default: return 'model';
  }
}

const StepNode: React.FC<{ step: LoopStep; isActive: boolean; isCompleted: boolean }> = ({ step, isActive, isCompleted }) => {
  const meta = STEP_META[step];
  return (
    <div className={cn('flex flex-col items-center gap-1 relative shrink-0', isActive && 'active', isCompleted && 'completed')}
      style={{ '--step-color': meta.color } as React.CSSProperties}>
      <div className={cn(
        'relative w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200',
        'bg-[var(--sky-bg-secondary)] border-[var(--sky-border)]',
        isActive && 'bg-[color-mix(in_srgb,var(--step-color)_15%,transparent)] border-[var(--step-color)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--step-color)_20%,transparent)]',
        isCompleted && 'bg-[color-mix(in_srgb,var(--step-color)_12%,transparent)] border-[color-mix(in_srgb,var(--step-color)_50%,transparent)]',
      )}>
        {isActive && <span className="absolute -inset-1 rounded-full border-2 border-[var(--step-color)] opacity-40 animate-ping" />}
        <span className="text-sm leading-none">{meta.icon}</span>
      </div>
      <span className={cn(
        'text-[10px] font-medium text-[var(--sky-text-tertiary)] transition-colors duration-200',
        isActive && 'text-[var(--sky-text)] font-semibold',
        isCompleted && 'text-[var(--sky-text-secondary)]',
      )}>{meta.label}</span>
    </div>
  );
};

const StepConnector: React.FC<{ filled: boolean }> = ({ filled }) => (
  <div className={cn(
    'flex-1 h-0.5 rounded-[1px] mx-1 mb-[18px] min-w-6 transition-colors duration-200',
    filled ? 'bg-[var(--sky-primary)] opacity-50' : 'bg-[var(--sky-border)]',
  )} />
);

const AgentLoop: React.FC<AgentLoopProps> = ({ blocks, currentTurn, isRunning, activeStep: activeStepProp, className }) => {
  const activeStep = activeStepProp ?? deriveActiveStep(blocks, isRunning);
  const activeIndex = STEPS.indexOf(activeStep === 'done' ? 'tool_result' : activeStep);
  const toolCallCount = useMemo(() => blocks.filter(b => b.type === 'tool' && b.turn === currentTurn).length, [blocks, currentTurn]);

  return (
    <div className={cn('flex flex-col gap-3 p-3 px-4 bg-[var(--sky-surface)] border border-[var(--sky-border-subtle)] rounded-xl', className)}>
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--sky-primary-muted)] rounded-full text-xs font-semibold">
          <span className="text-[var(--sky-text-secondary)]">Turn</span>
          <span className="text-[var(--sky-primary)] tabular-nums">{currentTurn}</span>
        </div>
        {toolCallCount > 0 && (
          <div className="text-xs text-[var(--sky-text-secondary)] px-2 py-0.5 bg-[var(--sky-bg-secondary)] rounded-full">
            ⚡ {toolCallCount} tool call{toolCallCount !== 1 ? 's' : ''}
          </div>
        )}
        {isRunning && (
          <span className="relative w-2 h-2 ml-auto">
            <span className="absolute inset-0 bg-[var(--sky-success)] rounded-full animate-ping" />
          </span>
        )}
      </div>
      <div className="flex items-center">
        {STEPS.map((step, i) => (
          <React.Fragment key={step}>
            <StepNode step={step} isActive={i === activeIndex && isRunning} isCompleted={i < activeIndex || activeStep === 'done'} />
            {i < STEPS.length - 1 && <StepConnector filled={i < activeIndex || activeStep === 'done'} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default AgentLoop;
export { AgentLoop };
