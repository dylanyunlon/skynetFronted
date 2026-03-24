/**
 * ExecutionMetrics — v19
 * 
 * Tracks execution timing, resource usage, cost estimation, and generates
 * session-level performance reports for code execution sessions.
 */

// ============================================================
// Types
// ============================================================
export interface ExecutionTimer {
  startTime: number | null;
  stopTime: number | null;
  isRunning: boolean;
}

export interface ExecutionEntry {
  command: string;
  durationMs: number;
  exitCode: number;
  success: boolean;
  tool: string;
  timestamp?: number;
}

export interface SessionMetrics {
  executions: ExecutionEntry[];
  startTime: number;
}

export interface SessionSummary {
  totalExecutions: number;
  successCount: number;
  failCount: number;
  totalDurationMs: number;
  avgDurationMs: number;
  successRate: number;
  byTool?: Record<string, number>;
}

export interface CostEstimate {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  currency: string;
}

export interface Throughput {
  commandsPerMinute: number;
  avgCommandDurationMs: number;
}

export interface TimelineEvent {
  command: string;
  durationMs: number;
  success: boolean;
  tool: string;
  timestamp: number;
}

// ============================================================
// Model pricing (per million tokens, USD)
// ============================================================
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4-20250514': { input: 3, output: 15 },
  'claude-opus-4-20250514': { input: 15, output: 75 },
  'claude-haiku-3-20240307': { input: 0.25, output: 1.25 },
};
const FALLBACK_PRICING = { input: 3, output: 15 };

// ============================================================
// ExecutionTimer
// ============================================================
export function createExecutionTimer(): ExecutionTimer {
  return { startTime: null, stopTime: null, isRunning: false };
}

export function startTimer(timer: ExecutionTimer): ExecutionTimer {
  return { startTime: Date.now(), stopTime: null, isRunning: true };
}

export function stopTimer(timer: ExecutionTimer): ExecutionTimer {
  if (!timer.isRunning || timer.startTime === null) return timer;
  return { ...timer, stopTime: Date.now(), isRunning: false };
}

export function getElapsed(timer: ExecutionTimer): number {
  if (timer.startTime === null) return 0;
  const end = timer.stopTime ?? Date.now();
  return end - timer.startTime;
}

// ============================================================
// SessionMetrics
// ============================================================
export function createSessionMetrics(): SessionMetrics {
  return { executions: [], startTime: Date.now() };
}

export function recordExecution(metrics: SessionMetrics, entry: ExecutionEntry): SessionMetrics {
  return {
    ...metrics,
    executions: [...metrics.executions, { ...entry, timestamp: entry.timestamp ?? Date.now() }],
  };
}

// ============================================================
// getSessionSummary
// ============================================================
export function getSessionSummary(metrics: SessionMetrics): SessionSummary {
  const total = metrics.executions.length;
  if (total === 0) {
    return {
      totalExecutions: 0, successCount: 0, failCount: 0,
      totalDurationMs: 0, avgDurationMs: 0, successRate: 1,
      byTool: {},
    };
  }

  const successCount = metrics.executions.filter(e => e.success).length;
  const failCount = total - successCount;
  const totalDurationMs = metrics.executions.reduce((sum, e) => sum + e.durationMs, 0);

  const byTool: Record<string, number> = {};
  for (const e of metrics.executions) {
    byTool[e.tool] = (byTool[e.tool] || 0) + 1;
  }

  return {
    totalExecutions: total,
    successCount,
    failCount,
    totalDurationMs,
    avgDurationMs: totalDurationMs / total,
    successRate: successCount / total,
    byTool,
  };
}

// ============================================================
// estimateCost
// ============================================================
export function estimateCost(opts: {
  inputTokens: number;
  outputTokens: number;
  model: string;
}): CostEstimate {
  const pricing = MODEL_PRICING[opts.model] || FALLBACK_PRICING;
  const inputCost = (opts.inputTokens / 1_000_000) * pricing.input;
  const outputCost = (opts.outputTokens / 1_000_000) * pricing.output;
  return {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
    currency: 'USD',
  };
}

// ============================================================
// calculateThroughput
// ============================================================
export function calculateThroughput(metrics: SessionMetrics): Throughput {
  const total = metrics.executions.length;
  if (total === 0) return { commandsPerMinute: 0, avgCommandDurationMs: 0 };

  const totalDuration = metrics.executions.reduce((sum, e) => sum + e.durationMs, 0);
  const avgMs = totalDuration / total;
  const totalMinutes = totalDuration / 60000;

  return {
    commandsPerMinute: totalMinutes > 0 ? total / totalMinutes : 0,
    avgCommandDurationMs: avgMs,
  };
}

// ============================================================
// getExecutionTimeline
// ============================================================
export function getExecutionTimeline(metrics: SessionMetrics): TimelineEvent[] {
  return metrics.executions.map(e => ({
    command: e.command,
    durationMs: e.durationMs,
    success: e.success,
    tool: e.tool,
    timestamp: e.timestamp ?? 0,
  }));
}

// ============================================================
// formatDuration
// ============================================================
export function formatDuration(ms: number): string {
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

// ============================================================
// formatBytes
// ============================================================
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

// ============================================================
// getTopSlowCommands
// ============================================================
export function getTopSlowCommands(metrics: SessionMetrics, n: number): ExecutionEntry[] {
  return [...metrics.executions]
    .sort((a, b) => b.durationMs - a.durationMs)
    .slice(0, n);
}
