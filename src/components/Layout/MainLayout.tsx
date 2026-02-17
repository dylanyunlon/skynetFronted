import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from '../Sidebar/Sidebar';
import { Conversation } from '@/types';

interface MainLayoutProps {
  children: React.ReactNode;
  conversations: Conversation[];
  currentConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
  onDeleteConversation: (conversationId: string) => void;
  onNewChat: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewChat,
  selectedModel,
  onModelChange,
}) => {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={onSelectConversation}
        onDeleteConversation={onDeleteConversation}
        onNewChat={onNewChat}
      />
      
      <div className="flex-1 flex flex-col">
        <Header
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          selectedModel={selectedModel}
          onModelChange={onModelChange}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onNewChat={onNewChat}
        />
        
        {children}
      </div>
    </div>
  );
};
