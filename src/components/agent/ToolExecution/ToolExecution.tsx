/**
 * ToolExecution — Displays bash/tool command execution with
 * expandable output, timing, and status indicators.
 * Claude Code style: "$ command" + expandable output
 */
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { TOOL_DISPLAY } from '@/types/agentic';
import type { ToolResultMeta } from '@/types/agentic';
import styles from './ToolExecution.module.css';

interface ToolExecutionProps {
  tool: string;
  args?: Record<string, any>;
  result?: string;
  resultMeta?: ToolResultMeta;
  success?: boolean;
  durationMs?: number;
  description?: string;
  isRunning?: boolean;
  className?: string;
}

/** Format ms into human-readable */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const min = Math.floor(ms / 60000);
  const sec = Math.round((ms % 60000) / 1000);
  return `${min}m ${sec}s`;
}

/** Extract display command from tool args */
function extractCommand(tool: string, args: Record<string, any> = {}): string {
  if (tool === 'bash' || tool === 'run_script') {
    return args.command || args.script || args.content || '';
  }
  if (tool === 'edit_file' || tool === 'write_file') {
    return args.path || args.file_path || '';
  }
  if (tool === 'read_file' || tool === 'view_truncated') {
    return args.path || args.file_path || '';
  }
  if (tool === 'web_search') {
    return args.query || '';
  }
  if (tool === 'web_fetch') {
    return args.url || '';
  }
  if (tool === 'grep_search' || tool === 'file_search') {
    return args.pattern || args.query || '';
  }
  // Fallback: show first string arg
  const firstStr = Object.values(args).find(v => typeof v === 'string');
  return typeof firstStr === 'string' ? firstStr : '';
}

/** Truncate output for preview */
function truncateOutput(text: string, maxLines = 8): { preview: string; truncated: boolean } {
  const lines = text.split('\n');
  if (lines.length <= maxLines) return { preview: text, truncated: false };
  return {
    preview: lines.slice(0, maxLines).join('\n'),
    truncated: true,
  };
}

const ToolExecution: React.FC<ToolExecutionProps> = ({
  tool,
  args,
  result,
  resultMeta,
  success,
  durationMs,
  description,
  isRunning,
  className,
}) => {
  const [expanded, setExpanded] = useState(false);
  const outputRef = useRef<HTMLPreElement>(null);
  const displayInfo = TOOL_DISPLAY[tool] || { label: tool, icon: '🔧', color: 'text-gray-400' };
  const command = extractCommand(tool, args);
  const isBashLike = tool === 'bash' || tool === 'run_script';

  const output = result || '';
  const { preview, truncated } = truncateOutput(output);

  // Status icon
  const statusIcon = isRunning
    ? '⏳'
    : success === true
    ? '✓'
    : success === false
    ? '✗'
    : '•';

  const statusColor = isRunning
    ? 'var(--sky-warning)'
    : success === true
    ? 'var(--sky-success)'
    : success === false
    ? 'var(--sky-error)'
    : 'var(--sky-text-tertiary)';

  return (
    <div className={cn(styles.wrapper, className, {
      [styles.running]: isRunning,
      [styles.failed]: success === false,
    })}>
      {/* Header — always visible */}
      <button
        className={styles.header}
        onClick={() => result && setExpanded(!expanded)}
        disabled={!result}
      >
        <span className={styles.icon}>{displayInfo.icon}</span>
        <div className={styles.headerContent}>
          <span className={styles.toolLabel}>{displayInfo.label}</span>
          {isBashLike && command && (
            <code className={styles.command}>$ {command.length > 80 ? command.slice(0, 80) + '…' : command}</code>
          )}
          {!isBashLike && command && (
            <span className={styles.argPreview}>{command.length > 60 ? command.slice(0, 60) + '…' : command}</span>
          )}
          {description && description !== displayInfo.label && (
            <span className={styles.description}>{description}</span>
          )}
        </div>

        <div className={styles.badges}>
          {durationMs !== undefined && (
            <span className={styles.duration}>{formatDuration(durationMs)}</span>
          )}
          {resultMeta?.exit_code !== undefined && resultMeta.exit_code !== 0 && (
            <span className={styles.exitCode}>exit {resultMeta.exit_code}</span>
          )}
          <span className={styles.status} style={{ color: statusColor }}>
            {statusIcon}
          </span>
          {result && (
            <span className={styles.chevron} data-expanded={expanded}>
              ▸
            </span>
          )}
        </div>
      </button>

      {/* Expandable output */}
      {expanded && result && (
        <div className={styles.output}>
          <pre ref={outputRef} className={styles.outputPre}>
            {expanded ? output : preview}
          </pre>
          {truncated && !expanded && (
            <button className={styles.showMore} onClick={() => setExpanded(true)}>
              Show all ({output.split('\n').length} lines)
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ToolExecution;
export { ToolExecution };
