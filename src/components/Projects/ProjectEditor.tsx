import React, { useState, useEffect } from 'react';
import { 
  X, Save, Play, Terminal, FileText, Plus, Trash2, 
  Edit2, FolderOpen, File, ChevronRight, ChevronDown,
  Download, Upload, RefreshCw, Settings, Code2
} from 'lucide-react';
import { api } from '@/services/api';
import { Project, ProjectFile, FileOperation } from '@/types';
import { CodeBlock } from '@/components/Chat/CodeBlock';

interface ProjectEditorProps {
  project: Project;
  onClose: () => void;
  onProjectUpdate?: (project: Project) => void;
}

interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
}

export const ProjectEditor: React.FC<ProjectEditorProps> = ({ 
  project, 
  onClose,
  onProjectUpdate 
}) => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [executionResult, setExecutionResult] = useState<string>('');
  const [showTerminal, setShowTerminal] = useState(false);
  const [showAiEditModal, setShowAiEditModal] = useState(false);
  const [aiEditPrompt, setAiEditPrompt] = useState('');

  useEffect(() => {
    loadProjectDetails();
  }, [project.id]);

  const loadProjectDetails = async () => {
    try {
      setIsLoading(true);
      const details = await api.getProjectDetail(project.id);
      if (details.files) {
        buildFileTree(details.files);
      }
      onProjectUpdate?.(details);
    } catch (error) {
      console.error('Failed to load project details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const buildFileTree = (files: ProjectFile[]) => {
    const tree: FileTreeNode[] = [];
    const map = new Map<string, FileTreeNode>();

    // Sort files by path
    files.sort((a, b) => a.path.localeCompare(b.path));

    files.forEach(file => {
      const parts = file.path.split('/');
      let currentLevel = tree;

      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;
        const currentPath = parts.slice(0, index + 1).join('/');

        if (!map.has(currentPath)) {
          const node: FileTreeNode = {
            name: part,
            path: currentPath,
            type: isFile ? 'file' : 'folder',
            children: isFile ? undefined : []
          };

          map.set(currentPath, node);
          
          if (index === 0) {
            currentLevel.push(node);
          } else {
            const parentPath = parts.slice(0, index).join('/');
            const parent = map.get(parentPath);
            if (parent && parent.children) {
              parent.children.push(node);
            }
          }
        }

        if (!isFile) {
          const node = map.get(currentPath);
          if (node && node.children) {
            currentLevel = node.children;
          }
        }
      });
    });

    setFileTree(tree);
  };

  const loadFileContent = async (filePath: string) => {
    try {
      setIsLoading(true);
      const file = await api.getFileContent(project.id, filePath);
      setSelectedFile(file);
      setFileContent(file.content);
      setIsEditing(false);
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to load file content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFile = async () => {
    if (!selectedFile || !isDirty) return;

    try {
      setIsLoading(true);
      const operations: FileOperation[] = [{
        type: 'update',
        path: selectedFile.path,
        content: fileContent,
        old_content: selectedFile.content
      }];

      await api.updateProjectFiles(project.id, operations, `Update ${selectedFile.path}`);
      
      // Update local state
      setSelectedFile({ ...selectedFile, content: fileContent });
      setIsDirty(false);
      
      // Reload project details
      await loadProjectDetails();
    } catch (error) {
      console.error('Failed to save file:', error);
      alert('保存文件失败');
    } finally {
      setIsLoading(false);
    }
  };

  const executeProject = async () => {
    try {
      setIsLoading(true);
      setShowTerminal(true);
      setExecutionResult('正在执行项目...\n');

      const result = await api.executeProject({
        project_id: project.id,
        max_debug_attempts: 3
      });

      let output = `执行${result.success ? '成功' : '失败'}\n`;
      output += `退出码: ${result.exit_code || 0}\n`;
      output += '=' .repeat(50) + '\n';

      if (result.stdout) {
        output += '标准输出:\n' + result.stdout + '\n';
      }

      if (result.stderr) {
        output += '\n错误输出:\n' + result.stderr + '\n';
      }

      if (result.debug_attempts && result.debug_attempts > 0) {
        output += `\n调试次数: ${result.debug_attempts}\n`;
      }

      setExecutionResult(output);
    } catch (error) {
      console.error('Failed to execute project:', error);
      setExecutionResult('执行失败: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiEdit = async () => {
    if (!selectedFile || !aiEditPrompt.trim()) return;

    try {
      setIsLoading(true);
      const result = await api.editProjectFile({
        project_id: project.id,
        file_path: selectedFile.path,
        prompt: aiEditPrompt
      });

      if (result.success) {
        setFileContent(result.new_content);
        setIsDirty(true);
        setShowAiEditModal(false);
        setAiEditPrompt('');
      }
    } catch (error) {
      console.error('Failed to edit file with AI:', error);
      alert('AI 编辑失败');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileTree = (nodes: FileTreeNode[], level = 0) => {
    return nodes.map(node => (
      <div key={node.path}>
        <div
          className={`flex items-center gap-2 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded ${
            selectedFile?.path === node.path ? 'bg-blue-100 dark:bg-blue-900' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (node.type === 'file') {
              loadFileContent(node.path);
            } else {
              toggleFolder(node.path);
            }
          }}
        >
          {node.type === 'folder' ? (
            <>
              {expandedFolders.has(node.path) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <FolderOpen className="w-4 h-4 text-yellow-600" />
            </>
          ) : (
            <>
              <div className="w-4" />
              <File className="w-4 h-4 text-gray-500" />
            </>
          )}
          <span className="text-sm">{node.name}</span>
        </div>
        {node.type === 'folder' && expandedFolders.has(node.path) && node.children && (
          <div>{renderFileTree(node.children, level + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-100">{project.name}</h2>
          {selectedFile && (
            <span className="text-sm text-gray-400">{selectedFile.path}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={executeProject}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
          >
            <Play className="w-4 h-4" />
            运行
          </button>
          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="终端"
          >
            <Terminal className="w-5 h-5 text-gray-300" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Tree */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">文件</span>
              <button
                onClick={loadProjectDetails}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
                title="刷新"
              >
                <RefreshCw className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            {isLoading && fileTree.length === 0 ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : (
              <div>{renderFileTree(fileTree)}</div>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          {selectedFile ? (
            <>
              {/* Editor Toolbar */}
              <div className="bg-gray-700 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={saveFile}
                        disabled={!isDirty}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm flex items-center gap-1"
                      >
                        <Save className="w-4 h-4" />
                        保存
                      </button>
                      <button
                        onClick={() => {
                          setFileContent(selectedFile.content);
                          setIsEditing(false);
                          setIsDirty(false);
                        }}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm"
                      >
                        取消
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm flex items-center gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        编辑
                      </button>
                      <button
                        onClick={() => setShowAiEditModal(true)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm flex items-center gap-1"
                      >
                        <Code2 className="w-4 h-4" />
                        AI 编辑
                      </button>
                    </>
                  )}
                </div>
                {isDirty && (
                  <span className="text-sm text-yellow-400">• 未保存</span>
                )}
              </div>

              {/* Code Editor */}
              <div className="flex-1 overflow-auto bg-gray-900">
                {isEditing ? (
                  <textarea
                    value={fileContent}
                    onChange={(e) => {
                      setFileContent(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full h-full p-4 bg-gray-900 text-gray-300 font-mono text-sm resize-none focus:outline-none"
                    spellCheck={false}
                  />
                ) : (
                  <div className="p-4">
                    <CodeBlock
                      code={{
                        id: selectedFile.path,
                        language: selectedFile.language,
                        content: fileContent
                      }}
                      onExecute={() => {}}
                      onSetupCron={() => {}}
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>选择一个文件开始编辑</p>
              </div>
            </div>
          )}
        </div>

        {/* Terminal */}
        {showTerminal && (
          <div className="w-full h-64 bg-black border-t border-gray-700">
            <div className="p-2 bg-gray-800 flex items-center justify-between">
              <span className="text-sm text-gray-300">终端输出</span>
              <button
                onClick={() => setShowTerminal(false)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <pre className="p-4 text-green-400 font-mono text-sm overflow-auto h-full">
              {executionResult || '等待执行...'}
            </pre>
          </div>
        )}
      </div>

      {/* AI Edit Modal */}
      {showAiEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">
              AI 编辑文件: {selectedFile?.path}
            </h3>
            <textarea
              value={aiEditPrompt}
              onChange={(e) => setAiEditPrompt(e.target.value)}
              placeholder="描述你想要的修改，例如：添加错误处理、优化性能、添加注释..."
              className="w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={4}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowAiEditModal(false)}
                className="px-4 py-2 text-gray-400 hover:bg-gray-700 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAiEdit}
                disabled={!aiEditPrompt.trim() || isLoading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                {isLoading ? '处理中...' : '应用修改'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};