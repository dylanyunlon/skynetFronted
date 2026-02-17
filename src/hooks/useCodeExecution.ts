import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { ExecutionResult } from '@/types';

export function useCodeExecution() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<Record<string, ExecutionResult>>({});

  const executeCode = useCallback(async (
    codeId: string,
    parameters?: Record<string, string>
  ): Promise<ExecutionResult> => {
    setIsExecuting(true);
    
    try {
      const response = await api.executeCode(codeId, parameters);
      
      if (response.success) {
        const result: ExecutionResult = {
          success: response.data.result.success,
          output: response.data.result.output,
          error: response.data.result.error,
          execution_time: response.data.result.execution_time,
        };
        
        setExecutionResults(prev => ({
          ...prev,
          [codeId]: result,
        }));
        
        return result;
      } else {
        throw new Error('Execution failed');
      }
    } catch (error) {
      const errorResult: ExecutionResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      
      setExecutionResults(prev => ({
        ...prev,
        [codeId]: errorResult,
      }));
      
      return errorResult;
    } finally {
      setIsExecuting(false);
    }
  }, []);

  const setupCron = useCallback(async (
    codeId: string,
    cronExpression: string,
    jobName?: string
  ) => {
    try {
      const response = await api.setupCron(codeId, cronExpression, jobName);
      return response.success;
    } catch (error) {
      console.error('Setup cron error:', error);
      return false;
    }
  }, []);

  const getExecutionResult = useCallback((codeId: string) => {
    return executionResults[codeId];
  }, [executionResults]);

  return {
    executeCode,
    setupCron,
    getExecutionResult,
    isExecuting,
    executionResults,
  };
}