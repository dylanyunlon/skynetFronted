/**
 * SubagentPanel — Recursive sub-agent task display
 * Shows sub-agent lifecycle: start → running → result
 * Supports nested sub-agents (recursive rendering)
 */
import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import type { AgenticBlock, ToolResultMeta } from '@/types/agentic';
import styles from './SubagentPanel.module.css';

interface SubagentInfo {
  id: string;
  type: 'explore' | 'plan' | 'general' | string;
  prompt: string;
  result?: string;
  resultMeta?: ToolResultMeta;
  isRunning: boolean;
  turns?: number;
  blocks?: AgenticBlock[];   // nested blocks for recursive rendering
  children?: SubagentInfo[]; // nested sub-agents
}

interface SubagentPanelProps {
  agent: SubagentInfo;
  depth?: number;
  className?: string;
}

const TYPE_META: Record<string, { label: string; icon: string; accent: string }> = {
  explore:  { label: 'Explorer',  icon: '🔭', accent: 'var(--sky-info)' },
  plan:     { label: 'Planner',   icon: '📐', accent: 'var(--sky-warning)' },
  general:  { label: 'Agent',     icon: '🤖', accent: 'var(--sky-accent)' },
};

const MAX_DEPTH = 4;

const SubagentPanel: React.FC<SubagentPanelProps> = ({
  agent,
  depth = 0,
  className,
}) => {
  const [expanded, setExpanded] = useState(depth < 2);
  const meta = TYPE_META[agent.type] || TYPE_META.general;

  if (depth >= MAX_DEPTH) {
    return (
      <div className={cn(styles.wrapper, styles.maxDepth, className)}>
        <span className={styles.maxDepthLabel}>⚠ Max nesting depth reached</span>
      </div>
    );
  }

  return (
    <div
      className={cn(styles.wrapper, className)}
      style={{
        '--agent-accent': meta.accent,
        '--agent-depth': depth,
      } as React.CSSProperties}
    >
      {/* Header */}
      <button className={styles.header} onClick={() => setExpanded(!expanded)}>
        <span className={styles.depthBar} />
        <span className={styles.icon}>{meta.icon}</span>
        <div className={styles.headerText}>
          <span className={styles.typeLabel}>{meta.label}</span>
          <span className={styles.prompt}>
            {agent.prompt.length > 100
              ? agent.prompt.slice(0, 100) + '…'
              : agent.prompt}
          </span>
        </div>
        <div className={styles.headerBadges}>
          {agent.isRunning && (
            <span className={styles.runningBadge}>
              <span className={styles.dot} />
              Running
            </span>
          )}
          {agent.turns !== undefined && (
            <span className={styles.turnsBadge}>{agent.turns} turns</span>
          )}
          <span className={styles.chevron} data-expanded={expanded}>▸</span>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className={styles.body}>
          {/* Prompt */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Prompt</div>
            <p className={styles.sectionText}>{agent.prompt}</p>
          </div>

          {/* Result */}
          {agent.result && (
            <div className={styles.section}>
              <div className={styles.sectionLabel}>Result</div>
              <pre className={styles.resultPre}>
                {agent.result.length > 500
                  ? agent.result.slice(0, 500) + '\n… (truncated)'
                  : agent.result}
              </pre>
            </div>
          )}

          {/* Nested sub-agents */}
          {agent.children && agent.children.length > 0 && (
            <div className={styles.nested}>
              {agent.children.map((child) => (
                <SubagentPanel
                  key={child.id}
                  agent={child}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubagentPanel;
export { SubagentPanel };
export type { SubagentInfo };
