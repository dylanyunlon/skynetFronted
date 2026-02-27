/**
 * AgentLoop — Visualizes the tool_use → tool_result cycle
 * Inspired by Claude Code Agent Loop v0-v4 architecture
 * Shows the Prompt → Model → Tool Use → Result pipeline
 */
import React, { useMemo } from 'react';
import { cn } from '@/lib/cn';
import type { AgenticBlock } from '@/types/agentic';
import styles from './AgentLoop.module.css';

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

/**
 * Compute which step is currently active based on recent blocks
 */
function deriveActiveStep(blocks: AgenticBlock[], isRunning: boolean): LoopStep {
  if (!isRunning) return 'done';
  if (blocks.length === 0) return 'prompt';

  const last = blocks[blocks.length - 1];
  switch (last.type) {
    case 'text':
    case 'thinking':
      return 'model';
    case 'tool':
      return last.toolResult !== undefined ? 'tool_result' : 'tool_use';
    case 'turn_summary':
      return 'prompt'; // new turn = back to prompt
    default:
      return 'model';
  }
}

/** Single step indicator dot + label */
const StepNode: React.FC<{
  step: LoopStep;
  isActive: boolean;
  isCompleted: boolean;
}> = ({ step, isActive, isCompleted }) => {
  const meta = STEP_META[step];
  return (
    <div
      className={cn(styles.stepNode, {
        [styles.active]: isActive,
        [styles.completed]: isCompleted,
      })}
      style={{ '--step-color': meta.color } as React.CSSProperties}
    >
      <div className={styles.stepDot}>
        {isActive && <span className={styles.stepPulse} />}
        <span className={styles.stepIcon}>{meta.icon}</span>
      </div>
      <span className={styles.stepLabel}>{meta.label}</span>
    </div>
  );
};

/** Connector line between steps */
const StepConnector: React.FC<{ filled: boolean }> = ({ filled }) => (
  <div className={cn(styles.connector, { [styles.filled]: filled })} />
);

/**
 * Compact turn counter badge
 */
const TurnBadge: React.FC<{ turn: number; maxTurns?: number }> = ({ turn, maxTurns }) => (
  <div className={styles.turnBadge}>
    <span className={styles.turnLabel}>Turn</span>
    <span className={styles.turnValue}>
      {turn}{maxTurns ? ` / ${maxTurns}` : ''}
    </span>
  </div>
);

/**
 * Tool call count for current turn
 */
const ToolCountBadge: React.FC<{ count: number }> = ({ count }) => (
  <div className={styles.toolCountBadge}>
    ⚡ {count} tool call{count !== 1 ? 's' : ''}
  </div>
);

const AgentLoop: React.FC<AgentLoopProps> = ({
  blocks,
  currentTurn,
  isRunning,
  activeStep: activeStepProp,
  className,
}) => {
  const activeStep = activeStepProp ?? deriveActiveStep(blocks, isRunning);

  const activeIndex = STEPS.indexOf(activeStep === 'done' ? 'tool_result' : activeStep);

  const toolCallCount = useMemo(() => {
    return blocks.filter(b => b.type === 'tool' && b.turn === currentTurn).length;
  }, [blocks, currentTurn]);

  return (
    <div className={cn(styles.wrapper, className)}>
      {/* Turn indicator */}
      <div className={styles.header}>
        <TurnBadge turn={currentTurn} />
        {toolCallCount > 0 && <ToolCountBadge count={toolCallCount} />}
        {isRunning && (
          <span className={styles.runningDot}>
            <span className={styles.runningPulse} />
          </span>
        )}
      </div>

      {/* Step pipeline */}
      <div className={styles.pipeline}>
        {STEPS.map((step, i) => (
          <React.Fragment key={step}>
            <StepNode
              step={step}
              isActive={i === activeIndex && isRunning}
              isCompleted={i < activeIndex || activeStep === 'done'}
            />
            {i < STEPS.length - 1 && (
              <StepConnector filled={i < activeIndex || activeStep === 'done'} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default AgentLoop;
export { AgentLoop };
