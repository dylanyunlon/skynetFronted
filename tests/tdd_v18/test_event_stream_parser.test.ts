// tests/tdd_v18/test_event_stream_parser.test.ts
// TDD Step 1: Tests for EventStreamParser — parses raw SSE text into structured blocks
// Tests reference actual data patterns from eventStream1-4.txt

import { describe, it, expect } from 'vitest';

import {
  parseEventStreamLine,
  parseEventStreamChunk,
  EventStreamBlock,
  ContentBlockState,
  aggregateToolCalls,
  extractThinkingSummary,
  extractToolUseMessage,
  buildTimelineFromBlocks,
  TimelineEntry,
} from '@/core/eventStreamParser';

// ============================================================
// Test 1: parseEventStreamLine — single SSE lines
// ============================================================
describe('EventStreamParser — Line Parsing', () => {
  it('T1.1: should parse "event: message_start" line', () => {
    const result = parseEventStreamLine('event: message_start');
    expect(result).toEqual({ field: 'event', value: 'message_start' });
  });

  it('T1.2: should parse "data: {...}" JSON line', () => {
    const json = '{"type":"message_start","message":{"id":"chatcompl_01Q","type":"message","role":"assistant"}}';
    const result = parseEventStreamLine(`data: ${json}`);
    expect(result.field).toBe('data');
    expect(result.parsed.type).toBe('message_start');
  });

  it('T1.3: should handle empty lines (SSE separator)', () => {
    const result = parseEventStreamLine('');
    expect(result).toBeNull();
  });

  it('T1.4: should handle lines with \\r\\n endings', () => {
    const result = parseEventStreamLine('event: content_block_start\r\n');
    expect(result.field).toBe('event');
    expect(result.value).toBe('content_block_start');
  });

  it('T1.5: should handle malformed JSON gracefully', () => {
    const result = parseEventStreamLine('data: {invalid json}');
    expect(result.field).toBe('data');
    expect(result.parseError).toBeTruthy();
  });

  it('T1.6: should parse content_block_delta with thinking_delta', () => {
    const json = '{"type":"content_block_delta","index":0,"delta":{"type":"thinking_delta","thinking":"Let"}}';
    const result = parseEventStreamLine(`data: ${json}`);
    expect(result.parsed.delta.type).toBe('thinking_delta');
    expect(result.parsed.delta.thinking).toBe('Let');
  });

  it('T1.7: should parse content_block_delta with text_delta', () => {
    const json = '{"type":"content_block_delta","index":25,"delta":{"type":"text_delta","text":"Good"}}';
    const result = parseEventStreamLine(`data: ${json}`);
    expect(result.parsed.index).toBe(25);
    expect(result.parsed.delta.text).toBe('Good');
  });

  it('T1.8: should parse content_block_delta with input_json_delta', () => {
    const json = '{"type":"content_block_delta","index":1,"delta":{"type":"input_json_delta","partial_json":"{\\"description\\":\\"Add"}}';
    const result = parseEventStreamLine(`data: ${json}`);
    expect(result.parsed.delta.type).toBe('input_json_delta');
  });

  it('T1.9: should parse tool_use_block_update_delta with message', () => {
    const json = '{"type":"content_block_delta","index":1,"delta":{"type":"tool_use_block_update_delta","message":"Add verl.utils and related stubs to conftest.py"}}';
    const result = parseEventStreamLine(`data: ${json}`);
    expect(result.parsed.delta.message).toContain('verl.utils');
  });

  it('T1.10: should parse thinking_summary_delta', () => {
    const json = '{"type":"content_block_delta","index":0,"delta":{"type":"thinking_summary_delta","summary":{"summary":"Thinking about what previous context to continue from."}}}';
    const result = parseEventStreamLine(`data: ${json}`);
    expect(result.parsed.delta.summary.summary).toContain('Thinking');
  });
});

// ============================================================
// Test 2: parseEventStreamChunk — multi-line chunk to blocks
// ============================================================
describe('EventStreamParser — Chunk Parsing', () => {
  const sampleChunk = [
    'event: content_block_start',
    'data: {"type":"content_block_start","index":1,"content_block":{"type":"tool_use","name":"str_replace","message":"Editing file","icon_name":"edit"}}',
    '',
    'event: content_block_delta',
    'data: {"type":"content_block_delta","index":1,"delta":{"type":"input_json_delta","partial_json":"{\\"path\\":\\"/home/test.py\\"}"}}',
    '',
  ].join('\n');

  it('T2.1: should parse a chunk into ContentBlockState objects', () => {
    const blocks = parseEventStreamChunk(sampleChunk);
    expect(blocks.length).toBeGreaterThan(0);
  });

  it('T2.2: should identify tool_use blocks with name', () => {
    const blocks = parseEventStreamChunk(sampleChunk);
    const toolBlock = blocks.find(b => b.blockType === 'tool_use');
    expect(toolBlock).toBeDefined();
    expect(toolBlock!.toolName).toBe('str_replace');
  });

  it('T2.3: should accumulate partial JSON from input_json_delta', () => {
    const blocks = parseEventStreamChunk(sampleChunk);
    const toolBlock = blocks.find(b => b.blockType === 'tool_use');
    expect(toolBlock!.partialJson).toContain('path');
  });

  it('T2.4: should capture icon_name from content_block_start', () => {
    const blocks = parseEventStreamChunk(sampleChunk);
    const toolBlock = blocks.find(b => b.blockType === 'tool_use');
    expect(toolBlock!.iconName).toBe('edit');
  });

  it('T2.5: should capture message from content_block_start', () => {
    const blocks = parseEventStreamChunk(sampleChunk);
    const toolBlock = blocks.find(b => b.blockType === 'tool_use');
    expect(toolBlock!.message).toBe('Editing file');
  });

  it('T2.6: should parse thinking block', () => {
    const thinkingChunk = [
      'event: content_block_start',
      'data: {"type":"content_block_start","index":0,"content_block":{"type":"thinking","thinking":""}}',
      '',
      'event: content_block_delta',
      'data: {"type":"content_block_delta","index":0,"delta":{"type":"thinking_delta","thinking":"Let me fix"}}',
      '',
    ].join('\n');
    const blocks = parseEventStreamChunk(thinkingChunk);
    const thinkBlock = blocks.find(b => b.blockType === 'thinking');
    expect(thinkBlock).toBeDefined();
    expect(thinkBlock!.accumulatedText).toContain('fix');
  });

  it('T2.7: should parse text block', () => {
    const textChunk = [
      'event: content_block_start',
      'data: {"type":"content_block_start","index":25,"content_block":{"type":"text","text":""}}',
      '',
      'event: content_block_delta',
      'data: {"type":"content_block_delta","index":25,"delta":{"type":"text_delta","text":"Good – 99 collected"}}',
      '',
    ].join('\n');
    const blocks = parseEventStreamChunk(textChunk);
    const textBlock = blocks.find(b => b.blockType === 'text');
    expect(textBlock).toBeDefined();
    expect(textBlock!.accumulatedText).toContain('99 collected');
  });

  it('T2.8: should handle tool_result blocks', () => {
    const resultChunk = [
      'event: content_block_start',
      'data: {"type":"content_block_start","index":2,"content_block":{"type":"tool_result","tool_use_id":"toolu_01X","name":"str_replace","is_error":false}}',
      '',
    ].join('\n');
    const blocks = parseEventStreamChunk(resultChunk);
    const resultBlock = blocks.find(b => b.blockType === 'tool_result');
    expect(resultBlock).toBeDefined();
    expect(resultBlock!.isError).toBe(false);
  });

  it('T2.9: should handle error tool_results', () => {
    const resultChunk = [
      'event: content_block_start',
      'data: {"type":"content_block_start","index":17,"content_block":{"type":"tool_result","tool_use_id":"toolu_01J","name":"create_file","is_error":true}}',
      '',
    ].join('\n');
    const blocks = parseEventStreamChunk(resultChunk);
    const resultBlock = blocks.find(b => b.blockType === 'tool_result');
    expect(resultBlock!.isError).toBe(true);
  });

  it('T2.10: should handle multiple blocks in one chunk', () => {
    const multiChunk = [
      'event: content_block_start',
      'data: {"type":"content_block_start","index":0,"content_block":{"type":"thinking","thinking":""}}',
      '',
      'event: content_block_stop',
      'data: {"type":"content_block_stop","index":0}',
      '',
      'event: content_block_start',
      'data: {"type":"content_block_start","index":1,"content_block":{"type":"tool_use","name":"bash_tool","message":"Running command","icon_name":"commandLine"}}',
      '',
    ].join('\n');
    const blocks = parseEventStreamChunk(multiChunk);
    expect(blocks.length).toBeGreaterThanOrEqual(2);
  });
});

// ============================================================
// Test 3: aggregateToolCalls — group by type
// ============================================================
describe('EventStreamParser — Tool Call Aggregation', () => {
  const sampleBlocks: ContentBlockState[] = [
    { index: 1, blockType: 'tool_use', toolName: 'bash_tool', message: 'Running command', iconName: 'commandLine', partialJson: '', accumulatedText: '', isError: false },
    { index: 3, blockType: 'tool_use', toolName: 'str_replace', message: 'Editing file', iconName: 'edit', partialJson: '', accumulatedText: '', isError: false },
    { index: 5, blockType: 'tool_use', toolName: 'bash_tool', message: 'Running command', iconName: 'commandLine', partialJson: '', accumulatedText: '', isError: false },
    { index: 7, blockType: 'tool_use', toolName: 'str_replace', message: 'Editing file', iconName: 'edit', partialJson: '', accumulatedText: '', isError: false },
    { index: 9, blockType: 'tool_use', toolName: 'view', message: 'Viewing file', iconName: 'file', partialJson: '', accumulatedText: '', isError: false },
    { index: 11, blockType: 'tool_use', toolName: 'create_file', message: 'Creating file', iconName: 'file', partialJson: '', accumulatedText: '', isError: false },
    { index: 13, blockType: 'tool_use', toolName: 'present_files', message: 'Presenting file(s)...', iconName: 'file', partialJson: '', accumulatedText: '', isError: false },
  ];

  it('T3.1: should count bash_tool calls correctly', () => {
    const agg = aggregateToolCalls(sampleBlocks);
    expect(agg.get('bash_tool')).toBe(2);
  });

  it('T3.2: should count str_replace calls correctly', () => {
    const agg = aggregateToolCalls(sampleBlocks);
    expect(agg.get('str_replace')).toBe(2);
  });

  it('T3.3: should count all unique tools', () => {
    const agg = aggregateToolCalls(sampleBlocks);
    expect(agg.size).toBe(5);
  });

  it('T3.4: should count view calls', () => {
    const agg = aggregateToolCalls(sampleBlocks);
    expect(agg.get('view')).toBe(1);
  });

  it('T3.5: should count create_file calls', () => {
    const agg = aggregateToolCalls(sampleBlocks);
    expect(agg.get('create_file')).toBe(1);
  });

  it('T3.6: should handle empty block list', () => {
    const agg = aggregateToolCalls([]);
    expect(agg.size).toBe(0);
  });

  it('T3.7: should only count tool_use blocks, not tool_result', () => {
    const mixed: ContentBlockState[] = [
      ...sampleBlocks,
      { index: 14, blockType: 'tool_result', toolName: 'bash_tool', message: '', iconName: '', partialJson: '', accumulatedText: '', isError: false },
    ];
    const agg = aggregateToolCalls(mixed);
    expect(agg.get('bash_tool')).toBe(2); // Not 3
  });

  it('T3.8: should handle blocks with same tool consecutively', () => {
    const consecutive: ContentBlockState[] = [
      { index: 1, blockType: 'tool_use', toolName: 'bash_tool', message: 'Cmd 1', iconName: 'commandLine', partialJson: '', accumulatedText: '', isError: false },
      { index: 3, blockType: 'tool_use', toolName: 'bash_tool', message: 'Cmd 2', iconName: 'commandLine', partialJson: '', accumulatedText: '', isError: false },
      { index: 5, blockType: 'tool_use', toolName: 'bash_tool', message: 'Cmd 3', iconName: 'commandLine', partialJson: '', accumulatedText: '', isError: false },
    ];
    const agg = aggregateToolCalls(consecutive);
    expect(agg.get('bash_tool')).toBe(3);
  });

  it('T3.9: total tool calls should match input length', () => {
    const agg = aggregateToolCalls(sampleBlocks);
    let total = 0;
    agg.forEach(v => total += v);
    expect(total).toBe(7);
  });

  it('T3.10: should handle present_files count', () => {
    const agg = aggregateToolCalls(sampleBlocks);
    expect(agg.get('present_files')).toBe(1);
  });
});

// ============================================================
// Test 4: extractThinkingSummary
// ============================================================
describe('EventStreamParser — Thinking Summary Extraction', () => {
  it('T4.1: should extract summary from thinking_summary_delta', () => {
    const summary = extractThinkingSummary([
      { type: 'thinking_summary_delta', summary: { summary: 'Orchestrated test framework setup.' } }
    ]);
    expect(summary).toContain('Orchestrated');
  });

  it('T4.2: should concatenate multiple summaries', () => {
    const summary = extractThinkingSummary([
      { type: 'thinking_summary_delta', summary: { summary: 'Part 1.' } },
      { type: 'thinking_summary_delta', summary: { summary: 'Part 2.' } },
    ]);
    expect(summary).toContain('Part 1');
    expect(summary).toContain('Part 2');
  });

  it('T4.3: should return empty string for no summaries', () => {
    const summary = extractThinkingSummary([]);
    expect(summary).toBe('');
  });

  it('T4.4: should handle null summary field', () => {
    const summary = extractThinkingSummary([
      { type: 'thinking_summary_delta', summary: null }
    ]);
    expect(summary).toBe('');
  });

  it('T4.5: should handle mixed delta types (filter non-summary)', () => {
    const summary = extractThinkingSummary([
      { type: 'thinking_delta', thinking: 'raw thinking' },
      { type: 'thinking_summary_delta', summary: { summary: 'The real summary.' } },
    ]);
    expect(summary).toContain('real summary');
    expect(summary).not.toContain('raw thinking');
  });

  it('T4.6: should trim whitespace', () => {
    const summary = extractThinkingSummary([
      { type: 'thinking_summary_delta', summary: { summary: '  spaced out  ' } }
    ]);
    expect(summary).toBe('spaced out');
  });

  it('T4.7: should handle very long summaries', () => {
    const longText = 'x'.repeat(500);
    const summary = extractThinkingSummary([
      { type: 'thinking_summary_delta', summary: { summary: longText } }
    ]);
    expect(summary.length).toBeLessThanOrEqual(300);
  });

  it('T4.8: should last-write-wins for duplicates', () => {
    const summary = extractThinkingSummary([
      { type: 'thinking_summary_delta', summary: { summary: 'First thought.' } },
      { type: 'thinking_summary_delta', summary: { summary: 'Revised thought.' } },
    ]);
    // Should contain the last one at minimum
    expect(summary).toContain('Revised thought');
  });

  it('T4.9: should handle unicode content', () => {
    const summary = extractThinkingSummary([
      { type: 'thinking_summary_delta', summary: { summary: '思考如何修复测试' } }
    ]);
    expect(summary).toContain('思考');
  });

  it('T4.10: should handle empty summary string', () => {
    const summary = extractThinkingSummary([
      { type: 'thinking_summary_delta', summary: { summary: '' } }
    ]);
    expect(summary).toBe('');
  });
});

// ============================================================
// Test 5: extractToolUseMessage
// ============================================================
describe('EventStreamParser — Tool Use Message Extraction', () => {
  it('T5.1: should extract message from tool_use_block_update_delta', () => {
    const msg = extractToolUseMessage([
      { type: 'tool_use_block_update_delta', message: 'Add verl.utils stubs' }
    ]);
    expect(msg).toBe('Add verl.utils stubs');
  });

  it('T5.2: should use last message when multiple updates', () => {
    const msg = extractToolUseMessage([
      { type: 'tool_use_block_update_delta', message: 'Initial msg' },
      { type: 'tool_use_block_update_delta', message: 'Updated msg' },
    ]);
    expect(msg).toBe('Updated msg');
  });

  it('T5.3: should return empty for no updates', () => {
    const msg = extractToolUseMessage([]);
    expect(msg).toBe('');
  });

  it('T5.4: should filter non-update deltas', () => {
    const msg = extractToolUseMessage([
      { type: 'input_json_delta', partial_json: '{"path":"/x"}' },
      { type: 'tool_use_block_update_delta', message: 'Real message' },
    ]);
    expect(msg).toBe('Real message');
  });

  it('T5.5: should handle TDD step messages', () => {
    const msg = extractToolUseMessage([
      { type: 'tool_use_block_update_delta', message: 'TDD Step 4: Run tests – iterate until all pass' }
    ]);
    expect(msg).toContain('TDD Step 4');
  });

  it('T5.6: should handle M-numbered messages', () => {
    const msg = extractToolUseMessage([
      { type: 'tool_use_block_update_delta', message: 'M51: Add _preferred_device' }
    ]);
    expect(msg).toContain('M51');
  });

  it('T5.7: should handle null message gracefully', () => {
    const msg = extractToolUseMessage([
      { type: 'tool_use_block_update_delta', message: null }
    ]);
    expect(msg).toBe('');
  });

  it('T5.8: should handle git-related messages', () => {
    const msg = extractToolUseMessage([
      { type: 'tool_use_block_update_delta', message: 'Configure git and commit tests' }
    ]);
    expect(msg).toContain('git');
  });

  it('T5.9: should handle verification messages', () => {
    const msg = extractToolUseMessage([
      { type: 'tool_use_block_update_delta', message: 'Verify function/class counts unchanged' }
    ]);
    expect(msg).toContain('Verify');
  });

  it('T5.10: should handle diff/patch messages', () => {
    const msg = extractToolUseMessage([
      { type: 'tool_use_block_update_delta', message: 'Generate single combined diff patch' }
    ]);
    expect(msg).toContain('diff patch');
  });
});

// ============================================================
// Test 6: buildTimelineFromBlocks
// ============================================================
describe('EventStreamParser — Timeline Builder', () => {
  const sampleTimeline: ContentBlockState[] = [
    { index: 0, blockType: 'thinking', toolName: '', message: '', iconName: '', partialJson: '', accumulatedText: 'Let me fix...', isError: false, startTimestamp: '2026-03-18T07:53:53.761Z', stopTimestamp: '2026-03-18T07:53:54.465Z' },
    { index: 1, blockType: 'tool_use', toolName: 'str_replace', message: 'Editing file', iconName: 'edit', partialJson: '{"path":"/home/test.py"}', accumulatedText: '', isError: false, startTimestamp: '2026-03-18T07:53:54.690Z', stopTimestamp: '2026-03-18T07:54:01.123Z' },
    { index: 4, blockType: 'tool_use', toolName: 'bash_tool', message: 'Run tests', iconName: 'commandLine', partialJson: '{"command":"pytest"}', accumulatedText: '', isError: false, startTimestamp: '2026-03-18T07:54:05.017Z', stopTimestamp: '2026-03-18T07:54:38.744Z' },
    { index: 25, blockType: 'text', toolName: '', message: '', iconName: '', partialJson: '', accumulatedText: 'Tests passed!', isError: false, startTimestamp: '2026-03-18T07:55:00.000Z' },
  ];

  it('T6.1: should build timeline entries from blocks', () => {
    const timeline = buildTimelineFromBlocks(sampleTimeline);
    expect(timeline.length).toBe(4);
  });

  it('T6.2: timeline entries should have duration_ms', () => {
    const timeline = buildTimelineFromBlocks(sampleTimeline);
    const toolEntry = timeline.find(e => e.toolName === 'str_replace');
    expect(toolEntry!.durationMs).toBeGreaterThan(0);
  });

  it('T6.3: bash command should have longest duration', () => {
    const timeline = buildTimelineFromBlocks(sampleTimeline);
    const bashEntry = timeline.find(e => e.toolName === 'bash_tool');
    const editEntry = timeline.find(e => e.toolName === 'str_replace');
    expect(bashEntry!.durationMs).toBeGreaterThan(editEntry!.durationMs);
  });

  it('T6.4: timeline should be sorted by start time', () => {
    const timeline = buildTimelineFromBlocks(sampleTimeline);
    for (let i = 1; i < timeline.length; i++) {
      expect(timeline[i].startTime).toBeGreaterThanOrEqual(timeline[i-1].startTime);
    }
  });

  it('T6.5: text blocks should have type "text"', () => {
    const timeline = buildTimelineFromBlocks(sampleTimeline);
    const textEntry = timeline.find(e => e.blockType === 'text');
    expect(textEntry).toBeDefined();
    expect(textEntry!.content).toContain('Tests passed');
  });

  it('T6.6: thinking blocks should have type "thinking"', () => {
    const timeline = buildTimelineFromBlocks(sampleTimeline);
    const thinkEntry = timeline.find(e => e.blockType === 'thinking');
    expect(thinkEntry).toBeDefined();
  });

  it('T6.7: should handle empty input', () => {
    const timeline = buildTimelineFromBlocks([]);
    expect(timeline.length).toBe(0);
  });

  it('T6.8: tool entries should preserve toolName', () => {
    const timeline = buildTimelineFromBlocks(sampleTimeline);
    const names = timeline.filter(e => e.toolName).map(e => e.toolName);
    expect(names).toContain('str_replace');
    expect(names).toContain('bash_tool');
  });

  it('T6.9: tool entries should preserve message/description', () => {
    const timeline = buildTimelineFromBlocks(sampleTimeline);
    const editEntry = timeline.find(e => e.toolName === 'str_replace');
    expect(editEntry!.message).toBe('Editing file');
  });

  it('T6.10: should handle missing timestamps gracefully', () => {
    const noTimestamps: ContentBlockState[] = [
      { index: 0, blockType: 'tool_use', toolName: 'bash_tool', message: 'Run', iconName: 'commandLine', partialJson: '', accumulatedText: '', isError: false },
    ];
    const timeline = buildTimelineFromBlocks(noTimestamps);
    expect(timeline.length).toBe(1);
    expect(timeline[0].durationMs).toBe(0);
  });
});
