import React from 'react';
import { Message } from '@/types';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';

interface ChatMessageProps {
  message: Message;
  onExecuteCode?: (codeId: string) => void;
  onSetupCron?: (codeId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onExecuteCode,
  onSetupCron,
}) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'} mb-6 fade-in`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          <Bot size={18} className="text-white" />
        </div>
      )}
      
      <div className={`max-w-[70%] ${isUser ? 'order-1' : 'order-2'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              className="prose dark:prose-invert max-w-none"
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');
                  
                  if (!inline && match) {
                    // 添加安全检查
                    const codeBlock = message.codeBlocks?.find(
                      block => block?.content && codeString && 
                               block.content.trim() === codeString.trim()
                    );
                    
                    return (
                      <CodeBlock
                        language={match[1]}
                        code={codeString}
                        codeId={codeBlock?.id}
                        saved={codeBlock?.saved}
                        onExecute={onExecuteCode}
                        onSetupCron={onSetupCron}
                      />
                    );
                  }
                  
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content || ''}
            </ReactMarkdown>
          )}
        </div>
        
        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center order-2">
          <User size={18} className="text-white" />
        </div>
      )}
    </div>
  );
};