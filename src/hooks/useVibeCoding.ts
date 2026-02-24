// src/hooks/useAgenticLoop.ts
// Agentic Loop SSE Hook — v3 (supports all Claude Code event types)

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
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://baloonet.tech:17432';

export function useAgenticLoop() {
  const [state, setState] = useState<AgenticLoopState>({
    blocks: [], status: 'idle', error: null,
    turns: 0, totalToolCalls: 0, duration: 0, model: '', workDir: '',
  });

  const abortRef = useRef<AbortController | null>(null);
  const pendingToolsRef = useRef<Map<string, number>>(new Map());
  const blockIdCounter = useRef(0);
  const nextId = () => `ab_${++blockIdCounter.current}`;

  const reset = useCallback(() => {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    pendingToolsRef.current.clear();
    blockIdCounter.current = 0;
    setState({ blocks: [], status: 'idle', error: null, turns: 0, totalToolCalls: 0, duration: 0, model: '', workDir: '' });
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

        case 'tool_start': {
          const idx = blocks.length;
          blocks.push({
            id: nextId(), type: 'tool', turn: event.turn ?? 0,
            tool: event.tool, toolArgs: event.args,
            toolResult: undefined, toolSuccess: undefined,
            toolDescription: event.description,  // v3
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
              toolResultMeta: event.result_meta,  // v3
              toolDiff: extractDiff(event.tool, event.result, event.result_meta),
            };
            pendingToolsRef.current.delete(event.tool_use_id);
          }
          return { ...prev, blocks };
        }

        case 'file_change': {
          // v3: 文件变更事件（可选渲染，也可以只在 turn_summary 中展示）
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
            detailItems: event.detail_items,  // v3
          });
          return {
            ...prev, blocks,
            turns: event.turn ?? prev.turns,
            totalToolCalls: event.total_tool_calls,
          };
        }

        case 'progress': {
          // v3: 进度事件 — 更新计数器但不创建新 block
          return {
            ...prev,
            turns: event.turn ?? prev.turns,
            totalToolCalls: event.total_tool_calls ?? prev.totalToolCalls,
          };
        }

        case 'done':
          return {
            ...prev, status: 'done' as AgenticStatus,
            turns: event.turns, totalToolCalls: event.total_tool_calls, duration: event.duration,
          };

        case 'error':
          blocks.push({ id: nextId(), type: 'error', turn: event.turn ?? 0, content: event.message });
          return {
            ...prev, blocks, status: 'error' as AgenticStatus, error: event.message,
            turns: event.turns ?? prev.turns,
            totalToolCalls: event.total_tool_calls ?? prev.totalToolCalls,
            duration: event.duration ?? prev.duration,
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
              console.warn('[AgenticLoop] Parse error:', dataStr, e);
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
      console.error('[AgenticLoop] Error:', err);
      setState((prev) => ({ ...prev, status: 'error' as AgenticStatus, error: err.message || 'Unknown error' }));
    }
  }, [reset, handleEvent]);

  const stop = useCallback(() => {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    setState((prev) => ({ ...prev, status: prev.status === 'running' ? 'done' as AgenticStatus : prev.status }));
  }, []);

  return { ...state, runTask, stop, reset };
}

/** 从 tool_result 提取 diff 信息 — v3 优先使用 result_meta */
function extractDiff(tool: string, result: string, meta?: ToolResultMeta): string | undefined {
  if (tool !== 'edit_file' && tool !== 'multi_edit') return undefined;

  // v3: 优先从 result_meta 取
  if (meta?.diff) return meta.diff;

  // 降级：从 result JSON 解析
  try {
    const parsed = JSON.parse(result);
    return parsed.diff;
  } catch {
    return undefined;
  }
}

// ============================================================
// Vibe Coding Hooks (兼容旧版 UnifiedChatInterface)
// ============================================================

import type {
  VibeCodingStage,
  VibeCodingSession,
  ProcessingStep,
} from '@/types';
import { api, detectVibeCodingIntent } from '@/services/api';

interface VibeCodingState {
  stage: VibeCodingStage;
  loading: boolean;
  error: string | null;
  session: VibeCodingSession | null;
  currentProject: any | null;
}

/**
 * useVibeCoding — 管理 Vibe Coding 的 meta/generate 两阶段流程
 */
export function useVibeCoding() {
  const [state, setState] = useState<VibeCodingState>({
    stage: 'idle',
    loading: false,
    error: null,
    session: null,
    currentProject: null,
  });

  const reset = useCallback(() => {
    setState({
      stage: 'idle',
      loading: false,
      error: null,
      session: null,
      currentProject: null,
    });
  }, []);

  const startVibeCoding = useCallback(async (userInput: string, conversationId?: string) => {
    const convId = conversationId || `vibe_${Date.now()}`;
    setState(prev => ({ ...prev, stage: 'meta_processing', loading: true, error: null }));
    try {
      const result = await api.sendVibeCodingMeta({
        content: userInput,
        conversation_id: convId,
      });

      const session: VibeCodingSession = {
        id: (result as any).session_id || `vs_${Date.now()}`,
        stage: 'meta_complete',
        original_input: userInput,
        conversation_id: convId,
        meta_response: result as any,
        created_at: new Date(),
        updated_at: new Date(),
      };

      setState(prev => ({
        ...prev,
        stage: 'meta_complete',
        loading: false,
        session,
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        stage: 'error',
        loading: false,
        error: err.message || 'Meta 阶段失败',
      }));
    }
  }, []);

  const confirmGenerate = useCallback(async (confirmMessage?: string) => {
    setState(prev => {
      const session = prev.session;
      if (!session) return { ...prev, stage: 'error' as VibeCodingStage, error: 'No active session' };
      return { ...prev, stage: 'generate_processing' as VibeCodingStage, loading: true, error: null };
    });
    try {
      const session = state.session;
      if (!session) throw new Error('No active session');

      const metaData = session.meta_response as any;
      const result = await api.sendVibeCodingGenerate({
        content: confirmMessage || '确认生成',
        conversation_id: session.conversation_id,
        meta_result: metaData?.vibe_data?.meta_result || metaData,
        optimized_prompt: metaData?.vibe_data?.optimized_description || session.original_input,
        original_user_input: session.original_input,
      });

      setState(prev => ({
        ...prev,
        stage: 'generate_complete',
        loading: false,
        session: { ...prev.session!, generate_response: result as any, stage: 'generate_complete', updated_at: new Date() },
        currentProject: (result as any)?.project_created || null,
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        stage: 'error',
        loading: false,
        error: err.message || 'Generate 阶段失败',
      }));
    }
  }, [state.session]);

  const modifyRequirement = useCallback(async (modificationRequest: string) => {
    setState(prev => ({ ...prev, stage: 'meta_processing', loading: true, error: null }));
    try {
      const session = state.session;
      if (!session) throw new Error('No active session');

      const metaData = session.meta_response as any;
      const result = await api.modifyVibeCodingRequirement({
        content: modificationRequest,
        conversation_id: session.conversation_id,
        previous_meta_result: metaData?.vibe_data?.meta_result || metaData,
      });

      setState(prev => ({
        ...prev,
        stage: 'meta_complete',
        loading: false,
        session: { ...prev.session!, meta_response: result as any, updated_at: new Date() },
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        stage: 'error',
        loading: false,
        error: err.message || '修改需求失败',
      }));
    }
  }, [state.session]);

  return {
    ...state,
    startVibeCoding,
    confirmGenerate,
    modifyRequirement,
    reset,
  };
}

/**
 * useVibeCodingSteps — 根据当前 stage 返回处理步骤列表
 */
export function useVibeCodingSteps(stage: VibeCodingStage): ProcessingStep[] {
  const steps: ProcessingStep[] = [
    {
      id: 'intent',
      label: '意图识别',
      status: stage === 'idle' ? 'pending' : 'completed',
    },
    {
      id: 'meta',
      label: '需求分析 & 优化',
      status: stage === 'meta_processing' ? 'processing'
            : stage === 'idle' ? 'pending'
            : 'completed',
    },
    {
      id: 'confirm',
      label: '确认方案',
      status: stage === 'meta_complete' ? 'processing'
            : ['generate_processing', 'generate_complete'].includes(stage) ? 'completed'
            : 'pending',
    },
    {
      id: 'generate',
      label: '生成项目',
      status: stage === 'generate_processing' ? 'processing'
            : stage === 'generate_complete' ? 'completed'
            : 'pending',
    },
  ];

  if (stage === 'error') {
    const last = steps.find(s => s.status === 'processing') || steps[steps.length - 1];
    if (last) last.status = 'error';
  }

  return steps;
}

/**
 * useVibeCodingIntentDetection — 返回本地意图检测函数
 */
export function useVibeCodingIntentDetection(): (text: string) => boolean {
  return useCallback((text: string) => {
    return detectVibeCodingIntent(text);
  }, []);
}