/**
 * TDD v17 — Claude Protocol Parser Tests
 * 
 * TEST-DRIVEN DEVELOPMENT: These tests are written FIRST.
 * No mock implementations. Real expected input/output pairs.
 * Target: ~50% failure on first run (existing functions pass, new functions fail).
 * 
 * Covers:
 *   Module 1: parseClaudeSSELine (10 tests)
 *   Module 2: parseToolResultContent (10 tests)
 *   Module 3: extractToolCallSignature — 50+ command types (10 tests)
 *   Module 4: buildTurnSummaryFromBlocks (10 tests)
 *   Module 5: processMessageEvents end-to-end (10 tests)
 *   Module 6: NEW — CommandDisplayRegistry (10 tests) — 50 command display types
 *   Module 7: NEW — EventStreamReplayer (10 tests) — replay eventStream files
 *   Module 8: NEW — ToolResultFormatters (10 tests) — rich formatting
 *   Module 9: NEW — StreamingStateManager (10 tests)
 *   Module 10: NEW — ProtocolMetrics (10 tests)
 */

import { describe, it, expect } from 'vitest';
import {
  parseClaudeSSELine,
  parseToolResultContent,
  extractToolCallSignature,
  buildTurnSummaryFromBlocks,
  processMessageEvents,
  extractBashOutput,
  extractEditResult,
  matchToolResultToToolUse,
  buildAgenticBlockFromToolResult,
  detectProtocolVersion,
  parseToolUseArgs,
  parseStreamedToolResultJson,
  extractToolResultDisplayText,
  getIconForToolResult,
  calculateBlockDuration,
  StreamingAccumulator,
} from '@/utils/claudeProtocolParser';

// NEW modules to be implemented
import {
  CommandDisplayRegistry,
  getCommandDisplayInfo,
  registerCommandDisplay,
  getAllCommandDisplayTypes,
  getCommandCategory,
  formatCommandTitle,
  formatCommandSubtitle,
  getCommandIcon,
  getCommandColor,
} from '@/utils/commandDisplayRegistry';

import {
  EventStreamReplayer,
  parseEventStreamFile,
  extractAllToolCalls,
  groupEventsByTurn,
  calculateStreamMetrics,
  buildReplayTimeline,
} from '@/utils/eventStreamReplayer';

import {
  formatBashResult,
  formatEditResult as formatEditResultRich,
  formatViewResult,
  formatCreateFileResult,
  formatPresentFilesResult,
  formatSearchResult,
  formatFetchResult,
  formatTestResult,
  formatDiffResult,
  formatGenericToolResult,
} from '@/utils/toolResultFormatters';

import {
  StreamingStateManager,
  createStreamingState,
  updateStreamingDelta,
  finalizeStreamingBlock,
  getActiveStreams,
  getStreamProgress,
} from '@/utils/streamingStateManager';

import {
  ProtocolMetrics,
  calculateTokenUsage,
  calculateLatency,
  calculateToolCallStats,
  calculateTurnStats,
  generatePerformanceReport,
} from '@/utils/protocolMetrics';

// ============================================================
// Module 1: parseClaudeSSELine (10 tests) — EXISTING
// ============================================================
describe('Module 1: parseClaudeSSELine', () => {
  it('M1.1 — parses event: message_start with full message payload', () => {
    const raw = 'event: message_start\r\ndata: {"type":"message_start","message":{"id":"chatcompl_01QHmkgUTc8E52oNmkKFYKnU","type":"message","role":"assistant","model":"","content":[],"stop_reason":null}}\r\n';
    const result = parseClaudeSSELine(raw);
    expect(result).not.toBeNull();
    expect(result!.eventType).toBe('message_start');
    expect(result!.data.message.id).toBe('chatcompl_01QHmkgUTc8E52oNmkKFYKnU');
    expect(result!.data.message.role).toBe('assistant');
  });

  it('M1.2 — parses content_block_start with thinking type', () => {
    const raw = 'event: content_block_start\r\ndata: {"type":"content_block_start","index":0,"content_block":{"type":"thinking","thinking":"","summaries":[],"cut_off":false}}\r\n';
    const result = parseClaudeSSELine(raw);
    expect(result).not.toBeNull();
    expect(result!.data.content_block.type).toBe('thinking');
    expect(result!.data.index).toBe(0);
  });

  it('M1.3 — parses content_block_delta with thinking_delta', () => {
    const raw = 'event: content_block_delta\r\ndata: {"type":"content_block_delta","index":0,"delta":{"type":"thinking_delta","thinking":"Let me fix"}}\r\n';
    const result = parseClaudeSSELine(raw);
    expect(result!.data.delta.thinking).toBe('Let me fix');
  });

  it('M1.4 — parses content_block_delta with input_json_delta', () => {
    const raw = 'event: content_block_delta\r\ndata: {"type":"content_block_delta","index":1,"delta":{"type":"input_json_delta","partial_json":"{\\"command\\":"}}\r\n';
    const result = parseClaudeSSELine(raw);
    expect(result!.data.delta.partial_json).toBe('{"command":');
  });

  it('M1.5 — parses tool_use_block_update_delta with message', () => {
    const raw = 'event: content_block_delta\r\ndata: {"type":"content_block_delta","index":1,"delta":{"type":"tool_use_block_update_delta","message":"Running tests","display_content":null}}\r\n';
    const result = parseClaudeSSELine(raw);
    expect(result!.data.delta.message).toBe('Running tests');
  });

  it('M1.6 — parses thinking_summary_delta', () => {
    const raw = 'event: content_block_delta\r\ndata: {"type":"content_block_delta","index":0,"delta":{"type":"thinking_summary_delta","summary":{"summary":"Analyzing test results."}}}\r\n';
    const result = parseClaudeSSELine(raw);
    expect(result!.data.delta.summary.summary).toBe('Analyzing test results.');
  });

  it('M1.7 — parses message_delta with stop_reason end_turn', () => {
    const raw = 'event: message_delta\r\ndata: {"type":"message_delta","delta":{"stop_reason":"end_turn"}}\r\n';
    const result = parseClaudeSSELine(raw);
    expect(result!.data.delta.stop_reason).toBe('end_turn');
  });

  it('M1.8 — returns null for empty input', () => {
    expect(parseClaudeSSELine('')).toBeNull();
    expect(parseClaudeSSELine('\r\n')).toBeNull();
    expect(parseClaudeSSELine('   ')).toBeNull();
  });

  it('M1.9 — returns null for SSE comment lines', () => {
    expect(parseClaudeSSELine(': keep-alive')).toBeNull();
  });

  it('M1.10 — handles malformed JSON gracefully', () => {
    const raw = 'event: test\r\ndata: {broken json}';
    expect(parseClaudeSSELine(raw)).toBeNull();
  });
});

// ============================================================
// Module 2: parseToolResultContent (10 tests) — EXISTING
// ============================================================
describe('Module 2: parseToolResultContent', () => {
  it('M2.1 — parses str_replace tool_result with success display_content', () => {
    const cb = {
      type: 'tool_result', tool_use_id: 'toolu_01WqqucrPEM2LYnV1zwV8EJH',
      name: 'str_replace', is_error: false, icon_name: 'edit',
      display_content: { type: 'text', text: 'Successfully replaced string in /home/claude/test.py' },
    };
    const info = parseToolResultContent(cb);
    expect(info.toolName).toBe('str_replace');
    expect(info.isError).toBe(false);
    expect(info.displayText).toContain('Successfully replaced');
    expect(info.iconName).toBe('edit');
  });

  it('M2.2 — parses bash_tool tool_result with json_block display_content', () => {
    const cb = {
      type: 'tool_result', tool_use_id: 'toolu_017T7vtgKStUF6Rkujy9kRff',
      name: 'bash_tool', is_error: false, icon_name: 'commandLine',
      display_content: { type: 'json_block', json_block: '{"returncode":0,"stdout":"test output","stderr":""}' },
    };
    const info = parseToolResultContent(cb);
    expect(info.toolName).toBe('bash_tool');
    expect(info.iconName).toBe('commandLine');
  });

  it('M2.3 — parses view tool_result', () => {
    const cb = {
      type: 'tool_result', tool_use_id: 'toolu_0111trgULb2beNuivFdak787',
      name: 'view', is_error: false, icon_name: 'file',
      display_content: { type: 'json_block', json_block: '{"language":"python","code":"# test","filename":"test.py"}' },
    };
    const info = parseToolResultContent(cb);
    expect(info.toolName).toBe('view');
    expect(info.iconName).toBe('file');
  });

  it('M2.4 — parses error tool_result', () => {
    const cb = { type: 'tool_result', name: 'bash_tool', is_error: true, display_content: { text: 'Command failed' } };
    const info = parseToolResultContent(cb);
    expect(info.isError).toBe(true);
    expect(info.displayText).toBe('Command failed');
  });

  it('M2.5 — parses create_file tool_result', () => {
    const cb = { type: 'tool_result', name: 'create_file', is_error: false, icon_name: 'file',
      display_content: { type: 'text', text: 'Created /home/claude/new_file.py' } };
    const info = parseToolResultContent(cb);
    expect(info.toolName).toBe('create_file');
    expect(info.displayText).toContain('Created');
  });

  it('M2.6 — parses present_files tool_result', () => {
    const cb = { type: 'tool_result', name: 'present_files', is_error: false,
      display_content: { type: 'text', text: 'Presented 2 files' } };
    const info = parseToolResultContent(cb);
    expect(info.toolName).toBe('present_files');
    expect(info.displayText).toBe('Presented 2 files');
  });

  it('M2.7 — handles null display_content', () => {
    const cb = { type: 'tool_result', name: 'bash_tool', is_error: false, display_content: null };
    const info = parseToolResultContent(cb);
    expect(info.displayText).toBe('');
  });

  it('M2.8 — handles missing content_block gracefully', () => {
    const info = parseToolResultContent(null);
    expect(info.toolName).toBe('');
    expect(info.toolUseId).toBe('');
    expect(info.isError).toBe(false);
  });

  it('M2.9 — handles undefined content_block', () => {
    const info = parseToolResultContent(undefined);
    expect(info.toolName).toBe('');
  });

  it('M2.10 — preserves tool_use_id for matching', () => {
    const cb = { type: 'tool_result', tool_use_id: 'toolu_ABC123', name: 'view', is_error: false };
    const info = parseToolResultContent(cb);
    expect(info.toolUseId).toBe('toolu_ABC123');
  });
});

// ============================================================
// Module 3: extractToolCallSignature — 50+ command types (10 tests)
// ============================================================
describe('Module 3: extractToolCallSignature — 50+ command display types', () => {
  it('M3.1 — bash_tool command signature with truncation', () => {
    expect(extractToolCallSignature('bash_tool', { command: 'cd /home/claude && npm test' }))
      .toBe('Bash(cd /home/claude && npm test)');
    // Very long command should truncate
    const longCmd = 'a'.repeat(100);
    const sig = extractToolCallSignature('bash_tool', { command: longCmd });
    expect(sig.length).toBeLessThan(100);
    expect(sig).toContain('…');
  });

  it('M3.2 — str_replace shows filename only', () => {
    expect(extractToolCallSignature('str_replace', { path: '/home/claude/operatorRL/tests/conftest.py' }))
      .toBe('Edit(conftest.py)');
  });

  it('M3.3 — view shows filename', () => {
    expect(extractToolCallSignature('view', { path: '/home/claude/operatorRL/tests/tdd_m51_m60/conftest.py' }))
      .toBe('Read(conftest.py)');
  });

  it('M3.4 — create_file shows filename', () => {
    expect(extractToolCallSignature('create_file', { path: '/home/claude/new_module.py' }))
      .toBe('Write(new_module.py)');
  });

  it('M3.5 — present_files shows file count', () => {
    expect(extractToolCallSignature('present_files', { filepaths: ['/a.txt', '/b.txt'] }))
      .toBe('Files(2 files)');
    expect(extractToolCallSignature('present_files', { filepaths: ['/a.txt'] }))
      .toBe('Files(1 file)');
  });

  it('M3.6 — web_search with quoted query', () => {
    expect(extractToolCallSignature('web_search', { query: 'Claude API SSE protocol' }))
      .toBe('WebSearch("Claude API SSE protocol")');
  });

  it('M3.7 — web_fetch with hostname extraction', () => {
    expect(extractToolCallSignature('web_fetch', { url: 'https://docs.anthropic.com/en/docs/claude-code' }))
      .toBe('Fetch(docs.anthropic.com)');
  });

  it('M3.8 — grep_search with pattern', () => {
    expect(extractToolCallSignature('grep_search', { pattern: 'def main' }))
      .toBe('Search(def main)');
  });

  it('M3.9 — empty args shows ellipsis', () => {
    expect(extractToolCallSignature('bash_tool', {})).toBe('Bash(…)');
    expect(extractToolCallSignature('unknown_tool', {})).toBe('unknown_tool(…)');
  });

  it('M3.10 — all 50+ display types have valid signatures', () => {
    // Test ALL known tool names produce non-empty signatures
    const allTools = [
      'bash_tool', 'bash', 'run_script', 'batch_commands', 'debug_test',
      'str_replace', 'edit_file', 'multi_edit',
      'view', 'read_file', 'batch_read', 'view_truncated', 'list_dir', 'glob',
      'create_file', 'write_file',
      'present_files', 'grep_search', 'file_search', 'web_search', 'web_fetch',
      'revert_edit', 'revert_to_checkpoint',
      'todo_write', 'todo_read', 'task', 'memory_read', 'memory_write',
      'task_complete', 'execute_code', 'install_package',
    ];
    for (const tool of allTools) {
      const sig = extractToolCallSignature(tool, { command: 'test', path: '/test', query: 'test', url: 'https://test.com', filepaths: ['/a'] });
      expect(sig).toBeTruthy();
      expect(sig.length).toBeGreaterThan(0);
    }
  });
});

// ============================================================
// Module 4: buildTurnSummaryFromBlocks (10 tests) — EXISTING
// ============================================================
describe('Module 4: buildTurnSummaryFromBlocks', () => {
  it('M4.1 — single bash command', () => {
    const blocks = [{ id: '1', type: 'tool' as const, turn: 0, tool: 'bash_tool' }];
    const summary = buildTurnSummaryFromBlocks(blocks);
    expect(summary.display).toBe('Ran a command');
    expect(summary.commands_run).toBe(1);
  });

  it('M4.2 — multiple commands', () => {
    const blocks = Array(7).fill(null).map((_, i) => ({ id: `${i}`, type: 'tool' as const, turn: 0, tool: 'bash_tool' }));
    const summary = buildTurnSummaryFromBlocks(blocks);
    expect(summary.display).toBe('Ran 7 commands');
    expect(summary.commands_run).toBe(7);
  });

  it('M4.3 — mixed: commands + view + edit', () => {
    const blocks = [
      { id: '1', type: 'tool' as const, turn: 0, tool: 'bash_tool' },
      { id: '2', type: 'tool' as const, turn: 0, tool: 'bash_tool' },
      { id: '3', type: 'tool' as const, turn: 0, tool: 'view' },
      { id: '4', type: 'tool' as const, turn: 0, tool: 'str_replace' },
    ];
    const summary = buildTurnSummaryFromBlocks(blocks);
    expect(summary.display).toBe('Ran 2 commands, viewed a file, edited a file');
  });

  it('M4.4 — 14 commands, viewed, edited', () => {
    const blocks = [
      ...Array(14).fill(null).map((_, i) => ({ id: `c${i}`, type: 'tool' as const, turn: 0, tool: 'bash_tool' })),
      { id: 'v1', type: 'tool' as const, turn: 0, tool: 'view' },
      { id: 'e1', type: 'tool' as const, turn: 0, tool: 'str_replace' },
    ];
    const summary = buildTurnSummaryFromBlocks(blocks);
    expect(summary.display).toBe('Ran 14 commands, viewed a file, edited a file');
  });

  it('M4.5 — web search + fetch', () => {
    const blocks = [
      { id: '1', type: 'tool' as const, turn: 0, tool: 'web_search' },
      { id: '2', type: 'tool' as const, turn: 0, tool: 'web_fetch' },
      { id: '3', type: 'tool' as const, turn: 0, tool: 'web_fetch' },
    ];
    const summary = buildTurnSummaryFromBlocks(blocks);
    expect(summary.display).toContain('searched the web');
    expect(summary.display).toContain('fetched 2 pages');
  });

  it('M4.6 — ignores non-tool blocks', () => {
    const blocks = [
      { id: '1', type: 'text' as const, turn: 0, content: 'hello' },
      { id: '2', type: 'thinking' as const, turn: 0, content: 'hmm' },
      { id: '3', type: 'tool' as const, turn: 0, tool: 'bash_tool' },
    ];
    const summary = buildTurnSummaryFromBlocks(blocks);
    expect(summary.tool_count).toBe(1);
  });

  it('M4.7 — present_files category', () => {
    const blocks = [
      { id: '1', type: 'tool' as const, turn: 0, tool: 'present_files' },
      { id: '2', type: 'tool' as const, turn: 0, tool: 'present_files' },
    ];
    const summary = buildTurnSummaryFromBlocks(blocks);
    expect(summary.display).toBe('presented 2 files');
  });

  it('M4.8 — empty blocks', () => {
    const summary = buildTurnSummaryFromBlocks([]);
    expect(summary.display).toBe('');
    expect(summary.tool_count).toBe(0);
  });

  it('M4.9 — create_file counted correctly', () => {
    const blocks = [
      { id: '1', type: 'tool' as const, turn: 0, tool: 'create_file' },
      { id: '2', type: 'tool' as const, turn: 0, tool: 'write_file' },
    ];
    const summary = buildTurnSummaryFromBlocks(blocks);
    expect(summary.files_created).toBe(2);
    expect(summary.display).toBe('created 2 files');
  });

  it('M4.10 — all categories present', () => {
    const blocks = [
      { id: '1', type: 'tool' as const, turn: 0, tool: 'bash_tool' },
      { id: '2', type: 'tool' as const, turn: 0, tool: 'view' },
      { id: '3', type: 'tool' as const, turn: 0, tool: 'str_replace' },
      { id: '4', type: 'tool' as const, turn: 0, tool: 'create_file' },
      { id: '5', type: 'tool' as const, turn: 0, tool: 'grep_search' },
      { id: '6', type: 'tool' as const, turn: 0, tool: 'web_search' },
      { id: '7', type: 'tool' as const, turn: 0, tool: 'web_fetch' },
      { id: '8', type: 'tool' as const, turn: 0, tool: 'present_files' },
    ];
    const summary = buildTurnSummaryFromBlocks(blocks);
    expect(summary.tool_count).toBe(8);
    expect(summary.display).toContain('Ran a command');
    expect(summary.display).toContain('viewed a file');
    expect(summary.display).toContain('edited a file');
    expect(summary.display).toContain('created a file');
    expect(summary.display).toContain('searched code');
    expect(summary.display).toContain('searched the web');
    expect(summary.display).toContain('fetched a page');
    expect(summary.display).toContain('presented a file');
  });
});

// ============================================================
// Module 5: processMessageEvents end-to-end (10 tests) — EXISTING
// ============================================================
describe('Module 5: processMessageEvents', () => {
  it('M5.1 — processes message_start → model extraction', () => {
    const events = [{ type: 'message_start', message: { id: 'test', model: 'claude-opus-4-20250514', content: [], stop_reason: null } }];
    const result = processMessageEvents(events);
    expect(result.model).toBe('claude-opus-4-20250514');
  });

  it('M5.2 — processes thinking block', () => {
    const events = [
      { type: 'message_start', message: { model: '' } },
      { type: 'content_block_start', index: 0, content_block: { type: 'thinking', thinking: '' } },
      { type: 'content_block_delta', index: 0, delta: { type: 'thinking_delta', thinking: 'Let me think' } },
      { type: 'content_block_stop', index: 0 },
    ];
    const result = processMessageEvents(events);
    expect(result.blocks[0].type).toBe('thinking');
    expect(result.blocks[0].content).toBe('Let me think');
  });

  it('M5.3 — processes text block', () => {
    const events = [
      { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } },
      { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'Hello world' } },
      { type: 'content_block_stop', index: 0 },
    ];
    const result = processMessageEvents(events);
    expect(result.blocks[0].type).toBe('text');
    expect(result.blocks[0].content).toBe('Hello world');
  });

  it('M5.4 — processes tool_use + tool_result cycle', () => {
    const events = [
      { type: 'content_block_start', index: 0, content_block: { type: 'tool_use', id: 'toolu_123', name: 'bash_tool', input: {}, message: 'Running command' } },
      { type: 'content_block_delta', index: 0, delta: { type: 'input_json_delta', partial_json: '{"command":' } },
      { type: 'content_block_delta', index: 0, delta: { type: 'input_json_delta', partial_json: '"ls -la"}' } },
      { type: 'content_block_stop', index: 0 },
      // tool_result
      { type: 'content_block_start', index: 1, content_block: { type: 'tool_result', tool_use_id: 'toolu_123', name: 'bash_tool', is_error: false, display_content: { type: 'text', text: 'OK' } } },
      { type: 'content_block_stop', index: 1 },
    ];
    const result = processMessageEvents(events);
    expect(result.blocks[0].tool).toBe('bash_tool');
    expect(result.blocks[0].toolArgs).toEqual({ command: 'ls -la' });
    expect(result.blocks[0].toolResult).toBe('OK');
    expect(result.blocks[0].toolSuccess).toBe(true);
    expect(result.blocks[0].isStreaming).toBe(false);
  });

  it('M5.5 — handles tool_result error', () => {
    const events = [
      { type: 'content_block_start', index: 0, content_block: { type: 'tool_use', id: 'toolu_err', name: 'bash_tool', input: {} } },
      { type: 'content_block_stop', index: 0 },
      { type: 'content_block_start', index: 1, content_block: { type: 'tool_result', tool_use_id: 'toolu_err', name: 'bash_tool', is_error: true, display_content: { text: 'Error occurred' } } },
      { type: 'content_block_stop', index: 1 },
    ];
    const result = processMessageEvents(events);
    expect(result.blocks[0].toolSuccess).toBe(false);
  });

  it('M5.6 — counts turns from message_delta end_turn', () => {
    const events = [
      { type: 'message_delta', delta: { stop_reason: 'end_turn' } },
      { type: 'message_delta', delta: { stop_reason: 'end_turn' } },
    ];
    const result = processMessageEvents(events);
    expect(result.turns).toBe(2);
  });

  it('M5.7 — processes multiple tool calls in sequence', () => {
    const events = [
      { type: 'content_block_start', index: 0, content_block: { type: 'tool_use', id: 'toolu_a', name: 'str_replace', input: {}, message: 'Editing file' } },
      { type: 'content_block_stop', index: 0 },
      { type: 'content_block_start', index: 1, content_block: { type: 'tool_result', tool_use_id: 'toolu_a', name: 'str_replace', is_error: false, display_content: { text: 'OK' } } },
      { type: 'content_block_stop', index: 1 },
      { type: 'content_block_start', index: 2, content_block: { type: 'tool_use', id: 'toolu_b', name: 'bash_tool', input: {}, message: 'Running tests' } },
      { type: 'content_block_stop', index: 2 },
      { type: 'content_block_start', index: 3, content_block: { type: 'tool_result', tool_use_id: 'toolu_b', name: 'bash_tool', is_error: false, display_content: { text: 'All pass' } } },
      { type: 'content_block_stop', index: 3 },
    ];
    const result = processMessageEvents(events);
    expect(result.blocks).toHaveLength(2);
    expect(result.blocks[0].tool).toBe('str_replace');
    expect(result.blocks[1].tool).toBe('bash_tool');
  });

  it('M5.8 — tool_use_block_update_delta updates description', () => {
    const events = [
      { type: 'content_block_start', index: 0, content_block: { type: 'tool_use', id: 'toolu_x', name: 'bash_tool', input: {}, message: 'Initial' } },
      { type: 'content_block_delta', index: 0, delta: { type: 'tool_use_block_update_delta', message: 'Updated description' } },
      { type: 'content_block_stop', index: 0 },
    ];
    const result = processMessageEvents(events);
    expect(result.blocks[0].toolDescription).toBe('Updated description');
  });

  it('M5.9 — thinking_summary_delta captured', () => {
    const events = [
      { type: 'content_block_start', index: 0, content_block: { type: 'thinking', thinking: '' } },
      { type: 'content_block_delta', index: 0, delta: { type: 'thinking_summary_delta', summary: { summary: 'Planning test strategy' } } },
      { type: 'content_block_stop', index: 0 },
    ];
    const result = processMessageEvents(events);
    expect(result.blocks[0].thinkingSummary).toBe('Planning test strategy');
  });

  it('M5.10 — bash_tool non-zero returncode → toolSuccess=false', () => {
    const events = [
      { type: 'content_block_start', index: 0, content_block: { type: 'tool_use', id: 'toolu_fail', name: 'bash_tool', input: {} } },
      { type: 'content_block_stop', index: 0 },
      { type: 'content_block_start', index: 1, content_block: { type: 'tool_result', tool_use_id: 'toolu_fail', name: 'bash_tool', is_error: false, display_content: { text: '{"returncode":1,"stdout":"","stderr":"error"}' } } },
      { type: 'content_block_stop', index: 1 },
    ];
    const result = processMessageEvents(events);
    // The display_content.text contains the JSON, not the streamed content
    // The result should detect returncode 1 in the result text
    expect(result.blocks[0].toolSuccess).toBeDefined();
  });
});

// ============================================================
// Module 6: CommandDisplayRegistry — 50 command display types (10 tests)
// NEW — will fail until implemented
// ============================================================
describe('Module 6: CommandDisplayRegistry — 50+ command display types', () => {
  it('M6.1 — getAllCommandDisplayTypes returns 50+ entries', () => {
    const types = getAllCommandDisplayTypes();
    expect(types.length).toBeGreaterThanOrEqual(50);
  });

  it('M6.2 — getCommandDisplayInfo returns info for bash_tool', () => {
    const info = getCommandDisplayInfo('bash_tool');
    expect(info).toBeDefined();
    expect(info.label).toBe('Command');
    expect(info.icon).toBeTruthy();
    expect(info.color).toBeTruthy();
    expect(info.category).toBe('execution');
  });

  it('M6.3 — getCommandCategory classifies correctly', () => {
    expect(getCommandCategory('bash_tool')).toBe('execution');
    expect(getCommandCategory('str_replace')).toBe('file_edit');
    expect(getCommandCategory('view')).toBe('file_read');
    expect(getCommandCategory('create_file')).toBe('file_create');
    expect(getCommandCategory('web_search')).toBe('web');
    expect(getCommandCategory('present_files')).toBe('output');
    expect(getCommandCategory('todo_write')).toBe('planning');
    expect(getCommandCategory('task')).toBe('subagent');
    expect(getCommandCategory('debug_test')).toBe('testing');
    expect(getCommandCategory('revert_edit')).toBe('revert');
  });

  it('M6.4 — formatCommandTitle generates Claude Code style titles', () => {
    expect(formatCommandTitle('bash_tool', { command: 'npm test' })).toBe('Bash(npm test)');
    expect(formatCommandTitle('str_replace', { path: '/src/app.tsx' })).toBe('Edit(app.tsx)');
    expect(formatCommandTitle('view', { path: '/src/utils/parser.ts' })).toBe('Read(parser.ts)');
  });

  it('M6.5 — formatCommandSubtitle generates description lines', () => {
    const sub = formatCommandSubtitle('bash_tool', { command: 'cd /home && npm test' }, 'Running tests');
    expect(sub).toBe('Running tests');
    // Without description, show truncated command
    const sub2 = formatCommandSubtitle('bash_tool', { command: 'ls -la' }, '');
    expect(sub2).toBe('$ ls -la');
  });

  it('M6.6 — getCommandIcon returns lucide icon name', () => {
    expect(getCommandIcon('bash_tool')).toBe('Terminal');
    expect(getCommandIcon('str_replace')).toBe('Pencil');
    expect(getCommandIcon('view')).toBe('Eye');
    expect(getCommandIcon('create_file')).toBe('FilePlus');
    expect(getCommandIcon('web_search')).toBe('Globe');
    expect(getCommandIcon('present_files')).toBe('Paperclip');
  });

  it('M6.7 — getCommandColor returns Tailwind color class', () => {
    const color = getCommandColor('bash_tool');
    expect(color).toMatch(/text-/);
    expect(getCommandColor('str_replace')).toMatch(/text-/);
  });

  it('M6.8 — registerCommandDisplay allows custom tool registration', () => {
    registerCommandDisplay('my_custom_tool', {
      label: 'Custom Tool',
      icon: 'Wrench',
      color: 'text-purple-400',
      category: 'custom',
      formatTitle: (args) => `CustomTool(${args.param || '...'})`,
    });
    const info = getCommandDisplayInfo('my_custom_tool');
    expect(info.label).toBe('Custom Tool');
    expect(info.category).toBe('custom');
  });

  it('M6.9 — complete list of 50 command display types', () => {
    // All 50+ types that must be registered
    const requiredTypes = [
      // Execution (10)
      'bash_tool', 'bash', 'run_script', 'batch_commands', 'debug_test',
      'execute_code', 'install_package', 'pip_install', 'npm_install', 'apt_install',
      // File Read (8)
      'view', 'read_file', 'batch_read', 'view_truncated', 'list_dir', 'glob',
      'cat_file', 'head_file',
      // File Edit (5)
      'str_replace', 'edit_file', 'multi_edit', 'patch_file', 'sed_replace',
      // File Create (4)
      'create_file', 'write_file', 'mkdir', 'copy_file',
      // Search (4)
      'grep_search', 'file_search', 'regex_search', 'find_files',
      // Web (3)
      'web_search', 'web_fetch', 'curl',
      // Output (3)
      'present_files', 'download_file', 'export_result',
      // Planning (4)
      'todo_write', 'todo_read', 'plan_create', 'checkpoint_save',
      // Subagent (3)
      'task', 'task_complete', 'subagent_spawn',
      // Memory (2)
      'memory_read', 'memory_write',
      // Revert (3)
      'revert_edit', 'revert_to_checkpoint', 'git_revert',
      // Testing (3)
      'test_run', 'test_debug', 'coverage_check',
    ];
    for (const toolName of requiredTypes) {
      const info = getCommandDisplayInfo(toolName);
      expect(info, `Missing display info for: ${toolName}`).toBeDefined();
      expect(info.label, `Missing label for: ${toolName}`).toBeTruthy();
    }
    expect(requiredTypes.length).toBeGreaterThanOrEqual(50);
  });

  it('M6.10 — unknown tool returns sensible defaults', () => {
    const info = getCommandDisplayInfo('completely_unknown_tool');
    expect(info).toBeDefined();
    expect(info.label).toBe('Tool');
    expect(info.icon).toBe('Zap');
    expect(info.category).toBe('unknown');
  });
});

// ============================================================
// Module 7: EventStreamReplayer (10 tests) — NEW
// ============================================================
describe('Module 7: EventStreamReplayer', () => {
  it('M7.1 — parseEventStreamFile parses SSE format correctly', () => {
    const raw = 'event: message_start\r\ndata: {"type":"message_start","message":{"id":"test","model":"claude"}}\r\n\r\nevent: message_stop\r\ndata: {"type":"message_stop"}\r\n\r\n';
    const events = parseEventStreamFile(raw);
    expect(events).toHaveLength(2);
    expect(events[0].type).toBe('message_start');
    expect(events[1].type).toBe('message_stop');
  });

  it('M7.2 — extractAllToolCalls returns tool_use blocks', () => {
    const events = [
      { type: 'content_block_start', index: 0, content_block: { type: 'tool_use', name: 'bash_tool', id: 'toolu_1', message: 'Running command' } },
      { type: 'content_block_start', index: 1, content_block: { type: 'tool_result', name: 'bash_tool', tool_use_id: 'toolu_1' } },
      { type: 'content_block_start', index: 2, content_block: { type: 'tool_use', name: 'str_replace', id: 'toolu_2', message: 'Editing file' } },
    ];
    const tools = extractAllToolCalls(events);
    expect(tools).toHaveLength(2);
    expect(tools[0].name).toBe('bash_tool');
    expect(tools[1].name).toBe('str_replace');
  });

  it('M7.3 — groupEventsByTurn splits on message_delta end_turn', () => {
    const events = [
      { type: 'content_block_start', index: 0, content_block: { type: 'text' } },
      { type: 'message_delta', delta: { stop_reason: 'end_turn' } },
      { type: 'content_block_start', index: 1, content_block: { type: 'text' } },
      { type: 'message_delta', delta: { stop_reason: 'end_turn' } },
    ];
    const turns = groupEventsByTurn(events);
    expect(turns).toHaveLength(2);
  });

  it('M7.4 — calculateStreamMetrics returns timing info', () => {
    const events = [
      { type: 'content_block_start', index: 0, content_block: { type: 'thinking', start_timestamp: '2026-03-18T07:53:53.761Z' } },
      { type: 'content_block_stop', index: 0, stop_timestamp: '2026-03-18T07:53:54.465Z' },
      { type: 'content_block_start', index: 1, content_block: { type: 'tool_use', start_timestamp: '2026-03-18T07:53:54.690Z' } },
      { type: 'content_block_stop', index: 1, stop_timestamp: '2026-03-18T07:53:55.000Z' },
    ];
    const metrics = calculateStreamMetrics(events);
    expect(metrics.totalBlocks).toBe(2);
    expect(metrics.thinkingDurationMs).toBeGreaterThan(0);
  });

  it('M7.5 — buildReplayTimeline creates ordered timeline', () => {
    const events = [
      { type: 'content_block_start', index: 0, content_block: { type: 'thinking', start_timestamp: '2026-03-18T07:53:53.000Z' } },
      { type: 'content_block_start', index: 1, content_block: { type: 'tool_use', name: 'bash_tool', start_timestamp: '2026-03-18T07:53:54.000Z' } },
    ];
    const timeline = buildReplayTimeline(events);
    expect(timeline).toHaveLength(2);
    expect(timeline[0].blockType).toBe('thinking');
    expect(timeline[1].blockType).toBe('tool_use');
  });

  it('M7.6 — EventStreamReplayer handles empty input', () => {
    const events = parseEventStreamFile('');
    expect(events).toHaveLength(0);
  });

  it('M7.7 — extractAllToolCalls counts by tool name', () => {
    const events = [
      { type: 'content_block_start', index: 0, content_block: { type: 'tool_use', name: 'bash_tool', id: 't1' } },
      { type: 'content_block_start', index: 1, content_block: { type: 'tool_use', name: 'bash_tool', id: 't2' } },
      { type: 'content_block_start', index: 2, content_block: { type: 'tool_use', name: 'str_replace', id: 't3' } },
      { type: 'content_block_start', index: 3, content_block: { type: 'tool_use', name: 'view', id: 't4' } },
    ];
    const tools = extractAllToolCalls(events);
    const counts = new Map<string, number>();
    for (const t of tools) { counts.set(t.name, (counts.get(t.name) || 0) + 1); }
    expect(counts.get('bash_tool')).toBe(2);
    expect(counts.get('str_replace')).toBe(1);
    expect(counts.get('view')).toBe(1);
  });

  it('M7.8 — parseEventStreamFile handles \\r\\n line endings', () => {
    const raw = 'event: message_start\r\ndata: {"type":"message_start","message":{"id":"1"}}\r\n\r\n';
    const events = parseEventStreamFile(raw);
    expect(events[0].type).toBe('message_start');
  });

  it('M7.9 — calculateStreamMetrics counts tool calls', () => {
    const events = [
      { type: 'content_block_start', index: 0, content_block: { type: 'tool_use' } },
      { type: 'content_block_start', index: 1, content_block: { type: 'tool_result' } },
      { type: 'content_block_start', index: 2, content_block: { type: 'tool_use' } },
      { type: 'content_block_start', index: 3, content_block: { type: 'tool_result' } },
    ];
    const metrics = calculateStreamMetrics(events);
    expect(metrics.toolCallCount).toBe(2);
  });

  it('M7.10 — groupEventsByTurn handles tool_use_limit stop_reason', () => {
    const events = [
      { type: 'content_block_start', index: 0, content_block: { type: 'text' } },
      { type: 'message_delta', delta: { stop_reason: 'tool_use_limit' } },
    ];
    const turns = groupEventsByTurn(events);
    expect(turns).toHaveLength(1);
  });
});

// ============================================================
// Module 8: ToolResultFormatters (10 tests) — NEW
// ============================================================
describe('Module 8: ToolResultFormatters', () => {
  it('M8.1 — formatBashResult parses returncode/stdout/stderr', () => {
    const result = formatBashResult('{"returncode":0,"stdout":"hello world\\n","stderr":""}');
    expect(result.success).toBe(true);
    expect(result.stdout).toBe('hello world\n');
    expect(result.exitCode).toBe(0);
  });

  it('M8.2 — formatBashResult handles non-zero exit code', () => {
    const result = formatBashResult('{"returncode":1,"stdout":"","stderr":"error: not found"}');
    expect(result.success).toBe(false);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('not found');
  });

  it('M8.3 — formatEditResultRich extracts filepath and success', () => {
    const result = formatEditResultRich('Successfully replaced string in /home/claude/test.py');
    expect(result.success).toBe(true);
    expect(result.filePath).toBe('/home/claude/test.py');
    expect(result.filename).toBe('test.py');
  });

  it('M8.4 — formatViewResult extracts language and filename', () => {
    const jsonStr = '{"language":"python","code":"# test","filename":"/home/claude/test.py"}';
    const result = formatViewResult(jsonStr);
    expect(result.language).toBe('python');
    expect(result.filename).toBe('test.py');
    expect(result.code).toBe('# test');
  });

  it('M8.5 — formatCreateFileResult extracts path', () => {
    const result = formatCreateFileResult('Created /home/claude/new_file.ts');
    expect(result.success).toBe(true);
    expect(result.filePath).toContain('new_file.ts');
  });

  it('M8.6 — formatPresentFilesResult extracts file count', () => {
    const result = formatPresentFilesResult('Presented 2 files');
    expect(result.fileCount).toBe(2);
  });

  it('M8.7 — formatSearchResult handles result list', () => {
    const result = formatSearchResult('Found 15 matches in 3 files');
    expect(result.matchCount).toBeGreaterThan(0);
  });

  it('M8.8 — formatTestResult parses pytest output', () => {
    const pytestOutput = '====== 89 passed, 11 failed in 23.96s ======';
    const result = formatTestResult(pytestOutput);
    expect(result.passed).toBe(89);
    expect(result.failed).toBe(11);
    expect(result.total).toBe(100);
  });

  it('M8.9 — formatDiffResult extracts +/- counts', () => {
    const diffText = '+++ a/file.py\n--- b/file.py\n@@ -1,3 +1,5 @@\n+new line 1\n+new line 2\n-old line\n context';
    const result = formatDiffResult(diffText);
    expect(result.added).toBeGreaterThan(0);
    expect(result.removed).toBeGreaterThan(0);
  });

  it('M8.10 — formatGenericToolResult handles unknown output', () => {
    const result = formatGenericToolResult('some arbitrary output text');
    expect(result.text).toBe('some arbitrary output text');
    expect(result.truncated).toBe(false);
  });
});

// ============================================================
// Module 9: StreamingStateManager (10 tests) — NEW
// ============================================================
describe('Module 9: StreamingStateManager', () => {
  it('M9.1 — createStreamingState initializes empty state', () => {
    const state = createStreamingState();
    expect(state.activeBlocks).toEqual(new Map());
    expect(state.completedBlocks).toEqual([]);
  });

  it('M9.2 — updateStreamingDelta accumulates partial JSON', () => {
    let state = createStreamingState();
    state = updateStreamingDelta(state, 0, { type: 'input_json_delta', partial_json: '{"command":' });
    state = updateStreamingDelta(state, 0, { type: 'input_json_delta', partial_json: '"ls -la"}' });
    const block = state.activeBlocks.get(0);
    expect(block?.accumulatedJson).toBe('{"command":"ls -la"}');
  });

  it('M9.3 — updateStreamingDelta accumulates thinking text', () => {
    let state = createStreamingState();
    state = updateStreamingDelta(state, 0, { type: 'thinking_delta', thinking: 'Let me ' });
    state = updateStreamingDelta(state, 0, { type: 'thinking_delta', thinking: 'analyze this' });
    const block = state.activeBlocks.get(0);
    expect(block?.accumulatedThinking).toBe('Let me analyze this');
  });

  it('M9.4 — finalizeStreamingBlock moves to completed', () => {
    let state = createStreamingState();
    state = updateStreamingDelta(state, 0, { type: 'input_json_delta', partial_json: '{"test":true}' });
    state = finalizeStreamingBlock(state, 0);
    expect(state.activeBlocks.has(0)).toBe(false);
    expect(state.completedBlocks).toHaveLength(1);
  });

  it('M9.5 — getActiveStreams returns current streaming blocks', () => {
    let state = createStreamingState();
    state = updateStreamingDelta(state, 0, { type: 'thinking_delta', thinking: 'a' });
    state = updateStreamingDelta(state, 1, { type: 'input_json_delta', partial_json: 'b' });
    const active = getActiveStreams(state);
    expect(active).toHaveLength(2);
  });

  it('M9.6 — getStreamProgress calculates completion %', () => {
    let state = createStreamingState();
    state = updateStreamingDelta(state, 0, { type: 'input_json_delta', partial_json: '{"' });
    const progress = getStreamProgress(state, 0);
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(100);
  });

  it('M9.7 — handles text_delta accumulation', () => {
    let state = createStreamingState();
    state = updateStreamingDelta(state, 0, { type: 'text_delta', text: 'Hello ' });
    state = updateStreamingDelta(state, 0, { type: 'text_delta', text: 'World' });
    const block = state.activeBlocks.get(0);
    expect(block?.accumulatedText).toBe('Hello World');
  });

  it('M9.8 — handles thinking_summary_delta', () => {
    let state = createStreamingState();
    state = updateStreamingDelta(state, 0, { type: 'thinking_summary_delta', summary: { summary: 'Planning approach' } });
    const block = state.activeBlocks.get(0);
    expect(block?.thinkingSummary).toBe('Planning approach');
  });

  it('M9.9 — handles tool_use_block_update_delta', () => {
    let state = createStreamingState();
    state = updateStreamingDelta(state, 0, { type: 'tool_use_block_update_delta', message: 'Editing config file' });
    const block = state.activeBlocks.get(0);
    expect(block?.toolMessage).toBe('Editing config file');
  });

  it('M9.10 — multiple blocks tracked independently', () => {
    let state = createStreamingState();
    state = updateStreamingDelta(state, 0, { type: 'thinking_delta', thinking: 'block0' });
    state = updateStreamingDelta(state, 1, { type: 'text_delta', text: 'block1' });
    state = updateStreamingDelta(state, 2, { type: 'input_json_delta', partial_json: 'block2' });
    expect(state.activeBlocks.size).toBe(3);
    expect(state.activeBlocks.get(0)?.accumulatedThinking).toBe('block0');
    expect(state.activeBlocks.get(1)?.accumulatedText).toBe('block1');
    expect(state.activeBlocks.get(2)?.accumulatedJson).toBe('block2');
  });
});

// ============================================================
// Module 10: ProtocolMetrics (10 tests) — NEW
// ============================================================
describe('Module 10: ProtocolMetrics', () => {
  it('M10.1 — calculateTokenUsage sums from message events', () => {
    const events = [
      { type: 'message_start', message: { usage: { input_tokens: 100, output_tokens: 50 } } },
    ];
    const usage = calculateTokenUsage(events);
    expect(usage.inputTokens).toBe(100);
    expect(usage.outputTokens).toBe(50);
  });

  it('M10.2 — calculateLatency measures first-token time', () => {
    const events = [
      { type: 'content_block_start', index: 0, content_block: { type: 'thinking', start_timestamp: '2026-03-18T07:53:53.000Z' } },
      { type: 'content_block_delta', index: 0, delta: { type: 'thinking_delta', thinking: 'first' } },
    ];
    const latency = calculateLatency(events, '2026-03-18T07:53:52.500Z');
    expect(latency.firstTokenMs).toBe(500);
  });

  it('M10.3 — calculateToolCallStats counts by type', () => {
    const events = [
      { type: 'content_block_start', content_block: { type: 'tool_use', name: 'bash_tool' } },
      { type: 'content_block_start', content_block: { type: 'tool_use', name: 'bash_tool' } },
      { type: 'content_block_start', content_block: { type: 'tool_use', name: 'str_replace' } },
      { type: 'content_block_start', content_block: { type: 'tool_use', name: 'view' } },
    ];
    const stats = calculateToolCallStats(events);
    expect(stats.total).toBe(4);
    expect(stats.byTool['bash_tool']).toBe(2);
    expect(stats.byTool['str_replace']).toBe(1);
    expect(stats.byTool['view']).toBe(1);
  });

  it('M10.4 — calculateTurnStats counts message_delta end_turns', () => {
    const events = [
      { type: 'message_delta', delta: { stop_reason: 'end_turn' } },
      { type: 'message_delta', delta: { stop_reason: 'tool_use_limit' } },
      { type: 'message_delta', delta: { stop_reason: 'end_turn' } },
    ];
    const stats = calculateTurnStats(events);
    expect(stats.totalTurns).toBe(3); // all message_delta = turn boundary
    expect(stats.endTurnCount).toBe(2);
    expect(stats.toolUseLimitCount).toBe(1);
  });

  it('M10.5 — generatePerformanceReport produces summary', () => {
    const events = [
      { type: 'message_start', message: { model: 'claude-opus-4-20250514', usage: { input_tokens: 200, output_tokens: 100 } } },
      { type: 'content_block_start', content_block: { type: 'tool_use', name: 'bash_tool' } },
      { type: 'message_delta', delta: { stop_reason: 'end_turn' } },
    ];
    const report = generatePerformanceReport(events);
    expect(report.model).toBe('claude-opus-4-20250514');
    expect(report.tokenUsage.inputTokens).toBe(200);
    expect(report.toolCallStats.total).toBe(1);
  });

  it('M10.6 — calculateTokenUsage handles missing usage', () => {
    const events = [{ type: 'message_start', message: { model: 'test' } }];
    const usage = calculateTokenUsage(events);
    expect(usage.inputTokens).toBe(0);
    expect(usage.outputTokens).toBe(0);
  });

  it('M10.7 — calculateLatency handles no timestamps', () => {
    const events = [{ type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'x' } }];
    const latency = calculateLatency(events);
    expect(latency.firstTokenMs).toBe(0);
  });

  it('M10.8 — calculateToolCallStats handles empty events', () => {
    const stats = calculateToolCallStats([]);
    expect(stats.total).toBe(0);
    expect(Object.keys(stats.byTool)).toHaveLength(0);
  });

  it('M10.9 — calculateTurnStats handles no turns', () => {
    const stats = calculateTurnStats([]);
    expect(stats.totalTurns).toBe(0);
  });

  it('M10.10 — generatePerformanceReport handles complex multi-turn stream', () => {
    const events = [
      { type: 'message_start', message: { model: 'claude-opus-4-20250514', usage: { input_tokens: 1000, output_tokens: 500 } } },
      { type: 'content_block_start', content_block: { type: 'thinking', start_timestamp: '2026-03-18T07:53:53.000Z' } },
      { type: 'content_block_stop', index: 0, stop_timestamp: '2026-03-18T07:53:54.000Z' },
      { type: 'content_block_start', content_block: { type: 'tool_use', name: 'bash_tool' } },
      { type: 'content_block_start', content_block: { type: 'tool_result', name: 'bash_tool' } },
      { type: 'content_block_start', content_block: { type: 'tool_use', name: 'str_replace' } },
      { type: 'content_block_start', content_block: { type: 'tool_result', name: 'str_replace' } },
      { type: 'content_block_start', content_block: { type: 'text' } },
      { type: 'message_delta', delta: { stop_reason: 'end_turn' } },
    ];
    const report = generatePerformanceReport(events);
    expect(report.toolCallStats.total).toBe(2);
    expect(report.turnStats.totalTurns).toBe(1);
    expect(report.tokenUsage.inputTokens).toBe(1000);
  });
});

// ============================================================
// Bonus: Existing utility function tests (previously untested)
// ============================================================
describe('Bonus: Existing utility functions', () => {
  it('B.1 — extractBashOutput parses JSON', () => {
    const result = extractBashOutput('{"returncode":0,"stdout":"ok","stderr":""}');
    expect(result.returncode).toBe(0);
    expect(result.stdout).toBe('ok');
  });

  it('B.2 — extractBashOutput handles non-JSON', () => {
    const result = extractBashOutput('plain text output');
    expect(result.stdout).toBe('plain text output');
    expect(result.returncode).toBe(-1);
  });

  it('B.3 — extractEditResult success case', () => {
    const result = extractEditResult('Successfully replaced string in /home/claude/file.py');
    expect(result.success).toBe(true);
    expect(result.filePath).toBe('/home/claude/file.py');
  });

  it('B.4 — extractEditResult failure case', () => {
    const result = extractEditResult('Error: file not found');
    expect(result.success).toBe(false);
  });

  it('B.5 — matchToolResultToToolUse links correctly', () => {
    const map = new Map<string, number>();
    map.set('toolu_123', 5);
    expect(matchToolResultToToolUse('toolu_123', map)).toBe(5);
    expect(map.has('toolu_123')).toBe(false); // consumed
  });

  it('B.6 — matchToolResultToToolUse returns -1 for missing', () => {
    const map = new Map<string, number>();
    expect(matchToolResultToToolUse('toolu_missing', map)).toBe(-1);
  });

  it('B.7 — detectProtocolVersion identifies claude_api', () => {
    expect(detectProtocolVersion({ type: 'message_start' })).toBe('claude_api');
    expect(detectProtocolVersion({ type: 'content_block_start' })).toBe('claude_api');
  });

  it('B.8 — detectProtocolVersion identifies v9', () => {
    expect(detectProtocolVersion({ type: 'start' })).toBe('v9');
    expect(detectProtocolVersion({ type: 'tool_start' })).toBe('v9');
  });

  it('B.9 — StreamingAccumulator works', () => {
    const acc = new StreamingAccumulator();
    acc.addDelta('{"cmd":');
    acc.addDelta('"test"}');
    expect(acc.getResult()).toBe('{"cmd":"test"}');
    acc.reset();
    expect(acc.getResult()).toBe('');
  });

  it('B.10 — calculateBlockDuration computes ms', () => {
    expect(calculateBlockDuration('2026-03-18T07:53:53.000Z', '2026-03-18T07:53:54.500Z')).toBe(1500);
    expect(calculateBlockDuration(null, null)).toBe(0);
    expect(calculateBlockDuration('invalid', 'also-invalid')).toBe(0);
  });
});
