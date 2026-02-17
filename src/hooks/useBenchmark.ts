// src/hooks/useBenchmark.ts - Benchmark Runner Hook

import { useState, useCallback, useRef, useEffect } from 'react';
import { benchmarkApi } from '@/services/benchmarkApi';
import {
  BenchmarkTask,
  BenchmarkSession,
  BenchmarkConfig,
  BenchmarkType,
  ExecutionStep,
  BenchmarkMetrics,
  BenchmarkLog,
  RepoAnalysisResult,
  DEFAULT_BENCHMARK_CONFIG,
  SAMPLE_BENCHMARK_TASKS
} from '@/types/benchmark';

/**
 * Benchmark Hook State
 */
interface BenchmarkState {
  // 当前状态
  status: 'idle' | 'loading' | 'running' | 'completed' | 'failed' | 'paused';
  
  // 任务和配置
  availableTasks: BenchmarkTask[];
  selectedTask: BenchmarkTask | null;
  config: BenchmarkConfig;
  
  // 执行状态
  session: BenchmarkSession | null;
  currentStep: ExecutionStep | null;
  currentStepProgress: number;
  steps: ExecutionStep[];
  
  // 分析结果
  repoAnalysis: RepoAnalysisResult | null;
  
  // 指标
  metrics: BenchmarkMetrics;
  
  // 日志
  logs: BenchmarkLog[];
  
  // 错误
  error: string | null;
}

/**
 * Benchmark Hook Actions
 */
interface BenchmarkActions {
  // 任务管理
  loadTasks: (type?: BenchmarkType) => Promise<void>;
  selectTask: (task: BenchmarkTask) => void;
  
  // 配置
  updateConfig: (config: Partial<BenchmarkConfig>) => void;
  
  // 执行控制
  startRun: () => void;
  pauseRun: () => void;
  resumeRun: () => void;
  cancelRun: () => void;
  reset: () => void;
  
  // 独立功能
  analyzeRepo: (repoUrl: string) => Promise<RepoAnalysisResult>;
  
  // 日志
  addLog: (level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any) => void;
  clearLogs: () => void;
}

const initialMetrics: BenchmarkMetrics = {
  total_tokens: 0,
  prompt_tokens: 0,
  completion_tokens: 0,
  total_api_calls: 0,
  total_duration_ms: 0,
  estimated_cost_usd: 0
};

const initialState: BenchmarkState = {
  status: 'idle',
  availableTasks: SAMPLE_BENCHMARK_TASKS,
  selectedTask: null,
  config: DEFAULT_BENCHMARK_CONFIG,
  session: null,
  currentStep: null,
  currentStepProgress: 0,
  steps: [],
  repoAnalysis: null,
  metrics: initialMetrics,
  logs: [],
  error: null
};

/**
 * Benchmark Runner Hook
 * 提供完整的Benchmark执行能力
 */
export function useBenchmark(): BenchmarkState & BenchmarkActions {
  const [state, setState] = useState<BenchmarkState>(initialState);
  const cancelRef = useRef<(() => void) | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // 添加日志
  const addLog = useCallback((
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    data?: any
  ) => {
    const log: BenchmarkLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };
    setState(prev => ({
      ...prev,
      logs: [...prev.logs.slice(-99), log] // 保留最近100条
    }));
  }, []);

  // 清空日志
  const clearLogs = useCallback(() => {
    setState(prev => ({ ...prev, logs: [] }));
  }, []);

  // 加载任务
  const loadTasks = useCallback(async (type?: BenchmarkType) => {
    setState(prev => ({ ...prev, status: 'loading' }));
    addLog('info', `加载${type || '所有'}类型的Benchmark任务...`);
    
    try {
      const tasks = await benchmarkApi.getAvailableTasks(type);
      setState(prev => ({
        ...prev,
        status: 'idle',
        availableTasks: tasks
      }));
      addLog('info', `成功加载 ${tasks.length} 个任务`);
    } catch (error: any) {
      addLog('error', `加载任务失败: ${error.message}`);
      setState(prev => ({
        ...prev,
        status: 'idle',
        error: error.message
      }));
    }
  }, [addLog]);

  // 选择任务
  const selectTask = useCallback((task: BenchmarkTask) => {
    setState(prev => ({
      ...prev,
      selectedTask: task,
      error: null
    }));
    addLog('info', `选择任务: ${task.name} (${task.id})`);
  }, [addLog]);

  // 更新配置
  const updateConfig = useCallback((config: Partial<BenchmarkConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...config }
    }));
  }, []);

  // 开始运行
  const startRun = useCallback(() => {
    if (!state.selectedTask) {
      addLog('error', '请先选择一个任务');
      return;
    }

    setState(prev => ({
      ...prev,
      status: 'running',
      steps: [],
      currentStep: null,
      currentStepProgress: 0,
      metrics: initialMetrics,
      error: null
    }));

    addLog('info', `开始运行 Benchmark: ${state.selectedTask.name}`);

    const { sessionId, cancel } = benchmarkApi.startBenchmarkRun(
      {
        task_id: state.selectedTask.id,
        benchmark_type: state.selectedTask.benchmark_type,
        config: state.config
      },
      {
        onStepStart: (step) => {
          setState(prev => ({
            ...prev,
            currentStep: step,
            currentStepProgress: 0,
            steps: [...prev.steps.filter(s => s.id !== step.id), step]
          }));
          addLog('info', `开始步骤: ${step.name}`, { step_id: step.id });
        },
        
        onStepProgress: (step, progress) => {
          setState(prev => ({
            ...prev,
            currentStep: step,
            currentStepProgress: progress,
            steps: prev.steps.map(s => s.id === step.id ? step : s)
          }));
        },
        
        onStepComplete: (step) => {
          setState(prev => ({
            ...prev,
            currentStep: step,
            currentStepProgress: 100,
            steps: prev.steps.map(s => s.id === step.id ? step : s)
          }));
          addLog('info', `完成步骤: ${step.name}`, {
            duration_ms: step.duration_ms,
            tokens: step.token_usage
          });
        },
        
        onStepError: (step, error) => {
          setState(prev => ({
            ...prev,
            currentStep: { ...step, status: 'failed' },
            steps: prev.steps.map(s => s.id === step.id ? { ...step, status: 'failed' as const } : s)
          }));
          addLog('error', `步骤失败: ${step.name}`, { error });
        },
        
        onLog: (log) => {
          addLog(log.level as any, log.message, log.data);
        },
        
        onMetricsUpdate: (metrics) => {
          setState(prev => ({ ...prev, metrics }));
        },
        
        onSessionComplete: (session) => {
          setState(prev => ({
            ...prev,
            status: 'completed',
            session
          }));
          addLog('info', 'Benchmark 运行完成', {
            duration_ms: session.metrics.total_duration_ms,
            tokens: session.metrics.total_tokens,
            ecr: session.metrics.execution_completion_rate,
            tpr: session.metrics.task_pass_rate
          });
        },
        
        onSessionError: (error) => {
          setState(prev => ({
            ...prev,
            status: 'failed',
            error
          }));
          addLog('error', `Benchmark 运行失败: ${error}`);
        }
      }
    );

    sessionIdRef.current = sessionId;
    cancelRef.current = cancel;
  }, [state.selectedTask, state.config, addLog]);

  // 暂停运行
  const pauseRun = useCallback(() => {
    setState(prev => ({ ...prev, status: 'paused' }));
    addLog('warn', 'Benchmark 已暂停');
  }, [addLog]);

  // 恢复运行
  const resumeRun = useCallback(() => {
    setState(prev => ({ ...prev, status: 'running' }));
    addLog('info', 'Benchmark 已恢复');
  }, [addLog]);

  // 取消运行
  const cancelRun = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
    setState(prev => ({
      ...prev,
      status: 'idle',
      error: '用户取消了运行'
    }));
    addLog('warn', 'Benchmark 已取消');
  }, [addLog]);

  // 重置
  const reset = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
    sessionIdRef.current = null;
    setState(initialState);
    addLog('info', 'Benchmark 已重置');
  }, [addLog]);

  // 分析仓库
  const analyzeRepo = useCallback(async (repoUrl: string): Promise<RepoAnalysisResult> => {
    addLog('info', `开始分析仓库: ${repoUrl}`);
    
    try {
      const result = await benchmarkApi.analyzeRepository(repoUrl);
      setState(prev => ({ ...prev, repoAnalysis: result }));
      addLog('info', '仓库分析完成', {
        modules: result.total_modules,
        functions: result.total_functions
      });
      return result;
    } catch (error: any) {
      addLog('error', `仓库分析失败: ${error.message}`);
      throw error;
    }
  }, [addLog]);

  // 初始加载
  useEffect(() => {
    loadTasks();
  }, []);

  return {
    ...state,
    loadTasks,
    selectTask,
    updateConfig,
    startRun,
    pauseRun,
    resumeRun,
    cancelRun,
    reset,
    analyzeRepo,
    addLog,
    clearLogs
  };
}

/**
 * Benchmark步骤显示Hook
 */
export function useBenchmarkSteps(steps: ExecutionStep[]) {
  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  
  const currentStep = steps.find(s => s.status === 'running');
  const failedStep = steps.find(s => s.status === 'failed');
  
  return {
    completedSteps,
    totalSteps,
    progress,
    currentStep,
    failedStep,
    isComplete: completedSteps === totalSteps && totalSteps > 0,
    hasFailed: !!failedStep
  };
}

/**
 * Benchmark指标格式化Hook
 */
export function useBenchmarkMetrics(metrics: BenchmarkMetrics) {
  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  };

  const formatTokens = (tokens: number): string => {
    if (tokens < 1000) return `${tokens}`;
    return `${(tokens / 1000).toFixed(1)}k`;
  };

  const formatCost = (cost: number): string => {
    return `$${cost.toFixed(4)}`;
  };

  const formatPercentage = (value?: number): string => {
    if (value === undefined) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
  };

  return {
    duration: formatDuration(metrics.total_duration_ms),
    totalTokens: formatTokens(metrics.total_tokens),
    promptTokens: formatTokens(metrics.prompt_tokens),
    completionTokens: formatTokens(metrics.completion_tokens),
    apiCalls: metrics.total_api_calls.toString(),
    cost: formatCost(metrics.estimated_cost_usd),
    ecr: formatPercentage(metrics.execution_completion_rate),
    tpr: formatPercentage(metrics.task_pass_rate),
    alphaScore: metrics.alpha_score?.toFixed(2) || 'N/A'
  };
}
