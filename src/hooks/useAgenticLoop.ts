// src/hooks/useAgenticLoop.ts
// Agentic Loop SSE Hook — v4 (supports usage, thinking, cost tracking)

import { useState, useCallback, useRef } from 'react';
import { AgenticEvent, AgenticBlock, AgenticTaskRequest, ToolResultMeta } from '@/types/agentic';

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
  // v4: token usage & cost
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  contextTokensEst: number;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://baloonet.tech:17432';

export function useAgenticLoop() {
  const [state, setState] = useState<AgenticLoopState>({
    blocks: [], status: 'idle', error: null,
    turns: 0, totalToolCalls: 0, duration: 0, model: '', workDir: '',
    totalInputTokens: 0, totalOutputTokens: 0, totalCost: 0, contextTokensEst: 0,
  });

  const abortRef = useRef<AbortController | null>(null);
  const pendingToolsRef = useRef<Map<string, number>>(new Map());
  const blockIdCounter = useRef(0);
  const nextId = () => `ab_${++blockIdCounter.current}`;

  const reset = useCallback(() => {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    pendingToolsRef.current.clear();
    blockIdCounter.current = 0;
    setState({
      blocks: [], status: 'idle', error: null,
      turns: 0, totalToolCalls: 0, duration: 0, model: '', workDir: '',
      totalInputTokens: 0, totalOutputTokens: 0, totalCost: 0, contextTokensEst: 0,
    });
  }, []);

  const handleEvent = useCallback((event: AgenticEvent) => {
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

        // v4: 思考块
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
          };
        }

        // v4: Token 用量事件
        case 'usage': {
          // 可选: 也作为 block 渲染 (小型 token 计数器)
          // blocks.push({ id: nextId(), type: 'usage', turn: event.turn ?? 0, ... });
          return {
            ...prev,
            totalInputTokens: event.total_input_tokens,
            totalOutputTokens: event.total_output_tokens,
            totalCost: event.total_cost,
            contextTokensEst: event.context_tokens_est,
          };
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
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          if (!part.trim()) continue;
          let dataStr = '';
          for (const line of part.split('\n')) {
            if (line.startsWith('data: ')) {
              dataStr = line.slice(6);
            }
          }
          if (dataStr) {
            try {
              const event: AgenticEvent = JSON.parse(dataStr);
              handleEvent(event);
            } catch (e) {
              console.warn('[AgenticLoop v4] Parse error:', dataStr, e);
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
      console.error('[AgenticLoop v4] Error:', err);
      setState((prev) => ({ ...prev, status: 'error' as AgenticStatus, error: err.message || 'Unknown error' }));
    }
  }, [reset, handleEvent]);

  const stop = useCallback(() => {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    setState((prev) => ({ ...prev, status: prev.status === 'running' ? 'done' as AgenticStatus : prev.status }));
  }, []);

  return { ...state, runTask, stop, reset };
}

/** 从 tool_result 提取 diff 信息 */
function extractDiff(tool: string, result: string, meta?: ToolResultMeta): string | undefined {
  if (tool !== 'edit_file' && tool !== 'multi_edit') return undefined;
  if (meta?.diff) return meta.diff;
  try { return JSON.parse(result).diff; } catch { return undefined; }
}