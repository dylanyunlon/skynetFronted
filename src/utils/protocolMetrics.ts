/**
 * ProtocolMetrics — v17
 * 
 * Performance analysis utilities for Claude API SSE event streams.
 * Token usage, latency, tool call stats, turn stats.
 */

// ============================================================
// Types
// ============================================================
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface LatencyInfo {
  firstTokenMs: number;
  totalMs: number;
}

export interface ToolCallStats {
  total: number;
  byTool: Record<string, number>;
  errorCount: number;
}

export interface TurnStats {
  totalTurns: number;
  endTurnCount: number;
  toolUseLimitCount: number;
}

export interface PerformanceReport {
  model: string;
  tokenUsage: TokenUsage;
  latency: LatencyInfo;
  toolCallStats: ToolCallStats;
  turnStats: TurnStats;
}

// ============================================================
// calculateTokenUsage
// ============================================================
export function calculateTokenUsage(events: any[]): TokenUsage {
  let inputTokens = 0;
  let outputTokens = 0;

  for (const event of events) {
    if (event.type === 'message_start') {
      const usage = event.message?.usage;
      if (usage) {
        inputTokens += usage.input_tokens || 0;
        outputTokens += usage.output_tokens || 0;
      }
    }
    // Also check message_delta for cumulative usage
    if (event.type === 'message_delta' && event.usage) {
      outputTokens = Math.max(outputTokens, event.usage.output_tokens || 0);
    }
  }

  return { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens };
}

// ============================================================
// calculateLatency
// ============================================================
export function calculateLatency(events: any[], requestTimestamp?: string): LatencyInfo {
  let firstBlockStart: number | null = null;
  let lastStop: number | null = null;
  const requestTime = requestTimestamp ? new Date(requestTimestamp).getTime() : 0;

  for (const event of events) {
    if (event.type === 'content_block_start') {
      const ts = event.content_block?.start_timestamp;
      if (ts) {
        const ms = new Date(ts).getTime();
        if (firstBlockStart === null || ms < firstBlockStart) {
          firstBlockStart = ms;
        }
      }
    }
    if (event.type === 'content_block_stop') {
      const ts = event.stop_timestamp;
      if (ts) {
        const ms = new Date(ts).getTime();
        if (lastStop === null || ms > lastStop) {
          lastStop = ms;
        }
      }
    }
  }

  const firstTokenMs = (requestTime > 0 && firstBlockStart !== null) 
    ? firstBlockStart - requestTime 
    : 0;

  const totalMs = (firstBlockStart !== null && lastStop !== null)
    ? lastStop - firstBlockStart
    : 0;

  return { firstTokenMs, totalMs };
}

// ============================================================
// calculateToolCallStats
// ============================================================
export function calculateToolCallStats(events: any[]): ToolCallStats {
  const byTool: Record<string, number> = {};
  let total = 0;
  let errorCount = 0;

  for (const event of events) {
    if (event.type === 'content_block_start') {
      const cb = event.content_block;
      if (cb?.type === 'tool_use') {
        const name = cb.name || 'unknown';
        byTool[name] = (byTool[name] || 0) + 1;
        total++;
      }
      if (cb?.type === 'tool_result' && cb.is_error) {
        errorCount++;
      }
    }
  }

  return { total, byTool, errorCount };
}

// ============================================================
// calculateTurnStats
// ============================================================
export function calculateTurnStats(events: any[]): TurnStats {
  let totalTurns = 0;
  let endTurnCount = 0;
  let toolUseLimitCount = 0;

  for (const event of events) {
    if (event.type === 'message_delta') {
      totalTurns++;
      const reason = event.delta?.stop_reason;
      if (reason === 'end_turn') endTurnCount++;
      else if (reason === 'tool_use_limit') toolUseLimitCount++;
    }
  }

  return { totalTurns, endTurnCount, toolUseLimitCount };
}

// ============================================================
// generatePerformanceReport
// ============================================================
export function generatePerformanceReport(events: any[]): PerformanceReport {
  let model = '';
  for (const event of events) {
    if (event.type === 'message_start' && event.message?.model) {
      model = event.message.model;
      break;
    }
  }

  return {
    model,
    tokenUsage: calculateTokenUsage(events),
    latency: calculateLatency(events),
    toolCallStats: calculateToolCallStats(events),
    turnStats: calculateTurnStats(events),
  };
}

// ============================================================
// Export class-style interface
// ============================================================
export class ProtocolMetrics {
  private events: any[];

  constructor(events: any[]) {
    this.events = events;
  }

  get tokenUsage(): TokenUsage { return calculateTokenUsage(this.events); }
  get latency(): LatencyInfo { return calculateLatency(this.events); }
  get toolCallStats(): ToolCallStats { return calculateToolCallStats(this.events); }
  get turnStats(): TurnStats { return calculateTurnStats(this.events); }
  get report(): PerformanceReport { return generatePerformanceReport(this.events); }
}
