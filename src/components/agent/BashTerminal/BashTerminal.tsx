/**
 * BashTerminal — Terminal emulator component
 * v22: Migrated from CSS Modules to Tailwind cn() utilities
 */
import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/cn';

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error' | 'info' | 'separator';
  content: string;
  timestamp?: number;
  exitCode?: number;
}

interface BashTerminalProps {
  lines: TerminalLine[];
  title?: string;
  isRunning?: boolean;
  currentCommand?: string;
  workDir?: string;
  maxHeight?: number;
  className?: string;
}

const TermLine: React.FC<{ line: TerminalLine; workDir?: string }> = ({ line, workDir }) => {
  switch (line.type) {
    case 'command':
      return (
        <div className="flex items-start gap-1.5">
          <span className="flex items-center gap-1 shrink-0">
            {workDir && <span className="text-emerald-400">{workDir.split('/').pop()}</span>}
            <span className="text-blue-400">$</span>
          </span>
          <span className="text-[#cdd6f4]">{line.content}</span>
          {line.exitCode !== undefined && line.exitCode !== 0 && (
            <span className="ml-auto text-red-400 text-[0.625rem] px-1.5 py-0.5 rounded bg-red-400/10 shrink-0">exit {line.exitCode}</span>
          )}
        </div>
      );
    case 'output':
      return <pre className="text-[#cdd6f4] m-0 whitespace-pre-wrap break-all">{line.content}</pre>;
    case 'error':
      return <pre className="text-red-400 m-0 whitespace-pre-wrap break-all">{line.content}</pre>;
    case 'info':
      return <div className="text-emerald-400">{line.content}</div>;
    case 'separator':
      return <hr className="border-[#313244] my-1" />;
    default:
      return null;
  }
};

const BashTerminal: React.FC<BashTerminalProps> = ({
  lines, title = 'Terminal', isRunning, currentCommand, workDir, maxHeight = 400, className,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollRef.current && (scrollRef.current.scrollTop = scrollRef.current.scrollHeight); }, [lines.length]);

  return (
    <div className={cn('rounded-xl overflow-hidden border border-[#3a3a3a]', className)}>
      {/* macOS title bar */}
      <div className="flex items-center px-3 py-2 bg-[#2d2d2d]">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="flex-1 text-center text-xs text-[#999]">{title}</span>
        <div className="w-12 flex justify-end">{isRunning && <span>⏳</span>}</div>
      </div>
      {/* Terminal body */}
      <div ref={scrollRef} className="bg-[#1a1a1a] p-3 overflow-auto font-mono text-xs leading-relaxed" style={{ maxHeight }}>
        {lines.map((line) => <TermLine key={line.id} line={line} workDir={workDir} />)}
        {isRunning && currentCommand && (
          <div className="flex items-start gap-1.5">
            <span className="text-blue-400">$</span>
            <span className="text-[#cdd6f4]">{currentCommand}</span>
            <span className="animate-pulse">▋</span>
          </div>
        )}
        {isRunning && !currentCommand && (
          <div className="flex items-start gap-1.5">
            <span className="text-blue-400">$</span>
            <span className="animate-pulse">▋</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BashTerminal;
export { BashTerminal };
export type { TerminalLine };
