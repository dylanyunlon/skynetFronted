import React, { useState, useEffect } from 'react';
import { Copy, Check, Play, Clock, FileCode } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';

interface CodeBlockProps {
  language: string;
  code: string;
  codeId?: string;
  saved?: boolean;
  onExecute?: (codeId: string) => void;
  onSetupCron?: (codeId: string) => void;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  language,
  code,
  codeId,
  saved,
  onExecute,
  onSetupCron,
}) => {
  const [copied, setCopied] = useState(false);
  const [highlighted, setHighlighted] = useState('');

  useEffect(() => {
    const highlighted = Prism.highlight(
      code,
      Prism.languages[language] || Prism.languages.plaintext,
      language
    );
    setHighlighted(highlighted);
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 20000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="relative group my-3 rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <FileCode size={14} className="text-gray-400" />
          <span className="text-xs font-mono text-gray-400">{language}</span>
          {saved && (
            <span className="text-xs px-2 py-0.5 bg-green-900 text-green-300 rounded">
              Saved
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors"
            title="Copy code"
          >
            {copied ? (
              <Check size={14} className="text-green-400" />
            ) : (
              <Copy size={14} className="text-gray-400" />
            )}
          </button>
          
          {saved && codeId && (
            <>
              {onExecute && (
                <button
                  onClick={() => onExecute(codeId)}
                  className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                  title="Execute code"
                >
                  <Play size={14} className="text-gray-400" />
                </button>
              )}
              
              {onSetupCron && (
                <button
                  onClick={() => onSetupCron(codeId)}
                  className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                  title="Setup cron job"
                >
                  <Clock size={14} className="text-gray-400" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm leading-relaxed">
          <code
            className={`language-${language}`}
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
      </div>
    </div>
  );
};
