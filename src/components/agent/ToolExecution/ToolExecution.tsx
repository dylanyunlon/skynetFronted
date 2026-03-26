/**
 * ToolExecution — Displays bash/tool command execution with
 * expandable output, timing, and status indicators.
 * Claude Code style: "$ command" + expandable output
 *
 * v22: Migrated from CSS Modules to Tailwind cn() utilities
 */
import React, { useState, useRef } from 'react';
import { cn } from '@/lib/cn';
import { TOOL_DISPLAY } from '@/types/agentic';
import type { ToolResultMeta } from '@/types/agentic';

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

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const min = Math.floor(ms / 60000);
  const sec = Math.round((ms % 60000) / 1000);
  return `${min}m ${sec}s`;
}

function extractCommand(tool: string, args: Record<string, any> = {}): string {
  if (tool === 'bash' || tool === 'run_script') return args.command || args.script || args.content || '';
  if (tool === 'edit_file' || tool === 'write_file') return args.path || args.file_path || '';
  if (tool === 'read_file' || tool === 'view_truncated') return args.path || args.file_path || '';
  if (tool === 'web_search') return args.query || '';
  if (tool === 'web_fetch') return args.url || '';
  if (tool === 'grep_search' || tool === 'file_search') return args.pattern || args.query || '';
  const firstStr = Object.values(args).find(v => typeof v === 'string');
  return typeof firstStr === 'string' ? firstStr : '';
}

function truncateOutput(text: string, maxLines = 8): { preview: string; truncated: boolean } {
  const lines = text.split('\n');
  if (lines.length <= maxLines) return { preview: text, truncated: false };
  return { preview: lines.slice(0, maxLines).join('\n'), truncated: true };
}

const ToolExecution: React.FC<ToolExecutionProps> = ({
  tool, args, result, resultMeta, success, durationMs, description, isRunning, className,
}) => {
  const [expanded, setExpanded] = useState(false);
  const outputRef = useRef<HTMLPreElement>(null);
  const displayInfo = TOOL_DISPLAY[tool] || { label: tool, icon: '🔧', color: 'text-gray-400' };
  const command = extractCommand(tool, args);
  const isBashLike = tool === 'bash' || tool === 'run_script';
  const output = result || '';
  const { preview, truncated } = truncateOutput(output);

  const statusIcon = isRunning ? '⏳' : success === true ? '✓' : success === false ? '✗' : '•';
  const statusColor = isRunning ? 'var(--sky-warning)' : success === true ? 'var(--sky-success)' : success === false ? 'var(--sky-error)' : 'var(--sky-text-tertiary)';

  return (
    <div className={cn(
      'border border-[var(--sky-border-subtle)] rounded-lg overflow-hidden transition-colors duration-100 hover:border-[var(--sky-border)]',
      isRunning && 'border-amber-400/40',
      success === false && 'border-red-400/30 bg-[var(--sky-error-bg)]',
      className,
    )}>
      <button
        className="flex items-center gap-2 w-full px-3 py-2 cursor-pointer transition-colors duration-100 hover:bg-[var(--sky-bg-hover)] disabled:cursor-default bg-transparent border-none text-left"
        onClick={() => result && setExpanded(!expanded)}
        disabled={!result}
      >
        <span className="text-sm shrink-0 w-5 text-center">{displayInfo.icon}</span>
        <div className="flex-1 min-w-0 flex flex-col gap-px">
          <span className="text-xs font-semibold text-[var(--sky-text-secondary)] uppercase tracking-wider">{displayInfo.label}</span>
          {isBashLike && command && (
            <code className="font-mono text-[0.8125rem] text-[var(--sky-text)] truncate bg-transparent p-0">$ {command.length > 80 ? command.slice(0, 80) + '…' : command}</code>
          )}
          {!isBashLike && command && (
            <span className="text-[0.8125rem] text-[var(--sky-text)] truncate">{command.length > 60 ? command.slice(0, 60) + '…' : command}</span>
          )}
          {description && description !== displayInfo.label && (
            <span className="text-xs text-[var(--sky-text-tertiary)] truncate">{description}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {durationMs !== undefined && <span className="text-xs text-[var(--sky-text-tertiary)] tabular-nums">{formatDuration(durationMs)}</span>}
          {resultMeta?.exit_code !== undefined && resultMeta.exit_code !== 0 && <span className="text-xs text-[var(--sky-error)] font-mono">exit {resultMeta.exit_code}</span>}
          <span className="text-sm font-bold leading-none" style={{ color: statusColor }}>{statusIcon}</span>
          {result && <span className={cn('text-xs text-[var(--sky-text-tertiary)] transition-transform duration-100', expanded && 'rotate-90')}>▸</span>}
        </div>
      </button>

      {expanded && result && (
        <div className="border-t border-[var(--sky-border-subtle)] bg-[var(--sky-bg-secondary)] animate-in slide-in-from-top-1 duration-100">
          <pre ref={outputRef} className="m-0 p-3 font-mono text-xs text-[var(--sky-text-secondary)] whitespace-pre-wrap break-all max-h-[300px] overflow-y-auto leading-relaxed">{output}</pre>
          {truncated && !expanded && (
            <button className="block w-full py-1 px-3 text-xs text-[var(--sky-primary)] cursor-pointer text-center border-t border-[var(--sky-border-subtle)] bg-transparent hover:bg-[var(--sky-bg-hover)]" onClick={() => setExpanded(true)}>
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
