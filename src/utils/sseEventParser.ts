/**
 * SSE Event Parser — Claude API SSE protocol, event stream builder, token usage
 * v21 Module 7
 */

export interface SSEEvent {
  event?: string;
  data: string;
}

export interface ClaudeStreamEvent {
  type: string;
  messageId?: string;
  blockType?: string;
  toolName?: string;
  toolId?: string;
  toolUseId?: string;
  deltaType?: string;
  deltaText?: string;
  index?: number;
  raw: any;
}

export interface TokenUsage {
  totalInput: number;
  totalOutput: number;
  total: number;
}

export interface ToolCallRef {
  name: string;
  id: string;
}

export interface EventStreamBuilder {
  events: ClaudeStreamEvent[];
  currentText: string;
  toolCalls: ToolCallRef[];
  addEvent: (event: ClaudeStreamEvent) => EventStreamBuilder;
}

// --- Raw SSE Parsing ---

export function parseSSEChunk(chunk: string): SSEEvent[] {
  if (!chunk || !chunk.trim()) return [];
  const results: SSEEvent[] = [];
  const blocks = chunk.split('\n\n').filter((b) => b.trim());

  for (const block of blocks) {
    const lines = block.split('\n');
    let event: string | undefined;
    let data = '';
    for (const line of lines) {
      if (line.startsWith('event: ')) {
        event = line.slice(7).trim();
      } else if (line.startsWith('data: ')) {
        data = line.slice(6);
      }
    }
    if (event === 'ping') continue;
    if (data || event) {
      results.push({ event, data });
    }
  }
  return results;
}

// --- Claude Stream Events ---

export function parseClaudeStreamEvent(raw: SSEEvent): ClaudeStreamEvent {
  let parsed: any = {};
  try {
    parsed = JSON.parse(raw.data);
  } catch { /* ignore */ }

  const type = parsed.type || raw.event || 'unknown';
  const result: ClaudeStreamEvent = { type, raw: parsed };

  if (type === 'message_start' && parsed.message) {
    result.messageId = parsed.message.id;
  }

  if (type === 'content_block_start' && parsed.content_block) {
    result.blockType = parsed.content_block.type;
    result.index = parsed.index;
    if (parsed.content_block.type === 'tool_use') {
      result.toolName = parsed.content_block.name;
      result.toolId = parsed.content_block.id;
    }
    if (parsed.content_block.type === 'tool_result') {
      result.toolUseId = parsed.content_block.tool_use_id;
    }
  }

  if (type === 'content_block_delta' && parsed.delta) {
    result.deltaType = parsed.delta.type;
    result.index = parsed.index;
    if (parsed.delta.type === 'text_delta') {
      result.deltaText = parsed.delta.text;
    }
    if (parsed.delta.type === 'input_json_delta') {
      result.deltaText = parsed.delta.partial_json;
    }
    if (parsed.delta.type === 'thinking_delta') {
      result.deltaText = parsed.delta.thinking;
    }
  }

  return result;
}

// --- Content Extraction ---

export function extractContentDelta(event: ClaudeStreamEvent): string | null {
  if (event.type !== 'content_block_delta') return null;
  return event.deltaText ?? null;
}

export function extractToolUseBlock(event: ClaudeStreamEvent): { name: string; id: string } | null {
  if (event.type !== 'content_block_start' || event.blockType !== 'tool_use') return null;
  return { name: event.toolName!, id: event.toolId! };
}

export function extractToolResultBlock(event: ClaudeStreamEvent): { toolUseId: string } | null {
  if (event.type !== 'content_block_start' || event.blockType !== 'tool_result') return null;
  return { toolUseId: event.toolUseId! };
}

// --- Event Stream Builder ---

export function buildEventStream(): EventStreamBuilder {
  return createBuilder([], '', []);
}

function createBuilder(events: ClaudeStreamEvent[], currentText: string, toolCalls: ToolCallRef[]): EventStreamBuilder {
  return {
    events,
    currentText,
    toolCalls,
    addEvent(event: ClaudeStreamEvent): EventStreamBuilder {
      const newEvents = [...events, event];
      let newText = currentText;
      let newToolCalls = [...toolCalls];

      if (event.type === 'content_block_delta' && event.deltaType === 'text_delta' && event.deltaText) {
        newText += event.deltaText;
      }
      if (event.type === 'content_block_start' && event.blockType === 'tool_use' && event.toolName && event.toolId) {
        newToolCalls.push({ name: event.toolName, id: event.toolId });
      }
      return createBuilder(newEvents, newText, newToolCalls);
    },
  };
}

// --- Token Usage ---

export function aggregateTokenUsage(usages: Array<{ input_tokens: number; output_tokens: number }>): TokenUsage {
  let totalInput = 0;
  let totalOutput = 0;
  for (const u of usages) {
    totalInput += u.input_tokens;
    totalOutput += u.output_tokens;
  }
  return { totalInput, totalOutput, total: totalInput + totalOutput };
}

// --- Stop Reason ---

export function detectStopReason(reason: string): string {
  switch (reason) {
    case 'end_turn': return 'completed';
    case 'tool_use':
    case 'tool_use_limit': return 'tool_use';
    case 'max_tokens': return 'truncated';
    case 'stop_sequence': return 'stopped';
    default: return 'unknown';
  }
}

// --- Type Guards ---

export function isToolUseEvent(event: ClaudeStreamEvent): boolean {
  return event.type === 'content_block_start' && event.blockType === 'tool_use';
}

export function isTextDeltaEvent(event: ClaudeStreamEvent): boolean {
  return event.type === 'content_block_delta' && event.deltaType === 'text_delta';
}

export function isThinkingEvent(event: ClaudeStreamEvent): boolean {
  return event.type === 'content_block_delta' && event.deltaType === 'thinking_delta';
}
