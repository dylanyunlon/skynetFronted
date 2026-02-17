// src/components/Benchmark/EnhancedBenchmarkInterface.tsx
// 增强版Benchmark界面 - 与现有Skynet UnifiedChatInterface兼容

import React, { useState, useCallback, useEffect } from 'react';
import {
  Play, Pause, Square, RotateCcw, Settings, ChevronRight,
  CheckCircle, XCircle, Loader2, Clock, Cpu, DollarSign,
  GitBranch, FolderTree, Search, Code2, FileText, Terminal,
  BarChart3, Zap, AlertTriangle, ChevronDown, ChevronUp,
  ExternalLink, Copy, Download, Filter, Sparkles, MessageSquare,
  Eye, RefreshCw, Monitor, ArrowLeft, Layers
} from 'lucide-react';
import { useBenchmark, useBenchmarkSteps, useBenchmarkMetrics } from '@/hooks/useBenchmark';
import { BenchmarkTask, ExecutionStep, BenchmarkType } from '@/types/benchmark';

interface EnhancedBenchmarkInterfaceProps {
  onBack?: () => void;
  onProjectCreated?: (projectId: string) => void;
  initialTask?: BenchmarkTask;
}

/**
 * baloonet的步骤可视化组件
 */
const StepVisualization: React.FC<{
  step: ExecutionStep;
  isActive: boolean;
  isLast: boolean;
}> = ({ step, isActive, isLast }) => {
  const [isExpanded, setIsExpanded] = useState(isActive);

  useEffect(() => {
    if (isActive) setIsExpanded(true);
  }, [isActive]);

  const getStatusColor = () => {
    switch (step.status) {
      case 'completed': return 'border-emerald-500 bg-emerald-50';
      case 'running': return 'border-indigo-500 bg-indigo-50 animate-pulse';
      case 'failed': return 'border-rose-500 bg-rose-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getStatusIcon = () => {
    switch (step.status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'running': return <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />;
      case 'failed': return <XCircle className="w-5 h-5 text-rose-500" />;
      default: return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="relative">
      {/* 连接线 */}
      {!isLast && (
        <div className={`absolute left-6 top-12 w-0.5 h-full ${
          step.status === 'completed' ? 'bg-emerald-300' : 'bg-gray-200'
        }`} />
      )}

      {/* 步骤卡片 */}
      <div className={`relative ml-0 p-4 rounded-xl border-2 transition-all ${getStatusColor()}`}>
        {/* 头部 */}
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex-shrink-0">
            {getStatusIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900">{step.name}</h4>
            {step.status === 'running' && (
              <p className="text-sm text-indigo-600 mt-0.5">正在处理...</p>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {step.duration_ms && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {(step.duration_ms / 1000).toFixed(1)}s
              </span>
            )}
            {step.token_usage && (
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" />
                {step.token_usage.toLocaleString()}
              </span>
            )}
            <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </div>
        </div>

        {/* 展开内容 */}
        {isExpanded && (step.output || step.sub_steps?.length > 0) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {/* 子步骤 */}
            {step.sub_steps && step.sub_steps.length > 0 && (
              <div className="mb-4 space-y-2">
                {step.sub_steps.map((subStep, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm pl-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-700">{subStep.name}</span>
                      {subStep.detail && (
                        <p className="text-gray-500 text-xs mt-0.5">{subStep.detail}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 输出 */}
            {step.output && (
              <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
                <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                  {step.output}
                </pre>
              </div>
            )}

            {/* 错误 */}
            {step.error && (
              <div className="mt-2 p-3 bg-rose-100 rounded-lg text-sm text-rose-800">
                {step.error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 实时指标仪表盘
 */
const MetricsDashboard: React.FC<{
  metrics: ReturnType<typeof useBenchmarkMetrics>;
  isRunning: boolean;
}> = ({ metrics, isRunning }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <MetricCard
        icon={<Clock className="w-4 h-4" />}
        label="耗时"
        value={metrics.duration}
        color="indigo"
        pulse={isRunning}
      />
      <MetricCard
        icon={<Cpu className="w-4 h-4" />}
        label="Tokens"
        value={metrics.totalTokens}
        subValue={`${metrics.promptTokens} / ${metrics.completionTokens}`}
        color="purple"
        pulse={isRunning}
      />
      <MetricCard
        icon={<GitBranch className="w-4 h-4" />}
        label="API调用"
        value={metrics.apiCalls}
        color="blue"
        pulse={isRunning}
      />
      <MetricCard
        icon={<DollarSign className="w-4 h-4" />}
        label="成本"
        value={metrics.cost}
        color="emerald"
        pulse={isRunning}
      />
    </div>
  );
};

const MetricCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  color: string;
  pulse?: boolean;
}> = ({ icon, label, value, subValue, color, pulse }) => {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  };

  return (
    <div className={`p-3 rounded-xl border ${colorClasses[color as keyof typeof colorClasses]} ${pulse ? 'animate-pulse' : ''}`}>
      <div className="flex items-center gap-2 text-xs opacity-70 mb-1">
        {icon}
        {label}
      </div>
      <div className="text-lg font-bold">{value}</div>
      {subValue && <div className="text-xs opacity-60 mt-0.5">{subValue}</div>}
    </div>
  );
};

/**
 * baloonet指标
 */
const RepoMasterMetrics: React.FC<{
  ecr: string;
  tpr: string;
  alphaScore: string;
}> = ({ ecr, tpr, alphaScore }) => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 text-white">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5" />
        <span className="font-semibold">RepoMaster 风格指标</span>
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold">{ecr}</div>
          <div className="text-xs opacity-80">ECR (执行完成率)</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{tpr}</div>
          <div className="text-xs opacity-80">TPR (任务通过率)</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{alphaScore}</div>
          <div className="text-xs opacity-80">α-score</div>
        </div>
      </div>
    </div>
  );
};

/**
 * 增强版Benchmark界面主组件
 */
export const EnhancedBenchmarkInterface: React.FC<EnhancedBenchmarkInterfaceProps> = ({
  onBack,
  onProjectCreated,
  initialTask
}) => {
  const benchmark = useBenchmark();
  const stepInfo = useBenchmarkSteps(benchmark.steps);
  const metricsFormatted = useBenchmarkMetrics(benchmark.metrics);

  const [activeTab, setActiveTab] = useState<'execution' | 'logs' | 'analysis'>('execution');

  // 如果有初始任务，自动选择
  useEffect(() => {
    if (initialTask && !benchmark.selectedTask) {
      benchmark.selectTask(initialTask);
    }
  }, [initialTask]);

  const isRunning = benchmark.status === 'running';
  const isCompleted = benchmark.status === 'completed';
  const canStart = benchmark.status === 'idle' && benchmark.selectedTask !== null;

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      {/* 头部 */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Benchmark Runner</h1>
              <p className="text-xs text-gray-500">Non-E2E Mode · Step-by-Step</p>
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center gap-2">
            {canStart && (
              <button
                onClick={benchmark.startRun}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <Play className="w-4 h-4" />
                开始运行
              </button>
            )}
            
            {isRunning && (
              <>
                <button
                  onClick={benchmark.pauseRun}
                  className="flex items-center gap-2 px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                >
                  <Pause className="w-4 h-4" />
                </button>
                <button
                  onClick={benchmark.cancelRun}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  <Square className="w-4 h-4" />
                </button>
              </>
            )}

            {isCompleted && (
              <button
                onClick={benchmark.reset}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                <RotateCcw className="w-4 h-4" />
                重新开始
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <div className="flex-1 overflow-hidden flex">
        {/* 左侧面板 - 任务选择和指标 */}
        <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto p-4 space-y-4">
          {/* 任务选择 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FolderTree className="w-4 h-4" />
              选择任务
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {benchmark.availableTasks.slice(0, 6).map(task => (
                <button
                  key={task.id}
                  onClick={() => benchmark.selectTask(task)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    benchmark.selectedTask?.id === task.id
                      ? 'bg-indigo-50 border-2 border-indigo-500'
                      : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className="font-medium text-sm text-gray-900 truncate">{task.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{task.benchmark_type}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 选中任务详情 */}
          {benchmark.selectedTask && (
            <div className="p-3 bg-gray-50 rounded-xl">
              <h4 className="font-semibold text-gray-900 text-sm">{benchmark.selectedTask.name}</h4>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{benchmark.selectedTask.description}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                  {benchmark.selectedTask.difficulty}
                </span>
                <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                  {benchmark.selectedTask.domain}
                </span>
              </div>
            </div>
          )}

          {/* 指标仪表盘 */}
          {(isRunning || isCompleted) && (
            <>
              <MetricsDashboard metrics={metricsFormatted} isRunning={isRunning} />
              <RepoMasterMetrics 
                ecr={metricsFormatted.ecr}
                tpr={metricsFormatted.tpr}
                alphaScore={metricsFormatted.alphaScore}
              />
            </>
          )}
        </div>

        {/* 右侧面板 - 执行可视化 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 进度条 */}
          {(isRunning || isCompleted) && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">执行进度</span>
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

          {/* Tab切换 */}
          <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
            {[
              { id: 'execution', label: '执行步骤', icon: Zap },
              { id: 'logs', label: '日志', icon: Terminal },
              { id: 'analysis', label: '分析', icon: BarChart3 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab内容 */}
          {activeTab === 'execution' && (
            <div className="space-y-4">
              {benchmark.steps.length === 0 && !isRunning ? (
                <div className="text-center py-12 text-gray-500">
                  <Zap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>选择任务并点击"开始运行"</p>
                </div>
              ) : (
                benchmark.steps.map((step, index) => (
                  <StepVisualization
                    key={step.id}
                    step={step}
                    isActive={benchmark.currentStep?.id === step.id}
                    isLast={index === benchmark.steps.length - 1}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="bg-gray-900 rounded-xl p-4 h-96 overflow-y-auto font-mono text-xs">
              {benchmark.logs.length === 0 ? (
                <div className="text-gray-600 text-center py-8">暂无日志</div>
              ) : (
                benchmark.logs.map((log, index) => (
                  <div key={index} className="flex gap-2 py-1">
                    <span className="text-gray-500 flex-shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`flex-shrink-0 ${
                      log.level === 'error' ? 'text-rose-400' :
                      log.level === 'warn' ? 'text-amber-400' :
                      'text-blue-400'
                    }`}>
                      [{log.level.toUpperCase()}]
                    </span>
                    <span className="text-gray-300">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'analysis' && benchmark.repoAnalysis && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="font-semibold text-gray-900 mb-3">仓库分析结果</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">
                      {benchmark.repoAnalysis.total_modules}
                    </div>
                    <div className="text-gray-500">模块</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {benchmark.repoAnalysis.total_classes}
                    </div>
                    <div className="text-gray-500">类</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {benchmark.repoAnalysis.total_functions}
                    </div>
                    <div className="text-gray-500">函数</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">
                      {benchmark.repoAnalysis.total_lines?.toLocaleString()}
                    </div>
                    <div className="text-gray-500">代码行</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 验证结果 */}
          {benchmark.session?.validation_result && (
            <div className={`mt-6 p-4 rounded-xl ${
              benchmark.session.validation_result.passed
                ? 'bg-emerald-50 border border-emerald-200'
                : 'bg-rose-50 border border-rose-200'
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
                    {benchmark.session.validation_result.passed ? '✓ 验证通过' : '✗ 验证失败'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    测试用例: {benchmark.session.validation_result.tests_passed}/
                    {benchmark.session.validation_result.tests_run} 通过
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedBenchmarkInterface;
