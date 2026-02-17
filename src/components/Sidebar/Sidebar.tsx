import React from 'react';
import { Menu, Settings, LogOut, HelpCircle } from 'lucide-react';
import { ConversationList } from './ConversationList';
import { NewChatButton } from './NewChatButton';
import { Conversation } from '@/types';
import { useAuthStore } from '@/store/auth';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  conversations: Conversation[];
  currentConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
  onDeleteConversation: (conversationId: string) => void;
  onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewChat,
}) => {
  const { user, logout } = useAuthStore();

  return (
    <div className={`
      ${isOpen ? 'w-64' : 'w-0'} 
      transition-all duration-300 bg-gray-50 dark:bg-gray-800 
      border-r border-gray-200 dark:border-gray-700 
      flex flex-col overflow-hidden
    `}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Chats</h2>
          <button
            onClick={onToggle}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>
        
        <NewChatButton onClick={onNewChat} />
      </div>
      
      <ConversationList
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={onSelectConversation}
        onDeleteConversation={onDeleteConversation}
      />
      
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-1">
        <button className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <Settings size={18} />
          <span className="text-sm">Settings</span>
        </button>
        
        <button className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <HelpCircle size={18} />
          <span className="text-sm">Help</span>
        </button>
        
        <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
            {user?.username || 'Guest'}
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-red-600"
          >
            <LogOut size={18} />
            <span className="text-sm">Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
};