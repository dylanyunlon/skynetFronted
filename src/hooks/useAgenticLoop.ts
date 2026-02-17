// src/hooks/useAgenticLoop.ts
// Agentic Loop SSE 连接 Hook
//
// 用法:
//   const { blocks, status, runTask, stop } = useAgenticLoop();
//   await runTask({ task: "创建一个 Flask API" });

import { useState, useCallback, useRef } from 'react';
import {
  AgenticEvent,
  AgenticBlock,
  AgenticTaskRequest,
} from '@/types/agentic';

export type AgenticStatus = 'idle' | 'running' | 'done' | 'error';

interface AgenticLoopState {
  /** 渲染块列表（前端 UI 直接映射） */
  blocks: AgenticBlock[];
  /** 运行状态 */
  status: AgenticStatus;
  /** 错误信息 */
  error: string | null;
  /** 统计 */
  turns: number;
  totalToolCalls: number;
  duration: number;
  /** 当前 model */
  model: string;
  /** 工作目录 */
  workDir: string;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://baloonet.tech:17432';

export function useAgenticLoop() {
  const [state, setState] = useState<AgenticLoopState>({
    blocks: [],
    status: 'idle',
    error: null,
    turns: 0,
    totalToolCalls: 0,
    duration: 0,
    model: '',
    workDir: '',
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  // 用来关联 tool_start 和 tool_result
  const pendingToolsRef = useRef<Map<string, number>>(new Map());
  const blockIdCounter = useRef(0);

  const nextId = () => `ab_${++blockIdCounter.current}`;

  /** 重置状态 */
  const reset = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    pendingToolsRef.current.clear();
    blockIdCounter.current = 0;
    setState({
      blocks: [],
      status: 'idle',
      error: null,
      turns: 0,
      totalToolCalls: 0,
      duration: 0,
      model: '',
      workDir: '',
    });
  }, []);

  /** 处理单个 SSE 事件 */
  const handleEvent = useCallback((event: AgenticEvent) => {
    setState((prev) => {
      const blocks = [...prev.blocks];

      switch (event.type) {
        case 'start':
          return {
            ...prev,
            status: 'running',
            model: event.model,
            workDir: event.work_dir,
          };

        case 'text': {
          // 合并相邻 text 块（同一 turn）
          const last = blocks[blocks.length - 1];
          if (last && last.type === 'text' && last.turn === (event.turn ?? 0)) {
            last.content = (last.content || '') + event.content;
          } else {
            blocks.push({
              id: nextId(),
              type: 'text',
              turn: event.turn ?? 0,
              content: event.content,
            });
          }
          return { ...prev, blocks };
        }

        case 'tool_start': {
          const idx = blocks.length;
          blocks.push({
            id: nextId(),
            type: 'tool',
            turn: event.turn ?? 0,
            tool: event.tool,
            toolArgs: event.args,
            toolResult: undefined,
            toolSuccess: undefined,
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
              // 从 edit_file 结果中提取 diff
              toolDiff: extractDiff(event.tool, event.result),
            };
            pendingToolsRef.current.delete(event.tool_use_id);
          }
          return { ...prev, blocks };
        }

        case 'turn': {
          blocks.push({
            id: nextId(),
            type: 'turn_summary',
            turn: event.turn ?? 0,
            display: event.display,
            summary: event.summary,
          });
          return {
            ...prev,
            blocks,
            turns: event.turn ?? prev.turns,
            totalToolCalls: event.total_tool_calls,
          };
        }

        case 'done':
          return {
            ...prev,
            status: 'done',
            turns: event.turns,
            totalToolCalls: event.total_tool_calls,
            duration: event.duration,
          };

        case 'error':
          blocks.push({
            id: nextId(),
            type: 'error',
            turn: event.turn ?? 0,
            content: event.message,
          });
          return {
            ...prev,
            blocks,
            status: 'error',
            error: event.message,
            turns: event.turns ?? prev.turns,
            totalToolCalls: event.total_tool_calls ?? prev.totalToolCalls,
            duration: event.duration ?? prev.duration,
          };

        default:
          return prev;
      }
    });
  }, []);

  /** 启动 Agentic Loop（POST + SSE） */
  const runTask = useCallback(
    async (request: AgenticTaskRequest) => {
      // 先重置
      reset();
      setState((prev) => ({ ...prev, status: 'running' }));

      const token = localStorage.getItem('chatbot_token');

      try {
        // 用 fetch POST，然后读取 SSE 流
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
        });

        if (!resp.ok) {
          const errText = await resp.text();
          throw new Error(`HTTP ${resp.status}: ${errText}`);
        }

        // 读取 SSE 流
        const reader = resp.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // 解析 SSE 格式: "event: xxx\ndata: {...}\n\n"
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';

          for (const part of parts) {
            if (!part.trim()) continue;

            let eventType = 'message';
            let dataStr = '';

            for (const line of part.split('\n')) {
              if (line.startsWith('event: ')) {
                eventType = line.slice(7).trim();
              } else if (line.startsWith('data: ')) {
                dataStr = line.slice(6);
              }
            }

            if (dataStr) {
              try {
                const event: AgenticEvent = JSON.parse(dataStr);
                handleEvent(event);
              } catch (e) {
                console.warn('[AgenticLoop] Failed to parse event:', dataStr, e);
              }
            }
          }
        }

        // 流结束后，如果 status 还是 running，标记为 done
        setState((prev) =>
          prev.status === 'running' ? { ...prev, status: 'done' } : prev
        );
      } catch (err: any) {
        console.error('[AgenticLoop] Error:', err);
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: err.message || 'Unknown error',
        }));
      }
    },
    [reset, handleEvent]
  );

  /** 停止当前任务 */
  const stop = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setState((prev) => ({
      ...prev,
      status: prev.status === 'running' ? 'done' : prev.status,
    }));
  }, []);

  return {
    ...state,
    runTask,
    stop,
    reset,
  };
}

/** 从 edit_file 的 tool_result 中提取 diff 信息 */
function extractDiff(tool: string, result: string): string | undefined {
  if (tool !== 'edit_file') return undefined;
  try {
    const parsed = JSON.parse(result);
    return parsed.diff; // "file.py +3 -4"
  } catch {
    return undefined;
  }
}
