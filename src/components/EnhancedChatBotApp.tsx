import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { ChatMessage } from '@/components/Chat/ChatMessage';
import { ChatInput } from '@/components/Chat/ChatInput';
import { ProjectManager } from '@/components/Projects/ProjectManager';
import { ProjectEditor } from '@/components/Projects/ProjectEditor';
import { useAuthStore } from '@/store/auth';
import { useChat } from '@/hooks/useChat';
import { useProjectChat } from '@/hooks/useProjectChat';
import { api } from '@/services/api';
import { 
  MessageCircle, FolderOpen, Terminal, Settings, LogOut,
  ChevronLeft, ChevronRight, Code2, Rocket
} from 'lucide-react';
import { Project, Message } from '@/types';

export const EnhancedChatBotApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'projects' | 'terminal'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectEditor, setShowProjectEditor] = useState(false);
  
  const { user, logout, checkAuth } = useAuthStore();
  const {
    conversations,
    currentConversation,
    isLoading,
    sendMessage,
    loadConversation,
    createNewConversation,
    deleteConversation,
    loadConversations,
  } = useChat();
  
  // 从 currentConversation 中提取 messages
  const messages = currentConversation?.messages || [];
  const currentConversationId = currentConversation?.id;
  
  const {
    currentProject,
    processProjectCommand,
    suggestProjectActions,
    PROJECT_COMMANDS
  } = useProjectChat();

  // 确保认证状态正确初始化
  useEffect(() => {
    // 检查认证状态
    checkAuth();
    
    // 确保 API 客户端加载了 token
    const token = localStorage.getItem('chatbot_token');
    if (token) {
      api.loadToken();
      console.log('[EnhancedChatBotApp] Token loaded from localStorage');
      console.log('[EnhancedChatBotApp] Token preview:', token.substring(0, 20) + '...');
      
      // 加载会话列表
      setTimeout(() => {
        console.log('[EnhancedChatBotApp] Loading conversations...');
        loadConversations();
      }, 500);
    } else {
      console.warn('[EnhancedChatBotApp] No token found in localStorage');
    }
  }, [checkAuth]); // 移除 loadConversations 依赖以避免循环

  // 监听项目打开事件
  useEffect(() => {
    const handleOpenProject = (event: CustomEvent<Project>) => {
      setSelectedProject(event.detail);
      setShowProjectEditor(true);
      setActiveTab('projects');
    };

    window.addEventListener('open-project', handleOpenProject as any);
    return () => {
      window.removeEventListener('open-project', handleOpenProject as any);
    };
  }, []);

  const handleSendMessage = async (content: string, options?: any) => {
    // 如果没有当前对话，先创建一个
    if (!currentConversation) {
      createNewConversation();
    }
    
    // 首先检查是否是项目命令
    const result = await processProjectCommand(content);
    
    if (result.isCommand) {
      // 如果是命令，显示命令结果
      if (result.response) {
        // 将命令和响应添加到消息列表
        const userMessage: Message = {
          id: Date.now().toString(),
          content,
          role: 'user',
          timestamp: new Date(),
        };
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: result.response,
          role: 'assistant',
          timestamp: new Date(),
        };
        
        // 更新当前对话
        if (currentConversation) {
          currentConversation.messages.push(userMessage, assistantMessage);
        }
      }
      
      // 执行命令相关的操作
      if (result.action) {
        result.action();
      }
    } else {
      // 不是命令，正常发送消息
      await sendMessage(content, options);
      
      // 检查是否需要建议项目操作
      const suggestions = suggestProjectActions(content);
      if (suggestions.length > 0 && currentConversation) {
        setTimeout(() => {
          const suggestionMessage: Message = {
            id: (Date.now() + 2).toString(),
            content: `💡 **项目建议**:\n${suggestions.map(s => `- ${s}`).join('\n')}`,
            role: 'assistant',
            timestamp: new Date(),
          };
          currentConversation.messages.push(suggestionMessage);
        }, 1000);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const tabIcons = {
    chat: <MessageCircle className="w-5 h-5" />,
    projects: <FolderOpen className="w-5 h-5" />,
    terminal: <Terminal className="w-5 h-5" />,
  };

  const tabTitles = {
    chat: '对话',
    projects: '项目',
    terminal: '终端',
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* 侧边栏 */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 flex-shrink-0`}>
        {isSidebarOpen && (
          <Sidebar
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={(conv) => loadConversation(conv.id)}
            onDeleteConversation={deleteConversation}
            onNewChat={createNewConversation}
          />
        )}
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部导航栏 */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {isSidebarOpen ? (
                  <ChevronLeft className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>

              {/* Tab切换 */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {Object.entries(tabTitles).map(([key, title]) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      activeTab === key
                        ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {tabIcons[key as keyof typeof tabIcons]}
                    <span className="text-sm font-medium">{title}</span>
                  </button>
                ))}
              </div>

              {/* 当前项目信息 */}
              {currentProject && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
                  <Code2 className="w-4 h-4" />
                  <span className="text-sm font-medium">{currentProject.name}</span>
                </div>
              )}
            </div>

            {/* 用户信息和设置 */}
            <div className="flex items-center gap-4">
              {user && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {user.username}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                title="退出登录"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* 内容区域 */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' && (
            <div className="h-full flex flex-col">
              {/* 消息列表 */}
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-4 py-6">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <Rocket className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        开始新的对话
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        试试这些项目管理命令：
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                        {PROJECT_COMMANDS.slice(0, 4).map((cmd) => (
                          <button
                            key={cmd.command}
                            onClick={() => handleSendMessage(cmd.usage)}
                            className="text-left p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors"
                          >
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {cmd.command}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {cmd.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))
                  )}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 py-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                      <span>AI 正在思考...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 输入框 */}
              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                placeholder="输入消息或项目命令 (输入 /help 查看命令)..."
              />
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="h-full">
              {showProjectEditor && selectedProject ? (
                <ProjectEditor
                  project={selectedProject}
                  onClose={() => {
                    setShowProjectEditor(false);
                    setSelectedProject(null);
                  }}
                />
              ) : (
                <ProjectManager
                  onOpenProject={(project) => {
                    setSelectedProject(project);
                    setShowProjectEditor(true);
                  }}
                  onCreateProject={() => {
                    // 可以打开创建项目对话框
                  }}
                />
              )}
            </div>
          )}

          {activeTab === 'terminal' && (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Terminal className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>终端功能开发中...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};