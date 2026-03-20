// src/hooks/useAgenticLoop.ts
// Agentic Loop SSE Hook — v15 (Claude API SSE Protocol + v9 backwards compat)
// v15 新增:
//   - tool_result content block 完整处理 (display_content, is_error, streamed content)
//   - tool_use_id linking (tool_result → tool_use block)
//   - 流式 tool_result 内容累积 (input_json_delta)
// v14 保留:
//   - Claude API event format 解析 (message_start/content_block_start/delta/stop)
//   - 流式工具参数 (input_json_delta → streamingJson)
//   - thinking summary (thinking_summary_delta → thinkingSummary)
//   - 双协议兼容: 自动检测 Claude API 格式 或 v9 自定义格式

import { useState, useCallback, useRef } from 'react';
import {
  AgenticEvent, AgenticBlock, AgenticTaskRequest, ToolResultMeta,
  StreamingToolState,
} from '@/types/agentic';
import {
  parseToolResultContent,
  parseStreamedToolResultJson,
  matchToolResultToToolUse,
  extractBashOutput,
  ToolResultInfo,
} from '@/utils/claudeProtocolParser';

export type AgenticStatus = 'idle' | 'running' | 'done' | 'error';

interface AgenticLoopState {
  blocks: AgenticBlock[];
  status: AgenticStatus;
  error: string | null;
  turns: number;
  totalToolCalls: number;
  duration: number;
  model: string;
  workDir: string;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  contextTokensEst: number;
  elapsed: number;
  // v14: streaming tools in progress
  streamingTools: Map<number, StreamingToolState>;
  messageId: string;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://baloonet.tech:17432';

export function useAgenticLoop() {
  const [state, setState] = useState<AgenticLoopState>({
    blocks: [], status: 'idle', error: null,
    turns: 0, totalToolCalls: 0, duration: 0, model: '', workDir: '',
    totalInputTokens: 0, totalOutputTokens: 0, totalCost: 0, contextTokensEst: 0,
    elapsed: 0, streamingTools: new Map(), messageId: '',
  });

  const abortRef = useRef<AbortController | null>(null);
  const pendingToolsRef = useRef<Map<string, number>>(new Map());
  // v14: track content block index → block array index
  const contentBlockMapRef = useRef<Map<number, number>>(new Map());
  // v15: track tool_result JSON accumulation (content block index → accumulated JSON)
  const toolResultJsonMapRef = useRef<Map<number, string>>(new Map());
  // v15: track tool_result info (content block index → ToolResultInfo)
  const toolResultInfoRef = useRef<Map<number, ToolResultInfo>>(new Map());
  const blockIdCounter = useRef(0);
  const nextId = () => `ab_${++blockIdCounter.current}`;

  const reset = useCallback(() => {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    pendingToolsRef.current.clear();
    contentBlockMapRef.current.clear();
    toolResultJsonMapRef.current.clear();
    toolResultInfoRef.current.clear();
    blockIdCounter.current = 0;
    setState({
      blocks: [], status: 'idle', error: null,
      turns: 0, totalToolCalls: 0, duration: 0, model: '', workDir: '',
      totalInputTokens: 0, totalOutputTokens: 0, totalCost: 0, contextTokensEst: 0,
      elapsed: 0, streamingTools: new Map(), messageId: '',
    });
  }, []);

  // =================================================================
  // v14: Handle Claude API SSE events (message_start, content_block_*)
  // =================================================================
  const handleClaudeEvent = useCallback((data: any) => {
    setState((prev) => {
      const blocks = [...prev.blocks];

      switch (data.type) {
        case 'message_start': {
          const msg = data.message || {};
          return {
            ...prev,
            status: 'running' as AgenticStatus,
            model: msg.model || prev.model,
            messageId: msg.id || '',
          };
        }

        case 'content_block_start': {
          const cb = data.content_block || {};
          const idx = data.index;

          if (cb.type === 'thinking') {
            const blockIdx = blocks.length;
            blocks.push({ id: nextId(), type: 'thinking', turn: prev.turns, content: '' });
            contentBlockMapRef.current.set(idx, blockIdx);
          } else if (cb.type === 'text') {
            const blockIdx = blocks.length;
            blocks.push({ id: nextId(), type: 'text', turn: prev.turns, content: '' });
            contentBlockMapRef.current.set(idx, blockIdx);
          } else if (cb.type === 'tool_use') {
            const blockIdx = blocks.length;
            blocks.push({
              id: nextId(), type: 'tool', turn: prev.turns,
              tool: cb.name || '', toolArgs: {},
              toolResult: undefined, toolSuccess: undefined,
              toolDescription: cb.message || '',
              streamingJson: '', streamingMessage: cb.message || '',
              isStreaming: true,
            });
            contentBlockMapRef.current.set(idx, blockIdx);
            if (cb.id) pendingToolsRef.current.set(cb.id, blockIdx);
          } else if (cb.type === 'tool_result') {
            // v15: tool_result is a separate content block — parse and track it
            const info = parseToolResultContent(cb);
            toolResultInfoRef.current.set(idx, info);
            toolResultJsonMapRef.current.set(idx, '');
            // Use -1 as marker: tool_result doesn't create its own block
            contentBlockMapRef.current.set(idx, -1);
          }
          return { ...prev, blocks };
        }

        case 'content_block_delta': {
          const idx = data.index;
          const delta = data.delta || {};

          // v15: Check if this is a tool_result delta — accumulate separately
          if (toolResultInfoRef.current.has(idx) && delta.type === 'input_json_delta') {
            const prev_json = toolResultJsonMapRef.current.get(idx) || '';
            toolResultJsonMapRef.current.set(idx, prev_json + (delta.partial_json || ''));
            return prev;
          }

          const blockIdx = contentBlockMapRef.current.get(idx);
          if (blockIdx === undefined || blockIdx < 0 || !blocks[blockIdx]) return prev;

          const block = { ...blocks[blockIdx] };

          if (delta.type === 'thinking_delta') {
            block.content = (block.content || '') + (delta.thinking || '');
          } else if (delta.type === 'text_delta') {
            block.content = (block.content || '') + (delta.text || '');
          } else if (delta.type === 'input_json_delta') {
            block.streamingJson = (block.streamingJson || '') + (delta.partial_json || '');
            block.isStreaming = true;
            // Try to parse partial JSON for live display
            try {
              const partial = JSON.parse(block.streamingJson + '}');
              if (partial.command) block.toolDescription = partial.command;
              else if (partial.path) block.toolDescription = partial.path;
              else if (partial.description) block.toolDescription = partial.description;
            } catch { /* partial JSON, expected */ }
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

          blocks[blockIdx] = block;
          return { ...prev, blocks };
        }

        case 'content_block_stop': {
          const idx = data.index;

          // v15: Finalize tool_result — link back to tool_use block
          const trInfo = toolResultInfoRef.current.get(idx);
          if (trInfo) {
            const accumulatedJson = toolResultJsonMapRef.current.get(idx) || '';
            const items = parseStreamedToolResultJson(accumulatedJson);
            let resultText = '';
            if (items && items.length > 0) {
              resultText = items.map(item => item.text || '').join('\n');
            } else if (trInfo.displayText) {
              resultText = trInfo.displayText;
            }

            // Determine success: is_error from protocol, or parse bash returncode
            let success = !trInfo.isError;
            if (success && (trInfo.toolName === 'bash_tool' || trInfo.toolName === 'bash') && resultText) {
              try {
                const bash = extractBashOutput(resultText);
                if (typeof bash.returncode === 'number' && bash.returncode !== 0) {
                  success = false;
                }
              } catch { /* not bash JSON, keep success=true */ }
            }

            // Link to the original tool_use block
            const toolBlockIdx = matchToolResultToToolUse(trInfo.toolUseId, pendingToolsRef.current);
            if (toolBlockIdx >= 0 && blocks[toolBlockIdx]) {
              blocks[toolBlockIdx] = {
                ...blocks[toolBlockIdx],
                toolResult: resultText,
                toolSuccess: success,
                isStreaming: false,
                toolDurationMs: data.stop_timestamp && blocks[toolBlockIdx].toolDescription
                  ? undefined : undefined, // duration calculated elsewhere if needed
              };
            }

            // Cleanup
            toolResultInfoRef.current.delete(idx);
            toolResultJsonMapRef.current.delete(idx);
            return { ...prev, blocks };
          }

          // Normal block stop (thinking, text, tool_use)
          const blockIdx = contentBlockMapRef.current.get(idx);
          if (blockIdx !== undefined && blockIdx >= 0 && blocks[blockIdx]) {
            const block = { ...blocks[blockIdx] };
            block.isStreaming = false;
            // Parse final JSON for tool_use blocks
            if (block.type === 'tool' && block.streamingJson) {
              try {
                block.toolArgs = JSON.parse(block.streamingJson);
              } catch { /* keep partial */ }
            }
            blocks[blockIdx] = block;
          }
          return { ...prev, blocks };
        }

        case 'message_delta': {
          // stop_reason received
          const stopReason = data.delta?.stop_reason;
          if (stopReason === 'end_turn' || stopReason === 'stop_sequence') {
            return { ...prev, turns: prev.turns + 1 };
          }
          return prev;
        }

        case 'message_stop': {
          // Full message complete — don't set 'done' yet, more messages may follow
          return prev;
        }

        default:
          return prev;
      }
    });
  }, []);

  // =================================================================
  // v9 backwards-compatible event handler (unchanged from v10)
  // =================================================================
  const handleV9Event = useCallback((event: AgenticEvent) => {
    setState((prev) => {
      const blocks = [...prev.blocks];

      switch (event.type) {
        case 'start':
          return { ...prev, status: 'running' as AgenticStatus, model: event.model, workDir: event.work_dir };

        case 'text': {
          const last = blocks[blocks.length - 1];
          if (last && last.type === 'text' && last.turn === (event.turn ?? 0)) {
            last.content = (last.content || '') + event.content;
          } else {
            blocks.push({ id: nextId(), type: 'text', turn: event.turn ?? 0, content: event.content });
          }
          return { ...prev, blocks };
        }

        case 'thinking': {
          const last = blocks[blocks.length - 1];
          if (last && last.type === 'thinking' && last.turn === (event.turn ?? 0)) {
            last.content = (last.content || '') + event.content;
          } else {
            blocks.push({ id: nextId(), type: 'thinking', turn: event.turn ?? 0, content: event.content });
          }
          return { ...prev, blocks };
        }

        case 'tool_start': {
          const idx = blocks.length;
          blocks.push({
            id: nextId(), type: 'tool', turn: event.turn ?? 0,
            tool: event.tool, toolArgs: event.args,
            toolResult: undefined, toolSuccess: undefined,
            toolDescription: event.description,
          });
          pendingToolsRef.current.set(event.tool_use_id, idx);
          return { ...prev, blocks };
        }

        case 'tool_result': {
          const idx = pendingToolsRef.current.get(event.tool_use_id);
          if (idx !== undefined && blocks[idx]) {
            blocks[idx] = {
              ...blocks[idx],
              toolResult: event.result,
              toolSuccess: event.success,
              toolResultMeta: event.result_meta,
              toolDiff: extractDiff(event.tool, event.result, event.result_meta),
              toolDurationMs: event.duration_ms,
              isStreaming: false,
            };
            pendingToolsRef.current.delete(event.tool_use_id);
          }
          return { ...prev, blocks };
        }

        case 'file_change': {
          blocks.push({
            id: nextId(), type: 'file_change', turn: event.turn ?? 0,
            fileAction: event.action, filePath: event.path, fileName: event.filename,
            linesAdded: event.added, linesRemoved: event.removed,
          });
          return { ...prev, blocks };
        }

        case 'turn': {
          blocks.push({
            id: nextId(), type: 'turn_summary', turn: event.turn ?? 0,
            display: event.display, summary: event.summary,
            detailItems: event.detail_items,
          });
          return {
            ...prev, blocks,
            turns: event.turn ?? prev.turns,
            totalToolCalls: event.total_tool_calls,
          };
        }

        case 'progress': {
          return {
            ...prev,
            turns: event.turn ?? prev.turns,
            totalToolCalls: event.total_tool_calls ?? prev.totalToolCalls,
            elapsed: event.elapsed ?? prev.elapsed,
          };
        }

        case 'usage': {
          return {
            ...prev,
            totalInputTokens: event.total_input_tokens,
            totalOutputTokens: event.total_output_tokens,
            totalCost: event.total_cost,
            contextTokensEst: event.context_tokens_est,
          };
        }

        case 'todo_update': {
          blocks.push({ id: nextId(), type: 'todo_update', turn: event.turn ?? 0, todoStatus: event.todo_status });
          return { ...prev, blocks };
        }

        case 'subagent_start': {
          blocks.push({
            id: nextId(), type: 'subagent', turn: event.turn ?? 0,
            subagentType: event.subagent_type, content: event.prompt,
            toolDescription: `SubAgent (${event.subagent_type})`,
          });
          return { ...prev, blocks };
        }

        case 'subagent_result': {
          for (let i = blocks.length - 1; i >= 0; i--) {
            if (blocks[i].type === 'subagent' && !blocks[i].toolResult) {
              blocks[i] = { ...blocks[i], toolResult: event.result, toolResultMeta: event.result_meta, toolSuccess: event.result_meta?.success };
              break;
            }
          }
          return { ...prev, blocks };
        }

        case 'debug_start': {
          blocks.push({ id: nextId(), type: 'debug_start', turn: event.turn ?? 0, debugCommand: event.command, debugAttempt: event.attempt, debugMaxRetries: event.max_retries });
          return { ...prev, blocks };
        }

        case 'debug_result': {
          blocks.push({ id: nextId(), type: 'debug_result', turn: event.turn ?? 0, debugPassed: event.passed, debugAttempt: event.attempt, debugExitCode: event.exit_code, debugDiagnosis: event.diagnosis });
          return { ...prev, blocks };
        }

        case 'test_result': {
          blocks.push({ id: nextId(), type: 'test_result', turn: event.turn ?? 0, testPassed: event.passed, testTotal: event.total_tests, testPassedCount: event.passed_tests, testFailedCount: event.failed_tests, testDurationS: event.duration_s, debugCommand: event.command });
          return { ...prev, blocks };
        }

        case 'revert': {
          blocks.push({ id: nextId(), type: 'revert', turn: event.turn ?? 0, revertPath: event.path, revertEditId: event.edit_id, revertDescription: event.description });
          return { ...prev, blocks };
        }

        case 'diff_summary': {
          blocks.push({ id: nextId(), type: 'diff_summary', turn: event.turn ?? 0, diffFilesChanged: event.files_changed, diffTotalAdded: event.total_added, diffTotalRemoved: event.total_removed, diffFileDetails: event.file_details });
          return { ...prev, blocks };
        }

        case 'approval_wait': {
          blocks.push({ id: nextId(), type: 'approval_wait', turn: event.turn ?? 0, approvalCommand: event.command, approvalRiskLevel: event.risk_level });
          return { ...prev, blocks };
        }

        case 'chunk_schedule': {
          blocks.push({ id: nextId(), type: 'chunk_schedule', turn: event.turn ?? 0, chunkTotalCalls: event.total_calls, chunkCount: event.chunks, chunkParallelCalls: event.parallel_calls });
          return { ...prev, blocks };
        }

        case 'context_compact': {
          blocks.push({ id: nextId(), type: 'context_compact', turn: event.turn ?? 0, compactBeforeTokens: event.before_tokens, compactAfterTokens: event.after_tokens, compactBeforeMessages: event.before_messages, compactAfterMessages: event.after_messages });
          return { ...prev, blocks };
        }

        case 'heartbeat': {
          return { ...prev, elapsed: event.elapsed ?? prev.elapsed };
        }

        case 'done':
          return {
            ...prev, status: 'done' as AgenticStatus,
            turns: event.turns, totalToolCalls: event.total_tool_calls, duration: event.duration,
            totalInputTokens: event.total_input_tokens ?? prev.totalInputTokens,
            totalOutputTokens: event.total_output_tokens ?? prev.totalOutputTokens,
            totalCost: event.total_cost ?? prev.totalCost,
          };

        case 'error':
          blocks.push({ id: nextId(), type: 'error', turn: event.turn ?? 0, content: event.message });
          return {
            ...prev, blocks, status: 'error' as AgenticStatus, error: event.message,
            turns: event.turns ?? prev.turns,
            totalToolCalls: event.total_tool_calls ?? prev.totalToolCalls,
            duration: event.duration ?? prev.duration,
            totalInputTokens: event.total_input_tokens ?? prev.totalInputTokens,
            totalOutputTokens: event.total_output_tokens ?? prev.totalOutputTokens,
            totalCost: event.total_cost ?? prev.totalCost,
          };

        default:
          return prev;
      }
    });
  }, []);

  // =================================================================
  // Unified event dispatcher — auto-detect protocol
  // =================================================================
  const handleEvent = useCallback((data: any) => {
    const t = data.type;
    // Claude API protocol events
    if (t === 'message_start' || t === 'content_block_start' || t === 'content_block_delta'
        || t === 'content_block_stop' || t === 'message_delta' || t === 'message_stop') {
      handleClaudeEvent(data);
    } else {
      // v9 custom protocol events
      handleV9Event(data as AgenticEvent);
    }
  }, [handleClaudeEvent, handleV9Event]);

  const runTask = useCallback(async (request: AgenticTaskRequest) => {
    reset();
    setState((prev) => ({ ...prev, status: 'running' as AgenticStatus }));

    const token = localStorage.getItem('chatbot_token');
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const resp = await fetch(`${BASE_URL}/api/v2/agent/agentic-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          task: request.task,
          model: request.model || 'claude-opus-4-6',
          project_id: request.project_id,
          max_turns: request.max_turns || 30,
          system_prompt: request.system_prompt,
          work_dir: request.work_dir,
        }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${errText}`);
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        buffer = buffer.replace(/\r\n/g, '\n');
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          if (!part.trim()) continue;
          // v14: Support both "event: xxx\ndata: {...}" and plain "data: {...}" formats
          let eventType = '';
          let dataStr = '';
          for (const line of part.split('\n')) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              dataStr += line.slice(6);
            } else if (line.startsWith('data:')) {
              dataStr += line.slice(5);
            }
          }
          if (dataStr) {
            try {
              const parsed = JSON.parse(dataStr);
              handleEvent(parsed);
            } catch (e) {
              console.warn('[AgenticLoop v14] Parse error:', dataStr, e);
            }
          }
        }
      }

      setState((prev) => prev.status === 'running' ? { ...prev, status: 'done' as AgenticStatus } : prev);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setState((prev) => ({ ...prev, status: prev.status === 'running' ? 'done' as AgenticStatus : prev.status }));
        return;
      }
      console.error('[AgenticLoop v14] Error:', err);
      setState((prev) => ({ ...prev, status: 'error' as AgenticStatus, error: err.message || 'Unknown error' }));
    }
  }, [reset, handleEvent]);

  const stop = useCallback(() => {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    setState((prev) => ({ ...prev, status: prev.status === 'running' ? 'done' as AgenticStatus : prev.status }));
  }, []);

  return { ...state, runTask, stop, reset };
}

function extractDiff(tool: string, result: string, meta?: ToolResultMeta): string | undefined {
  if (!['edit_file', 'multi_edit', 'revert_edit', 'revert_to_checkpoint', 'str_replace'].includes(tool)) return undefined;
  if (meta?.unified_diff) return meta.unified_diff;
  if (meta?.diff) return meta.diff;
  if (meta?.diff_display) return meta.diff_display;
  try { const d = JSON.parse(result); return d.unified_diff || d.diff || d.diff_display; } catch { return undefined; }
}
