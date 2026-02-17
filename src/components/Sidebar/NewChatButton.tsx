import React from 'react';
import { Plus, Edit3 } from 'lucide-react';

interface NewChatButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const NewChatButton: React.FC<NewChatButtonProps> = ({ 
  onClick, 
  variant = 'primary' 
}) => {
  if (variant === 'secondary') {
    return (
      <button
        onClick={onClick}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        title="New chat"
      >
        <Edit3 size={20} />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
    >
      <Plus size={20} />
      New Chat
    </button>
  );
};