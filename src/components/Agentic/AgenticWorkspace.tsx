// src/components/Agentic/AgenticWorkspace.tsx
// Agentic Loop 工作区 — 包含主 Chat 区域 + 侧边状态面板

import React, { useState, useCallback } from 'react';
import {
  Terminal, ChevronRight, ChevronLeft, Zap, Clock,
  FolderOpen, Cpu, DollarSign, FileText, Settings2,
  RotateCcw, Layers, HardDrive, CircleDot
} from 'lucide-react';
import { AgenticChat } from './AgenticChat';

/**
 * AgenticWorkspace — Agentic Loop 全屏工作台
 * 
 * 布局:
 * ┌──────────────────────────────────────┐
 * │ AgenticChat (主区域)    │  SidePanel │
 * │                         │  (可折叠)   │
 * │                         │            │
 * └──────────────────────────────────────┘
 */
export const AgenticWorkspace: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('claude-opus-4-6');
  const [maxTurns, setMaxTurns] = useState(30);
  const [workDir, setWorkDir] = useState('');

  return (
    <div className="flex h-full">
      {/* 主区域 — AgenticChat 全宽 */}
      <div className="flex-1 min-w-0">
        <AgenticChat
          defaultModel={selectedModel}
          defaultMaxTurns={maxTurns}
          defaultWorkDir={workDir}
        />
      </div>

      {/* 侧边栏切换按钮 */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="flex-shrink-0 w-6 bg-gray-800 border-l border-gray-700/50 flex items-center justify-center
                   hover:bg-gray-700 transition-colors text-gray-500 hover:text-gray-300"
        title={sidebarOpen ? '收起面板' : '展开设置面板'}
      >
        {sidebarOpen ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* 设置侧边栏 */}
      {sidebarOpen && (
        <div className="w-72 bg-gray-900 border-l border-gray-700/50 flex flex-col overflow-y-auto flex-shrink-0">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-700/50">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-200">Agentic Settings</h3>
            </div>
          </div>

          <div className="px-4 py-3 space-y-4">
            {/* 模型选择 */}
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1.5">Model</label>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600/50 rounded-lg px-3 py-1.5 text-sm text-gray-200
                           focus:outline-none focus:border-cyan-500/50"
              >
                <option value="claude-opus-4-6">Claude Opus 4.6</option>
                <option value="claude-sonnet-4-5-20250929">Claude Sonnet 4.5</option>
                <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
              </select>
            </div>

            {/* Max Turns */}
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1.5">Max Turns</label>
              <input
                type="number"
                value={maxTurns}
                onChange={e => setMaxTurns(parseInt(e.target.value) || 30)}
                min={1}
                max={100}
                className="w-full bg-gray-800 border border-gray-600/50 rounded-lg px-3 py-1.5 text-sm text-gray-200
                           focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            {/* Work Directory */}
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1.5">Work Directory (optional)</label>
              <input
                type="text"
                value={workDir}
                onChange={e => setWorkDir(e.target.value)}
                placeholder="/path/to/project"
                className="w-full bg-gray-800 border border-gray-600/50 rounded-lg px-3 py-1.5 text-sm text-gray-200
                           placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
              />
              <p className="text-[10px] text-gray-600 mt-1">留空则自动创建临时工作目录</p>
            </div>

            {/* 分割线 */}
            <div className="border-t border-gray-700/50 pt-3">
              <h4 className="text-xs text-gray-400 font-medium mb-2">工具能力</h4>
              <div className="space-y-1.5">
                {[
                  { icon: <Terminal className="w-3 h-3" />, label: 'Bash / 脚本执行', color: 'text-yellow-400' },
                  { icon: <FileText className="w-3 h-3" />, label: '文件读写 / 编辑', color: 'text-blue-400' },
                  { icon: <Zap className="w-3 h-3" />, label: 'Web 搜索 / 抓取', color: 'text-cyan-400' },
                  { icon: <Layers className="w-3 h-3" />, label: '批量命令 / 多文件', color: 'text-green-400' },
                  { icon: <RotateCcw className="w-3 h-3" />, label: '调试 / 回滚 / 测试', color: 'text-orange-400' },
                  { icon: <CircleDot className="w-3 h-3" />, label: 'SubAgent / Todo', color: 'text-pink-400' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className={item.color}>{item.icon}</span>
                    <span className="text-gray-400">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 架构说明 */}
            <div className="border-t border-gray-700/50 pt-3">
              <h4 className="text-xs text-gray-400 font-medium mb-2">Loop 模式</h4>
              <div className="bg-gray-800/50 rounded-lg p-2.5 text-[11px] text-gray-500 leading-relaxed">
                <p className="mb-1"><strong className="text-gray-400">Think</strong> → AI 分析任务</p>
                <p className="mb-1"><strong className="text-gray-400">Act</strong> → 调用工具执行</p>
                <p className="mb-1"><strong className="text-gray-400">Observe</strong> → 获取结果反馈</p>
                <p><strong className="text-gray-400">Repeat</strong> → 循环直到完成</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgenticWorkspace;