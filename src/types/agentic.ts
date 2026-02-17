// src/types/agentic.ts
// Agentic Loop 前端类型定义

/** SSE 事件类型 */
export type AgenticEventType =
  | 'start'
  | 'text'
  | 'tool_start'
  | 'tool_result'
  | 'turn'
  | 'done'
  | 'error';

/** 基础事件 */
export interface AgenticBaseEvent {
  type: AgenticEventType;
  turn?: number;
}

/** 任务开始 */
export interface AgenticStartEvent extends AgenticBaseEvent {
  type: 'start';
  task: string;
  model: string;
  work_dir: string;
  max_turns: number;
  timestamp: string;
}

/** AI 文本输出 */
export interface AgenticTextEvent extends AgenticBaseEvent {
  type: 'text';
  content: string;
}

/** 工具开始执行 */
export interface AgenticToolStartEvent extends AgenticBaseEvent {
  type: 'tool_start';
  tool: string;
  args: Record<string, any>;
  tool_use_id: string;
}

/** 工具执行结果 */
export interface AgenticToolResultEvent extends AgenticBaseEvent {
  type: 'tool_result';
  tool: string;
  tool_use_id: string;
  result: string;
  success: boolean;
}

/** Turn 汇总 */
export interface AgenticTurnEvent extends AgenticBaseEvent {
  type: 'turn';
  tool_calls_this_turn: number;
  total_tool_calls: number;
  summary: {
    commands_run: number;
    files_viewed: number;
    files_edited: number;
    files_created: number;
    searches: number;
    pages_fetched: number;
    display: string;
  };
  display: string;
}

/** 任务完成 */
export interface AgenticDoneEvent extends AgenticBaseEvent {
  type: 'done';
  turns: number;
  total_tool_calls: number;
  duration: number;
  stop_reason: string;
  work_dir: string;
}

/** 错误 */
export interface AgenticErrorEvent extends AgenticBaseEvent {
  type: 'error';
  message: string;
  turns?: number;
  total_tool_calls?: number;
  duration?: number;
}

/** 所有事件联合类型 */
export type AgenticEvent =
  | AgenticStartEvent
  | AgenticTextEvent
  | AgenticToolStartEvent
  | AgenticToolResultEvent
  | AgenticTurnEvent
  | AgenticDoneEvent
  | AgenticErrorEvent;

/** 工具名称 → 图标/标签映射 */
export const TOOL_DISPLAY: Record<string, { label: string; icon: string }> = {
  bash:        { label: 'Command',     icon: '⚡' },
  read_file:   { label: 'Read file',   icon: '📄' },
  write_file:  { label: 'Create file', icon: '✏️' },
  edit_file:   { label: 'Edit file',   icon: '🔧' },
  list_dir:    { label: 'List dir',    icon: '📁' },
  grep_search: { label: 'Search code', icon: '🔍' },
  web_search:  { label: 'Web search',  icon: '🌐' },
  web_fetch:   { label: 'Fetch page',  icon: '📥' },
};

/** 任务请求体 */
export interface AgenticTaskRequest {
  task: string;
  model?: string;
  project_id?: string;
  max_turns?: number;
  system_prompt?: string;
  work_dir?: string;
}

/** 前端渲染用的消息块 */
export interface AgenticBlock {
  id: string;
  type: 'text' | 'tool' | 'turn_summary' | 'error';
  turn: number;
  // text 块
  content?: string;
  // tool 块
  tool?: string;
  toolArgs?: Record<string, any>;
  toolResult?: string;
  toolSuccess?: boolean;
  toolDiff?: string;  // "file.py +3 -4"
  // turn_summary 块
  display?: string;
  summary?: AgenticTurnEvent['summary'];
}
