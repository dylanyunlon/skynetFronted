// src/components/Unified/LiveProjectPreview.tsx - 修复版本：增强AI生成项目支持
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  RefreshCw, ExternalLink, Monitor, Globe, Bug, Play,
  CheckCircle, AlertCircle, Eye, Clock, Wrench, Bot,
  Code, Shield, Zap, Activity, Settings
} from 'lucide-react';
import { Project } from '@/types';

interface LiveProjectPreviewProps {
  project: Project | null;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onExecuteProject?: (project: Project) => void;
  onEditFile?: (project: Project, filePath: string) => void;
  onFixPreviewUrl?: () => string | null;
}

interface PreviewState {
  loading: boolean;
  error: string | null;
  lastRefresh: Date | null;
  retryCount: number;
  isManualTesting: boolean;
  autoFixAttempted: boolean;
  aiGeneratedVerified: boolean;
}

export const LiveProjectPreview: React.FC<LiveProjectPreviewProps> = ({
  project,
  isExpanded = false,
  onToggleExpand,
  onExecuteProject,
  onEditFile,
  onFixPreviewUrl
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<PreviewState>({
    loading: false,
    error: null,
    lastRefresh: null,
    retryCount: 0,
    isManualTesting: false,
    autoFixAttempted: false,
    aiGeneratedVerified: false
  });
  const [debugMode, setDebugMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [aiMetrics, setAiMetrics] = useState<any>(null);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 验证AI生成项目
  const verifyAIGeneration = useCallback((project: Project): boolean => {
    const checks = [
      project.ai_generated === true,
      project.file_count > 0,
      project.id && project.id !== 'undefined',
      project.name && project.name !== 'undefined'
    ];
    
    const isValid = checks.every(check => check === true);
    
    setDebugInfo(`AI生成验证: ${isValid ? '✅ 通过' : '❌ 失败'} - ${checks.filter(c => c).length}/${checks.length}`);
    
    return isValid;
  }, []);

  // 修复预览URL
  const fixPreviewUrl = useCallback((url: string): string => {
    if (!url || url === 'None' || url === 'null' || url === 'undefined') {
      console.warn('[fixPreviewUrl] Invalid URL input:', url);
      return '';
    }
    
    let fixedUrl = url.replace(/localhost/g, '8.163.12.28')
                    .replace(/127\.0\.0\.1/g, '8.163.12.28');
    
    if (!fixedUrl.startsWith('http://') && !fixedUrl.startsWith('https://')) {
      fixedUrl = `http://${fixedUrl}`;
    }
    
    console.log(`[fixPreviewUrl] ${url} -> ${fixedUrl}`);
    setDebugInfo(`URL修复: ${url} -> ${fixedUrl}`);
    return fixedUrl;
  }, []);

  // 生成默认预览URL
  const generateDefaultPreviewUrl = useCallback((port: number = 17430): string => {
    const url = `http://8.163.12.28:${port}`;
    console.log(`[generateDefaultPreviewUrl] Generated: ${url} for port ${port}`);
    setDebugInfo(`生成默认URL: ${url}`);
    return url;
  }, []);

  // 智能获取预览URL - 针对AI生成项目优化
  const getSmartPreviewUrl = useCallback((project: Project): string => {
    console.group('🔍 [getSmartPreviewUrl] Analyzing AI-generated project for preview URL');
    console.log('Project data:', project);
    
    let url = '';
    let source = '';
    
    // 验证AI生成
    const isAIGenerated = verifyAIGeneration(project);
    
    if (isAIGenerated) {
      console.log('✅ AI-generated project verified');
      
      // 策略1: 使用项目的预览URL
      if (project.preview_url && 
          project.preview_url !== 'undefined' && 
          project.preview_url !== 'null' &&
          project.preview_url !== 'None') {
        url = fixPreviewUrl(project.preview_url);
        source = 'ai_project.preview_url';
        console.log('✅ Strategy 1 - Using AI project preview URL:', url);
      }
      // 策略2: 生成默认URL
      else {
        const port = 17430; // AI生成项目的默认端口
        url = generateDefaultPreviewUrl(port);
        source = 'ai_generated_default';
        console.log('✅ Strategy 2 - Generated default URL for AI project:', url);
      }
    } else {
      console.warn('⚠️ Project may not be AI-generated');
      url = generateDefaultPreviewUrl(17430);
      source = 'fallback_default';
    }
    
    console.log(`🎯 Final URL: ${url} (source: ${source})`);
    setDebugInfo(`智能获取URL: ${url} (来源: ${source}, AI生成: ${isAIGenerated})`);
    console.groupEnd();
    
    return url;
  }, [fixPreviewUrl, generateDefaultPreviewUrl, verifyAIGeneration]);

  // 自动修复预览URL - 针对AI生成项目
  const autoFixPreviewUrl = useCallback(async (): Promise<string | null> => {
    if (!project || previewState.autoFixAttempted) {
      return null;
    }
    
    console.log('🔧 [autoFixPreviewUrl] Attempting to auto-fix AI project preview URL');
    setPreviewState(prev => ({ ...prev, autoFixAttempted: true }));
    
    try {
      // 验证AI生成
      const isAIGenerated = verifyAIGeneration(project);
      
      if (isAIGenerated) {
        console.log('✅ AI-generated project verified, proceeding with fix');
        
        // 尝试使用外部修复函数
        if (onFixPreviewUrl) {
          const fixedUrl = onFixPreviewUrl();
          if (fixedUrl) {
            console.log('✅ [autoFixPreviewUrl] Fixed via AI callback:', fixedUrl);
            setPreviewUrl(fixedUrl);
            setDebugInfo(`AI项目自动修复成功: ${fixedUrl}`);
            return fixedUrl;
          }
        }
        
        // 备用修复：为AI生成项目生成默认URL
        const defaultUrl = generateDefaultPreviewUrl(17430);
        setPreviewUrl(defaultUrl);
        setDebugInfo(`AI项目备用修复: ${defaultUrl}`);
        console.log('🔄 [autoFixPreviewUrl] Using fallback URL for AI project:', defaultUrl);
        
        return defaultUrl;
      } else {
        console.warn('⚠️ Project is not AI-generated, using standard fix');
        const fallbackUrl = generateDefaultPreviewUrl(17430);
        setPreviewUrl(fallbackUrl);
        setDebugInfo(`非AI项目修复: ${fallbackUrl}`);
        return fallbackUrl;
      }
    } catch (error) {
      console.error('❌ [autoFixPreviewUrl] Failed:', error);
      setDebugInfo(`自动修复失败: ${error.message}`);
      return null;
    }
  }, [project, previewState.autoFixAttempted, onFixPreviewUrl, generateDefaultPreviewUrl, verifyAIGeneration]);

  // 测试URL连接 - 增强版本
  const testUrlConnection = useCallback(async (url: string): Promise<boolean> => {
    try {
      setDebugInfo(`测试AI项目连接: ${url}`);
      console.log(`[testUrlConnection] Testing AI project: ${url}`);
      
      // 方法1: 尝试fetch HEAD请求
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 50000);
      
      try {
        const response = await fetch(url, {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal,
          cache: 'no-cache'
        });
        clearTimeout(timeoutId);
        setDebugInfo(`AI项目连接测试成功: ${url}`);
        return true;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // 方法2: 尝试图片加载测试
        return new Promise((resolve) => {
          const img = new Image();
          const imgTimeout = setTimeout(() => {
            resolve(false);
            setDebugInfo(`AI项目连接测试失败: ${url} - ${fetchError.message}`);
          }, 30000);
          
          img.onload = () => {
            clearTimeout(imgTimeout);
            setDebugInfo(`AI项目连接测试成功(图片): ${url}`);
            resolve(true);
          };
          
          img.onerror = () => {
            clearTimeout(imgTimeout);
            setDebugInfo(`AI项目连接测试失败(图片): ${url}`);
            resolve(false);
          };
          
          img.src = `${url}/favicon.ico?t=${Date.now()}`;
        });
      }
    } catch (error) {
      setDebugInfo(`AI项目连接测试异常: ${url} - ${error.message}`);
      return false;
    }
  }, []);

  // 收集AI项目指标
  const collectAIMetrics = useCallback((project: Project) => {
    if (!project.ai_generated) return;
    
    const metrics = {
      project_id: project.id,
      name: project.name,
      type: project.type,
      file_count: project.file_count,
      status: project.status,
      preview_url: project.preview_url,
      created_at: project.created_at,
      ai_generated: project.ai_generated,
      verification_passed: verifyAIGeneration(project),
      preview_accessible: previewUrl !== null && previewUrl !== '',
      last_check: new Date().toISOString()
    };
    
    setAiMetrics(metrics);
    console.log('📊 AI Project Metrics:', metrics);
  }, [verifyAIGeneration, previewUrl]);

  // 强制刷新预览 - 针对AI生成项目
  const forceRefreshPreview = useCallback(async () => {
    if (!previewUrl) {
      const fixedUrl = await autoFixPreviewUrl();
      if (!fixedUrl) return;
    }
    
    console.log('[forceRefreshPreview] Force refreshing AI project preview...');
    setPreviewState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const urlToTest = previewUrl!;
      const isConnected = await testUrlConnection(urlToTest);
      
      if (isConnected) {
        // 强制刷新iframe
        if (iframeRef.current) {
          const timestamp = Date.now();
          const urlWithTimestamp = `${urlToTest}?t=${timestamp}`;
          iframeRef.current.src = urlWithTimestamp;
          setDebugInfo(`AI项目强制刷新iframe: ${urlWithTimestamp}`);
        }
        
        setPreviewState(prev => ({ 
          ...prev, 
          loading: false, 
          error: null, 
          lastRefresh: new Date(),
          retryCount: 0
        }));
      } else {
        throw new Error('AI项目预览服务连接失败');
      }
    } catch (error) {
      setPreviewState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message,
        retryCount: prev.retryCount + 1
      }));
    }
  }, [previewUrl, testUrlConnection, autoFixPreviewUrl]);

  // 直接测试端口 - 增强版本
  const testSpecificPort = useCallback(async (port: number) => {
    const testUrl = `http://8.163.12.28:${port}`;
    setPreviewState(prev => ({ ...prev, isManualTesting: true }));
    setDebugInfo(`手动测试AI项目端口 ${port}...`);
    
    const isConnected = await testUrlConnection(testUrl);
    
    const result = {
      port,
      url: testUrl,
      connected: isConnected,
      timestamp: new Date().toLocaleTimeString(),
      ai_project: project?.ai_generated || false
    };
    
    setTestResults(prev => [result, ...prev.slice(0, 4)]);
    
    if (isConnected) {
      setPreviewUrl(testUrl);
      setPreviewState(prev => ({ 
        ...prev, 
        isManualTesting: false, 
        error: null,
        autoFixAttempted: false
      }));
      setDebugInfo(`AI项目端口 ${port} 测试成功，已设置为预览URL`);
    } else {
      setPreviewState(prev => ({ ...prev, isManualTesting: false }));
      setDebugInfo(`AI项目端口 ${port} 测试失败`);
    }
  }, [testUrlConnection, project]);

  // 手动修复按钮
  const handleManualFix = useCallback(async () => {
    console.log('🔧 [handleManualFix] Manual fix triggered for AI project');
    setPreviewState(prev => ({ ...prev, autoFixAttempted: false }));
    const fixedUrl = await autoFixPreviewUrl();
    if (fixedUrl) {
      const isConnected = await testUrlConnection(fixedUrl);
      if (!isConnected) {
        setPreviewState(prev => ({ 
          ...prev, 
          error: 'AI项目修复的URL无法连接，请尝试手动测试端口' 
        }));
      }
    }
  }, [autoFixPreviewUrl, testUrlConnection]);

  // 项目变化时的处理 - 专门针对AI生成项目
  useEffect(() => {
    console.group('🔄 [useEffect] AI Project changed');
    console.log('New project:', project);
    
    if (project) {
      // 重置状态
      setPreviewState(prev => ({ 
        ...prev, 
        autoFixAttempted: false, 
        error: null,
        aiGeneratedVerified: false
      }));
      
      // 验证AI生成
      const isAIGenerated = verifyAIGeneration(project);
      setPreviewState(prev => ({ ...prev, aiGeneratedVerified: isAIGenerated }));
      
      // 收集AI指标
      collectAIMetrics(project);
      
      // 检查预览URL状态
      console.log('Project preview_url:', project.preview_url);
      console.log('Project ai_generated:', project.ai_generated);
      
      if (!project.preview_url || 
          project.preview_url === 'undefined' || 
          project.preview_url === 'null' ||
          project.preview_url === 'None') {
        
        console.warn('⚠️ AI Project has invalid preview_url, will attempt auto-fix');
        setDebugInfo(`AI项目预览URL无效，准备自动修复... (AI生成: ${isAIGenerated})`);
        
        // 延迟自动修复，给AI生成的项目一些时间
        const timer = setTimeout(async () => {
          const fixedUrl = await autoFixPreviewUrl();
          if (!fixedUrl) {
            setPreviewState(prev => ({ 
              ...prev, 
              error: `AI项目无法获取预览URL，请手动测试端口或等待服务启动 (验证: ${isAIGenerated})` 
            }));
          }
        }, 2000);
        
        return () => clearTimeout(timer);
      } else {
        // AI项目有有效的预览URL
        const url = getSmartPreviewUrl(project);
        setPreviewUrl(url);
        setDebugInfo(`使用AI项目预览URL: ${url} (验证: ${isAIGenerated})`);
        
        // 延迟测试连接
        const timer = setTimeout(() => {
          testUrlConnection(url).then(connected => {
            if (!connected) {
              setPreviewState(prev => ({ 
                ...prev, 
                error: `AI项目预览服务可能还在启动中，请稍后重试或手动测试端口 (验证: ${isAIGenerated})` 
              }));
            }
          });
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    } else {
      setPreviewUrl(null);
      setDebugInfo('无AI项目数据');
      setAiMetrics(null);
    }
    
    console.groupEnd();
  }, [project, getSmartPreviewUrl, testUrlConnection, autoFixPreviewUrl, verifyAIGeneration, collectAIMetrics]);

  // iframe加载事件
  const handleIframeLoad = useCallback(() => {
    console.log('[Preview] AI Project iframe loaded successfully');
    setPreviewState(prev => ({ ...prev, loading: false, error: null }));
    setDebugInfo(`AI项目Iframe加载成功: ${previewUrl}`);
    
    // 更新AI指标
    if (project?.ai_generated) {
      collectAIMetrics(project);
    }
  }, [previewUrl, project, collectAIMetrics]);

  const handleIframeError = useCallback(() => {
    console.error('[Preview] AI Project iframe failed to load');
    setPreviewState(prev => ({ 
      ...prev, 
      loading: false, 
      error: 'AI项目Iframe加载失败，请尝试新窗口打开' 
    }));
    setDebugInfo(`AI项目Iframe加载失败: ${previewUrl}`);
  }, [previewUrl]);

  // 打开新窗口
  const openInNewWindow = useCallback(() => {
    if (previewUrl) {
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
      setDebugInfo(`AI项目新窗口打开: ${previewUrl}`);
    }
  }, [previewUrl]);

  // 如果没有项目
  if (!project) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Monitor className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>等待AI项目创建...</p>
          <div className="mt-4 space-y-2">
            <button
              onClick={() => testSpecificPort(17430)}
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              直接测试17430端口
            </button>
            <div className="text-xs text-gray-400">
              <Bot className="w-4 h-4 inline mr-1" />
              等待AI生成项目...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* 预览控制栏 */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {project.ai_generated && (
                <Bot className="w-4 h-4 text-blue-500" aria-label="AI生成项目" />
              )}
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {project.name || '项目预览'}
            </span>
            {project.ai_generated && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                AI生成
              </span>
            )}
            {previewUrl && (
              <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {previewUrl}
              </code>
            )}
            {(!previewUrl || previewUrl === 'undefined') && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                URL未设置
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {/* AI指标显示 */}
            {project.ai_generated && (
              <button
                onClick={() => setDebugMode(!debugMode)}
                className={`p-2 rounded transition-colors ${
                  debugMode ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                aria-label="AI项目指标"
              >
                <Activity className="w-4 h-4" />
              </button>
            )}
            
            {/* 调试开关 */}
            <button
              onClick={() => setDebugMode(!debugMode)}
              className={`p-2 rounded transition-colors ${
                debugMode ? 'bg-yellow-100 text-yellow-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label="调试模式"
            >
              <Bug className="w-4 h-4" />
            </button>
            
            {/* 手动修复按钮 */}
            {(!previewUrl || previewState.error) && (
              <button
                onClick={handleManualFix}
                className="p-2 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded transition-colors"
                aria-label="手动修复预览URL"
              >
                <Wrench className="w-4 h-4" />
              </button>
            )}
            
            {/* 端口测试按钮 */}
            <button
              onClick={() => testSpecificPort(17430)}
              disabled={previewState.isManualTesting}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              aria-label="测试17430端口"
            >
              <Play className="w-4 h-4" />
            </button>
            
            {/* 刷新按钮 */}
            <button
              onClick={forceRefreshPreview}
              disabled={previewState.loading}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              aria-label="强制刷新"
            >
              <RefreshCw className={`w-4 h-4 ${previewState.loading ? 'animate-spin' : ''}`} />
            </button>
            
            {/* 新窗口打开 */}
            {previewUrl && previewUrl !== 'undefined' && (
              <button
                onClick={openInNewWindow}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                aria-label="新窗口打开"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* 调试信息面板 */}
        {debugMode && (
          <div className="mt-3 space-y-2">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
              <div className="font-medium mb-1">AI项目调试信息:</div>
              <div><strong>项目ID:</strong> {project.id}</div>
              <div><strong>AI生成:</strong> {project.ai_generated ? '✅ 是' : '❌ 否'}</div>
              <div><strong>验证通过:</strong> {previewState.aiGeneratedVerified ? '✅ 是' : '❌ 否'}</div>
              <div><strong>当前预览URL:</strong> {previewUrl || '未设置'}</div>
              <div><strong>项目预览URL:</strong> {project.preview_url || '未设置'}</div>
              <div><strong>文件数量:</strong> {project.file_count}</div>
              <div><strong>项目状态:</strong> {project.status}</div>
              <div><strong>状态:</strong> {previewState.loading ? '加载中' : '空闲'}</div>
              <div><strong>错误:</strong> {previewState.error || '无'}</div>
              <div><strong>重试次数:</strong> {previewState.retryCount}</div>
              <div><strong>自动修复:</strong> {previewState.autoFixAttempted ? '已尝试' : '未尝试'}</div>
              <div className="mt-1 text-blue-600 dark:text-blue-400">{debugInfo}</div>
            </div>
            
            {/* AI指标显示 */}
            {aiMetrics && (
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded text-xs">
                <div className="font-medium mb-1">AI项目指标:</div>
                <div><strong>验证通过:</strong> {aiMetrics.verification_passed ? '✅' : '❌'}</div>
                <div><strong>预览可访问:</strong> {aiMetrics.preview_accessible ? '✅' : '❌'}</div>
                <div><strong>最后检查:</strong> {new Date(aiMetrics.last_check).toLocaleTimeString()}</div>
              </div>
            )}
            
            {/* 测试结果 */}
            {testResults.length > 0 && (
              <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded text-xs">
                <div className="font-medium mb-1">端口测试结果:</div>
                {testResults.map((result, index) => (
                  <div key={index} className={`flex justify-between items-center ${result.connected ? 'text-green-600' : 'text-red-600'}`}>
                    <span>端口{result.port}</span>
                    <span>{result.connected ? '✅' : '❌'}</span>
                    <span className="text-xs">{result.timestamp}</span>
                    {result.ai_project && <Bot className="w-3 h-3 text-blue-500" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* 错误提示 */}
        {previewState.error && !debugMode && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-sm">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span>{previewState.error}</span>
              {project.ai_generated && (
                <Bot className="w-4 h-4 text-blue-500" aria-label="AI生成项目" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* 预览内容区 */}
      <div className="h-96">
        {previewUrl && previewUrl !== 'undefined' ? (
          <div className="relative h-full">
            {previewState.loading && (
              <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center z-10">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                <span className="ml-2 text-sm text-gray-600">
                  {project.ai_generated ? 'AI项目加载中...' : '加载中...'}
                </span>
              </div>
            )}
            
            {previewState.isManualTesting && (
              <div className="absolute inset-0 bg-blue-50/80 dark:bg-blue-900/80 flex items-center justify-center z-10">
                <Clock className="w-6 h-6 animate-pulse text-blue-500" />
                <span className="ml-2 text-sm text-blue-600">
                  测试AI项目连接中...
                </span>
              </div>
            )}
            
            <iframe
              ref={iframeRef}
              src={previewUrl}
              className="w-full h-full border-0"
              title={project.ai_generated ? "AI生成项目预览" : "项目预览"}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-same-origin allow-scripts allow-forms"
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <Monitor className="w-12 h-12 text-gray-300" />
                {project.ai_generated && (
                  <Bot className="w-8 h-8 text-blue-500 ml-2" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {project.ai_generated ? 'AI项目预览URL未设置' : '预览URL未设置'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {project.ai_generated ? 
                  `AI生成项目预览URL无效或未设置 (当前: ${project.preview_url || 'undefined'})` :
                  `项目预览URL无效或未设置 (当前: ${project.preview_url || 'undefined'})`
                }
              </p>
              <div className="space-y-2">
                <button
                  onClick={handleManualFix}
                  className="block w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Wrench className="w-4 h-4" />
                  {project.ai_generated ? '修复AI项目预览URL' : '自动修复预览URL'}
                </button>
                <button
                  onClick={() => testSpecificPort(17430)}
                  className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  测试17430端口
                </button>
                <button
                  onClick={() => testSpecificPort(17431)}
                  className="block w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  测试17431端口
                </button>
                <button
                  onClick={() => setDebugMode(true)}
                  className="block w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  开启调试模式
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 快捷操作栏 */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-700/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            {project.ai_generated && (
              <div className="flex items-center gap-1">
                <Bot className="w-4 h-4 text-blue-500" />
                <span>AI生成项目</span>
              </div>
            )}
            {previewUrl && previewUrl !== 'undefined' && (
              <>
                <Globe className="w-4 h-4" />
                <span>预览:</span>
                <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-xs">
                  {previewUrl}
                </code>
              </>
            )}
          </div>
          
          <div className="flex gap-2">
            {/* 常用端口快速测试 */}
            {[17430, 17431, 17432].map(port => (
              <button
                key={port}
                onClick={() => testSpecificPort(port)}
                className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                title={`测试端口${port}`}
              >
                {port}
              </button>
            ))}
            
            {/* AI项目特殊功能 */}
            {project.ai_generated && (
              <button
                onClick={() => collectAIMetrics(project)}
                className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                aria-label="刷新AI指标"
              >
                <Activity className="w-3 h-3" />
              </button>
            )}
            
            {previewUrl && previewUrl !== 'undefined' && (
              <button
                onClick={openInNewWindow}
                className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                新窗口打开
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};