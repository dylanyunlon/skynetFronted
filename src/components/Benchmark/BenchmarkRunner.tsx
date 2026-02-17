// src/components/Benchmark/BenchmarkRunner.tsx
// 非端到端的Benchmark测试界面 - 展示每个步骤的详细过程

import React, { useState, useEffect, useMemo } from 'react';
import {
  Play, Pause, Square, RotateCcw, Settings, ChevronRight,
  CheckCircle, XCircle, Loader2, Clock, Cpu, DollarSign,
  GitBranch, FolderTree, Search, Code2, FileText, Terminal,
  BarChart3, Zap, AlertTriangle, Info, ChevronDown, ChevronUp,
  ExternalLink, Copy, Download, Filter
} from 'lucide-react';
import { useBenchmark, useBenchmarkSteps, useBenchmarkMetrics } from '@/hooks/useBenchmark';
import { BenchmarkTask, ExecutionStep, BenchmarkType, BENCHMARK_STEPS } from '@/types/benchmark';

// ==================== 子组件 ====================

/**
 * 任务选择器
 */
const TaskSelector: React.FC<{
  tasks: BenchmarkTask[];
  selectedTask: BenchmarkTask | null;
  onSelect: (task: BenchmarkTask) => void;
  onFilter: (type?: BenchmarkType) => void;
}> = ({ tasks, selectedTask, onSelect, onFilter }) => {
  const [filterType, setFilterType] = useState<BenchmarkType | undefined>();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleFilterChange = (type: BenchmarkType | 'all') => {
    const newType = type === 'all' ? undefined : type;
    setFilterType(newType);
    onFilter(newType);
  };

  const filteredTasks = useMemo(() => {
    if (!filterType) return tasks;
    return tasks.filter(t => t.benchmark_type === filterType);
  }, [tasks, filterType]);

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'bg-emerald-100 text-emerald-700',
      medium: 'bg-amber-100 text-amber-700',
      hard: 'bg-rose-100 text-rose-700',
      expert: 'bg-purple-100 text-purple-700'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* 头部 */}
      <div 
        className="px-4 py-3 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <FolderTree className="w-5 h-5 text-indigo-600" />
          <span className="font-semibold text-gray-800">任务选择</span>
          <span className="text-sm text-gray-500">({filteredTasks.length} 个任务)</span>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </div>

      {isExpanded && (
        <>
          {/* 过滤器 */}
          <div className="px-4 py-2 border-b border-gray-100 flex gap-2 overflow-x-auto">
            {['all', 'gittaskbench', 'swe_bench_verified', 'swe_bench_pro', 'mle_bench'].map(type => (
              <button
                key={type}
                onClick={() => handleFilterChange(type as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all ${
                  (type === 'all' && !filterType) || filterType === type
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? '全部' : type.replace(/_/g, '-').toUpperCase()}
              </button>
            ))}
          </div>

          {/* 任务列表 */}
          <div className="max-h-64 overflow-y-auto">
            {filteredTasks.map(task => (
              <div
                key={task.id}
                onClick={() => onSelect(task)}
                className={`px-4 py-3 border-b border-gray-50 cursor-pointer transition-all ${
                  selectedTask?.id === task.id
                    ? 'bg-indigo-50 border-l-4 border-l-indigo-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">{task.name}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getDifficultyColor(task.difficulty)}`}>
                        {task.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Code2 className="w-3 h-3" />
                        {task.domain}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.timeout_seconds}s
                      </span>
                    </div>
                  </div>
                  {selectedTask?.id === task.id && (
                    <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 ml-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * 步骤执行面板 - 核心组件
 */
const ExecutionPanel: React.FC<{
  steps: ExecutionStep[];
  currentStep: ExecutionStep | null;
  currentStepProgress: number;
  status: string;
}> = ({ steps, currentStep, currentStepProgress, status }) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const getStepIcon = (step: ExecutionStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-rose-500" />;
      case 'skipped':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepBgColor = (step: ExecutionStep) => {
    switch (step.status) {
      case 'completed':
        return 'bg-emerald-50 border-emerald-200';
      case 'running':
        return 'bg-indigo-50 border-indigo-200';
      case 'failed':
        return 'bg-rose-50 border-rose-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // 预定义步骤（用于显示未开始的步骤）
  const allStepDefs = Object.values(BENCHMARK_STEPS);
  const displaySteps = useMemo(() => {
    const existingIds = new Set(steps.map(s => s.id));
    const result = [...steps];
    
    allStepDefs.forEach(def => {
      if (!existingIds.has(def.id)) {
        result.push({
          id: def.id,
          name: def.name,
          description: def.description,
          status: 'pending'
        });
      }
    });
    
    return result;
  }, [steps]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* 头部 */}
      <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600" />
            <span className="font-semibold text-gray-800">执行步骤</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {status === 'running' && (
              <span className="flex items-center gap-1 text-indigo-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                运行中
              </span>
            )}
            {status === 'completed' && (
              <span className="flex items-center gap-1 text-emerald-600">
                <CheckCircle className="w-4 h-4" />
                完成
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 步骤列表 */}
      <div className="divide-y divide-gray-100">
        {displaySteps.map((step, index) => (
          <div key={step.id} className={`${getStepBgColor(step)} border-l-4 transition-all`}>
            {/* 步骤头部 */}
            <div 
              className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-opacity-80"
              onClick={() => toggleStep(step.id)}
            >
              {/* 步骤序号和图标 */}
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-600 shadow-sm">
                  {index + 1}
                </span>
                {getStepIcon(step)}
              </div>

              {/* 步骤信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{step.name}</span>
                  {step.duration_ms && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {(step.duration_ms / 1000).toFixed(1)}s
                    </span>
                  )}
                  {step.token_usage && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Cpu className="w-3 h-3" />
                      {step.token_usage.toLocaleString()} tokens
                    </span>
                  )}
                </div>
                
                {/* 进度条 */}
                {step.status === 'running' && currentStep?.id === step.id && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${currentStepProgress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* 展开/收起 */}
              <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                expandedSteps.has(step.id) ? 'rotate-90' : ''
              }`} />
            </div>

            {/* 步骤详情 */}
            {expandedSteps.has(step.id) && (step.output || step.sub_steps?.length) && (
              <div className="px-4 pb-3 pl-16">
                {/* 子步骤 */}
                {step.sub_steps && step.sub_steps.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {step.sub_steps.map(subStep => (
                      <div key={subStep.id} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-gray-700">{subStep.name}</span>
                          {subStep.detail && (
                            <p className="text-gray-500 text-xs mt-0.5">{subStep.detail}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 输出内容 */}
                {step.output && (
                  <div className="bg-gray-900 rounded-lg p-3 text-sm font-mono">
                    <pre className="text-gray-300 whitespace-pre-wrap text-xs leading-relaxed">
                      {step.output}
                    </pre>
                  </div>
                )}

                {/* 错误信息 */}
                {step.error && (
                  <div className="bg-rose-100 border border-rose-200 rounded-lg p-3 mt-2">
                    <p className="text-sm text-rose-800">{step.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 指标面板
 */
const MetricsPanel: React.FC<{
  metrics: ReturnType<typeof useBenchmarkMetrics>;
  isRunning: boolean;
}> = ({ metrics, isRunning }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          <span className="font-semibold text-gray-800">性能指标</span>
          {isRunning && (
            <span className="ml-auto text-xs text-emerald-600 flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              实时更新
            </span>
          )}
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-4">
        {/* 时间 */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <Clock className="w-3 h-3" />
            总耗时
          </div>
          <div className="text-xl font-bold text-gray-900">{metrics.duration}</div>
        </div>

        {/* Tokens */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <Cpu className="w-3 h-3" />
            Token使用
          </div>
          <div className="text-xl font-bold text-gray-900">{metrics.totalTokens}</div>
          <div className="text-xs text-gray-500 mt-1">
            输入: {metrics.promptTokens} / 输出: {metrics.completionTokens}
          </div>
        </div>

        {/* API调用 */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <GitBranch className="w-3 h-3" />
            API调用
          </div>
          <div className="text-xl font-bold text-gray-900">{metrics.apiCalls}</div>
        </div>

        {/* 成本 */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <DollarSign className="w-3 h-3" />
            预估成本
          </div>
          <div className="text-xl font-bold text-gray-900">{metrics.cost}</div>
        </div>

        {/* RepoMaster指标 */}
        <div className="col-span-2 bg-indigo-50 rounded-lg p-3">
          <div className="text-xs text-indigo-600 font-medium mb-2">RepoMaster 风格指标</div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-indigo-700">{metrics.ecr}</div>
              <div className="text-xs text-gray-500">ECR (执行完成率)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-700">{metrics.tpr}</div>
              <div className="text-xs text-gray-500">TPR (任务通过率)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-700">{metrics.alphaScore}</div>
              <div className="text-xs text-gray-500">α-score</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 日志面板
 */
const LogPanel: React.FC<{
  logs: Array<{ timestamp: string; level: string; message: string; data?: any }>;
  onClear: () => void;
}> = ({ logs, onClear }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    if (filter === 'all') return logs;
    return logs.filter(log => log.level === filter);
  }, [logs, filter]);

  const getLevelColor = (level: string) => {
    const colors = {
      debug: 'text-gray-400',
      info: 'text-blue-400',
      warn: 'text-amber-400',
      error: 'text-rose-400'
    };
    return colors[level as keyof typeof colors] || 'text-gray-400';
  };

  const getLevelBg = (level: string) => {
    const colors = {
      debug: 'bg-gray-500',
      info: 'bg-blue-500',
      warn: 'bg-amber-500',
      error: 'bg-rose-500'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      {/* 头部 */}
      <div 
        className="px-4 py-2 bg-gray-800 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">执行日志</span>
          <span className="text-xs text-gray-500">({logs.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {/* 过滤器 */}
          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
            {['all', 'info', 'warn', 'error'].map(level => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`px-2 py-0.5 text-xs rounded ${
                  filter === level ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="text-gray-500 hover:text-gray-300 text-xs"
          >
            清空
          </button>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </div>
      </div>

      {/* 日志内容 */}
      {isExpanded && (
        <div className="h-48 overflow-y-auto p-3 font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="text-gray-600 text-center py-4">暂无日志</div>
          ) : (
            filteredLogs.map((log, index) => (
              <div key={index} className="flex items-start gap-2 py-1 hover:bg-gray-800/50">
                <span className="text-gray-600 flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${getLevelBg(log.level)}`} />
                <span className={`flex-shrink-0 ${getLevelColor(log.level)}`}>
                  [{log.level.toUpperCase()}]
                </span>
                <span className="text-gray-300">{log.message}</span>
                {log.data && (
                  <span className="text-gray-500 ml-1">
                    {JSON.stringify(log.data)}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ==================== 主组件 ====================

/**
 * BenchmarkRunner - 非端到端Benchmark测试界面
 * 展示每个步骤的详细过程，类似RepoMaster的demo风格
 */
export const BenchmarkRunner: React.FC = () => {
  const benchmark = useBenchmark();
  const stepInfo = useBenchmarkSteps(benchmark.steps);
  const metricsFormatted = useBenchmarkMetrics(benchmark.metrics);

  const isRunning = benchmark.status === 'running';
  const isPaused = benchmark.status === 'paused';
  const isCompleted = benchmark.status === 'completed';
  const canStart = benchmark.status === 'idle' && benchmark.selectedTask !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-zinc-100">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Benchmark Runner</h1>
                <p className="text-xs text-gray-500">Non-E2E Mode · Step-by-Step Visualization</p>
              </div>
            </div>

            {/* 控制按钮 */}
            <div className="flex items-center gap-2">
              {canStart && (
                <button
                  onClick={benchmark.startRun}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  开始运行
                </button>
              )}
              
              {isRunning && (
                <>
                  <button
                    onClick={benchmark.pauseRun}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                  >
                    <Pause className="w-4 h-4" />
                    暂停
                  </button>
                  <button
                    onClick={benchmark.cancelRun}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <Square className="w-4 h-4" />
                    停止
                  </button>
                </>
              )}

              {isPaused && (
                <button
                  onClick={benchmark.resumeRun}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  继续
                </button>
              )}

              {isCompleted && (
                <button
                  onClick={benchmark.reset}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  重新开始
                </button>
              )}

              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* 左侧：任务选择和指标 */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* 任务选择器 */}
            <TaskSelector
              tasks={benchmark.availableTasks}
              selectedTask={benchmark.selectedTask}
              onSelect={benchmark.selectTask}
              onFilter={benchmark.loadTasks}
            />

            {/* 选中任务详情 */}
            {benchmark.selectedTask && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {benchmark.selectedTask.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {benchmark.selectedTask.description}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 rounded p-2">
                    <span className="text-gray-500">类型:</span>{' '}
                    <span className="font-medium">{benchmark.selectedTask.benchmark_type}</span>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <span className="text-gray-500">领域:</span>{' '}
                    <span className="font-medium">{benchmark.selectedTask.domain}</span>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <span className="text-gray-500">难度:</span>{' '}
                    <span className="font-medium">{benchmark.selectedTask.difficulty}</span>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <span className="text-gray-500">超时:</span>{' '}
                    <span className="font-medium">{benchmark.selectedTask.timeout_seconds}s</span>
                  </div>
                </div>
                {benchmark.selectedTask.repository_url && (
                  <a
                    href={benchmark.selectedTask.repository_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 mt-3"
                  >
                    <GitBranch className="w-3 h-3" />
                    查看仓库
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {/* 性能指标 */}
            <MetricsPanel metrics={metricsFormatted} isRunning={isRunning} />
          </div>

          {/* 右侧：执行步骤和日志 */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* 进度概览 */}
            {(isRunning || isCompleted) && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    执行进度
                  </span>
                  <span className="text-sm text-gray-500">
                    {stepInfo.completedSteps} / {stepInfo.totalSteps} 步骤
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      stepInfo.hasFailed ? 'bg-rose-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${stepInfo.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* 执行步骤面板 */}
            <ExecutionPanel
              steps={benchmark.steps}
              currentStep={benchmark.currentStep}
              currentStepProgress={benchmark.currentStepProgress}
              status={benchmark.status}
            />

            {/* 日志面板 */}
            <LogPanel
              logs={benchmark.logs}
              onClear={benchmark.clearLogs}
            />

            {/* 验证结果 */}
            {benchmark.session?.validation_result && (
              <div className={`rounded-xl border p-4 ${
                benchmark.session.validation_result.passed
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-rose-50 border-rose-200'
              }`}>
                <div className="flex items-center gap-3">
                  {benchmark.session.validation_result.passed ? (
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <XCircle className="w-8 h-8 text-rose-500" />
                  )}
                  <div>
                    <h3 className={`font-semibold ${
                      benchmark.session.validation_result.passed ? 'text-emerald-800' : 'text-rose-800'
                    }`}>
                      {benchmark.session.validation_result.passed ? '验证通过' : '验证失败'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      测试用例: {benchmark.session.validation_result.tests_passed}/{benchmark.session.validation_result.tests_run} 通过
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BenchmarkRunner;
