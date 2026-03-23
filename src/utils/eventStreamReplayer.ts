/**
 * EventStreamReplayer — v17
 * 
 * Utilities for parsing, replaying, and analyzing Claude API SSE event stream files.
 * Used to replay eventStream1-4.txt for testing and debugging.
 */

// ============================================================
// Types
// ============================================================
export interface ToolCallInfo {
  name: string;
  id: string;
  message?: string;
  index: number;
}

export interface StreamMetrics {
  totalBlocks: number;
  thinkingDurationMs: number;
  toolCallCount: number;
  textBlockCount: number;
  totalDurationMs: number;
}

export interface TimelineEntry {
  blockType: string;
  startTimestamp?: string;
  stopTimestamp?: string;
  index: number;
  toolName?: string;
  message?: string;
}

// ============================================================
// parseEventStreamFile — parse raw SSE file into event array
// ============================================================
export function parseEventStreamFile(raw: string): any[] {
  if (!raw || !raw.trim()) return [];

  const events: any[] = [];
  const normalized = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Split by double newlines (SSE event separator)
  const chunks = normalized.split('\n\n');

  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    let dataStr = '';
    for (const line of trimmed.split('\n')) {
      const ln = line.trim();
      if (ln.startsWith('data: ')) {
        dataStr += ln.slice(6);
      } else if (ln.startsWith('data:')) {
        dataStr += ln.slice(5);
      }
    }

    if (!dataStr) continue;

    try {
      const parsed = JSON.parse(dataStr);
      events.push(parsed);
    } catch {
      // Skip malformed events
    }
  }

  return events;
}

// ============================================================
// extractAllToolCalls — get all tool_use content blocks
// ============================================================
export function extractAllToolCalls(events: any[]): ToolCallInfo[] {
  const tools: ToolCallInfo[] = [];

  for (const event of events) {
    if (event.type === 'content_block_start') {
      const cb = event.content_block;
      if (cb && cb.type === 'tool_use') {
        tools.push({
          name: cb.name || '',
          id: cb.id || '',
          message: cb.message || '',
          index: event.index ?? tools.length,
        });
      }
    }
  }

  return tools;
}

// ============================================================
// groupEventsByTurn — split events at message_delta boundaries
// ============================================================
export function groupEventsByTurn(events: any[]): any[][] {
  const turns: any[][] = [];
  let currentTurn: any[] = [];

  for (const event of events) {
    currentTurn.push(event);
    if (event.type === 'message_delta') {
      turns.push(currentTurn);
      currentTurn = [];
    }
  }

  // Push remaining events as last turn if any
  if (currentTurn.length > 0) {
    turns.push(currentTurn);
  }

  return turns;
}

// ============================================================
// calculateStreamMetrics — timing and count analysis
// ============================================================
export function calculateStreamMetrics(events: any[]): StreamMetrics {
  let totalBlocks = 0;
  let thinkingDurationMs = 0;
  let toolCallCount = 0;
  let textBlockCount = 0;
  let totalDurationMs = 0;
  let earliestStart: number | null = null;
  let latestStop: number | null = null;

  const blockStarts = new Map<number, { type: string; start: string }>();

  for (const event of events) {
    if (event.type === 'content_block_start') {
      const cb = event.content_block || {};
      totalBlocks++;

      if (cb.type === 'tool_use') toolCallCount++;
      else if (cb.type === 'text') textBlockCount++;

      if (cb.start_timestamp) {
        const startMs = new Date(cb.start_timestamp).getTime();
        blockStarts.set(event.index ?? totalBlocks, { type: cb.type, start: cb.start_timestamp });
        if (earliestStart === null || startMs < earliestStart) earliestStart = startMs;
      }
    } else if (event.type === 'content_block_stop') {
      const stopTs = event.stop_timestamp;
      if (stopTs) {
        const stopMs = new Date(stopTs).getTime();
        if (latestStop === null || stopMs > latestStop) latestStop = stopMs;

        const idx = event.index ?? 0;
        const blockInfo = blockStarts.get(idx);
        if (blockInfo) {
          const startMs = new Date(blockInfo.start).getTime();
          const duration = stopMs - startMs;
          if (blockInfo.type === 'thinking') {
            thinkingDurationMs += duration;
          }
        }
      }
    }
  }

  if (earliestStart !== null && latestStop !== null) {
    totalDurationMs = latestStop - earliestStart;
  }

  return { totalBlocks, thinkingDurationMs, toolCallCount, textBlockCount, totalDurationMs };
}

// ============================================================
// buildReplayTimeline — ordered timeline for visual replay
// ============================================================
export function buildReplayTimeline(events: any[]): TimelineEntry[] {
  const timeline: TimelineEntry[] = [];

  for (const event of events) {
    if (event.type === 'content_block_start') {
      const cb = event.content_block || {};
      timeline.push({
        blockType: cb.type || 'unknown',
        startTimestamp: cb.start_timestamp,
        index: event.index ?? timeline.length,
        toolName: cb.name,
        message: cb.message,
      });
    }
  }

  return timeline;
}

// ============================================================
// EventStreamReplayer class — stateful replayer
// ============================================================
export class EventStreamReplayer {
  private events: any[];
  private position: number = 0;

  constructor(rawOrEvents: string | any[]) {
    if (typeof rawOrEvents === 'string') {
      this.events = parseEventStreamFile(rawOrEvents);
    } else {
      this.events = rawOrEvents;
    }
  }

  get totalEvents(): number { return this.events.length; }
  get currentPosition(): number { return this.position; }

  next(): any | null {
    if (this.position >= this.events.length) return null;
    return this.events[this.position++];
  }

  peek(): any | null {
    if (this.position >= this.events.length) return null;
    return this.events[this.position];
  }

  reset(): void { this.position = 0; }

  getToolCalls(): ToolCallInfo[] { return extractAllToolCalls(this.events); }
  getMetrics(): StreamMetrics { return calculateStreamMetrics(this.events); }
  getTimeline(): TimelineEntry[] { return buildReplayTimeline(this.events); }
}
