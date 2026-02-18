// src/types/agentic.ts
// Agentic Loop 前端类型定义 — v3 (Claude Code 全功能版)

export type AgenticEventType =
  | 'start' | 'text' | 'tool_start' | 'tool_result'
  | 'file_change' | 'turn' | 'progress' | 'done' | 'error';

export interface AgenticBaseEvent { type: AgenticEventType; turn?: number; }

export interface AgenticStartEvent extends AgenticBaseEvent {
  type: 'start'; task: string; model: string; work_dir: string; max_turns: number; timestamp: string;
}
export interface AgenticTextEvent extends AgenticBaseEvent {
  type: 'text'; content: string;
}
export interface AgenticToolStartEvent extends AgenticBaseEvent {
  type: 'tool_start'; tool: string; args: Record<string, any>; tool_use_id: string; description: string;
}
export interface AgenticToolResultEvent extends AgenticBaseEvent {
  type: 'tool_result'; tool: string; tool_use_id: string; result: string;
  result_meta: ToolResultMeta; success: boolean;
}
export interface AgenticFileChangeEvent extends AgenticBaseEvent {
  type: 'file_change'; action: string; path: string; filename: string; added: number; removed: number;
}
export interface AgenticTurnEvent extends AgenticBaseEvent {
  type: 'turn'; tool_calls_this_turn: number; total_tool_calls: number;
  summary: TurnSummary; display: string; detail_items: DetailItem[];
}
export interface AgenticProgressEvent extends AgenticBaseEvent {
  type: 'progress'; max_turns: number; total_tool_calls: number; elapsed: number;
}
export interface AgenticDoneEvent extends AgenticBaseEvent {
  type: 'done'; turns: number; total_tool_calls: number; duration: number;
  stop_reason: string; work_dir: string;
  file_changes?: Array<{ action: string; path: string; filename: string; added?: number; removed?: number; lines?: number; }>;
}
export interface AgenticErrorEvent extends AgenticBaseEvent {
  type: 'error'; message: string; turns?: number; total_tool_calls?: number; duration?: number;
}

export type AgenticEvent =
  | AgenticStartEvent | AgenticTextEvent | AgenticToolStartEvent | AgenticToolResultEvent
  | AgenticFileChangeEvent | AgenticTurnEvent | AgenticProgressEvent
  | AgenticDoneEvent | AgenticErrorEvent;

export interface ToolResultMeta {
  truncated?: boolean; filename?: string; total_lines?: number;
  truncated_range?: string; hint?: string;
  files_read?: number; files_errored?: number;
  diff?: string; added_lines?: number; removed_lines?: number;
  lines?: number; action?: string;
  results_count?: number; query?: string;
  result_titles?: Array<{ title: string; url: string; domain: string; }>;
  title?: string; url?: string; content_length?: number;
  matches?: number; pattern?: string;
  exit_code?: number;
  completed?: boolean; summary?: string;
}

export interface TurnSummary {
  commands_run: number; files_viewed: number; files_edited: number; files_created: number;
  searches_code: number; searches_web: number; pages_fetched: number; task_completed: boolean;
  display: string; detail_items: DetailItem[]; tool_count: number;
}

export interface DetailItem { tool: string; title: string; icon: string; }

export const TOOL_DISPLAY: Record<string, { label: string; icon: string }> = {
  bash:          { label: 'Command',     icon: '⚡' },
  read_file:     { label: 'Read file',   icon: '📄' },
  batch_read:    { label: 'Read files',  icon: '📑' },
  write_file:    { label: 'Create file', icon: '✏️' },
  edit_file:     { label: 'Edit file',   icon: '🔧' },
  multi_edit:    { label: 'Multi edit',  icon: '🔧' },
  list_dir:      { label: 'List dir',    icon: '📁' },
  grep_search:   { label: 'Search code', icon: '🔍' },
  file_search:   { label: 'Find files',  icon: '🔎' },
  web_search:    { label: 'Web search',  icon: '🌐' },
  web_fetch:     { label: 'Fetch page',  icon: '📥' },
  task_complete:  { label: 'Complete',   icon: '✅' },
};

export interface AgenticTaskRequest {
  task: string; model?: string; project_id?: string;
  max_turns?: number; system_prompt?: string; work_dir?: string;
}

export interface AgenticBlock {
  id: string;
  type: 'text' | 'tool' | 'turn_summary' | 'file_change' | 'progress' | 'error';
  turn: number;
  content?: string;
  tool?: string; toolArgs?: Record<string, any>; toolResult?: string;
  toolResultMeta?: ToolResultMeta; toolSuccess?: boolean;
  toolDiff?: string; toolDescription?: string;
  display?: string; summary?: TurnSummary; detailItems?: DetailItem[];
  fileAction?: string; filePath?: string; fileName?: string;
  linesAdded?: number; linesRemoved?: number;
  maxTurns?: number; elapsed?: number;
}