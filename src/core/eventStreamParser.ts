// src/core/eventStreamParser.ts
// Event Stream Parser v18 — parses Claude API SSE protocol into structured blocks
// Supports: message_start, content_block_start/delta/stop, message_delta/stop
// Handles: thinking, text, tool_use, tool_result block types

// ============================================================
// Types
// ============================================================
export interface ParsedLine {
  field: string;
  value?: string;
  parsed?: any;
  parseError?: boolean;
}

export interface ContentBlockState {
  index: number;
  blockType: 'thinking' | 'text' | 'tool_use' | 'tool_result' | 'unknown';
  toolName: string;
  message: string;
  iconName: string;
  partialJson: string;
  accumulatedText: string;
  isError: boolean;
  startTimestamp?: string;
  stopTimestamp?: string;
  toolUseId?: string;
  summaries?: Array<{ summary: string }>;
}

export interface EventStreamBlock {
  type: string;
  index: number;
  data: any;
}

export interface TimelineEntry {
  index: number;
  blockType: string;
  toolName: string;
  message: string;
  content: string;
  startTime: number;
  durationMs: number;
  isError: boolean;
  iconName: string;
}

// ============================================================
// parseEventStreamLine — single SSE line → parsed structure
// ============================================================
export function parseEventStreamLine(line: string): ParsedLine | null {
  // Trim carriage return and newline
  const trimmed = line.replace(/\r?\n$/, '').replace(/\r$/, '');

  // Empty line = SSE separator
  if (trimmed === '') return null;

  // Parse "field: value" format
  const colonIndex = trimmed.indexOf(':');
  if (colonIndex === -1) return { field: trimmed, value: '' };

  const field = trimmed.substring(0, colonIndex).trim();
  const rawValue = trimmed.substring(colonIndex + 1).trim();

  if (field === 'event') {
    return { field: 'event', value: rawValue };
  }

  if (field === 'data') {
    try {
      const parsed = JSON.parse(rawValue);
      return { field: 'data', value: rawValue, parsed };
    } catch {
      return { field: 'data', value: rawValue, parseError: true };
    }
  }

  return { field, value: rawValue };
}

// ============================================================
// parseEventStreamChunk — multi-line SSE text → ContentBlockState[]
// ============================================================
export function parseEventStreamChunk(chunk: string): ContentBlockState[] {
  const lines = chunk.split('\n');
  const blockMap = new Map<number, ContentBlockState>();

  for (const line of lines) {
    const parsed = parseEventStreamLine(line);
    if (!parsed || parsed.field !== 'data' || !parsed.parsed) continue;

    const data = parsed.parsed;

    if (data.type === 'content_block_start') {
      const cb = data.content_block || {};
      const idx = data.index;
      const blockType = mapBlockType(cb.type);

      blockMap.set(idx, {
        index: idx,
        blockType,
        toolName: cb.name || '',
        message: cb.message || '',
        iconName: cb.icon_name || '',
        partialJson: '',
        accumulatedText: cb.thinking || cb.text || '',
        isError: cb.is_error === true,
        startTimestamp: cb.start_timestamp,
        stopTimestamp: cb.stop_timestamp || undefined,
        toolUseId: cb.tool_use_id || cb.id || '',
        summaries: cb.summaries || [],
      });
    }

    if (data.type === 'content_block_delta') {
      const idx = data.index;
      const delta = data.delta || {};
      let block = blockMap.get(idx);

      if (!block) {
        // Create a synthetic block if we see deltas before start (shouldn't normally happen)
        block = {
          index: idx,
          blockType: 'unknown',
          toolName: '',
          message: '',
          iconName: '',
          partialJson: '',
          accumulatedText: '',
          isError: false,
        };
        blockMap.set(idx, block);
      }

      if (delta.type === 'thinking_delta') {
        block.accumulatedText += delta.thinking || '';
        if (block.blockType === 'unknown') block.blockType = 'thinking';
      }
      if (delta.type === 'text_delta') {
        block.accumulatedText += delta.text || '';
        if (block.blockType === 'unknown') block.blockType = 'text';
      }
      if (delta.type === 'input_json_delta') {
        block.partialJson += delta.partial_json || '';
      }
      if (delta.type === 'tool_use_block_update_delta') {
        if (delta.message) block.message = delta.message;
      }
      if (delta.type === 'thinking_summary_delta') {
        if (delta.summary?.summary) {
          if (!block.summaries) block.summaries = [];
          block.summaries.push(delta.summary);
        }
      }
    }

    if (data.type === 'content_block_stop') {
      const idx = data.index;
      const block = blockMap.get(idx);
      if (block) {
        block.stopTimestamp = data.stop_timestamp || undefined;
      }
    }
  }

  return Array.from(blockMap.values()).sort((a, b) => a.index - b.index);
}

function mapBlockType(type: string): ContentBlockState['blockType'] {
  if (type === 'thinking') return 'thinking';
  if (type === 'text') return 'text';
  if (type === 'tool_use') return 'tool_use';
  if (type === 'tool_result') return 'tool_result';
  return 'unknown';
}

// ============================================================
// aggregateToolCalls — count tool_use blocks by tool name
// ============================================================
export function aggregateToolCalls(blocks: ContentBlockState[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const block of blocks) {
    if (block.blockType === 'tool_use' && block.toolName) {
      counts.set(block.toolName, (counts.get(block.toolName) || 0) + 1);
    }
  }
  return counts;
}

// ============================================================
// extractThinkingSummary — from array of delta objects
// ============================================================
export function extractThinkingSummary(
  deltas: Array<{ type: string; summary?: { summary: string } | null; thinking?: string }>,
): string {
  const summaries: string[] = [];
  for (const d of deltas) {
    if (d.type === 'thinking_summary_delta' && d.summary?.summary) {
      summaries.push(d.summary.summary.trim());
    }
  }

  if (summaries.length === 0) return '';

  // Use last summary as the canonical one, but join if multiple
  const combined = summaries.join(' ').trim();
  // Truncate to 300 chars max
  return combined.length > 300 ? combined.substring(0, 297) + '...' : combined;
}

// ============================================================
// extractToolUseMessage — from array of delta objects
// ============================================================
export function extractToolUseMessage(
  deltas: Array<{ type: string; message?: string | null; partial_json?: string }>,
): string {
  let lastMessage = '';
  for (const d of deltas) {
    if (d.type === 'tool_use_block_update_delta' && d.message) {
      lastMessage = d.message;
    }
  }
  return lastMessage;
}

// ============================================================
// buildTimelineFromBlocks — create ordered timeline entries
// ============================================================
export function buildTimelineFromBlocks(blocks: ContentBlockState[]): TimelineEntry[] {
  return blocks
    .map((block) => {
      let startTime = 0;
      let durationMs = 0;

      if (block.startTimestamp) {
        startTime = new Date(block.startTimestamp).getTime();
        if (block.stopTimestamp) {
          const stopTime = new Date(block.stopTimestamp).getTime();
          durationMs = Math.max(0, stopTime - startTime);
        }
      }

      return {
        index: block.index,
        blockType: block.blockType,
        toolName: block.toolName,
        message: block.message,
        content: block.accumulatedText,
        startTime,
        durationMs,
        isError: block.isError,
        iconName: block.iconName,
      };
    })
    .sort((a, b) => a.startTime - b.startTime || a.index - b.index);
}
