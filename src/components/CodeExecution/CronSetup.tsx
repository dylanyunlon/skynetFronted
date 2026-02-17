import React, { useState } from 'react';
import { Clock, X, Info } from 'lucide-react';

interface CronSetupProps {
  codeId: string;
  onClose: () => void;
  onSetup: (codeId: string, cronExpression: string, jobName?: string) => Promise<void>;
}

export const CronSetup: React.FC<CronSetupProps> = ({
  codeId,
  onClose,
  onSetup,
}) => {
  const [cronExpression, setCronExpression] = useState('');
  const [jobName, setJobName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cronExamples = [
    { expression: '*/5 * * * *', description: 'Every 5 minutes' },
    { expression: '0 * * * *', description: 'Every hour' },
    { expression: '0 0 * * *', description: 'Daily at midnight' },
    { expression: '0 2 * * *', description: 'Daily at 2 AM' },
    { expression: '0 0 * * 1', description: 'Weekly on Monday' },
    { expression: '0 0 1 * *', description: 'Monthly on the 1st' },
  ];

  const handleSubmit = async () => {
    if (!cronExpression) return;
    
    setIsSubmitting(true);
    try {
      await onSetup(codeId, cronExpression, jobName || undefined);
      onClose();
    } catch (error) {
      console.error('Failed to setup cron:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock size={20} />
            Setup Cron Job
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Job Name (Optional)
            </label>
            <input
              type="text"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              placeholder="e.g., system-monitor"
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Cron Expression <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={cronExpression}
              onChange={(e) => setCronExpression(e.target.value)}
              placeholder="*/5 * * * *"
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 font-mono"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Cron Expression Format:</p>
                <p className="font-mono text-xs">* * * * *</p>
                <p className="text-xs mt-1">
                  minute hour day month weekday
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Quick Templates:</p>
            <div className="grid grid-cols-2 gap-2">
              {cronExamples.map((example) => (
                <button
                  key={example.expression}
                  onClick={() => setCronExpression(example.expression)}
                  className="text-left p-2 border dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <p className="font-mono text-sm">{example.expression}</p>
                  <p className="text-xs text-gray-500">{example.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t dark:border-gray-700 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!cronExpression || isSubmitting}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {isSubmitting ? 'Setting up...' : 'Setup Cron Job'}
          </button>
        </div>
      </div>
    </div>
  );
};