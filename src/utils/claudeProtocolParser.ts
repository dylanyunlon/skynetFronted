/**
 * Claude API SSE Protocol Parser — v15
 * 
 * Utility functions for parsing the Claude API streaming event protocol.
 * Reverse-engineered from real Claude API event streams (eventStream1-4.txt).
 * 
 * Protocol structure:
 *   event: content_block_start
 *   data: {"type":"content_block_start","index":N,"content_block":{...}}
 * 
 * Content block types: thinking, text, tool_use, tool_result
 * Delta types: thinking_delta, text_delta, input_json_delta,
 *              tool_use_block_update_delta, thinking_summary_delta
 */

import { AgenticBlock, TurnSummary } from '@/types/agentic';

// ============================================================
// Types
// ============================================================
export interface ParsedSSELine {
  eventType: string;
  data: any;
}

export interface ToolResultInfo {
  toolName: string;
  toolUseId: string;
  isError: boolean;
  displayText: string;
  iconName?: string;
}

export interface BashOutput {
  returncode: number;
  stdout: string;
  stderr: string;
}

export interface EditResult {
  success: boolean;
  filePath: string;
}

export interface ToolResultContentItem {
  type: string;
  text: string;
  uuid?: string;
}

// ============================================================
// parseClaudeSSELine — parse "event: xxx\ndata: {...}" format
// ============================================================
export function parseClaudeSSELine(raw: string): ParsedSSELine | null {
  if (!raw || !raw.trim()) return null;

  const cleaned = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!cleaned || cleaned.startsWith(':')) return null;

  let eventType = '';
  let dataStr = '';

  for (const line of cleaned.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('event: ')) {
      eventType = trimmed.slice(7).trim();
    } else if (trimmed.startsWith('data: ')) {
      dataStr += trimmed.slice(6);
    } else if (trimmed.startsWith('data:')) {
      dataStr += trimmed.slice(5);
    }
  }

  if (!dataStr) return null;

  try {
    const data = JSON.parse(dataStr);
    return {
      eventType: eventType || data.type || '',
      data,
    };
  } catch {
    return null;
  }
}

// ============================================================
// parseToolResultContent — parse tool_result content_block_start
// ============================================================
export function parseToolResultContent(cb: any): ToolResultInfo {
  return {
    toolName: cb?.name || '',
    toolUseId: cb?.tool_use_id || '',
    isError: cb?.is_error === true,
    displayText: extractToolResultDisplayText(cb?.display_content),
    iconName: cb?.icon_name,
  };
}

// ============================================================
// extractToolResultDisplayText — extract text from display_content
// ============================================================
export function extractToolResultDisplayText(dc: any): string {
  if (dc === null || dc === undefined) return '';
  if (typeof dc === 'string') return dc;
  if (typeof dc === 'object' && dc.text !== undefined) return dc.text || '';
  return '';
}

// ============================================================
// parseStreamedToolResultJson — parse accumulated input_json_delta
// ============================================================
export function parseStreamedToolResultJson(jsonStr: string): ToolResultContentItem[] | null {
  if (!jsonStr || !jsonStr.trim()) return null;
  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) return parsed;
    return [parsed];
  } catch {
    return null;
  }
}

// ============================================================
// extractBashOutput — parse nested bash_tool JSON
// ============================================================
export function extractBashOutput(text: string): BashOutput {
  try {
    const parsed = JSON.parse(text);
    return {
      returncode: typeof parsed.returncode === 'number' ? parsed.returncode : -1,
      stdout: parsed.stdout || '',
      stderr: parsed.stderr || '',
    };
  } catch {
    return { returncode: -1, stdout: text, stderr: '' };
  }
}

// ============================================================
// extractEditResult — parse str_replace/edit result
// ============================================================
export function extractEditResult(displayText: string): EditResult {
  if (!displayText) return { success: false, filePath: '' };

  const success = displayText.startsWith('Successfully');

  // Extract path — match anything after "in " or "exists: "
  const pathMatch = displayText.match(/(?:in |exists: )(\S+)/);
  const filePath = pathMatch ? pathMatch[1] : '';

  return { success, filePath };
}

// ============================================================
// matchToolResultToToolUse — link tool_result → tool_use by ID
// ============================================================
export function matchToolResultToToolUse(
  toolUseId: string,
  pendingMap: Map<string, number>
): number {
  const idx = pendingMap.get(toolUseId);
  if (idx === undefined) return -1;
  pendingMap.delete(toolUseId);
  return idx;
}

// ============================================================
// buildAgenticBlockFromToolResult — create block update data
// ============================================================
export function buildAgenticBlockFromToolResult(
  info: ToolResultInfo,
  resultContent?: ToolResultContentItem[]
): Partial<AgenticBlock> {
  let resultText = '';
  if (resultContent && resultContent.length > 0) {
    resultText = resultContent.map(item => item.text || '').join('\n');
  } else if (info.displayText) {
    resultText = info.displayText;
  }

  return {
    toolResult: resultText,
    toolSuccess: !info.isError,
    isStreaming: false,
  };
}

// ============================================================
// detectProtocolVersion — auto-detect Claude API vs v9
// ============================================================
const CLAUDE_API_EVENTS = new Set([
  'message_start', 'content_block_start', 'content_block_delta',
  'content_block_stop', 'message_delta', 'message_stop', 'message_limit',
]);

const V9_EVENTS = new Set([
  'start', 'text', 'thinking', 'tool_start', 'tool_result',
  'file_change', 'turn', 'progress', 'usage', 'done', 'error',
  'todo_update', 'subagent_start', 'subagent_result',
  'debug_start', 'debug_result', 'test_result', 'revert',
  'diff_summary', 'approval_wait', 'chunk_schedule',
  'context_compact', 'heartbeat', 'approval_needed',
]);

export function detectProtocolVersion(data: any): 'claude_api' | 'v9' | 'unknown' {
  const t = data?.type;
  if (!t) return 'unknown';
  if (CLAUDE_API_EVENTS.has(t)) return 'claude_api';
  if (V9_EVENTS.has(t)) return 'v9';
  return 'unknown';
}

// ============================================================
// parseToolUseArgs — parse accumulated input_json_delta into args
// ============================================================
export function parseToolUseArgs(jsonStr: string): Record<string, any> {
  if (!jsonStr || !jsonStr.trim()) return {};
  try {
    return JSON.parse(jsonStr);
  } catch {
    return {};
  }
}

// ============================================================
// buildTurnSummaryFromBlocks — generate Claude Code style summary
// ============================================================
const COMMAND_TOOLS = new Set(['bash', 'bash_tool', 'run_script', 'batch_commands', 'debug_test', 'execute_code']);
const VIEW_TOOLS = new Set(['read_file', 'batch_read', 'view', 'view_truncated', 'list_dir', 'glob']);
const EDIT_TOOLS = new Set(['edit_file', 'multi_edit', 'str_replace']);
const CREATE_TOOLS = new Set(['write_file', 'create_file']);
const SEARCH_TOOLS = new Set(['grep_search', 'file_search']);
const WEB_SEARCH_TOOLS = new Set(['web_search']);
const FETCH_TOOLS = new Set(['web_fetch']);
const PRESENT_TOOLS = new Set(['present_files']);

export function buildTurnSummaryFromBlocks(blocks: AgenticBlock[]): TurnSummary {
  let commands_run = 0;
  let files_viewed = 0;
  let files_edited = 0;
  let files_created = 0;
  let searches_code = 0;
  let searches_web = 0;
  let pages_fetched = 0;
  let files_presented = 0;

  for (const block of blocks) {
    if (block.type !== 'tool') continue;
    const tool = block.tool || '';
    if (COMMAND_TOOLS.has(tool)) commands_run++;
    else if (VIEW_TOOLS.has(tool)) files_viewed++;
    else if (EDIT_TOOLS.has(tool)) files_edited++;
    else if (CREATE_TOOLS.has(tool)) files_created++;
    else if (SEARCH_TOOLS.has(tool)) searches_code++;
    else if (WEB_SEARCH_TOOLS.has(tool)) searches_web++;
    else if (FETCH_TOOLS.has(tool)) pages_fetched++;
    else if (PRESENT_TOOLS.has(tool)) files_presented++;
  }

  // Build Claude Code-style display string
  const parts: string[] = [];
  if (commands_run > 0) {
    parts.push(commands_run === 1 ? 'Ran a command' : `Ran ${commands_run} commands`);
  }
  if (files_viewed > 0) {
    parts.push(files_viewed === 1 ? 'viewed a file' : `viewed ${files_viewed} files`);
  }
  if (files_edited > 0) {
    parts.push(files_edited === 1 ? 'edited a file' : `edited ${files_edited} files`);
  }
  if (files_created > 0) {
    parts.push(files_created === 1 ? 'created a file' : `created ${files_created} files`);
  }
  if (searches_code > 0) {
    parts.push(searches_code === 1 ? 'searched code' : `searched code ${searches_code} times`);
  }
  if (searches_web > 0) {
    parts.push(searches_web === 1 ? 'searched the web' : `searched the web ${searches_web} times`);
  }
  if (pages_fetched > 0) {
    parts.push(pages_fetched === 1 ? 'fetched a page' : `fetched ${pages_fetched} pages`);
  }
  if (files_presented > 0) {
    parts.push(files_presented === 1 ? 'presented a file' : `presented ${files_presented} files`);
  }

  const display = parts.join(', ');
  const tool_count = commands_run + files_viewed + files_edited + files_created
    + searches_code + searches_web + pages_fetched + files_presented;

  return {
    commands_run,
    files_viewed,
    files_edited,
    files_created,
    searches_code,
    searches_web,
    pages_fetched,
    task_completed: false,
    display,
    detail_items: [],
    tool_count,
  };
}

// ============================================================
// extractToolCallSignature — Claude Code style: Bash(cmd), Edit(file)
// ============================================================
const TOOL_DISPLAY_NAME: Record<string, string> = {
  bash_tool: 'Bash', bash: 'Bash', run_script: 'Bash', batch_commands: 'Bash', debug_test: 'Bash',
  str_replace: 'Edit', edit_file: 'Edit', multi_edit: 'MultiEdit',
  view: 'Read', read_file: 'Read', batch_read: 'Read', view_truncated: 'Read',
  create_file: 'Write', write_file: 'Write',
  present_files: 'Files', list_dir: 'LS', glob: 'Glob',
  grep_search: 'Search', file_search: 'Search',
  web_search: 'WebSearch', web_fetch: 'Fetch',
  revert_edit: 'Revert', revert_to_checkpoint: 'Revert',
  todo_write: 'TodoWrite', todo_read: 'TodoRead',
  task: 'Task', memory_read: 'Memory', memory_write: 'Memory',
  task_complete: 'Complete', execute_code: 'Execute', install_package: 'Install',
};

export function extractToolCallSignature(toolName: string, args: Record<string, any>): string {
  const displayName = TOOL_DISPLAY_NAME[toolName] || toolName;

  if (!args || Object.keys(args).length === 0) {
    return `${displayName}(…)`;
  }

  switch (toolName) {
    case 'bash_tool': case 'bash': case 'run_script': case 'debug_test': {
      const cmd = args.command || args.script || '…';
      const truncated = cmd.length > 80 ? cmd.slice(0, 77) + '…' : cmd;
      return `${displayName}(${truncated})`;
    }
    case 'str_replace': case 'edit_file': case 'multi_edit':
    case 'view': case 'read_file': case 'create_file': case 'write_file': {
      const path = args.path || args.file_path || '…';
      const filename = path.split('/').pop() || path;
      return `${displayName}(${filename})`;
    }
    case 'present_files': {
      const fps = args.filepaths || [];
      return `${displayName}(${fps.length} file${fps.length !== 1 ? 's' : ''})`;
    }
    case 'grep_search': case 'file_search': {
      const pattern = args.pattern || args.query || '…';
      return `${displayName}(${pattern})`;
    }
    case 'web_search': {
      return `${displayName}("${args.query || '…'}")`;
    }
    case 'web_fetch': {
      try { return `${displayName}(${new URL(args.url).hostname})`; }
      catch { return `${displayName}(${(args.url || '…').slice(0, 40)})`; }
    }
    case 'batch_read': {
      const files = args.files || args.paths || [];
      return `${displayName}(${files.length} files)`;
    }
    default: {
      const firstArg = args.command || args.path || args.query || '…';
      const s = String(firstArg);
      return `${displayName}(${s.length > 60 ? s.slice(0, 57) + '…' : s})`;
    }
  }
}

// ============================================================
// getIconForToolResult — map Claude API icon_name → lucide icon
// ============================================================
const ICON_NAME_MAP: Record<string, string> = {
  commandLine: 'Terminal',
  edit: 'Pencil',
  file: 'FileText',
  search: 'Search',
  globe: 'Globe',
  download: 'Download',
  code: 'Code',
  folder: 'Folder',
  play: 'Play',
  check: 'CheckCircle',
  error: 'XCircle',
  warning: 'AlertTriangle',
  info: 'Info',
};

export function getIconForToolResult(iconName?: string): string {
  if (!iconName) return 'Zap';
  return ICON_NAME_MAP[iconName] || 'Zap';
}

// ============================================================
// calculateBlockDuration — from ISO timestamps to ms
// ============================================================
export function calculateBlockDuration(startTs: string | null, stopTs: string | null): number {
  if (!startTs || !stopTs) return 0;
  try {
    return new Date(stopTs).getTime() - new Date(startTs).getTime();
  } catch { return 0; }
}

// ============================================================
// StreamingAccumulator — accumulate partial_json from deltas
// ============================================================
export class StreamingAccumulator {
  private buffer: string = '';
  addDelta(partial: string): void { this.buffer += partial; }
  getResult(): string { return this.buffer; }
  reset(): void { this.buffer = ''; }
}

// ============================================================
// processMessageEvents — full message flow processor
// ============================================================
export function processMessageEvents(events: any[]): { blocks: AgenticBlock[]; model: string; turns: number } {
  const blocks: AgenticBlock[] = [];
  const contentBlockMap = new Map<number, number>();
  const pendingTools = new Map<string, number>();
  const toolResultAccumulators = new Map<number, StreamingAccumulator>();
  const toolResultInfoMap = new Map<number, ToolResultInfo>();
  let blockIdCounter = 0;
  let model = '';
  let turns = 0;
  const nextId = () => `ab_${++blockIdCounter}`;

  for (const event of events) {
    switch (event.type) {
      case 'message_start': {
        model = event.message?.model || model;
        break;
      }
      case 'content_block_start': {
        const cb = event.content_block || {};
        const idx = event.index;
        if (cb.type === 'thinking') {
          contentBlockMap.set(idx, blocks.length);
          blocks.push({ id: nextId(), type: 'thinking', turn: turns, content: '' });
        } else if (cb.type === 'text') {
          contentBlockMap.set(idx, blocks.length);
          blocks.push({ id: nextId(), type: 'text', turn: turns, content: '' });
        } else if (cb.type === 'tool_use') {
          const blockIdx = blocks.length;
          contentBlockMap.set(idx, blockIdx);
          blocks.push({
            id: nextId(), type: 'tool', turn: turns,
            tool: cb.name || '', toolArgs: {},
            toolDescription: cb.message || '',
            streamingJson: '', streamingMessage: cb.message || '',
            isStreaming: true,
          });
          if (cb.id) pendingTools.set(cb.id, blockIdx);
        } else if (cb.type === 'tool_result') {
          const info = parseToolResultContent(cb);
          toolResultInfoMap.set(idx, info);
          toolResultAccumulators.set(idx, new StreamingAccumulator());
          contentBlockMap.set(idx, -1);
        }
        break;
      }
      case 'content_block_delta': {
        const idx = event.index;
        const delta = event.delta || {};
        // tool_result accumulation
        const acc = toolResultAccumulators.get(idx);
        if (acc && delta.type === 'input_json_delta') {
          acc.addDelta(delta.partial_json || '');
          break;
        }
        // normal block delta
        const blockIdx = contentBlockMap.get(idx);
        if (blockIdx === undefined || blockIdx < 0 || !blocks[blockIdx]) break;
        const block = blocks[blockIdx];
        if (delta.type === 'thinking_delta') block.content = (block.content || '') + (delta.thinking || '');
        else if (delta.type === 'text_delta') block.content = (block.content || '') + (delta.text || '');
        else if (delta.type === 'input_json_delta') {
          block.streamingJson = (block.streamingJson || '') + (delta.partial_json || '');
          block.isStreaming = true;
        } else if (delta.type === 'tool_use_block_update_delta') {
          block.streamingMessage = delta.message || block.streamingMessage;
          block.toolDescription = delta.message || block.toolDescription;
        } else if (delta.type === 'thinking_summary_delta') {
          const s = delta.summary;
          block.thinkingSummary = (s && typeof s === 'object') ? s.summary : (typeof s === 'string' ? s : block.thinkingSummary);
        }
        break;
      }
      case 'content_block_stop': {
        const idx = event.index;
        // tool_result finalization
        const acc = toolResultAccumulators.get(idx);
        const info = toolResultInfoMap.get(idx);
        if (acc && info) {
          const items = parseStreamedToolResultJson(acc.getResult());
          const resultText = items
            ? items.map(i => i.text || '').join('\n')
            : info.displayText;
          let success = !info.isError;
          if (success && info.toolName === 'bash_tool' && resultText) {
            try {
              const bash = JSON.parse(resultText);
              if (typeof bash.returncode === 'number' && bash.returncode !== 0) success = false;
            } catch { /* not bash JSON */ }
          }
          const toolBlockIdx = matchToolResultToToolUse(info.toolUseId, pendingTools);
          if (toolBlockIdx >= 0 && blocks[toolBlockIdx]) {
            blocks[toolBlockIdx] = {
              ...blocks[toolBlockIdx],
              toolResult: resultText,
              toolSuccess: success,
              isStreaming: false,
            };
          }
          toolResultAccumulators.delete(idx);
          toolResultInfoMap.delete(idx);
          break;
        }
        // normal block stop
        const blockIdx = contentBlockMap.get(idx);
        if (blockIdx !== undefined && blockIdx >= 0 && blocks[blockIdx]) {
          blocks[blockIdx].isStreaming = false;
          if (blocks[blockIdx].type === 'tool' && blocks[blockIdx].streamingJson) {
            blocks[blockIdx].toolArgs = parseToolUseArgs(blocks[blockIdx].streamingJson || '');
          }
        }
        break;
      }
      case 'message_delta': {
        if (event.delta?.stop_reason === 'end_turn' || event.delta?.stop_reason === 'stop_sequence') turns++;
        break;
      }
    }
  }
  return { blocks, model, turns };
}
