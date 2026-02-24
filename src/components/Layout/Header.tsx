import React from 'react';
import { Moon, Sun, Code, ChevronDown, X, Menu } from 'lucide-react';
import { NewChatButton } from '../Sidebar/NewChatButton';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
}

const models = [
  'Doubao-1.5-pro-256k',
  'GPT-4-Turbo',
  'claude-opus-4-6',
  'Gemini-Pro',
  'Llama-3-70B',
];

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  selectedModel,
  onModelChange,
  sidebarOpen,
  onToggleSidebar,
  onNewChat,
}) => {
  const [showModelDropdown, setShowModelDropdown] = React.useState(false);

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors lg:hidden"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        <h1 className="text-xl font-semibold">Skynet</h1>
        
        <div className="hidden md:block">
          <NewChatButton onClick={onNewChat} variant="secondary" />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Model Selector */}
        <div className="relative">
          <button
            onClick={() => setShowModelDropdown(!showModelDropdown)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Code size={16} />
            <span className="text-sm hidden sm:inline">{selectedModel}</span>
            <ChevronDown size={16} />
          </button>
          
          {showModelDropdown && (
            <>
              <div 
                className="fixed inset-0 z-20"
                onClick={() => setShowModelDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-30">
                <div className="p-2">
                  <p className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wider">
                    Select Model
                  </p>
                  {models.map((model) => (
                    <button
                      key={model}
                      onClick={() => {
                        onModelChange(model);
                        setShowModelDropdown(false);
                      }}
                      className={`
                        w-full text-left px-3 py-2 rounded-lg transition-colors
                        ${selectedModel === model 
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      <div className="font-medium text-sm">{model}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {model.includes('Doubao') && 'Recommended for code'}
                        {model.includes('GPT') && 'General purpose'}
                        {model.includes('Claude') && 'Complex reasoning'}
                        {model.includes('Gemini') && 'Multimodal'}
                        {model.includes('Llama') && 'Open source'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};