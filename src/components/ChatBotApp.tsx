// 修复 src/components/ChatBotApp.tsx
// 完整替换文件内容，使用真实 API

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Plus, Settings, Moon, Sun, Code, Play, Clock, Copy, Check, ChevronDown, Menu, X, Loader2 } from 'lucide-react';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/auth';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  codeBlocks?: CodeBlock[];
}

interface CodeBlock {
  id: string;
  language: string;
  content: string;
  saved?: boolean;
  executed?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// Components
const CodeBlockComponent: React.FC<{
  code: CodeBlock;
  onExecute: (id: string) => void;
  onSetupCron: (id: string) => void;
}> = ({ code, onExecute, onSetupCron }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 20000);
  };

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs font-mono text-gray-400">{code.language}</span>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Copy code"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-gray-400" />}
          </button>
          {code.saved && (
            <>
              <button
                onClick={() => onExecute(code.id)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
                title="Execute code"
              >
                <Play size={14} className="text-gray-400" />
              </button>
              <button
                onClick={() => onSetupCron(code.id)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
                title="Setup cron job"
              >
                <Clock size={14} className="text-gray-400" />
              </button>
            </>
          )}
        </div>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-gray-300 font-mono">{code.content}</code>
      </pre>
    </div>
  );
};

const MessageComponent: React.FC<{
  message: Message;
  onExecuteCode: (id: string) => void;
  onSetupCron: (id: string) => void;
}> = ({ message, onExecuteCode, onSetupCron }) => {
  const isUser = message.role === 'user';

  // Parse code blocks from content
  const parseContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
        if (match) {
          const language = match[1] || 'text';
          const codeContent = match[2];
          const codeBlock: CodeBlock = {
            id: `${message.id}-code-${index}`,
            language,
            content: codeContent,
            saved: message.codeBlocks?.some(b => b.content === codeContent && b.saved)
          };
          return (
            <CodeBlockComponent
              key={index}
              code={codeBlock}
              onExecute={onExecuteCode}
              onSetupCron={onSetupCron}
            />
          );
        }
      }
      return <p key={index} className="whitespace-pre-wrap">{part}</p>;
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isUser
              ? 'bg-blue-600 text-white ml-auto'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose dark:prose-invert max-w-none">
              {parseContent(message.content)}
            </div>
          )}
        </div>
        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

// Main App Component
const ChatBotApp: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Doubao-2.0-pro-256k');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuthStore();

  const models = [
    'Doubao-1.5-pro-256k',
    'o3-gz',
    'GPT-4',
    'claude-opus-4-6'
  ];

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Apply dark mode class
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  const createNewConversation = () => {
    const newConv: Conversation = {
      id: 'conv-' + Date.now(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setConversations([newConv, ...conversations]);
    setCurrentConversation(newConv);
  };


  // 在现有的 sendMessage 函数之前添加命令处理函数
  const processCommand = async (
    command: string,
    addSystemMessage: (content: string) => void,
    setIsLoading: (loading: boolean) => void
  ) => {
    const parts = command.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    
    switch (cmd) {
      case '/exit':
        addSystemMessage('👋 再见！');
        // 可以添加实际的退出逻辑，比如清除会话
        break;
        
      case '/templates':
        setIsLoading(true);
        try {
          const result = await api.getCodeTemplates();
          if (result.success) {
            let content = '📋 可用模板:\n\n';
            for (const [lang, templates] of Object.entries(result.templates)) {
              content += `${lang.toUpperCase()}:\n`;
              for (const task of Object.keys(templates)) {
                content += `  - ${task}\n`;
              }
              content += '\n';
            }
            addSystemMessage(content);
          }
        } catch (error) {
          addSystemMessage('❌ 获取模板失败');
        }
        setIsLoading(false);
        break;
        
      case '/codes':
        setIsLoading(true);
        try {
          // 假设 API 有 listCodes 方法
          const codes = await (api as any).listCodes?.() || [];
          if (codes.length > 0) {
            let content = '📋 保存的代码:\n\n';
            codes.forEach((code: any, index: number) => {
              content += `${index + 1}. [${code.language}] ${code.description || 'No description'}\n`;
              content += `   ID: ${code.id}\n`;
              content += `   执行次数: ${code.execution_count || 0}\n\n`;
            });
            addSystemMessage(content);
          } else {
            addSystemMessage('没有保存的代码');
          }
        } catch (error) {
          addSystemMessage('❌ 获取代码列表失败');
        }
        setIsLoading(false);
        break;
        
      case '/exec':
        if (parts.length < 2) {
          addSystemMessage('❌ 用法: /exec <code_id>');
          break;
        }
        
        const codeId = parts[1];
        setIsLoading(true);
        addSystemMessage(`🚀 执行代码 ${codeId}...`);
        
        try {
          const result = await api.executeCode(codeId);
          if (result.success) {
            addSystemMessage(`✅ ${result.data.report || '执行成功'}`);
          }
        } catch (error) {
          addSystemMessage(`❌ 执行失败: ${error}`);
        }
        setIsLoading(false);
        break;
        
      case '/cron':
        if (parts.length < 3) {
          addSystemMessage('❌ 用法: /cron <code_id> <cron_expression>');
          break;
        }
        
        const cronCodeId = parts[1];
        const cronExpr = parts.slice(2).join(' ');
        setIsLoading(true);
        addSystemMessage(`⏰ 创建定时任务...`);
        
        try {
          const result = await api.setupCron(cronCodeId, cronExpr);
          if (result.success) {
            addSystemMessage(`✅ 定时任务创建成功！
  任务名: ${result.data.job_name || 'N/A'}
  Cron表达式: ${result.data.cron_expression}
  下次运行: ${new Date(result.data.next_run).toLocaleString()}`);
          }
        } catch (error) {
          addSystemMessage(`❌ 创建失败: ${error}`);
        }
        setIsLoading(false);
        break;
        
      case '/help':
        addSystemMessage(`🤖 增强代码聊天模式
  ==================================================
  命令列表:
    /templates - 查看代码模板
    /codes - 查看已保存的代码
    /exec <code_id> - 执行代码
    /cron <code_id> <expression> - 设置定时任务
    /help - 显示此帮助信息
    /exit - 退出聊天
  ==================================================`);
        break;
        
      default:
        if (cmd.startsWith('/')) {
          addSystemMessage(`❌ 未知命令: ${cmd}\n输入 /help 查看可用命令`);
        }
    }
  };

  // 修改 ChatBotApp 组件的 sendMessage 函数
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    // Update conversation
    if (!currentConversation) {
      createNewConversation();
    }

    const updatedMessages = [...(currentConversation?.messages || []), userMessage];
    const updatedConv = {
      ...currentConversation!,
      messages: updatedMessages,
      updatedAt: new Date()
    };
    setCurrentConversation(updatedConv);
    
    const userInput = inputValue;
    setInputValue('');

    // 添加系统消息的辅助函数
    const addSystemMessage = (content: string) => {
      const systemMessage: Message = {
        id: 'msg-system-' + Date.now(),
        role: 'assistant',
        content,
        timestamp: new Date()
      };
      
      const messagesWithSystem = [...updatedMessages, systemMessage];
      setCurrentConversation({
        ...updatedConv,
        messages: messagesWithSystem
      });
      
      setConversations(convs => {
        const existingIndex = convs.findIndex(c => c.id === updatedConv.id);
        if (existingIndex >= 0) {
          const newConvs = [...convs];
          newConvs[existingIndex] = {
            ...updatedConv,
            messages: messagesWithSystem
          };
          return newConvs;
        } else {
          return [{
            ...updatedConv,
            messages: messagesWithSystem
          }, ...convs];
        }
      });
    };

    // 检查是否是命令
    if (userInput.startsWith('/')) {
      await processCommand(userInput, addSystemMessage, setIsLoading);
      return;
    }

    // 正常的消息处理
    setIsLoading(true);

    try {
      const response = await api.sendMessage({
        content: userInput,
        model: selectedModel,
        conversation_id: currentConversation?.id,
        extract_code: true,
        auto_execute: false,
        setup_cron: false
      });

      if (response.success && response.data) {
        let assistantContent = response.data.content;
        
        // 添加代码提取信息
        if (response.data.metadata?.extracted_codes) {
          const codes = response.data.metadata.extracted_codes;
          assistantContent += `\n\n💾 提取到 ${codes.length} 个代码块`;
          codes.forEach((code: any) => {
            if (code.saved && code.id) {
              assistantContent += `\n  - [${code.language}] ID: ${code.id}`;
            }
          });
        }
        
        // 添加建议操作
        if (response.data.follow_up_questions) {
          assistantContent += '\n\n💡 建议操作:';
          response.data.follow_up_questions.forEach((q: string, i: number) => {
            assistantContent += `\n  ${i + 1}. ${q}`;
          });
        }

        const assistantMessage: Message = {
          id: 'msg-' + Date.now(),
          role: 'assistant',
          content: assistantContent,
          timestamp: new Date(),
          codeBlocks: response.data.metadata?.extracted_codes
        };

        const finalMessages = [...updatedMessages, assistantMessage];
        const finalConv = {
          ...updatedConv,
          messages: finalMessages,
          title: updatedMessages.length === 1 ? userInput.slice(0, 30) + '...' : updatedConv.title
        };
        
        setCurrentConversation(finalConv);
        setConversations(convs => {
          const existingIndex = convs.findIndex(c => c.id === finalConv.id);
          if (existingIndex >= 0) {
            const newConvs = [...convs];
            newConvs[existingIndex] = finalConv;
            return newConvs;
          } else {
            return [finalConv, ...convs];
          }
        });
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: 'msg-error-' + Date.now(),
        role: 'assistant',
        content: '抱歉，发送消息时出现错误。请检查网络连接并重试。',
        timestamp: new Date()
      };
      
      const errorMessages = [...updatedMessages, errorMessage];
      setCurrentConversation({
        ...updatedConv,
        messages: errorMessages
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 在组件开始时添加欢迎消息
  useEffect(() => {
    if (conversations.length === 0) {
      const welcomeConv: Conversation = {
        id: 'conv-welcome',
        title: '欢迎使用',
        messages: [{
          id: 'msg-welcome',
          role: 'assistant',
          content: `🤖 增强代码聊天模式
  ==================================================
  命令: /templates - 查看模板, /exec <code_id> - 执行代码
      /cron <code_id> <expression> - 设置定时任务
      /codes - 查看已保存代码, /exit - 退出
  ==================================================

  请输入消息或使用命令。输入 /help 查看所有可用命令。`,
          timestamp: new Date()
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setConversations([welcomeConv]);
      setCurrentConversation(welcomeConv);
    }
  }, []);



  const executeCode = async (codeId: string) => {
    try {
      console.log('Executing code:', codeId);
      
      const result = await api.executeCode(codeId);
      if (result.success && result.data?.result) {
        const execResult = result.data.result;
        
        // 格式化输出消息
        let message = '✅ 代码执行成功\n\n';
        
        if (execResult.execution_time !== undefined) {
          message += `⏱️ 执行时间: ${execResult.execution_time.toFixed(2)} 秒\n\n`;
        }
        
        if (execResult.output) {
          message += '📤 输出:\n' + execResult.output;
        }
        
        if (execResult.error) {
          message += '\n\n❌ 错误:\n' + execResult.error;
        }
        
        alert(message);
      } else {
        alert('执行失败: ' + (result.data?.result?.error || '未知错误'));
      }
    } catch (error) {
      console.error('Failed to execute code:', error);
      alert('执行代码失败: ' + error);
    }
  };

  const setupCron = async (codeId: string) => {
    const cronExpression = prompt('Enter cron expression (e.g., */5 * * * *)');
    if (!cronExpression) return;

    try {
      const result = await api.setupCron(codeId, cronExpression);
      if (result.success) {
        alert(`Cron job set up successfully!\nNext run: ${result.data.next_run}`);
      }
    } catch (error) {
      console.error('Failed to setup cron:', error);
      alert('Failed to setup cron');
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden`}>
        <div className="p-4">
          <button
            onClick={createNewConversation}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus size={20} />
            New Chat
          </button>
          
          <div className="mt-4 space-y-2">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setCurrentConversation(conv)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  currentConversation?.id === conv.id
                    ? 'bg-gray-200 dark:bg-gray-700'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="text-sm font-medium truncate">{conv.title}</div>
                <div className="text-xs text-gray-500">
                  {new Date(conv.updatedAt).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-xl font-semibold">Skynet Console</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Model Selector */}
            <div className="relative">
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Code size={16} />
                <span className="text-sm">{selectedModel}</span>
                <ChevronDown size={16} />
              </button>
              
              {showModelDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                  {models.map(model => (
                    <button
                      key={model}
                      onClick={() => {
                        setSelectedModel(model);
                        setShowModelDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {model}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {currentConversation ? (
            <>
              {currentConversation.messages.map(message => (
                <MessageComponent
                  key={message.id}
                  message={message}
                  onExecuteCode={executeCode}
                  onSetupCron={setupCron}
                />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-2xl">
                    <Loader2 className="animate-spin" size={20} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Welcome to Our Skynet</h2>
                <p>Start a new conversation to begin</p>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-end gap-4">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  sendMessage();
                }
              }}
              placeholder="Type your message... (Ctrl+Enter to send)"
              className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Send size={20} />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBotApp;