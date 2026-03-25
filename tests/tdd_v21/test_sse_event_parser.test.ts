/**
 * TDD v21 Module 7: SSE Event Parser
 * Tests for eventsource-parser integration, Claude API SSE protocol
 * Target: src/utils/sseEventParser.ts
 */
import { describe, it, expect } from 'vitest';

import {
  parseSSEChunk,
  SSEEvent,
  parseClaudeStreamEvent,
  ClaudeStreamEvent,
  extractContentDelta,
  extractToolUseBlock,
  extractToolResultBlock,
  buildEventStream,
  EventStreamBuilder,
  aggregateTokenUsage,
  TokenUsage,
  detectStopReason,
  isToolUseEvent,
  isTextDeltaEvent,
  isThinkingEvent,
} from '@/utils/sseEventParser';

describe('SSE Event Parser', () => {
  // --- Raw SSE Parsing ---
  describe('parseSSEChunk', () => {
    it('should parse basic SSE event', () => {
      const chunk = 'event: message_start\ndata: {"type":"message_start"}\n\n';
      const events = parseSSEChunk(chunk);
      expect(events.length).toBe(1);
      expect(events[0].event).toBe('message_start');
    });

    it('should parse data-only events', () => {
      const chunk = 'data: {"type":"content_block_delta"}\n\n';
      const events = parseSSEChunk(chunk);
      expect(events.length).toBe(1);
    });

    it('should parse multiple events in one chunk', () => {
      const chunk = 'event: a\ndata: {"x":1}\n\nevent: b\ndata: {"x":2}\n\n';
      const events = parseSSEChunk(chunk);
      expect(events.length).toBe(2);
    });

    it('should skip ping events', () => {
      const chunk = 'event: ping\ndata: {}\n\n';
      const events = parseSSEChunk(chunk);
      expect(events.length).toBe(0);
    });

    it('should handle empty input', () => {
      expect(parseSSEChunk('')).toEqual([]);
    });
  });

  // --- Claude Stream Events ---
  describe('parseClaudeStreamEvent', () => {
    it('should parse message_start event', () => {
      const raw: SSEEvent = { event: 'message_start', data: '{"type":"message_start","message":{"id":"msg_01","role":"assistant"}}' };
      const parsed = parseClaudeStreamEvent(raw);
      expect(parsed.type).toBe('message_start');
      expect(parsed.messageId).toBeDefined();
    });

    it('should parse content_block_start with text type', () => {
      const raw: SSEEvent = { event: 'content_block_start', data: '{"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}' };
      const parsed = parseClaudeStreamEvent(raw);
      expect(parsed.type).toBe('content_block_start');
      expect(parsed.blockType).toBe('text');
    });

    it('should parse content_block_start with tool_use type', () => {
      const raw: SSEEvent = { event: 'content_block_start', data: '{"type":"content_block_start","index":1,"content_block":{"type":"tool_use","id":"tu_01","name":"bash_tool"}}' };
      const parsed = parseClaudeStreamEvent(raw);
      expect(parsed.blockType).toBe('tool_use');
      expect(parsed.toolName).toBe('bash_tool');
    });

    it('should parse content_block_delta with text_delta', () => {
      const raw: SSEEvent = { event: 'content_block_delta', data: '{"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Hello "}}' };
      const parsed = parseClaudeStreamEvent(raw);
      expect(parsed.type).toBe('content_block_delta');
      expect(parsed.deltaType).toBe('text_delta');
    });

    it('should parse message_stop event', () => {
      const raw: SSEEvent = { event: 'message_stop', data: '{"type":"message_stop"}' };
      const parsed = parseClaudeStreamEvent(raw);
      expect(parsed.type).toBe('message_stop');
    });
  });

  // --- Content Extraction ---
  describe('extractContentDelta', () => {
    it('should extract text from text_delta', () => {
      const event: ClaudeStreamEvent = {
        type: 'content_block_delta',
        deltaType: 'text_delta',
        deltaText: 'Hello world',
        raw: {},
      };
      expect(extractContentDelta(event)).toBe('Hello world');
    });

    it('should extract JSON fragment from input_json_delta', () => {
      const event: ClaudeStreamEvent = {
        type: 'content_block_delta',
        deltaType: 'input_json_delta',
        deltaText: '{"command":',
        raw: {},
      };
      expect(extractContentDelta(event)).toBe('{"command":');
    });

    it('should return null for non-delta events', () => {
      const event: ClaudeStreamEvent = { type: 'message_start', raw: {} };
      expect(extractContentDelta(event)).toBeNull();
    });
  });

  // --- Tool Use Block ---
  describe('extractToolUseBlock', () => {
    it('should extract tool name and id', () => {
      const event: ClaudeStreamEvent = {
        type: 'content_block_start',
        blockType: 'tool_use',
        toolName: 'bash_tool',
        toolId: 'tu_123',
        raw: {},
      };
      const block = extractToolUseBlock(event);
      expect(block).not.toBeNull();
      expect(block!.name).toBe('bash_tool');
      expect(block!.id).toBe('tu_123');
    });

    it('should return null for non-tool events', () => {
      const event: ClaudeStreamEvent = { type: 'content_block_start', blockType: 'text', raw: {} };
      expect(extractToolUseBlock(event)).toBeNull();
    });
  });

  // --- Tool Result Block ---
  describe('extractToolResultBlock', () => {
    it('should extract tool_result content', () => {
      const event: ClaudeStreamEvent = {
        type: 'content_block_start',
        blockType: 'tool_result',
        toolUseId: 'tu_123',
        raw: {},
      };
      const block = extractToolResultBlock(event);
      expect(block).not.toBeNull();
      expect(block!.toolUseId).toBe('tu_123');
    });
  });

  // --- Event Stream Builder ---
  describe('buildEventStream', () => {
    it('should create empty stream builder', () => {
      const builder = buildEventStream();
      expect(builder.events).toEqual([]);
      expect(builder.currentText).toBe('');
    });
  });

  describe('EventStreamBuilder', () => {
    it('should accumulate text from text deltas', () => {
      let builder = buildEventStream();
      builder = builder.addEvent({
        type: 'content_block_delta',
        deltaType: 'text_delta',
        deltaText: 'Hello ',
        raw: {},
      });
      builder = builder.addEvent({
        type: 'content_block_delta',
        deltaType: 'text_delta',
        deltaText: 'world',
        raw: {},
      });
      expect(builder.currentText).toBe('Hello world');
    });

    it('should track tool calls', () => {
      let builder = buildEventStream();
      builder = builder.addEvent({
        type: 'content_block_start',
        blockType: 'tool_use',
        toolName: 'bash_tool',
        toolId: 'tu_1',
        raw: {},
      });
      expect(builder.toolCalls.length).toBe(1);
    });
  });

  // --- Token Usage ---
  describe('aggregateTokenUsage', () => {
    it('should sum input and output tokens', () => {
      const usage = aggregateTokenUsage([
        { input_tokens: 100, output_tokens: 50 },
        { input_tokens: 200, output_tokens: 150 },
      ]);
      expect(usage.totalInput).toBe(300);
      expect(usage.totalOutput).toBe(200);
    });

    it('should calculate total tokens', () => {
      const usage = aggregateTokenUsage([{ input_tokens: 10, output_tokens: 20 }]);
      expect(usage.total).toBe(30);
    });

    it('should handle empty array', () => {
      const usage = aggregateTokenUsage([]);
      expect(usage.total).toBe(0);
    });
  });

  // --- Type Guards ---
  describe('isToolUseEvent', () => {
    it('should return true for tool_use block start', () => {
      expect(isToolUseEvent({ type: 'content_block_start', blockType: 'tool_use', raw: {} })).toBe(true);
    });

    it('should return false for text block', () => {
      expect(isToolUseEvent({ type: 'content_block_start', blockType: 'text', raw: {} })).toBe(false);
    });
  });

  describe('isTextDeltaEvent', () => {
    it('should return true for text_delta', () => {
      expect(isTextDeltaEvent({ type: 'content_block_delta', deltaType: 'text_delta', raw: {} })).toBe(true);
    });
  });

  describe('isThinkingEvent', () => {
    it('should return true for thinking_delta', () => {
      expect(isThinkingEvent({ type: 'content_block_delta', deltaType: 'thinking_delta', raw: {} })).toBe(true);
    });
  });

  // --- Stop Reason ---
  describe('detectStopReason', () => {
    it('should detect end_turn', () => {
      expect(detectStopReason('end_turn')).toBe('completed');
    });

    it('should detect tool_use', () => {
      expect(detectStopReason('tool_use')).toBe('tool_use');
    });

    it('should detect max_tokens', () => {
      expect(detectStopReason('max_tokens')).toBe('truncated');
    });

    it('should return unknown for unrecognized', () => {
      expect(detectStopReason('weird')).toBe('unknown');
    });
  });
});
