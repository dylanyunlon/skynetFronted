// src/types/agentic.ts
// Agentic Loop v6 前端类型定义 — Claude Code 全功能对标

export type AgenticEventType =
  | 'start' | 'text' | 'thinking' | 'tool_start' | 'tool_result'
  | 'file_change' | 'turn' | 'progress' | 'usage' | 'done' | 'error'
  | 'todo_update' | 'subagent_start' | 'subagent_result';

export interface AgenticBaseEvent { type: AgenticEventType; turn?: number; }
export interface AgenticStartEvent extends AgenticBaseEvent { type: 'start'; task: string; model: string; work_dir: string; max_turns: number; timestamp: string; version?: string; }
export interface AgenticTextEvent extends AgenticBaseEvent { type: 'text'; content: string; }
export interface AgenticThinkingEvent extends AgenticBaseEvent { type: 'thinking'; content: string; }
export interface AgenticToolStartEvent extends AgenticBaseEvent { type: 'tool_start'; tool: string; args: Record<string, any>; tool_use_id: string; description: string; }
export interface AgenticToolResultEvent extends AgenticBaseEvent { type: 'tool_result'; tool: string; tool_use_id: string; result: string; result_meta: ToolResultMeta; success: boolean; }
export interface AgenticFileChangeEvent extends AgenticBaseEvent { type: 'file_change'; action: string; path: string; filename: string; added: number; removed: number; }
export interface AgenticTurnEvent extends AgenticBaseEvent { type: 'turn'; tool_calls_this_turn: number; total_tool_calls: number; summary: TurnSummary; display: string; detail_items: DetailItem[]; }
export interface AgenticProgressEvent extends AgenticBaseEvent { type: 'progress'; max_turns: number; total_tool_calls: number; elapsed: number; context_compacted?: boolean; }
export interface AgenticUsageEvent extends AgenticBaseEvent { type: 'usage'; input_tokens: number; output_tokens: number; total_input_tokens: number; total_output_tokens: number; turn_cost: number; total_cost: number; context_tokens_est: number; }
export interface AgenticDoneEvent extends AgenticBaseEvent { type: 'done'; turns: number; total_tool_calls: number; duration: number; stop_reason: string; work_dir: string; file_changes?: Array<{ action: string; path: string; filename: string; added?: number; removed?: number; }>; total_input_tokens?: number; total_output_tokens?: number; total_cost?: number; todo_status?: TodoStatus; }
export interface AgenticErrorEvent extends AgenticBaseEvent { type: 'error'; message: string; turns?: number; total_tool_calls?: number; duration?: number; total_input_tokens?: number; total_output_tokens?: number; total_cost?: number; }
export interface AgenticTodoUpdateEvent extends AgenticBaseEvent { type: 'todo_update'; todo_status: TodoStatus; }
export interface AgenticSubagentStartEvent extends AgenticBaseEvent { type: 'subagent_start'; tool_use_id: string; subagent_type: 'explore' | 'plan' | 'general'; prompt: string; }
export interface AgenticSubagentResultEvent extends AgenticBaseEvent { type: 'subagent_result'; tool_use_id: string; result: string; result_meta: ToolResultMeta; subagent_type: string; }

export type AgenticEvent =
  | AgenticStartEvent | AgenticTextEvent | AgenticThinkingEvent
  | AgenticToolStartEvent | AgenticToolResultEvent
  | AgenticFileChangeEvent | AgenticTurnEvent | AgenticProgressEvent
  | AgenticUsageEvent | AgenticDoneEvent | AgenticErrorEvent
  | AgenticTodoUpdateEvent | AgenticSubagentStartEvent | AgenticSubagentResultEvent;

export interface TodoItem { id: string; content: string; status: 'pending' | 'in_progress' | 'completed'; priority?: 'high' | 'medium' | 'low'; }
export interface TodoStatus { total: number; completed: number; in_progress: number; pending: number; todos: TodoItem[]; progress_display: string; }

export interface ToolResultMeta {
  truncated?: boolean; filename?: string; total_lines?: number;
  truncated_range?: string; hint?: string;
  files_read?: number; files_errored?: number;
  diff?: string; unified_diff?: string;
  added_lines?: number; removed_lines?: number;
  lines?: number; action?: string;
  results_count?: number; query?: string;
  result_titles?: Array<{ title: string; url: string; domain: string; }>;
  title?: string; url?: string; content_length?: number;
  matches?: number; pattern?: string;
  exit_code?: number; risk_level?: string;
  completed?: boolean; summary?: string;
  total?: number; in_progress?: number; pending?: number;
  progress_display?: string; display_title?: string;
  success?: boolean; subagent_type?: string; turns?: number;
  total_commands?: number; executed?: number; succeeded?: number; failed?: number;
  results?: Array<{ description: string; success: boolean; }>;
  script_preview?: string; description?: string; display_type?: string;
  reverted?: boolean; size?: number; has_content?: boolean; mode?: string;
  todo_status?: TodoStatus;
}

export interface TurnSummary {
  commands_run: number; files_viewed: number; files_edited: number; files_created: number;
  searches_code: number; searches_web: number; pages_fetched: number; task_completed: boolean;
  display: string; detail_items: DetailItem[]; tool_count: number;
  reverts?: number; todos_updated?: number; subagents_launched?: number;
}

export interface DetailItem { tool: string; title: string; icon: string; }

export const TOOL_DISPLAY: Record<string, { label: string; icon: string }> = {
  bash: { label: 'Command', icon: '⚡' }, read_file: { label: 'Read file', icon: '📄' },
  batch_read: { label: 'Read files', icon: '📑' }, write_file: { label: 'Create file', icon: '✏️' },
  edit_file: { label: 'Edit file', icon: '🔧' }, multi_edit: { label: 'Multi edit', icon: '🔧' },
  list_dir: { label: 'List dir', icon: '📁' }, glob: { label: 'Glob files', icon: '🔎' },
  grep_search: { label: 'Search code', icon: '🔍' }, file_search: { label: 'Find files', icon: '🔎' },
  web_search: { label: 'Web search', icon: '🌐' }, web_fetch: { label: 'Fetch page', icon: '📥' },
  view_truncated: { label: 'View section', icon: '👁' }, batch_commands: { label: 'Batch run', icon: '⚡' },
  run_script: { label: 'Script', icon: '📜' }, revert_edit: { label: 'Revert', icon: '↩️' },
  todo_write: { label: 'Plan tasks', icon: '📋' }, todo_read: { label: 'Check tasks', icon: '✅' },
  task: { label: 'Sub-agent', icon: '🤖' }, memory_read: { label: 'Read memory', icon: '🧠' },
  memory_write: { label: 'Save memory', icon: '🧠' }, task_complete: { label: 'Complete', icon: '✅' },
};

export interface AgenticTaskRequest { task: string; model?: string; project_id?: string; max_turns?: number; system_prompt?: string; work_dir?: string; }

export interface AgenticBlock {
  id: string;
  type: 'text' | 'thinking' | 'tool' | 'turn_summary' | 'file_change' | 'progress' | 'usage' | 'error' | 'todo_update' | 'subagent';
  turn: number; content?: string;
  tool?: string; toolArgs?: Record<string, any>; toolResult?: string;
  toolResultMeta?: ToolResultMeta; toolSuccess?: boolean;
  toolDiff?: string; toolDescription?: string;
  display?: string; summary?: TurnSummary; detailItems?: DetailItem[];
  fileAction?: string; filePath?: string; fileName?: string;
  linesAdded?: number; linesRemoved?: number;
  maxTurns?: number; elapsed?: number;
  inputTokens?: number; outputTokens?: number;
  totalInputTokens?: number; totalOutputTokens?: number;
  turnCost?: number; totalCost?: number; contextTokensEst?: number;
  todoStatus?: TodoStatus; subagentType?: string;
}