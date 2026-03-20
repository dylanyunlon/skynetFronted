/**
 * Claude API Protocol Test Helpers — v15
 * 
 * Mock builders and event sequence simulator for testing the
 * Claude API SSE protocol without requiring a real SSE connection.
 * 
 * Simulates the state transitions that useAgenticLoop.handleClaudeEvent performs.
 */

import { AgenticBlock } from '@/types/agentic';
import {
  parseToolResultContent,
  parseStreamedToolResultJson,
  parseToolUseArgs,
} from './claudeProtocolParser';

// ============================================================
// State type
// ============================================================
export interface SimulatedState {
  blocks: AgenticBlock[];
  status: 'idle' | 'running' | 'done' | 'error';
  model: string;
  messageId: string;
  turns: number;
}

// ============================================================
// Mock builders
// ============================================================
export function buildMockMessageStart(id: string, model: string): any {
  return {
    type: 'message_start',
    message: { id, type: 'message', role: 'assistant', model, content: [], stop_reason: null },
  };
}

export function buildMockContentBlockStart(index: number, contentBlock: any): any {
  return {
    type: 'content_block_start',
    index,
    content_block: contentBlock,
  };
}

export function buildMockContentBlockDelta(index: number, delta: any): any {
  return {
    type: 'content_block_delta',
    index,
    delta,
  };
}

export function buildMockContentBlockStop(index: number): any {
  return {
    type: 'content_block_stop',
    index,
    stop_timestamp: new Date().toISOString(),
  };
}

export function buildMockMessageDelta(stopReason: string): any {
  return {
    type: 'message_delta',
    delta: { stop_reason: stopReason },
  };
}

export function buildMockMessageStop(): any {
  return { type: 'message_stop' };
}

// ============================================================
// Event sequence simulator
// Mirrors the logic of useAgenticLoop.handleClaudeEvent
// ============================================================
let blockIdCounter = 0;
function nextId(): string {
  return `sim_${++blockIdCounter}`;
}

export function simulateClaudeEventSequence(events: any[]): SimulatedState {
  blockIdCounter = 0;

  const state: SimulatedState = {
    blocks: [],
    status: 'idle',
    model: '',
    messageId: '',
    turns: 0,
  };

  // Maps: content_block index → blocks array index
  const contentBlockMap = new Map<number, number>();
  // Maps: tool_use_id → blocks array index (for linking tool_result)
  const pendingToolUses = new Map<string, number>();
  // Maps: content_block index → accumulated JSON string (for tool_result streaming)
  const toolResultJsonMap = new Map<number, string>();

  for (const data of events) {
    switch (data.type) {
      case 'message_start': {
        const msg = data.message || {};
        state.status = 'running';
        state.model = msg.model || state.model;
        state.messageId = msg.id || '';
        break;
      }

      case 'content_block_start': {
        const cb = data.content_block || {};
        const idx = data.index;

        if (cb.type === 'thinking') {
          const blockIdx = state.blocks.length;
          state.blocks.push({ id: nextId(), type: 'thinking', turn: state.turns, content: '' });
          contentBlockMap.set(idx, blockIdx);
        } else if (cb.type === 'text') {
          const blockIdx = state.blocks.length;
          state.blocks.push({ id: nextId(), type: 'text', turn: state.turns, content: '' });
          contentBlockMap.set(idx, blockIdx);
        } else if (cb.type === 'tool_use') {
          const blockIdx = state.blocks.length;
          state.blocks.push({
            id: nextId(), type: 'tool', turn: state.turns,
            tool: cb.name || '', toolArgs: {},
            toolResult: undefined, toolSuccess: undefined,
            toolDescription: cb.message || '',
            streamingJson: '', streamingMessage: cb.message || '',
            isStreaming: true,
          });
          contentBlockMap.set(idx, blockIdx);
          if (cb.id) pendingToolUses.set(cb.id, blockIdx);
        } else if (cb.type === 'tool_result') {
          // v15: Handle tool_result content block
          const info = parseToolResultContent(cb);
          contentBlockMap.set(idx, -1); // track index for delta accumulation
          toolResultJsonMap.set(idx, ''); // init JSON accumulator

          // Link back to tool_use block
          const toolBlockIdx = pendingToolUses.get(info.toolUseId);
          if (toolBlockIdx !== undefined) {
            const block = state.blocks[toolBlockIdx];
            if (block) {
              block.toolSuccess = !info.isError;
              block.isStreaming = false;
              // Store displayText if available
              if (info.displayText) {
                block.toolResult = info.displayText;
              }
            }
            pendingToolUses.delete(info.toolUseId);
            // Store reference for delta updates
            contentBlockMap.set(idx, toolBlockIdx);
          }
        }
        break;
      }

      case 'content_block_delta': {
        const idx = data.index;
        const delta = data.delta || {};
        const blockIdx = contentBlockMap.get(idx);

        // Handle tool_result JSON delta accumulation
        if (toolResultJsonMap.has(idx)) {
          if (delta.type === 'input_json_delta') {
            toolResultJsonMap.set(idx, (toolResultJsonMap.get(idx) || '') + (delta.partial_json || ''));
          }
          break;
        }

        if (blockIdx === undefined || blockIdx < 0 || !state.blocks[blockIdx]) break;

        const block = state.blocks[blockIdx];

        if (delta.type === 'thinking_delta') {
          block.content = (block.content || '') + (delta.thinking || '');
        } else if (delta.type === 'text_delta') {
          block.content = (block.content || '') + (delta.text || '');
        } else if (delta.type === 'input_json_delta') {
          block.streamingJson = (block.streamingJson || '') + (delta.partial_json || '');
          block.isStreaming = true;
        } else if (delta.type === 'tool_use_block_update_delta') {
          block.streamingMessage = delta.message || block.streamingMessage;
          block.toolDescription = delta.message || block.toolDescription;
        } else if (delta.type === 'thinking_summary_delta') {
          const summary = delta.summary;
          if (summary && typeof summary === 'object' && summary.summary) {
            block.thinkingSummary = summary.summary;
          } else if (typeof summary === 'string') {
            block.thinkingSummary = summary;
          }
        }
        break;
      }

      case 'content_block_stop': {
        const idx = data.index;

        // Handle tool_result stop — parse accumulated JSON
        if (toolResultJsonMap.has(idx)) {
          const accumulatedJson = toolResultJsonMap.get(idx) || '';
          const blockIdx = contentBlockMap.get(idx);
          if (blockIdx !== undefined && blockIdx >= 0 && state.blocks[blockIdx]) {
            const block = state.blocks[blockIdx];
            if (accumulatedJson) {
              const parsed = parseStreamedToolResultJson(accumulatedJson);
              if (parsed && parsed.length > 0) {
                const resultText = parsed.map(item => item.text || '').join('\n');
                block.toolResult = resultText;
              }
            }
            block.isStreaming = false;
          }
          toolResultJsonMap.delete(idx);
          break;
        }

        const blockIdx = contentBlockMap.get(idx);
        if (blockIdx !== undefined && blockIdx >= 0 && state.blocks[blockIdx]) {
          const block = state.blocks[blockIdx];
          block.isStreaming = false;
          // Parse final JSON for tool_use blocks
          if (block.type === 'tool' && block.streamingJson) {
            block.toolArgs = parseToolUseArgs(block.streamingJson);
          }
        }
        break;
      }

      case 'message_delta': {
        const stopReason = data.delta?.stop_reason;
        if (stopReason === 'end_turn' || stopReason === 'stop_sequence') {
          state.turns++;
        }
        break;
      }

      case 'message_stop': {
        break;
      }
    }
  }

  return state;
}
