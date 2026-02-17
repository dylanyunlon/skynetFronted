import React, { useEffect, useRef } from 'react';
import { MessageSquare, Trash2, MoreVertical } from 'lucide-react';
import { Conversation } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  conversations: Conversation[];
  currentConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
  onDeleteConversation: (conversationId: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
}) => {
  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousConversationCount = useRef(conversations.length);

  // 当有新对话时自动滚动到顶部
  useEffect(() => {
    if (conversations.length > previousConversationCount.current && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    previousConversationCount.current = conversations.length;
  }, [conversations.length]);

  const handleDelete = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    onDeleteConversation(conversationId);
    setMenuOpenId(null);
  };

  return (
    <div 
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto scrollbar-thin"
      style={{ 
        height: 'calc(100vh - 140px)', // 减去头部和底部的高度
        minHeight: '0' // 确保flex子元素能够正确收缩
      }}
    >
      {conversations.length === 0 ? (
        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
          <MessageSquare size={48} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">No conversations yet</p>
          <p className="text-xs mt-1">Start a new chat to begin</p>
        </div>
      ) : (
        <div className="space-y-1 px-2 py-2">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`
                relative group cursor-pointer rounded-lg px-3 py-2 transition-colors
                ${currentConversationId === conversation.id
                  ? 'bg-gray-200 dark:bg-gray-700'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }
              `}
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="flex items-start gap-3">
                <MessageSquare size={16} className="mt-0.5 flex-shrink-0 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">
                    {conversation.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {conversation.messages[conversation.messages.length - 1]?.content || 'Empty conversation'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                  </p>
                </div>
                
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === conversation.id ? null : conversation.id);
                    }}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-all"
                  >
                    <MoreVertical size={16} />
                  </button>
                  
                  {menuOpenId === conversation.id && (
                    <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[120px]">
                      <button
                        onClick={(e) => handleDelete(e, conversation.id)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};