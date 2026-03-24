/**
 * CodeExecutionEngine — v19
 * 
 * Manages code execution lifecycle: language detection, sandbox state,
 * execution queueing, output streaming, and exit code handling.
 */

// ============================================================
// Types
// ============================================================
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed';
export type ExecutionLanguage = 'bash' | 'python' | 'javascript' | 'typescript' | 'rust' | 'go' | 'java' | 'c' | 'cpp' | 'ruby';
export type ExecutionComplexity = 'low' | 'medium' | 'high';
export type ExitCodeSeverity = 'success' | 'warning' | 'error' | 'unknown';

export interface ExecutionContext {
  id: string;
  command: string;
  language: ExecutionLanguage;
  status: ExecutionStatus;
  createdAt: number;
  output: string | null;
  exitCode: number | null;
  workDir?: string;
  env?: Record<string, string>;
  timeout?: number;
}

export interface ExecutionQueue {
  pending: ExecutionContext[];
  active: ExecutionContext[];
  completed: ExecutionContext[];
}

export interface QueueStats {
  pending: number;
  active: number;
  completed: number;
  failed: number;
  succeeded: number;
  total: number;
}

export interface ExitCodeInfo {
  code: number;
  label: string;
  severity: ExitCodeSeverity;
}

export interface ExecutionOutput {
  exitCode: number;
  stdout: string;
  stderr: string;
  success: boolean;
  lineCount: number;
  truncated: boolean;
  language: string;
}

// ============================================================
// Language detection patterns
// ============================================================
const LANG_PATTERNS: Array<{ pattern: RegExp; lang: ExecutionLanguage }> = [
  { pattern: /\bpython3?\b|\bpip3?\b|\bpytest\b|\bconda\b/, lang: 'python' },
  { pattern: /\bnode\b|\bnpm\b|\bnpx\b|\byarn\b|\bbun\b|\bvitest\b|\bjest\b/, lang: 'javascript' },
  { pattern: /\brustc\b|\bcargo\b/, lang: 'rust' },
  { pattern: /\bgo\s+(run|build|get|test|mod|install)\b|\bgo\b.*\.go\b/, lang: 'go' },
  { pattern: /\bjavac\b|\bjava\b|\bmaven\b|\bgradle\b/, lang: 'java' },
  { pattern: /\bgcc\b/, lang: 'c' },
  { pattern: /\bg\+\+/, lang: 'cpp' },
  { pattern: /\bruby\b|\bgem\b|\bbundle\b/, lang: 'ruby' },
];

// ============================================================
// detectLanguage
// ============================================================
export function detectLanguage(command: string): ExecutionLanguage {
  if (!command) return 'bash';
  const lower = command.toLowerCase();
  for (const { pattern, lang } of LANG_PATTERNS) {
    if (pattern.test(lower)) return lang;
  }
  return 'bash';
}

// ============================================================
// createExecutionContext
// ============================================================
let contextCounter = 0;
export function createExecutionContext(
  command: string,
  options?: { language?: ExecutionLanguage; workDir?: string; env?: Record<string, string>; timeout?: number }
): ExecutionContext {
  return {
    id: `exec_${Date.now()}_${++contextCounter}_${Math.random().toString(36).slice(2, 8)}`,
    command,
    language: options?.language ?? detectLanguage(command),
    status: 'pending',
    createdAt: Date.now(),
    output: null,
    exitCode: null,
    workDir: options?.workDir,
    env: options?.env,
    timeout: options?.timeout,
  };
}

// ============================================================
// ExecutionQueue operations
// ============================================================
export function createExecutionQueue(): ExecutionQueue {
  return { pending: [], active: [], completed: [] };
}

export function queueExecution(queue: ExecutionQueue, ctx: ExecutionContext): ExecutionQueue {
  return { ...queue, pending: [...queue.pending, ctx] };
}

export function resolveExecution(
  queue: ExecutionQueue,
  id: string,
  newStatus: ExecutionStatus,
  updates?: { exitCode?: number; output?: string }
): ExecutionQueue {
  let result = { ...queue, pending: [...queue.pending], active: [...queue.active], completed: [...queue.completed] };

  // Check pending first
  const pendingIdx = result.pending.findIndex(c => c.id === id);
  if (pendingIdx >= 0) {
    const ctx = { ...result.pending[pendingIdx], status: newStatus, ...updates };
    result.pending.splice(pendingIdx, 1);
    if (newStatus === 'running') {
      result.active.push(ctx);
    } else {
      result.completed.push(ctx);
    }
    return result;
  }

  // Check active
  const activeIdx = result.active.findIndex(c => c.id === id);
  if (activeIdx >= 0) {
    const ctx = { ...result.active[activeIdx], status: newStatus, ...updates };
    result.active.splice(activeIdx, 1);
    if (newStatus === 'completed' || newStatus === 'failed') {
      result.completed.push(ctx);
    } else {
      result.active.push(ctx);
    }
    return result;
  }

  return result; // not found — no-op
}

// ============================================================
// getQueueStats
// ============================================================
export function getQueueStats(queue: ExecutionQueue): QueueStats {
  const failed = queue.completed.filter(c => c.status === 'failed').length;
  const succeeded = queue.completed.length - failed;
  return {
    pending: queue.pending.length,
    active: queue.active.length,
    completed: queue.completed.length,
    failed,
    succeeded,
    total: queue.pending.length + queue.active.length + queue.completed.length,
  };
}

// ============================================================
// formatExitCode
// ============================================================
const EXIT_CODE_MAP: Record<number, { label: string; severity: ExitCodeSeverity }> = {
  0: { label: 'Success', severity: 'success' },
  1: { label: 'General error', severity: 'error' },
  2: { label: 'Misuse of shell command', severity: 'error' },
  126: { label: 'Permission denied', severity: 'error' },
  127: { label: 'Command not found', severity: 'error' },
  130: { label: 'Interrupted (Ctrl+C)', severity: 'warning' },
  137: { label: 'Killed (OOM or SIGKILL)', severity: 'error' },
  143: { label: 'Terminated (SIGTERM)', severity: 'warning' },
};

export function formatExitCode(code: number | null | undefined): ExitCodeInfo {
  if (code === null || code === undefined) {
    return { code: -1, label: 'Unknown', severity: 'unknown' };
  }
  const info = EXIT_CODE_MAP[code];
  if (info) return { code, ...info };
  return { code, label: `Exit code ${code}`, severity: 'error' };
}

// ============================================================
// parseExecutionOutput
// ============================================================
const MAX_OUTPUT_LENGTH = 20000;

export function parseExecutionOutput(raw: string, tool: string): ExecutionOutput {
  try {
    const parsed = JSON.parse(raw);
    const stdout = parsed.stdout || '';
    const stderr = parsed.stderr || '';
    const exitCode = typeof parsed.returncode === 'number' ? parsed.returncode : 0;
    const truncated = stdout.length > MAX_OUTPUT_LENGTH;
    return {
      exitCode,
      stdout: truncated ? stdout.slice(0, MAX_OUTPUT_LENGTH) : stdout,
      stderr,
      success: exitCode === 0,
      lineCount: (stdout || '').split('\n').filter((l: string) => l).length,
      truncated,
      language: detectLanguage(tool),
    };
  } catch {
    return {
      exitCode: 0,
      stdout: raw,
      stderr: '',
      success: true,
      lineCount: raw.split('\n').filter(l => l).length,
      truncated: raw.length > MAX_OUTPUT_LENGTH,
      language: 'bash',
    };
  }
}

// ============================================================
// estimateExecutionComplexity
// ============================================================
const HIGH_PATTERNS = /\bpytest\b.*(-v|--cov)|&&.*&&|\bdocker\s+compose\b/i;
const MEDIUM_PATTERNS = /\bnpm\s+(install|ci|run\s+build)\b|\bpip\s+install\b|\bcargo\s+build\b|\byarn\s+(add|install)\b/i;

export function estimateExecutionComplexity(command: string): ExecutionComplexity {
  if (HIGH_PATTERNS.test(command)) return 'high';
  if (MEDIUM_PATTERNS.test(command)) return 'medium';
  return 'low';
}

// ============================================================
// mergeExecutionOutputs
// ============================================================
export function mergeExecutionOutputs(outputs: ExecutionOutput[]): ExecutionOutput {
  if (outputs.length === 0) {
    return { exitCode: 0, stdout: '', stderr: '', success: true, lineCount: 0, truncated: false, language: 'bash' };
  }

  const allSuccess = outputs.every(o => o.success);
  const lastNonZero = outputs.filter(o => o.exitCode !== 0).pop();
  return {
    exitCode: lastNonZero ? lastNonZero.exitCode : 0,
    stdout: outputs.map(o => o.stdout).filter(Boolean).join('\n'),
    stderr: outputs.map(o => o.stderr).filter(Boolean).join('\n'),
    success: allSuccess,
    lineCount: outputs.reduce((sum, o) => sum + o.lineCount, 0),
    truncated: outputs.some(o => o.truncated),
    language: outputs[0]?.language || 'bash',
  };
}
