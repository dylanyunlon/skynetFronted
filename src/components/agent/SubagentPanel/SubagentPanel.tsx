/**
 * SubagentPanel — Recursive sub-agent task display
 * v22: Migrated from CSS Modules to Tailwind cn() utilities
 */
import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import type { AgenticBlock, ToolResultMeta } from '@/types/agentic';

interface SubagentInfo {
  id: string;
  type: 'explore' | 'plan' | 'general' | string;
  prompt: string;
  result?: string;
  resultMeta?: ToolResultMeta;
  isRunning: boolean;
  turns?: number;
  blocks?: AgenticBlock[];
  children?: SubagentInfo[];
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

const SubagentPanel: React.FC<SubagentPanelProps> = ({ agent, depth = 0, className }) => {
  const [expanded, setExpanded] = useState(depth < 2);
  const meta = TYPE_META[agent.type] || TYPE_META.general;

  if (depth >= MAX_DEPTH) {
    return (
      <div className={cn('border border-dashed border-amber-400/40 rounded-lg px-3 py-2 opacity-60', className)}>
        <span className="text-xs text-amber-500">⚠ Max nesting depth reached</span>
      </div>
    );
  }

  return (
    <div className={cn('border-l-2 rounded-lg overflow-hidden', className)}
      style={{ borderLeftColor: meta.accent, marginLeft: depth > 0 ? '0.75rem' : undefined }}>

      <button className="flex items-center gap-2 w-full px-3 py-2 bg-transparent border-none text-left cursor-pointer hover:bg-[var(--sky-bg-hover)] transition-colors" onClick={() => setExpanded(!expanded)}>
        <span className="text-base">{meta.icon}</span>
        <div className="flex-1 min-w-0 flex flex-col gap-px">
          <span className="text-xs font-semibold text-[var(--sky-text-secondary)] uppercase tracking-wider">{meta.label}</span>
          <span className="text-[0.8125rem] text-[var(--sky-text)] truncate">{agent.prompt.length > 100 ? agent.prompt.slice(0, 100) + '…' : agent.prompt}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {agent.isRunning && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Running
            </span>
          )}
          {agent.turns !== undefined && <span className="text-xs text-[var(--sky-text-tertiary)] tabular-nums">{agent.turns} turns</span>}
          <span className={cn('text-xs text-[var(--sky-text-tertiary)] transition-transform duration-100', expanded && 'rotate-90')}>▸</span>
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 animate-in slide-in-from-top-1">
          <div>
            <div className="text-[10px] font-medium text-[var(--sky-text-tertiary)] uppercase tracking-wider mb-1">Prompt</div>
            <p className="text-[0.8125rem] text-[var(--sky-text)] leading-relaxed m-0">{agent.prompt}</p>
          </div>
          {agent.result && (
            <div>
              <div className="text-[10px] font-medium text-[var(--sky-text-tertiary)] uppercase tracking-wider mb-1">Result</div>
              <pre className="text-xs font-mono text-[var(--sky-text-secondary)] whitespace-pre-wrap break-all bg-[var(--sky-bg-secondary)] rounded-md p-2 max-h-48 overflow-auto m-0">
                {agent.result.length > 500 ? agent.result.slice(0, 500) + '\n… (truncated)' : agent.result}
              </pre>
            </div>
          )}
          {agent.children && agent.children.length > 0 && (
            <div className="space-y-2 mt-2">
              {agent.children.map((child) => <SubagentPanel key={child.id} agent={child} depth={depth + 1} />)}
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
