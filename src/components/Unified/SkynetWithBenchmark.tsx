// src/components/Unified/SkynetWithBenchmark.tsx
// Skynet主界面 + Benchmark模式集成
// 支持在端到端Vibe Coding和非端到端Benchmark模式间切换
// v2: 新增baloonetBenchmark界面，支持GitTaskBench/SWE-bench/MLE-bench
// DEBUG VERSION - 添加调试日志

import React, { useState, useCallback, useEffect } from 'react';
import { 
  MessageSquare, Layers, Settings, ChevronDown, 
  Sparkles, Zap, BarChart3, GitBranch, FlaskConical 
} from 'lucide-react';
import { UnifiedChatInterface } from './UnifiedChatInterface';
import { EnhancedBenchmarkInterface } from '@/components/Benchmark/EnhancedBenchmarkInterface';
import { RepoMasterBenchmarkInterface } from '@/components/Benchmark/RepoMasterBenchmarkInterface';
import { AgenticChat } from '@/components/Agentic';
import { Project } from '@/types';

console.log('[SkynetWithBenchmark] Module loaded - v2 with RepoMaster support');

// 扩展模式类型：chat | benchmark (旧版) | repomaster (新版)
type ViewMode = 'chat' | 'benchmark' | 'repomaster'  | 'agentic';

interface SkynetWithBenchmarkProps {
  onProjectCreated?: (project: Project) => void;
  onProjectUpdated?: (project: Project) => void;
  initialProject?: Project;
}

/**
 * 模式选择器组件 - 支持三种模式
 */
const ModeSelector: React.FC<{
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}> = ({ currentMode, onModeChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  console.log('[ModeSelector] Rendering with currentMode:', currentMode);

  const modes = [
    {
      id: 'agentic',
   name: 'Agentic Loop',
   description: 'AI 自主工具循环',
 icon: Zap,
    color: 'yellow'
  },
    {
      id: 'chat' as const,
      name: 'Vibe Coding',
      description: '端到端AI项目生成',
      icon: Sparkles,
      color: 'indigo'
    },
    {
      id: 'repomaster' as const,
      name: 'RepoMaster Bench',
      description: 'GitTaskBench/SWE-bench/MLE-bench',
      icon: FlaskConical,
      color: 'emerald'
    },
    {
      id: 'benchmark' as const,
      name: 'Basic Benchmark',
      description: '基础非端到端步骤可视化',
      icon: Layers,
      color: 'purple'
    }
  ];

  console.log('[ModeSelector] Available modes:', modes.map(m => m.id));

  const currentModeInfo = modes.find(m => m.id === currentMode)!;

  // 根据颜色返回正确的Tailwind类名
  const getColorClasses = (color: string, type: 'text' | 'bg') => {
    const colorMap: Record<string, { text: string; bg: string }> = {
      indigo: { text: 'text-indigo-600', bg: 'bg-indigo-100' },
      emerald: { text: 'text-emerald-600', bg: 'bg-emerald-100' },
      purple: { text: 'text-purple-600', bg: 'bg-purple-100' }
    };
    return colorMap[color]?.[type] || (type === 'text' ? 'text-gray-600' : 'bg-gray-100');
  };

  const handleModeClick = (modeId: ViewMode) => {
    console.log('[ModeSelector] Mode clicked:', modeId);
    onModeChange(modeId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          console.log('[ModeSelector] Dropdown toggled, isOpen:', !isOpen);
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <currentModeInfo.icon className={`w-4 h-4 ${getColorClasses(currentModeInfo.color, 'text')}`} />
        <span className="text-sm font-medium text-gray-700">{currentModeInfo.name}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 left-0 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-20">
            {modes.map(mode => {
              console.log('[ModeSelector] Rendering mode option:', mode.id);
              return (
                <button
                  key={mode.id}
                  onClick={() => handleModeClick(mode.id)}
                  className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                    currentMode === mode.id ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg ${getColorClasses(mode.color, 'bg')} flex items-center justify-center flex-shrink-0`}>
                    <mode.icon className={`w-5 h-5 ${getColorClasses(mode.color, 'text')}`} />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium text-gray-900">{mode.name}</div>
                    <div className="text-xs text-gray-500">{mode.description}</div>
                  </div>
                  {currentMode === mode.id && (
                    <div className="ml-auto self-center">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                  )}
                  {currentMode === 'agentic' && <AgenticChat />}
                </button>
              );
            })}

            <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
              <p className="text-xs text-gray-500">
                💡 RepoMaster模式支持GitTaskBench等论文级Benchmark测试
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Skynet + Benchmark 集成主组件
 * 支持三种模式：Vibe Coding / RepoMaster Bench / Basic Benchmark
 */
export const SkynetWithBenchmark: React.FC<SkynetWithBenchmarkProps> = ({
  onProjectCreated,
  onProjectUpdated,
  initialProject
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [lastCreatedProject, setLastCreatedProject] = useState<Project | null>(initialProject || null);
  const [benchmarkResults, setBenchmarkResults] = useState<any[]>([]);

  // 调试日志
  useEffect(() => {
    console.log('[SkynetWithBenchmark] Component mounted');
    console.log('[SkynetWithBenchmark] Initial viewMode:', viewMode);
    return () => {
      console.log('[SkynetWithBenchmark] Component unmounted');
    };
  }, []);

  useEffect(() => {
    console.log('[SkynetWithBenchmark] viewMode changed to:', viewMode);
  }, [viewMode]);

  const handleProjectCreated = useCallback((project: Project) => {
    console.log('[SkynetWithBenchmark] Project created:', project);
    setLastCreatedProject(project);
    onProjectCreated?.(project);
  }, [onProjectCreated]);

  const handleModeChange = useCallback((mode: ViewMode) => {
    console.log('[SkynetWithBenchmark] handleModeChange called with:', mode);
    setViewMode(mode);
  }, []);

  const handleBenchmarkBack = useCallback(() => {
    console.log('[SkynetWithBenchmark] handleBenchmarkBack called');
    setViewMode('chat');
  }, []);

  const handleBenchmarkComplete = useCallback((results: any[]) => {
    console.log('[SkynetWithBenchmark] Benchmark complete, results:', results);
    setBenchmarkResults(results);
  }, []);

  console.log('[SkynetWithBenchmark] Rendering with viewMode:', viewMode);

  return (
    <div className="h-screen flex flex-col">
      {/* 全局顶栏 - 仅在chat模式显示 */}
      {viewMode === 'chat' && (
        <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Skynet</span>
          </div>

          <div className="flex items-center gap-3">
            <ModeSelector 
              currentMode={viewMode}
              onModeChange={handleModeChange}
            />
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </header>
      )}

      {/* 主内容区 */}
      <main className="flex-1 overflow-hidden">
        {(() => {
          console.log('[SkynetWithBenchmark] Rendering main content for viewMode:', viewMode);
          if (viewMode === 'chat') {
            console.log('[SkynetWithBenchmark] Rendering UnifiedChatInterface');
            return (
              <UnifiedChatInterface
                onProjectCreated={handleProjectCreated}
                onProjectUpdated={onProjectUpdated}
                initialProject={lastCreatedProject || initialProject}
              />
            );
          } else if (viewMode === 'repomaster') {
            console.log('[SkynetWithBenchmark] Rendering RepoMasterBenchmarkInterface');
            return (
              <RepoMasterBenchmarkInterface
                onBack={handleBenchmarkBack}
                onComplete={handleBenchmarkComplete}
              />
            );
          } else {
            console.log('[SkynetWithBenchmark] Rendering EnhancedBenchmarkInterface');
            return (
              <EnhancedBenchmarkInterface
                onBack={handleBenchmarkBack}
                onProjectCreated={(projectId) => {
                  console.log('[SkynetWithBenchmark] Benchmark created project:', projectId);
                }}
              />
            );
          }
        })()}
      </main>

      {/* 模式切换快捷按钮 - 仅在chat模式显示 */}
      {viewMode === 'chat' && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          {/* RepoMaster模式按钮 - 主推 */}
          <button
            onClick={() => {
              console.log('[SkynetWithBenchmark] RepoMaster button clicked');
              setViewMode('repomaster');
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all hover:scale-105"
            title="RepoMaster Benchmark (GitTaskBench/SWE-bench/MLE-bench)"
          >
            <FlaskConical className="w-4 h-4" />
            <span className="text-sm font-medium">RepoMaster Bench</span>
          </button>
          
          {/* 基础Benchmark模式按钮 */}
          <button
            onClick={() => {
              console.log('[SkynetWithBenchmark] Basic Bench button clicked');
              setViewMode('benchmark');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-all hover:scale-105 opacity-80"
            title="基础Benchmark模式"
          >
            <Layers className="w-4 h-4" />
            <span className="text-sm font-medium">Basic Bench</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SkynetWithBenchmark;