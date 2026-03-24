/**
 * CodeExecutionPanelLogic — v20
 *
 * Unified panel state connecting CodeExecutionEngine, StreamingCodeOutput,
 * and SandboxStateManager into a cohesive code execution panel.
 */
import { detectLanguage, type ExecutionLanguage, type ExecutionStatus } from './codeExecutionEngine';
import { stripAnsiCodes, detectProgressBar, type ProgressInfo, type OutputType } from './streamingCodeOutput';

// ============================================================
// Types
// ============================================================

export interface OutputLine {
  text: string;
  type: OutputType;
  lineNumber: number;
  timestamp: number;
  execId: string;
}

export interface OutputBufferState {
  lines: OutputLine[];
  partialLine: string;
}

export interface PanelExecution {
  id: string;
  command: string;
  language: ExecutionLanguage;
  status: ExecutionStatus;
  startedAt: number;
  completedAt?: number;
  cancelledAt?: number;
  exitCode?: number;
}

export interface CodeExecutionPanelState {
  executions: PanelExecution[];
  outputBuffer: OutputBufferState;
  sandboxStatus: 'initializing' | 'ready' | 'executing' | 'terminated';
  sandboxWorkDir: string;
  isExecuting: boolean;
}

export interface PanelSummary {
  status: 'idle' | 'executing' | 'terminated';
  totalExecutions: number;
  activeCount: number;
  completedCount: number;
  failedCount: number;
  outputLineCount: number;
}

export interface ExecutionHistoryEntry {
  id: string;
  command: string;
  language: ExecutionLanguage;
  exitCode?: number;
  startedAt: number;
  completedAt?: number;
  durationMs?: number;
}

// ============================================================
// State creation
// ============================================================

let _nextExecId = 1;

export function createPanelState(opts?: { workDir?: string }): CodeExecutionPanelState {
  return {
    executions: [],
    outputBuffer: { lines: [], partialLine: '' },
    sandboxStatus: 'ready',
    sandboxWorkDir: opts?.workDir || '/home/claude',
    isExecuting: false,
  };
}

// ============================================================
// Execution management
// ============================================================

export function submitExecution(
  state: CodeExecutionPanelState,
  command: string,
  language?: ExecutionLanguage,
): CodeExecutionPanelState {
  const detectedLang = language || detectLanguage(command);
  const exec: PanelExecution = {
    id: `exec-${_nextExecId++}-${Date.now()}`,
    command,
    language: detectedLang,
    status: 'running',
    startedAt: Date.now(),
  };
  return {
    ...state,
    executions: [...state.executions, exec],
    isExecuting: true,
    sandboxStatus: 'executing',
  };
}

export function cancelExecution(
  state: CodeExecutionPanelState,
  execId: string,
): CodeExecutionPanelState {
  const exec = state.executions.find(e => e.id === execId);
  if (!exec || exec.status !== 'running') return state;

  const updatedExecutions = state.executions.map(e =>
    e.id === execId
      ? { ...e, status: 'failed' as const, cancelledAt: Date.now() }
      : e
  );
  const anyRunning = updatedExecutions.some(e => e.status === 'running');
  return {
    ...state,
    executions: updatedExecutions,
    isExecuting: anyRunning,
    sandboxStatus: anyRunning ? 'executing' : 'ready',
  };
}

export function getActiveExecution(state: CodeExecutionPanelState): PanelExecution | null {
  const running = state.executions.filter(e => e.status === 'running');
  if (running.length === 0) return null;
  return running[running.length - 1];
}

// ============================================================
// Output management
// ============================================================

export function appendOutput(
  state: CodeExecutionPanelState,
  execId: string,
  chunk: string,
  stream: 'stdout' | 'stderr',
): CodeExecutionPanelState {
  const cleanChunk = stripAnsiCodes(chunk);
  const combined = state.outputBuffer.partialLine + cleanChunk;
  const parts = combined.split('\n');
  const partialLine = parts[parts.length - 1]; // may be '' if chunk ends with \n
  const fullLines = parts.slice(0, -1).filter(l => l.length > 0);

  const baseLineNum = state.outputBuffer.lines.length;
  const newLines: OutputLine[] = fullLines.map((text, i) => ({
    text,
    type: stream === 'stderr' ? 'error' as const : detectOutputLineType(text),
    lineNumber: baseLineNum + i + 1,
    timestamp: Date.now(),
    execId,
  }));

  return {
    ...state,
    outputBuffer: {
      lines: [...state.outputBuffer.lines, ...newLines],
      partialLine,
    },
  };
}

function detectOutputLineType(line: string): OutputType {
  const lower = line.toLowerCase();
  if (lower.includes('error') || lower.includes('fail') || lower.includes('exception')) return 'error';
  if (lower.includes('warn')) return 'warning';
  if (lower.includes('success') || lower.includes('pass') || lower.includes('ok')) return 'success';
  return 'stdout';
}

export function clearOutput(state: CodeExecutionPanelState): CodeExecutionPanelState {
  return {
    ...state,
    outputBuffer: { lines: [], partialLine: '' },
  };
}

// ============================================================
// History & Stats
// ============================================================

export function getExecutionHistory(state: CodeExecutionPanelState): ExecutionHistoryEntry[] {
  return state.executions
    .filter(e => e.status === 'completed' || e.status === 'failed')
    .map(e => ({
      id: e.id,
      command: e.command,
      language: e.language,
      exitCode: e.exitCode,
      startedAt: e.startedAt,
      completedAt: e.completedAt,
      durationMs: e.completedAt ? e.completedAt - e.startedAt : undefined,
    }));
}

export function getPanelSummary(state: CodeExecutionPanelState): PanelSummary {
  const running = state.executions.filter(e => e.status === 'running');
  const completed = state.executions.filter(e => e.status === 'completed');
  const failed = state.executions.filter(e => e.status === 'failed');

  return {
    status: state.sandboxStatus === 'terminated' ? 'terminated'
      : running.length > 0 ? 'executing'
      : 'idle',
    totalExecutions: state.executions.length,
    activeCount: running.length,
    completedCount: completed.length,
    failedCount: failed.length,
    outputLineCount: state.outputBuffer.lines.length,
  };
}

export function detectProgressFromOutput(line: string): ProgressInfo | null {
  return detectProgressBar(line);
}

export function exportPanelHistory(state: CodeExecutionPanelState): string {
  return JSON.stringify({
    executions: state.executions.map(e => ({
      id: e.id,
      command: e.command,
      language: e.language,
      status: e.status,
      exitCode: e.exitCode,
      startedAt: e.startedAt,
      completedAt: e.completedAt,
    })),
    outputLines: state.outputBuffer.lines.map(l => ({
      text: l.text,
      type: l.type,
      lineNumber: l.lineNumber,
      execId: l.execId,
    })),
    exportedAt: new Date().toISOString(),
  });
}
