import React, { useEffect, useState } from 'react';
import { UnifiedChatInterface } from '@/components/Unified/UnifiedChatInterface';
import { EnhancedBenchmarkInterface } from '@/components/Benchmark/EnhancedBenchmarkInterface';
import { RepoMasterBenchmarkInterface } from '@/components/Benchmark/RepoMasterBenchmarkInterface';
import LoginPage from '@/pages/Login';
import { useAuthStore } from '@/store/auth';
import { api } from '@/services/api';
import { Sparkles, Layers, Settings, ChevronDown, FlaskConical } from 'lucide-react';

// v2: 扩展为三种模式
type ViewMode = 'chat' | 'benchmark' | 'repomaster';

/**
 * 模式选择器组件 - 支持三种模式
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
                💡 <strong>RepoMaster</strong>支持GitTaskBench等论文级Benchmark测试
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
    // 应用启动时检查认证状态
    const initAuth = async () => {
      try {
        // 先尝试从 localStorage 加载 token
        const token = localStorage.getItem('chatbot_token');
        if (token) {
          api.loadToken();
          console.log('[App] Token loaded on startup');
        }
        
        // 检查认证状态
        checkAuth();
      } catch (error) {
        console.error('[App] Auth initialization error:', error);
      } finally {
        setIsChecking(false);
      }
    };

    initAuth();
  }, [checkAuth]);

  // 监听 URL 变化（简单的路由实现）
  useEffect(() => {
    const handleLocationChange = () => {
      // 检查URL是否包含mode参数
      const urlParams = new URLSearchParams(window.location.search);
      const mode = urlParams.get('mode');
      if (mode === 'benchmark') {
        setViewMode('benchmark');
      } else if (mode === 'repomaster') {
        setViewMode('repomaster');
      }
      
      // 如果 URL 包含 /login 且已认证，重定向到主页
      if (window.location.pathname === '/login' && isAuthenticated) {
        window.history.pushState({}, '', '/');
      }
      // 如果不是 /login 且未认证，重定向到登录页
      else if (window.location.pathname !== '/login' && !isAuthenticated && !isChecking) {
        window.history.pushState({}, '', '/login');
      }
    };

    handleLocationChange();
    
    // 监听浏览器前进/后退
    window.addEventListener('popstate', handleLocationChange);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [isAuthenticated, isChecking]);

  // 处理模式切换
  const handleModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    // 更新URL参数
    const url = new URL(window.location.href);
    if (mode === 'benchmark') {
      url.searchParams.set('mode', 'benchmark');
    } else if (mode === 'repomaster') {
      url.searchParams.set('mode', 'repomaster');
    } else {
      url.searchParams.delete('mode');
    }
    window.history.pushState({}, '', url.toString());
  };

  // 获取当前模式的显示名称
  const getModeDisplayName = () => {
    switch (viewMode) {
      case 'chat': return 'Vibe Coding';
      case 'repomaster': return 'RepoMaster Bench';
      case 'benchmark': return 'Basic Benchmark';
      default: return 'Vibe Coding';
    }
  };

  // 加载中状态
  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative mb-8">
            {/* 外圈动画 */}
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 dark:border-blue-800"></div>
            {/* 内圈动画 */}
            <div className="absolute top-2 left-2 animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
            {/* 中心图标 */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">
            Skynet Console
          </h2>
          <p className="text-gray-500 dark:text-gray-400 animate-pulse">
            正在初始化AI系统...
          </p>
          
          {/* 加载进度指示器 */}
          <div className="mt-6 w-64 mx-auto">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div className="bg-blue-600 h-1 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 根据认证状态和 URL 显示不同的组件
  const currentPath = window.location.pathname;
  
  if (!isAuthenticated && currentPath !== '/login') {
    // 未认证且不在登录页，显示登录页
    window.history.pushState({}, '', '/login');
    return <LoginPage />;
  }
  
  if (isAuthenticated && currentPath === '/login') {
    // 已认证但在登录页，重定向到主页
    window.history.pushState({}, '', '/');
  }
  
  // 已认证，显示主应用
  if (isAuthenticated) {
    return (
      <div className="h-screen flex flex-col">
        {/* 全局顶栏 - 仅在chat模式显示 */}
        {viewMode === 'chat' && (
          <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <Sparkles className="w-5 h-5 text-white" />
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

        {/* 模式切换快捷入口浮窗（仅在chat模式显示） */}
        {viewMode === 'chat' && (
          <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
            {/* RepoMaster模式按钮 - 主推 */}
            <button
              onClick={() => handleModeChange('repomaster')}
              className="group flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
              title="RepoMaster Benchmark - GitTaskBench/SWE-bench/MLE-bench"
            >
              <FlaskConical className="w-5 h-5" />
              <span className="text-sm font-medium">RepoMaster</span>
            </button>
            
            {/* 基础Benchmark模式按钮 */}
            <button
              onClick={() => handleModeChange('benchmark')}
              className="group flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 opacity-80"
              title="Basic Benchmark - 基础步骤可视化"
            >
              <Layers className="w-4 h-4" />
              <span className="text-sm font-medium">Basic</span>
            </button>
          </div>
        )}
      </div>
    );
  }
  
  // 未认证，显示登录页
  return <LoginPage />;
}

export default App;