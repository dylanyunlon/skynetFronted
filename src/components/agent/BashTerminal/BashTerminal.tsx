/**
 * BashTerminal — Terminal emulator component
 * Displays command history with styled output, supports
 * streaming output and scroll-to-bottom behavior.
 */
import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/cn';
import styles from './BashTerminal.module.css';

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

/** Format timestamp for terminal prompt */
function formatTime(ts?: number): string {
  if (!ts) return '';
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
}

/** Render a single terminal line */
const TermLine: React.FC<{ line: TerminalLine; workDir?: string }> = ({ line, workDir }) => {
  switch (line.type) {
    case 'command':
      return (
        <div className={styles.commandLine}>
          <span className={styles.prompt}>
            {workDir && <span className={styles.cwd}>{workDir.split('/').pop()}</span>}
            <span className={styles.promptChar}>$</span>
          </span>
          <span className={styles.commandText}>{line.content}</span>
          {line.exitCode !== undefined && line.exitCode !== 0 && (
            <span className={styles.exitBadge}>exit {line.exitCode}</span>
          )}
        </div>
      );
    case 'output':
      return <pre className={styles.outputLine}>{line.content}</pre>;
    case 'error':
      return <pre className={cn(styles.outputLine, styles.errorLine)}>{line.content}</pre>;
    case 'info':
      return <div className={styles.infoLine}>{line.content}</div>;
    case 'separator':
      return <hr className={styles.separator} />;
    default:
      return null;
  }
};

const BashTerminal: React.FC<BashTerminalProps> = ({
  lines,
  title = 'Terminal',
  isRunning,
  currentCommand,
  workDir,
  maxHeight = 400,
  className,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new lines
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines.length]);

  return (
    <div className={cn(styles.wrapper, className)}>
      {/* Title bar */}
      <div className={styles.titleBar}>
        <div className={styles.trafficLights}>
          <span className={cn(styles.dot, styles.red)} />
          <span className={cn(styles.dot, styles.yellow)} />
          <span className={cn(styles.dot, styles.green)} />
        </div>
        <span className={styles.title}>{title}</span>
        <div className={styles.titleRight}>
          {isRunning && <span className={styles.runningIndicator}>⏳</span>}
        </div>
      </div>

      {/* Terminal body */}
      <div
        ref={scrollRef}
        className={styles.body}
        style={{ maxHeight }}
      >
        {lines.map((line) => (
          <TermLine key={line.id} line={line} workDir={workDir} />
        ))}

        {/* Current running command cursor */}
        {isRunning && currentCommand && (
          <div className={styles.commandLine}>
            <span className={styles.prompt}>
              <span className={styles.promptChar}>$</span>
            </span>
            <span className={styles.commandText}>{currentCommand}</span>
            <span className={styles.cursor} />
          </div>
        )}

        {/* Blinking cursor when idle & running */}
        {isRunning && !currentCommand && (
          <div className={styles.commandLine}>
            <span className={styles.prompt}>
              <span className={styles.promptChar}>$</span>
            </span>
            <span className={styles.cursor} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BashTerminal;
export { BashTerminal };
export type { TerminalLine };
