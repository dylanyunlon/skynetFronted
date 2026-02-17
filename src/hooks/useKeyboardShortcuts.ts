import { useEffect } from 'react';
import { SHORTCUTS } from '@/config/constants';

interface ShortcutHandlers {
  onSendMessage?: () => void;
  onNewChat?: () => void;
  onToggleTheme?: () => void;
  onShowHelp?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for modifier keys
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      
      if (isCtrlOrCmd) {
        switch (e.key.toLowerCase()) {
          case 'enter':
            e.preventDefault();
            handlers.onSendMessage?.();
            break;
          case 'k':
            e.preventDefault();
            handlers.onNewChat?.();
            break;
          case 'd':
            e.preventDefault();
            handlers.onToggleTheme?.();
            break;
          case '/':
            e.preventDefault();
            handlers.onShowHelp?.();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlers]);
}
