// src/types/agentic.ts
// Agentic Loop v10 前端类型定义 — Claude Code 全功能深度对标
// 新增: debug_start/result, test_result, revert, diff_summary, approval_wait,
//       chunk_schedule, context_compact, heartbeat, approval_needed

export type AgenticEventType =
  | 'start' | 'text' | 'thinking' | 'tool_start' | 'tool_result'
  | 'file_change' | 'turn' | 'progress' | 'usage' | 'done' | 'error'
  | 'todo_update' | 'subagent_start' | 'subagent_result'
  | 'debug_start' | 'debug_result' | 'test_result' | 'revert'
  | 'diff_summary' | 'approval_wait' | 'chunk_schedule'
  | 'context_compact' | 'heartbeat' | 'approval_needed';

export interface AgenticBaseEvent { type: AgenticEventType; turn?: number; timestamp?: number; session_id?: string; }
export interface AgenticStartEvent extends AgenticBaseEvent { type: 'start'; task: string; model: string; work_dir: string; max_turns: number; version?: string; }
export interface AgenticTextEvent extends AgenticBaseEvent { type: 'text'; content: string; }
export interface AgenticThinkingEvent extends AgenticBaseEvent { type: 'thinking'; content: string; }
export interface AgenticToolStartEvent extends AgenticBaseEvent { type: 'tool_start'; tool: string; args: Record<string, any>; tool_use_id: string; description: string; }
export interface AgenticToolResultEvent extends AgenticBaseEvent { type: 'tool_result'; tool: string; tool_use_id: string; result: string; result_meta: ToolResultMeta; success: boolean; duration_ms?: number; }
export interface AgenticFileChangeEvent extends AgenticBaseEvent { type: 'file_change'; action: string; path: string; filename: string; added: number; removed: number; }
export interface AgenticTurnEvent extends AgenticBaseEvent { type: 'turn'; tool_calls_this_turn: number; total_tool_calls: number; summary: TurnSummary; display: string; detail_items: DetailItem[]; }
export interface AgenticProgressEvent extends AgenticBaseEvent { type: 'progress'; max_turns: number; total_tool_calls: number; elapsed: number; }
export interface AgenticUsageEvent extends AgenticBaseEvent { type: 'usage'; input_tokens: number; output_tokens: number; total_input_tokens: number; total_output_tokens: number; turn_cost: number; total_cost: number; context_tokens_est: number; }
export interface AgenticDoneEvent extends AgenticBaseEvent { type: 'done'; turns: number; total_tool_calls: number; duration: number; stop_reason: string; work_dir: string; file_changes?: Array<{ action: string; path: string; filename: string; added?: number; removed?: number }>; total_input_tokens?: number; total_output_tokens?: number; total_cost?: number; todo_status?: TodoStatus; diff_summary?: DiffSummaryData; }
export interface AgenticErrorEvent extends AgenticBaseEvent { type: 'error'; message: string; turns?: number; total_tool_calls?: number; duration?: number; total_input_tokens?: number; total_output_tokens?: number; total_cost?: number; }
export interface AgenticTodoUpdateEvent extends AgenticBaseEvent { type: 'todo_update'; todo_status: TodoStatus; }
export interface AgenticSubagentStartEvent extends AgenticBaseEvent { type: 'subagent_start'; tool_use_id: string; subagent_type: 'explore' | 'plan' | 'general'; prompt: string; }
export interface AgenticSubagentResultEvent extends AgenticBaseEvent { type: 'subagent_result'; tool_use_id: string; result: string; result_meta: ToolResultMeta; subagent_type: string; }
export interface AgenticDebugStartEvent extends AgenticBaseEvent { type: 'debug_start'; command: string; attempt: number; max_retries: number; }
export interface AgenticDebugResultEvent extends AgenticBaseEvent { type: 'debug_result'; passed: boolean; attempt: number; exit_code: number; diagnosis?: { error_type: string; error_summary: string; likely_files: string[] }; }
export interface AgenticTestResultEvent extends AgenticBaseEvent { type: 'test_result'; command: string; passed: boolean; exit_code: number; total_tests: number; passed_tests: number; failed_tests: number; duration_s: number; }
export interface AgenticRevertEvent extends AgenticBaseEvent { type: 'revert'; path: string; edit_id?: string; description?: string; }
export interface AgenticDiffSummaryEvent extends AgenticBaseEvent { type: 'diff_summary'; files_changed: number; total_added: number; total_removed: number; file_details: Array<{ path: string; added: number; removed: number }>; }
export interface AgenticApprovalWaitEvent extends AgenticBaseEvent { type: 'approval_wait'; command: string; risk_level: string; timeout_s?: number; }
export interface AgenticChunkScheduleEvent extends AgenticBaseEvent { type: 'chunk_schedule'; total_calls: number; chunks: number; parallel_calls: number; }
export interface AgenticContextCompactEvent extends AgenticBaseEvent { type: 'context_compact'; before_tokens: number; after_tokens: number; before_messages: number; after_messages: number; }
export interface AgenticHeartbeatEvent extends AgenticBaseEvent { type: 'heartbeat'; elapsed: number; }
export interface AgenticApprovalNeededEvent extends AgenticBaseEvent { type: 'approval_needed'; command: string; risk_level: string; }

export type AgenticEvent =
  | AgenticStartEvent | AgenticTextEvent | AgenticThinkingEvent
  | AgenticToolStartEvent | AgenticToolResultEvent
  | AgenticFileChangeEvent | AgenticTurnEvent | AgenticProgressEvent
  | AgenticUsageEvent | AgenticDoneEvent | AgenticErrorEvent
  | AgenticTodoUpdateEvent | AgenticSubagentStartEvent | AgenticSubagentResultEvent
  | AgenticDebugStartEvent | AgenticDebugResultEvent | AgenticTestResultEvent
  | AgenticRevertEvent | AgenticDiffSummaryEvent | AgenticApprovalWaitEvent
  | AgenticChunkScheduleEvent | AgenticContextCompactEvent
  | AgenticHeartbeatEvent | AgenticApprovalNeededEvent;

export interface TodoItem { id: string; content: string; status: 'pending' | 'in_progress' | 'completed'; priority?: 'high' | 'medium' | 'low'; }
export interface TodoStatus { total: number; completed: number; in_progress: number; pending: number; todos: TodoItem[]; progress_display: string; }
export interface DiffSummaryData { files_changed: number; total_added: number; total_removed: number; file_details: Array<{ path: string; added: number; removed: number }>; }

export interface ToolResultMeta {
  truncated?: boolean; filename?: string; total_lines?: number;
  truncated_range?: string; hint?: string;
  files_read?: number; files_errored?: number;
  diff?: string; unified_diff?: string;
  added_lines?: number; removed_lines?: number;
  lines?: number; action?: string;
  results_count?: number; query?: string;
  result_titles?: Array<{ title: string; url: string; domain: string }>;
  title?: string; url?: string; content_length?: number;
  matches?: number; pattern?: string;
  exit_code?: number; risk_level?: string;
  completed?: boolean; summary?: string;
  total?: number; in_progress?: number; pending?: number;
  progress_display?: string; display_title?: string;
  success?: boolean; subagent_type?: string; turns?: number;
  total_commands?: number; executed?: number; succeeded?: number; failed?: number;
  results?: Array<{ description: string; success: boolean }>;
  script_preview?: string; description?: string; display_type?: string;
  reverted?: boolean; size?: number; has_content?: boolean; mode?: string;
  todo_status?: TodoStatus;
  duration_ms?: number;
  passed?: boolean; total_tests?: number; passed_tests?: number; failed_tests?: number;
  duration_s?: number;
  diagnosis?: { error_type: string; error_summary: string; likely_files: string[] };
  path?: string; edit_id?: string; diff_display?: string;
}

export interface TurnSummary {
  commands_run: number; files_viewed: number; files_edited: number; files_created: number;
  searches_code: number; searches_web: number; pages_fetched: number; task_completed: boolean;
  display: string; detail_items: DetailItem[]; tool_count: number;
  reverts?: number; todos_updated?: number; subagents_launched?: number;
  tests_run?: number;
}

export interface DetailItem { tool: string; title: string; icon: string; }

export const TOOL_DISPLAY: Record<string, { label: string; icon: string; color: string }> = {
  bash:              { label: 'Command',       icon: '⚡', color: 'text-yellow-400' },
  read_file:         { label: 'Read file',     icon: '📄', color: 'text-blue-400' },
  batch_read:        { label: 'Read files',    icon: '📑', color: 'text-blue-400' },
  write_file:        { label: 'Create file',   icon: '✏️', color: 'text-green-400' },
  edit_file:         { label: 'Edit file',     icon: '🔧', color: 'text-orange-400' },
  multi_edit:        { label: 'Multi edit',    icon: '🔧', color: 'text-orange-400' },
  list_dir:          { label: 'List dir',      icon: '📁', color: 'text-gray-400' },
  glob:              { label: 'Glob files',    icon: '🔎', color: 'text-gray-400' },
  grep_search:       { label: 'Search code',   icon: '🔍', color: 'text-purple-400' },
  file_search:       { label: 'Find files',    icon: '🔎', color: 'text-purple-400' },
  web_search:        { label: 'Web search',    icon: '🌐', color: 'text-cyan-400' },
  web_fetch:         { label: 'Fetch page',    icon: '📥', color: 'text-cyan-400' },
  view_truncated:    { label: 'View section',  icon: '👁',  color: 'text-blue-300' },
  batch_commands:    { label: 'Batch run',     icon: '⚡', color: 'text-yellow-400' },
  run_script:        { label: 'Script',        icon: '📜', color: 'text-yellow-400' },
  revert_edit:       { label: 'Revert',        icon: '↩️', color: 'text-red-400' },
  todo_write:        { label: 'Plan tasks',    icon: '📋', color: 'text-indigo-400' },
  todo_read:         { label: 'Check tasks',   icon: '✅', color: 'text-indigo-400' },
  task:              { label: 'Sub-agent',     icon: '🤖', color: 'text-pink-400' },
  memory_read:       { label: 'Read memory',   icon: '🧠', color: 'text-violet-400' },
  memory_write:      { label: 'Save memory',   icon: '🧠', color: 'text-violet-400' },
  task_complete:     { label: 'Complete',      icon: '✅', color: 'text-green-500' },
  debug_test:        { label: 'Debug test',    icon: '🐛', color: 'text-red-400' },
  revert_to_checkpoint: { label: 'Revert',    icon: '↩️', color: 'text-red-400' },
};

export interface AgenticTaskRequest { task: string; model?: string; project_id?: string; max_turns?: number; system_prompt?: string; work_dir?: string; }

export type AgenticBlockType =
  | 'text' | 'thinking' | 'tool' | 'turn_summary' | 'file_change'
  | 'progress' | 'usage' | 'error' | 'todo_update' | 'subagent'
  | 'debug_start' | 'debug_result' | 'test_result' | 'revert'
  | 'diff_summary' | 'approval_wait' | 'chunk_schedule' | 'context_compact';

export interface AgenticBlock {
  id: string;
  type: AgenticBlockType;
  turn: number;
  content?: string;
  tool?: string; toolArgs?: Record<string, any>; toolResult?: string;
  toolResultMeta?: ToolResultMeta; toolSuccess?: boolean;
  toolDiff?: string; toolDescription?: string; toolDurationMs?: number;
  display?: string; summary?: TurnSummary; detailItems?: DetailItem[];
  fileAction?: string; filePath?: string; fileName?: string;
  linesAdded?: number; linesRemoved?: number;
  maxTurns?: number; elapsed?: number;
  inputTokens?: number; outputTokens?: number;
  totalInputTokens?: number; totalOutputTokens?: number;
  turnCost?: number; totalCost?: number; contextTokensEst?: number;
  todoStatus?: TodoStatus; subagentType?: string;
  debugCommand?: string; debugAttempt?: number; debugMaxRetries?: number;
  debugPassed?: boolean; debugExitCode?: number;
  debugDiagnosis?: { error_type: string; error_summary: string; likely_files: string[] };
  testPassed?: boolean; testTotal?: number; testPassedCount?: number;
  testFailedCount?: number; testDurationS?: number;
  diffFilesChanged?: number; diffTotalAdded?: number; diffTotalRemoved?: number;
  diffFileDetails?: Array<{ path: string; added: number; removed: number }>;
  approvalCommand?: string; approvalRiskLevel?: string;
  chunkTotalCalls?: number; chunkCount?: number; chunkParallelCalls?: number;
  compactBeforeTokens?: number; compactAfterTokens?: number;
  compactBeforeMessages?: number; compactAfterMessages?: number;
  revertPath?: string; revertEditId?: string; revertDescription?: string;
}