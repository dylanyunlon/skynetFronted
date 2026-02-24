import React, { useEffect, useState } from 'react';
import { UnifiedChatInterface } from '@/components/Unified/UnifiedChatInterface';
import { EnhancedBenchmarkInterface } from '@/components/Benchmark/EnhancedBenchmarkInterface';
import { RepoMasterBenchmarkInterface } from '@/components/Benchmark/RepoMasterBenchmarkInterface';
import { AgenticWorkspace } from '@/components/Agentic/AgenticWorkspace';
import LoginPage from '@/pages/Login';
import { useAuthStore } from '@/store/auth';
import { api } from '@/services/api';
import { Sparkles, Layers, Settings, ChevronDown, FlaskConical, Terminal } from 'lucide-react';

// v3: 四种模式 — 新增 Agentic Loop
type ViewMode = 'chat' | 'agentic' | 'benchmark' | 'repomaster';

/**
 * 模式选择器组件 - 支持四种模式
 */
const ModeSelector: React.FC<{
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}> = ({ currentMode, onModeChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const modes = [
    {
      id: 'chat' as const,
      name: 'Vibe Coding',
      description: '端到端AI项目生成',
      icon: Sparkles,
      gradient: 'from-indigo-500 to-purple-500',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600'
    },
    {
      id: 'agentic' as const,
      name: 'Agentic Loop',
      description: 'Claude Code 风格自主编程',
      icon: Terminal,
      gradient: 'from-cyan-500 to-blue-600',
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-600'
    },
    {
      id: 'repomaster' as const,
      name: 'RepoMaster Bench',
      description: 'GitTaskBench/SWE-bench/MLE-bench',
      icon: FlaskConical,
      gradient: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    {
      id: 'benchmark' as const,
      name: 'Basic Benchmark',
      description: '基础非端到端步骤可视化',
      icon: Layers,
      gradient: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ];

  const currentModeInfo = modes.find(m => m.id === currentMode)!;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <currentModeInfo.icon className={`w-4 h-4 ${currentModeInfo.iconColor}`} />
        <span className="text-sm font-medium text-gray-700">{currentModeInfo.name}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-20">
            {modes.map(mode => (
              <button
                key={mode.id}
                onClick={() => {
                  onModeChange(mode.id);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                  currentMode === mode.id ? 'bg-gray-50' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${mode.gradient} flex items-center justify-center flex-shrink-0`}>
                  <mode.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-gray-900">{mode.name}</div>
                  <div className="text-xs text-gray-500">{mode.description}</div>
                </div>
                {currentMode === mode.id && (
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                )}
              </button>
            ))}

            <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
              <p className="text-xs text-gray-500">
                💡 <strong>Agentic Loop</strong> — AI自主调用工具循环直到完成任务
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

function App() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('chat');

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('chatbot_token');
        if (token) {
          api.loadToken();
          console.log('[App] Token loaded on startup');
        }
        checkAuth();
      } catch (error) {
        console.error('[App] Auth initialization error:', error);
      } finally {
        setIsChecking(false);
      }
    };

    initAuth();
  }, [checkAuth]);

  // URL 路由
  useEffect(() => {
    const handleLocationChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const mode = urlParams.get('mode');
      if (mode === 'benchmark') {
        setViewMode('benchmark');
      } else if (mode === 'repomaster') {
        setViewMode('repomaster');
      } else if (mode === 'agentic') {
        setViewMode('agentic');
      }
      
      if (window.location.pathname === '/login' && isAuthenticated) {
        window.history.pushState({}, '', '/');
      }
      else if (window.location.pathname !== '/login' && !isAuthenticated && !isChecking) {
        window.history.pushState({}, '', '/login');
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [isAuthenticated, isChecking]);

  const handleModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    const url = new URL(window.location.href);
    if (mode === 'chat') {
      url.searchParams.delete('mode');
    } else {
      url.searchParams.set('mode', mode);
    }
    window.history.pushState({}, '', url.toString());
  };

  const getModeDisplayName = () => {
    switch (viewMode) {
      case 'chat': return 'Vibe Coding';
      case 'agentic': return 'Agentic Loop';
      case 'repomaster': return 'RepoMaster Bench';
      case 'benchmark': return 'Basic Benchmark';
      default: return 'Vibe Coding';
    }
  };

  // Loading
  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 dark:border-blue-800"></div>
            <div className="absolute top-2 left-2 animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">Skynet Console</h2>
          <p className="text-gray-500 dark:text-gray-400 animate-pulse">正在初始化AI系统...</p>
          <div className="mt-6 w-64 mx-auto">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div className="bg-blue-600 h-1 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentPath = window.location.pathname;
  
  if (!isAuthenticated && currentPath !== '/login') {
    window.history.pushState({}, '', '/login');
    return <LoginPage />;
  }
  
  if (isAuthenticated && currentPath === '/login') {
    window.history.pushState({}, '', '/');
  }
  
  if (isAuthenticated) {
    return (
      <div className="h-screen flex flex-col">
        {/* 顶栏 — 在 chat 和 agentic 模式显示 */}
        {(viewMode === 'chat' || viewMode === 'agentic') && (
          <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${
                viewMode === 'agentic' 
                  ? 'from-cyan-600 to-blue-700' 
                  : 'from-indigo-600 to-purple-600'
              } flex items-center justify-center shadow-lg ${
                viewMode === 'agentic' ? 'shadow-cyan-200' : 'shadow-indigo-200'
              }`}>
                {viewMode === 'agentic' 
                  ? <Terminal className="w-5 h-5 text-white" />
                  : <Sparkles className="w-5 h-5 text-white" />
                }
              </div>
              <div>
                <span className="font-bold text-gray-900">Skynet</span>
                <span className="text-xs text-gray-500 ml-2">{getModeDisplayName()}</span>
              </div>
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
          {viewMode === 'chat' ? (
            <UnifiedChatInterface />
          ) : viewMode === 'agentic' ? (
            <AgenticWorkspace />
          ) : viewMode === 'repomaster' ? (
            <RepoMasterBenchmarkInterface
              onBack={() => handleModeChange('chat')}
              onComplete={(results) => {
                console.log('[App] RepoMaster Benchmark complete:', results);
              }}
            />
          ) : (
            <EnhancedBenchmarkInterface
              onBack={() => handleModeChange('chat')}
            />
          )}
        </main>

        {/* 浮窗快捷入口 — 仅在 chat 模式显示 */}
        {viewMode === 'chat' && (
          <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
            {/* Agentic Loop 按钮 — 最主推 */}
            <button
              onClick={() => handleModeChange('agentic')}
              className="group flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
              title="Agentic Loop — Claude Code 风格自主编程"
            >
              <Terminal className="w-5 h-5" />
              <span className="text-sm font-medium">Agentic Loop</span>
            </button>

            {/* RepoMaster 按钮 */}
            <button
              onClick={() => handleModeChange('repomaster')}
              className="group flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 opacity-90"
              title="RepoMaster Benchmark"
            >
              <FlaskConical className="w-4 h-4" />
              <span className="text-sm font-medium">RepoMaster</span>
            </button>
            
            {/* 基础Benchmark */}
            <button
              onClick={() => handleModeChange('benchmark')}
              className="group flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 opacity-80"
              title="Basic Benchmark"
            >
              <Layers className="w-4 h-4" />
              <span className="text-sm font-medium">Basic</span>
            </button>
          </div>
        )}
      </div>
    );
  }
  
  return <LoginPage />;
}

export default App;