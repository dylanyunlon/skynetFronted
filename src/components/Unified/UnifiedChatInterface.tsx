import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Send, Loader2, Sparkles, Play, Code2, 
  Settings, RefreshCw, ExternalLink, Download,
  Monitor, Smartphone, Tablet, Maximize2,
  Eye, EyeOff, RotateCcw, Save, Share2,
  MessageSquare, Zap, CheckCircle, AlertCircle,
  Clock, ArrowRight, Edit3, Bug
} from 'lucide-react';
import { api, detectVibeCodingIntent } from '@/services/api';
import { useAuthStore } from '@/store/auth';
import { useChat } from '@/hooks/useChat';
import { useVibeCoding, useVibeCodingSteps, useVibeCodingIntentDetection } from '@/hooks/useVibeCoding';
import { ChatInput } from '@/components/Chat/ChatInput';
import { ChatMessage } from '@/components/Chat/ChatMessage';
import LovableStyleWaiting from './LovableStyleWaiting';
import { 
  Message, 
  Project, 
  VibeCodingStage, 
  ProcessingStep, 
  ProjectPreviewState 
} from '@/types';

interface UnifiedChatInterfaceProps {
  onProjectCreated?: (project: Project) => void;
  onProjectUpdated?: (project: Project) => void;
  initialProject?: Project;
}

export const UnifiedChatInterface: React.FC<UnifiedChatInterfaceProps> = ({
  onProjectCreated,
  onProjectUpdated,
  initialProject
}) => {
  // 现有聊天功能
  const { 
    sendMessage: sendChatMessage, 
    currentConversation, 
    isLoading: chatLoading 
  } = useChat();

  // Vibe Coding 功能
  const {
    stage: vibeStage,
    loading: vibeLoading,
    error: vibeError,
    session: vibeSession,
    currentProject: vibeProject,
    startVibeCoding,
    confirmGenerate,
    modifyRequirement,
    reset: resetVibe
  } = useVibeCoding();

  // 意图检测
  const detectVibeIntent = useVibeCodingIntentDetection();

  // 处理步骤
  const processingSteps = useVibeCodingSteps(vibeStage);

  // UI 状态
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isVibeMode, setIsVibeMode] = useState(false);
  const [showModifyInput, setShowModifyInput] = useState(false);
  const [modifyInputValue, setModifyInputValue] = useState('');
  const [currentProject, setCurrentProject] = useState<Project | null>(initialProject || null);
  const [previewState, setPreviewState] = useState<ProjectPreviewState>({
    mode: 'desktop',
    showCode: false,
    isFullscreen: false,
    currentFile: null,
    loading: false,
    error: null
  });
  
  // 调试状态
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // 修复滚动定位的关键refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const { user } = useAuthStore();

  // 调试信息更新
  const updateDebugInfo = useCallback((info: any) => {
    setDebugInfo(prev => ({
      ...prev,
      timestamp: new Date().toISOString(),
      ...info
    }));
    console.log('[DEBUG]', info);
  }, []);

  // 添加消息到聊天
  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
    updateDebugInfo({ action: 'message_added', message_id: message.id, role: message.role });
  }, [updateDebugInfo]);

  // 生成预览URL的辅助函数
  const generatePreviewUrl = useCallback((projectId: string, originalUrl?: string) => {
    // 如果有原始URL且不是 'None'，使用原始URL
    if (originalUrl && originalUrl !== 'None' && originalUrl !== 'undefined') {
      return originalUrl;
    }
    
    // 否则生成默认URL
    return `http://8.163.12.28:17430`;
  }, []);

  // 处理消息发送 - 增强调试版本
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    updateDebugInfo({ action: 'send_message_start', content: content.substring(0, 50) + '...' });

    // 创建用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date()
    };

    addMessage(userMessage);
    setInput('');

    // 检测是否为 Vibe Coding 意图
    const isVibeIntent = detectVibeIntent(content);
    updateDebugInfo({ 
      action: 'intent_detection', 
      isVibeIntent, 
      vibeStage, 
      content: content.substring(0, 50) 
    });

    if (isVibeIntent && vibeStage === 'idle') {
      console.log('[UnifiedChat] Detected Vibe Coding intent, starting...');
      setIsVibeMode(true);
      updateDebugInfo({ action: 'vibe_mode_activated', stage: vibeStage });
      
      try {
        await startVibeCoding(content, currentConversation?.id);
        updateDebugInfo({ action: 'vibe_coding_started', success: true });
      } catch (error) {
        updateDebugInfo({ action: 'vibe_coding_error', error: error.message });
        console.error('[UnifiedChat] Vibe Coding start failed:', error);
      }
      return;
    }

    // 普通聊天处理
    try {
      updateDebugInfo({ action: 'regular_chat_start' });
      await sendChatMessage(content);
      updateDebugInfo({ action: 'regular_chat_success' });
    } catch (error) {
      console.error('[UnifiedChat] Failed to send message:', error);
      updateDebugInfo({ action: 'regular_chat_error', error: error.message });
      addMessage({
        id: Date.now().toString(),
        content: `❌ 发送失败: ${error}`,
        role: 'assistant',
        timestamp: new Date(),
        metadata: { isError: true }
      });
    }
  }, [detectVibeIntent, vibeStage, currentConversation, startVibeCoding, sendChatMessage, addMessage, updateDebugInfo]);

  // 处理 Vibe Coding 确认生成
  const handleConfirmGenerate = useCallback(async () => {
    console.log('[UnifiedChat] Confirming project generation...');
    updateDebugInfo({ action: 'confirm_generate_start' });
    
    try {
      await confirmGenerate();
      updateDebugInfo({ action: 'confirm_generate_success' });
    } catch (error) {
      updateDebugInfo({ action: 'confirm_generate_error', error: error.message });
    }
  }, [confirmGenerate, updateDebugInfo]);

  // 处理 Vibe Coding 需求修改
  const handleModifyRequirement = useCallback(async () => {
    if (!modifyInputValue.trim()) return;
    
    console.log('[UnifiedChat] Modifying requirement:', modifyInputValue);
    updateDebugInfo({ action: 'modify_requirement_start', modification: modifyInputValue });
    
    try {
      await modifyRequirement(modifyInputValue);
      setModifyInputValue('');
      setShowModifyInput(false);
      updateDebugInfo({ action: 'modify_requirement_success' });
    } catch (error) {
      updateDebugInfo({ action: 'modify_requirement_error', error: error.message });
    }
  }, [modifyInputValue, modifyRequirement, updateDebugInfo]);

  // 退出 Vibe 模式
  const exitVibeMode = useCallback(() => {
    console.log('[UnifiedChat] Exiting Vibe mode');
    updateDebugInfo({ action: 'exit_vibe_mode' });
    setIsVibeMode(false);
    resetVibe();
    setShowModifyInput(false);
    setModifyInputValue('');
  }, [resetVibe, updateDebugInfo]);

  // 强制重试当前操作
  const forceRetry = useCallback(async () => {
    updateDebugInfo({ action: 'force_retry_start', vibeStage, vibeSession });
    
    if (vibeStage === 'meta_processing' || vibeStage === 'error') {
      // 重试 Meta 阶段
      if (vibeSession?.original_input) {
        await startVibeCoding(vibeSession.original_input, vibeSession.conversation_id);
      }
    } else if (vibeStage === 'meta_complete') {
      // 重试 Generate 阶段
      await confirmGenerate();
    }
  }, [vibeStage, vibeSession, startVibeCoding, confirmGenerate, updateDebugInfo]);

  // 刷新预览
  const refreshPreview = useCallback(async () => {
    if (previewRef.current && currentProject?.preview_url) {
      setPreviewState(prev => ({ ...prev, loading: true }));
      
      try {
        updateDebugInfo({ action: 'refresh_preview_start', project_id: currentProject.id });
        
        // 检查预览状态
        if (currentProject.id) {
          const status = await api.getProjectPreviewStatus(currentProject.id);
          if (status.preview_url) {
            previewRef.current.src = status.preview_url;
            updateDebugInfo({ action: 'refresh_preview_success', preview_url: status.preview_url });
          }
        }
      } catch (error) {
        console.error('[UnifiedChat] Preview refresh failed:', error);
        updateDebugInfo({ action: 'refresh_preview_error', error: error.message });
        setPreviewState(prev => ({ 
          ...prev, 
          error: 'Preview refresh failed' 
        }));
      } finally {
        setPreviewState(prev => ({ ...prev, loading: false }));
      }
    }
  }, [currentProject, updateDebugInfo]);

  // 预览控制
  const togglePreviewMode = useCallback((mode: ProjectPreviewState['mode']) => {
    setPreviewState(prev => ({ ...prev, mode }));
  }, []);

  const toggleCodeView = useCallback(() => {
    setPreviewState(prev => ({ ...prev, showCode: !prev.showCode }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    setPreviewState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  }, []);

  // 监听 Vibe Coding 状态变化 - 增强调试版本
  useEffect(() => {
    updateDebugInfo({ 
      action: 'vibe_state_change', 
      vibeStage, 
      hasSession: !!vibeSession, 
      hasProject: !!vibeProject,
      hasError: !!vibeError,
      sessionData: vibeSession ? {
        stage: vibeSession.stage,
        hasMetaResponse: !!vibeSession.meta_response,
        hasGenerateResponse: !!vibeSession.generate_response
      } : null
    });

    if (vibeStage === 'meta_complete' && vibeSession?.meta_response) {
      updateDebugInfo({ action: 'meta_complete_detected', meta_response: vibeSession.meta_response });
      
      // Meta 阶段完成，显示优化后的项目描述
      const content = vibeSession.meta_response.vibe_data?.optimized_description || '项目需求已优化';
      addMessage({
        id: Date.now().toString(),
        content: content,
        role: 'assistant',
        timestamp: new Date(),
        metadata: {
          stage: 'meta_complete',
          vibe_data: vibeSession.meta_response.vibe_data,
          suggestions: vibeSession.meta_response.suggestions
        }
      });
    } else if (vibeStage === 'generate_complete' && vibeSession?.generate_response) {
      updateDebugInfo({ action: 'generate_complete_detected', generate_response: vibeSession.generate_response });
      
      // Generate 阶段完成，显示项目创建结果
      const projectData = vibeSession.generate_response.project_created;
      
      if (projectData) {
        let content = `✅ **项目创建成功！**\n\n`;
        content += `📁 **项目名称**: ${projectData.project_name || '未命名项目'}\n`;
        content += `🆔 **项目ID**: ${projectData.project_id || '未知'}\n`;
        content += `📄 **文件数量**: ${projectData.files_created || 0}\n`;
        
        // 生成预览URL
        const previewUrl = generatePreviewUrl(projectData.project_id, projectData.preview_url);
        content += `🌐 **预览链接**: [点击查看](${previewUrl})\n`;
        
        content += `\n💡 **提示**: 你可以继续与我对话来修改和优化这个项目。`;

        addMessage({
          id: Date.now().toString(),
          content: content,
          role: 'assistant',
          timestamp: new Date(),
          metadata: {
            stage: 'generate_complete',
            project_created: projectData,
            suggestions: vibeSession.generate_response.suggestions
          }
        });

        // 手动创建项目对象（因为 vibeProject 为空）
        if (projectData.project_id) {
          updateDebugInfo({ action: 'creating_manual_project', projectData });
          
          // 尝试从 API 获取项目详情
          const fetchProjectDetails = async () => {
            try {
              const project = await api.getProjectDetail(projectData.project_id);
              updateDebugInfo({ action: 'project_details_fetched', project });
              
              // 确保预览URL正确
              if (!project.preview_url || project.preview_url === 'None') {
                project.preview_url = generatePreviewUrl(project.id);
              }
              
              setCurrentProject(project);
              onProjectCreated?.(project);
            } catch (error) {
              updateDebugInfo({ action: 'project_details_fetch_failed', error: error.message });
              
              // 创建基础项目对象作为后备
              const fallbackProject: Project = {
                id: projectData.project_id,
                name: projectData.project_name || '甘晓婷个人网站',
                description: '个人信息展示网站',
                type: projectData.project_type || 'web',
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                last_executed_at: null,
                execution_count: 0,
                file_count: projectData.files_created || 0,
                size: 0,
                entry_point: 'index.html',
                git_repo: null,
                dependencies: [],
                settings: {},
                structure: {},
                preview_url: generatePreviewUrl(projectData.project_id, projectData.preview_url)
              };
              
              updateDebugInfo({ action: 'using_fallback_project', fallbackProject });
              setCurrentProject(fallbackProject);
              onProjectCreated?.(fallbackProject);
            }
          };
          
          fetchProjectDetails();
        }
      }
    } else if (vibeStage === 'error' && vibeError) {
      updateDebugInfo({ action: 'error_detected', vibeError });
      
      // 错误处理
      addMessage({
        id: Date.now().toString(),
        content: `❌ **处理失败**: ${vibeError}\n\n你可以重试或重新描述你的需求。`,
        role: 'assistant',
        timestamp: new Date(),
        metadata: { isError: true }
      });
    }
  }, [vibeStage, vibeSession, vibeProject, vibeError, addMessage, onProjectCreated, updateDebugInfo, generatePreviewUrl]);

  // 监听当前项目变化
  useEffect(() => {
    if (currentProject) {
      setPreviewState(prev => ({ ...prev, loading: false, error: null }));
      updateDebugInfo({ 
        action: 'current_project_updated', 
        project: {
          id: currentProject.id,
          name: currentProject.name,
          preview_url: currentProject.preview_url,
          status: currentProject.status
        }
      });
    }
  }, [currentProject, updateDebugInfo]);

  // 关键修复：自动滚动到底部
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
    // 也可以直接设置容器的 scrollTop
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, processingSteps]);


  // 修改初始化欢迎消息的逻辑，避免重复
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = {
        id: 'welcome',
        content: `👋 **欢迎使用 Skynet Console！**

  我是天网：

  🚀 **创建应用**：只需用自然语言描述你的想法
  - "创建一个待办事项应用"
  - "搭建一个博客网站" 
  - "做一个在线商店"

  🔧 **修改优化**：实时调整和完善你的项目
  - "把按钮颜色改成蓝色"
  - "增加用户登录功能"
  - "优化移动端显示"

  ✨ **即时预览**：右侧实时是视野展示，所见即所得

  开始描述你的想法，让我们一起`,
        role: 'assistant' as const,
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
      updateDebugInfo({ action: 'welcome_message_initialized' });
    }
  }, []); // 移除 messages.length 和 addMessage 依赖，避免重复触发


  // 修改自动滚动效果
  useEffect(() => {
    // 使用 requestAnimationFrame 确保在 DOM 更新后执行
    const scrollToBottom = () => {
      if (messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        // 直接设置 scrollTop 到最大值
        container.scrollTop = container.scrollHeight;
      }
    };

    // 延迟执行，确保新消息已经渲染
    const timeoutId = setTimeout(scrollToBottom, 100);
    
    return () => clearTimeout(timeoutId);
  }, [messages, processingSteps]);

  // 也可以添加一个新消息时立即滚动的效果
  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
      
      // 只有当用户在底部附近时才自动滚动
      if (isNearBottom) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [messages]);


  // 渲染调试面板
  const renderDebugPanel = () => {
    if (!showDebugPanel) return null;

    return (
      <div className="fixed top-4 right-4 w-96 bg-black text-green-400 p-4 rounded-lg shadow-xl z-50 max-h-96 overflow-auto font-mono text-xs">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-white font-bold">🐛 调试面板</h3>
          <button 
            onClick={() => setShowDebugPanel(false)}
            className="text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-2">
          <div><strong>Vibe Stage:</strong> {vibeStage}</div>
          <div><strong>Is Loading:</strong> {vibeLoading ? 'Yes' : 'No'}</div>
          <div><strong>Has Error:</strong> {vibeError ? 'Yes' : 'No'}</div>
          <div><strong>Has Session:</strong> {vibeSession ? 'Yes' : 'No'}</div>
          <div><strong>Has Project:</strong> {vibeProject ? 'Yes' : 'No'}</div>
          <div><strong>Is Vibe Mode:</strong> {isVibeMode ? 'Yes' : 'No'}</div>
          <div><strong>Preview URL:</strong> {currentProject?.preview_url || 'None'}</div>
          
          {debugInfo && (
            <div className="border-t border-green-600 pt-2 mt-2">
              <strong>Last Action:</strong>
              <pre className="whitespace-pre-wrap text-xs">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="border-t border-green-600 pt-2 mt-2">
            <button 
              onClick={forceRetry}
              className="bg-yellow-600 text-black px-2 py-1 rounded text-xs mr-2"
            >
              强制重试
            </button>
            <button 
              onClick={exitVibeMode}
              className="bg-red-600 text-white px-2 py-1 rounded text-xs"
            >
              退出模式
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 渲染 Vibe Coding 状态指示器
  const renderVibeStatusIndicator = () => {
    if (!isVibeMode || vibeStage === 'idle') return null;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-blue-800">系统运行中</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className="text-yellow-600 hover:text-yellow-800 text-sm underline flex items-center gap-1"
            >
              <Bug className="w-3 h-3" />
              调试
            </button>
            <button
              onClick={exitVibeMode}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              退出模式
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          {processingSteps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                step.status === 'completed' ? 'bg-green-500' :
                step.status === 'processing' ? 'bg-blue-500 animate-pulse' :
                step.status === 'error' ? 'bg-red-500' :
                'bg-gray-300'
              }`} />
              <span className={`text-sm ${
                step.status === 'completed' ? 'text-green-700' :
                step.status === 'processing' ? 'text-blue-700 font-medium' :
                step.status === 'error' ? 'text-red-700' :
                'text-gray-500'
              }`}>
                {step.label}
              </span>
              {step.status === 'completed' && index < processingSteps.length - 1 && (
                <ArrowRight className="w-3 h-3 text-green-500" />
              )}
              {step.message && (
                <span className="text-xs text-gray-500">- {step.message}</span>
              )}
            </div>
          ))}
        </div>
        
        {/* 调试信息显示 */}
        {vibeError && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm">
            <strong>错误详情:</strong> {vibeError}
          </div>
        )}
        
        {vibeStage === 'meta_processing' && vibeLoading && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <strong>状态:</strong> 正在处理 Meta 阶段，请等待...
          </div>
        )}
        
        {vibeStage === 'generate_processing' && vibeLoading && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
            <strong>状态:</strong> 正在生成项目，请等待...
          </div>
        )}
      </div>
    );
  };

  // 渲染 Vibe Coding 操作按钮
  const renderVibeActions = () => {
    if (!isVibeMode) return null;

    if (vibeStage === 'meta_complete') {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex flex-wrap gap-3 mb-3">
            <button
              onClick={handleConfirmGenerate}
              disabled={vibeLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
            >
              {vibeLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              确认生成项目
            </button>
            
            <button
              onClick={() => setShowModifyInput(!showModifyInput)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              修改需求
            </button>
            
            <button
              onClick={forceRetry}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              强制重试
            </button>
            
            <button
              onClick={exitVibeMode}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              重新开始
            </button>
          </div>
          
          {showModifyInput && (
            <div className="bg-white border rounded-lg p-3">
              <textarea
                value={modifyInputValue}
                onChange={(e) => setModifyInputValue(e.target.value)}
                placeholder="请描述您要修改的内容..."
                className="w-full h-20 p-2 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleModifyRequirement}
                  disabled={!modifyInputValue.trim() || vibeLoading}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 disabled:bg-gray-400"
                >
                  提交修改
                </button>
                <button
                  onClick={() => {
                    setShowModifyInput(false);
                    setModifyInputValue('');
                  }}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (vibeStage === 'generate_complete') {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex gap-3">
            {currentProject?.preview_url && (
              <a
                href={currentProject.preview_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                查看预览
              </a>
            )}
            
            <button
              onClick={exitVibeMode}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              创建新项目
            </button>
          </div>
        </div>
      );
    }

    // 如果卡在处理中，提供重试选项
    if (vibeStage === 'meta_processing' || vibeStage === 'generate_processing') {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex gap-3">
            <button
              onClick={forceRetry}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              强制重试
            </button>
            
            <button
              onClick={exitVibeMode}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              退出并重新开始
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 调试面板 */}
      {renderDebugPanel()}
      
      {/* 左侧：聊天界面 */}
      <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
        {/* 聊天头部 */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Skynet Console</h1>
                <p className="text-sm text-gray-500">天网 (内测模式)</p>
              </div>
            </div>
            
            {currentProject && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>{currentProject.name || '未命名项目'}</span>
              </div>
            )}
          </div>
        </div>

        {/* 消息区域 - 关键修复点 */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto"
          style={{
            height: '0', // 让 flex-1 自动计算高度
            minHeight: '0' // 确保可以缩小
          }}
        >
          <div className="p-4 min-h-full flex flex-col">
            {/* Vibe Coding 状态指示器 */}
            {renderVibeStatusIndicator()}
            
            {/* 错误提示 */}
            {vibeError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                  <AlertCircle className="w-4 h-4" />
                  出现错误
                </div>
                <p className="text-red-700 text-sm mb-3">{vibeError}</p>
                <div className="flex gap-2">
                  <button
                    onClick={forceRetry}
                    className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                  >
                    重试
                  </button>
                  <button
                    onClick={exitVibeMode}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    重新开始
                  </button>
                </div>
              </div>
            )}

            {/* Vibe Coding 操作区域 */}
            {renderVibeActions()}

            {/* 消息列表 */}
            <div className="flex-1 space-y-4">
              {messages.map(message => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onExecuteCode={(codeId) => {
                    console.log('Execute code:', codeId);
                  }}
                />
              ))}
            </div>

            {/* 滚动到底部的锚点 */}
            <div ref={messagesEndRef} className="h-px" />
          </div>
        </div>

        {/* 输入区域 */}
        <div className="border-t border-gray-200">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={chatLoading || vibeLoading}
            placeholder={
              isVibeMode ? "Vibe Coding 模式 - 等待您的操作..." :
              currentProject ? "继续与AI对话来修改项目..." : 
              "描述你想创建的应用，或直接聊天..."
            }
          />
          
          {/* Vibe 模式提示 */}
          {isVibeMode && (
            <div className="px-4 pb-2 text-sm text-gray-600 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              调试 模式创建项目
              <button
                onClick={() => setShowDebugPanel(true)}
                className="ml-auto text-yellow-600 hover:text-yellow-700 flex items-center gap-1"
              >
                <Bug className="w-3 h-3" />
                调试
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 右侧：预览界面 */}
      <div className="w-1/2 bg-gray-100 flex flex-col">
        {/* 预览控制栏 */}
        <div className="bg-white border-b border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">实时预览</span>
              {currentProject && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  {currentProject.name || '未命名项目'}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {/* 设备预览模式 */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => togglePreviewMode('desktop')}
                  className={`p-2 rounded transition-colors ${
                    previewState.mode === 'desktop' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                  title="桌面预览"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => togglePreviewMode('tablet')}
                  className={`p-2 rounded transition-colors ${
                    previewState.mode === 'tablet' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                  title="平板预览"
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => togglePreviewMode('mobile')}
                  className={`p-2 rounded transition-colors ${
                    previewState.mode === 'mobile' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                  title="手机预览"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>

              {/* 功能按钮 */}
              <button
                onClick={toggleCodeView}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="切换代码视图"
              >
                {previewState.showCode ? <Eye className="w-4 h-4" /> : <Code2 className="w-4 h-4" />}
              </button>
              
              <button
                onClick={refreshPreview}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="刷新预览"
                disabled={previewState.loading}
              >
                <RefreshCw className={`w-4 h-4 ${previewState.loading ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="全屏预览"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 预览内容 */}
        <div className="flex-1 p-4">
          {currentProject ? (
            <div className={`h-full bg-white rounded-lg shadow-lg overflow-hidden transition-all ${
              previewState.mode === 'mobile' ? 'max-w-sm mx-auto' :
              previewState.mode === 'tablet' ? 'max-w-2xl mx-auto' :
              'w-full'
            }`}>
              {previewState.showCode ? (
                <div className="h-full p-4 bg-gray-900 text-green-400 font-mono text-sm overflow-auto">
                  <div className="mb-2 text-gray-500">// 项目代码预览</div>
                  <div className="whitespace-pre-wrap">
                    {`// ${currentProject.name || '未命名项目'}
// 文件数量: ${currentProject.file_count || 0}
// 项目类型: ${currentProject.type || 'unknown'}
// 状态: ${currentProject.status || 'unknown'}
// 预览URL: ${currentProject.preview_url || '未设置'}

// 这里显示实际的代码内容...
import React from 'react';

function App() {
  return (
    <div className="app">
      <h1>Hello World</h1>
      <p>Project created with Vibe Coding!</p>
    </div>
  );
}

export default App;`}
                  </div>
                </div>
              ) : (
                currentProject.preview_url ? (
                  <iframe
                    ref={previewRef}
                    src={currentProject.preview_url}
                    className="w-full h-full border-0"
                    title="项目预览"
                    onLoad={() => {
                      console.log('[UnifiedChat] Preview loaded successfully');
                      setPreviewState(prev => ({ ...prev, loading: false, error: null }));
                    }}
                    onError={() => {
                      console.error('[UnifiedChat] Preview failed to load');
                      setPreviewState(prev => ({ 
                        ...prev, 
                        loading: false, 
                        error: 'Preview failed to load' 
                      }));
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-3">
                        {previewState.loading ? (
                          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        ) : (
                          <AlertCircle className="w-8 h-8 text-yellow-500" />
                        )}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {previewState.loading ? '预览准备中' : '预览暂不可用'}
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {previewState.loading 
                          ? '项目正在启动预览服务器，请稍等...'
                          : '项目预览服务暂时不可用'}
                      </p>
                      {!previewState.loading && (
                        <button 
                          onClick={refreshPreview}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          重试加载
                        </button>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <LovableStyleWaiting
              stage={vibeStage}
              loading={vibeLoading || isVibeMode}
              userInput={messages.find(m => m.role === 'user')?.content}
              className="h-full"
            />
          )}
        </div>
      </div>
    </div>
  );
};