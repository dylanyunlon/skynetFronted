import { useState, useCallback, useRef, useEffect } from 'react'
import { api } from '@/services/api'
import { Message, Conversation } from '@/types'

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoadedConversations, setHasLoadedConversations] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  const sendMessage = useCallback(async (
    content: string,
    model: string = 'claude-opus-4-5-20251101',
    options?: {
      extractCode?: boolean
      autoExecute?: boolean
      setupCron?: boolean
      cronExpression?: string
    }
  ) => {
    if (!content.trim() || isLoading) return

    setIsLoading(true)

    try {
      // Create user message
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
      }

      // Update conversation with user message
      const updatedConversation = currentConversation
        ? {
            ...currentConversation,
            messages: [...currentConversation.messages, userMessage],
            updatedAt: new Date(),
          }
        : {
            id: `conv-${Date.now()}`,
            title: content.slice(0, 30) + '...',
            messages: [userMessage],
            createdAt: new Date(),
            updatedAt: new Date(),
          }

      setCurrentConversation(updatedConversation)

      // 构建符合后端 ChatMessage schema 的数据
      const messageData = {
        content: content.trim(),
        model: model,
        conversation_id: currentConversation?.id || updatedConversation.id,
        system_prompt: undefined,
        attachments: undefined,
        extract_code: options?.extractCode,
        auto_execute: options?.autoExecute,
        setup_cron: options?.setupCron,
        cron_expression: options?.cronExpression,
      }

      console.log('Sending message data:', messageData)

      // Send message to API
      const response = await api.sendMessage(messageData)

      if (response.success) {
        // Create assistant message
        const assistantMessage: Message = {
          id: response.data.conversation_id ? `msg-${Date.now()}-assistant` : `msg-${Date.now()}`,
          role: 'assistant',
          content: response.data.content,
          timestamp: new Date(),
          metadata: response.data.metadata,
          codeBlocks: response.data.metadata?.extracted_codes,
        }

        // Update conversation with assistant message
        const finalConversation = {
          ...updatedConversation,
          id: response.data.conversation_id || updatedConversation.id,
          messages: [...updatedConversation.messages, assistantMessage],
          updatedAt: new Date(),
        }

        setCurrentConversation(finalConversation)
        
        // Update conversations list
        setConversations(prev => {
          const exists = prev.find(c => c.id === finalConversation.id)
          if (exists) {
            return prev.map(c => c.id === finalConversation.id ? finalConversation : c)
          }
          return [finalConversation, ...prev]
        })
      }
    } catch (error: any) {
      console.error('Send message error:', error)
      
      // 创建错误消息
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: `Error: ${error.response?.data?.detail || error.message || 'Failed to send message'}`,
        timestamp: new Date(),
        isError: true,
      }

      // 更新对话以显示错误
      if (currentConversation) {
        const errorConversation = {
          ...currentConversation,
          messages: [...currentConversation.messages, errorMessage],
          updatedAt: new Date(),
        }
        setCurrentConversation(errorConversation)
      }
    } finally {
      setIsLoading(false)
    }
  }, [currentConversation, isLoading])

  const sendStreamingMessage = useCallback(async (
    content: string,
    model: string = 'claude-opus-4-5-20251101',
    options?: {
      extractCode?: boolean
      autoExecute?: boolean
    }
  ) => {
    if (!content.trim() || isLoading) return

    setIsLoading(true)

    // Close existing stream if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    try {
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
      }

      // Create or update conversation
      const conversationId = currentConversation?.id || `conv-${Date.now()}`
      let streamingMessage: Message = {
        id: `msg-${Date.now()}-streaming`,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      }

      // Update UI with user message
      const updatedConversation = currentConversation
        ? {
            ...currentConversation,
            messages: [...currentConversation.messages, userMessage, streamingMessage],
            updatedAt: new Date(),
          }
        : {
            id: conversationId,
            title: content.slice(0, 30) + '...',
            messages: [userMessage, streamingMessage],
            createdAt: new Date(),
            updatedAt: new Date(),
          }

      setCurrentConversation(updatedConversation)

      // Create SSE connection
      eventSourceRef.current = api.createMessageStream({
        content: content.trim(),
        model: model,
        conversation_id: conversationId,
        extract_code: options?.extractCode,
        auto_execute: options?.autoExecute,
        onMessage: (data) => {
          // Update streaming message content based on type
          if (data.type === 'text' || data.type === 'text_delta') {
            streamingMessage.content += data.content || ''
          } else if (data.type === 'error') {
            streamingMessage.content = data.content || 'An error occurred'
            streamingMessage.isError = true
          }
          
          // Update metadata if provided
          if (data.metadata) {
            streamingMessage.metadata = data.metadata
            if (data.metadata.extracted_codes) {
              streamingMessage.codeBlocks = data.metadata.extracted_codes
            }
          }
          
          setCurrentConversation(prev => {
            if (!prev) return null
            return {
              ...prev,
              messages: prev.messages.map(m =>
                m.id === streamingMessage.id ? { ...streamingMessage } : m
              ),
            }
          })
        },
        onError: (error) => {
          console.error('Streaming error:', error)
          
          // Update streaming message to show error
          streamingMessage.content = 'Error: Failed to connect to streaming service'
          streamingMessage.isError = true
          streamingMessage.isStreaming = false
          
          setCurrentConversation(prev => {
            if (!prev) return null
            return {
              ...prev,
              messages: prev.messages.map(m =>
                m.id === streamingMessage.id ? { ...streamingMessage } : m
              ),
            }
          })
          
          setIsLoading(false)
        },
        onComplete: () => {
          // Finalize the message
          streamingMessage.id = `msg-${Date.now()}`
          streamingMessage.isStreaming = false
          
          setIsLoading(false)
          
          // Update conversations list
          setConversations(prev => {
            const finalConv = { ...updatedConversation }
            const exists = prev.find(c => c.id === finalConv.id)
            if (exists) {
              return prev.map(c => c.id === finalConv.id ? finalConv : c)
            }
            return [finalConv, ...prev]
          })
        },
      })
    } catch (error: any) {
      console.error('Streaming message error:', error)
      setIsLoading(false)
      
      // Show error message
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: `Error: ${error.message || 'Failed to start streaming'}`,
        timestamp: new Date(),
        isError: true,
      }

      if (currentConversation) {
        setCurrentConversation({
          ...currentConversation,
          messages: [...currentConversation.messages, errorMessage],
          updatedAt: new Date(),
        })
      }
    }
  }, [currentConversation, isLoading])

  const createNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setCurrentConversation(newConversation)
    return newConversation
  }, [])

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      await api.deleteConversation(conversationId)
      setConversations(prev => prev.filter(c => c.id !== conversationId))
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null)
      }
    } catch (error) {
      console.error('Delete conversation error:', error)
    }
  }, [currentConversation])

  const loadConversations = useCallback(async () => {
    // 防止重复加载
    if (hasLoadedConversations || isLoading) {
      console.log('[useChat] Skipping loadConversations - already loaded or loading');
      return;
    }

    // 检查是否已经有太多失败的尝试
    const failedAttempts = parseInt(sessionStorage.getItem('conversations_failed_attempts') || '0');
    if (failedAttempts >= 3) {
      console.warn('[useChat] Too many failed attempts, stopping');
      return;
    }

    try {
      setIsLoading(true);
      console.log('[useChat] Loading conversations...');
      
      // 检查 token 状态
      const tokenStatus = api.getTokenStatus();
      console.log('[useChat] Token status:', tokenStatus);
      
      if (!tokenStatus.hasToken) {
        console.warn('[useChat] No token available, skipping conversation load');
        return;
      }

      const response = await api.getConversations();
      
      if (response.conversations) {
        // 转换后端数据格式到前端格式
        const formattedConversations: Conversation[] = response.conversations.map((conv: any) => ({
          id: conv.id,
          title: conv.title || 'Untitled',
          messages: [], // 消息需要单独加载
          createdAt: new Date(conv.created_at),
          updatedAt: new Date(conv.updated_at),
          messageCount: conv.message_count || 0,
        }));
        
        setConversations(formattedConversations);
        setHasLoadedConversations(true);
        sessionStorage.removeItem('conversations_failed_attempts'); // 清除失败计数
        console.log('[useChat] Loaded', formattedConversations.length, 'conversations');
      }
    } catch (error: any) {
      console.error('[useChat] Load conversations error:', error);
      console.error('[useChat] Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      // 增加失败计数
      const currentAttempts = parseInt(sessionStorage.getItem('conversations_failed_attempts') || '0');
      sessionStorage.setItem('conversations_failed_attempts', String(currentAttempts + 1));
      
      // 如果是认证错误，不要标记为已加载，这样登录后可以重新加载
      if (error.response?.status !== 401) {
        setHasLoadedConversations(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [hasLoadedConversations, isLoading]);

  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      const response = await api.getConversation(conversationId)
      if (response.messages) {
        // 转换消息格式
        const messages: Message[] = response.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at || msg.timestamp),
          metadata: msg.metadata,
          codeBlocks: msg.metadata?.extracted_codes,
        }))

        const conversation: Conversation = {
          id: conversationId,
          title: response.title || 'Untitled',
          messages,
          createdAt: new Date(response.created_at),
          updatedAt: new Date(response.updated_at),
        }

        setCurrentConversation(conversation)
        
        // 更新会话列表
        setConversations(prev => {
          const exists = prev.find(c => c.id === conversationId)
          if (exists) {
            return prev.map(c => c.id === conversationId ? conversation : c)
          }
          return [conversation, ...prev]
        })
      }
    } catch (error) {
      console.error('Load conversation error:', error)
    }
  }, [])

  // 重置加载状态（用于登录后重新加载）
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chatbot_token' && e.newValue) {
        console.log('[useChat] Token changed, resetting load state');
        setHasLoadedConversations(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    conversations,
    currentConversation,
    isLoading,
    sendMessage,
    sendStreamingMessage,
    createNewConversation,
    deleteConversation,
    setCurrentConversation,
    loadConversations,
    loadConversation,
  }
}