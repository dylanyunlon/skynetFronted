import React, { useState } from 'react';
import { Play, X, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { ExecutionResult } from '@/types';

interface ExecutionPanelProps {
  codeId: string;
  onClose: () => void;
  onExecute: (codeId: string, params?: Record<string, string>) => Promise<ExecutionResult>;
}

export const ExecutionPanel: React.FC<ExecutionPanelProps> = ({
  codeId,
  onClose,
  onExecute,
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [parameters, setParameters] = useState<Record<string, string>>({});

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      const executionResult = await onExecute(codeId, parameters);
      setResult(executionResult);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Execution failed',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold">Code Execution</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Parameters Section */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Parameters (Optional)</h4>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="KEY=value (e.g., BACKUP_DIR=/tmp)"
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    const [key, value] = e.currentTarget.value.split('=');
                    if (key && value) {
                      setParameters({ ...parameters, [key]: value });
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
              {Object.entries(parameters).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {key}={value}
                  </span>
                  <button
                    onClick={() => {
                      const newParams = { ...parameters };
                      delete newParams[key];
                      setParameters(newParams);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Execution Result */}
          {result && (
            <div className="mt-4">
              <div className={`flex items-center gap-2 mb-2 ${
                result.success ? 'text-green-600' : 'text-red-600'
              }`}>
                {result.success ? (
                  <CheckCircle size={20} />
                ) : (
                  <AlertCircle size={20} />
                )}
                <span className="font-medium">
                  {result.success ? 'Execution Successful' : 'Execution Failed'}
                </span>
              </div>
              
              {result.output && (
                <div className="bg-gray-900 text-gray-300 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{result.output}</pre>
                </div>
              )}
              
              {result.error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg mt-2">
                  {result.error}
                </div>
              )}
              
              {result.execution_time && (
                <div className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                  <Clock size={14} />
                  Execution time: {result.execution_time}ms
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t dark:border-gray-700">
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {isExecuting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Executing...
              </>
            ) : (
              <>
                <Play size={16} />
                Execute Code
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};