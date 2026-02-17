import React, { useState, useEffect } from 'react';
import { 
  Folder, Plus, Play, Edit, Trash2, Save, X, 
  FileCode, Terminal, Clock, CheckCircle, AlertCircle,
  FolderOpen, File, Code2, Coffee,
  GitBranch, Download, Upload, Search, Filter
} from 'lucide-react';
import { api } from '@/services/api';
import { Project, ProjectFile, WorkspaceInfo } from '@/types';

interface ProjectManagerProps {
  onOpenProject?: (project: Project) => void;
  onCreateProject?: () => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ 
  onOpenProject, 
  onCreateProject 
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [workspaceInfo, setWorkspaceInfo] = useState<WorkspaceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createPrompt, setCreatePrompt] = useState('');
  const [createProjectType, setCreateProjectType] = useState<'python' | 'javascript'>('python');

  useEffect(() => {
    // 调试：检查 token 状态
    console.log('[ProjectManager] Component mounted');
    console.log('[ProjectManager] localStorage token:', localStorage.getItem('chatbot_token') ? 'exists' : 'missing');
    
    // 确保 API 服务已经加载了 token
    api.loadToken();
    
    // 延迟加载，确保认证信息已准备好
    const timer = setTimeout(() => {
      console.log('[ProjectManager] Starting to load projects and workspace info...');
      loadProjects();
      loadWorkspaceInfo();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      console.log('[ProjectManager] Loading projects...');
      const projectList = await api.listProjects({ status: 'active' });
      setProjects(projectList);
      console.log('[ProjectManager] Projects loaded:', projectList.length);
    } catch (error: any) {
      console.error('Failed to load projects:', error);
      // 如果是 401 错误，可能需要重新登录
      if (error.response?.status === 401) {
        console.error('Authentication error, token might be invalid');
        // 尝试重新加载 token
        api.loadToken();
        // 如果还是失败，重定向到登录页
        if (!localStorage.getItem('chatbot_token')) {
          console.error('No token found, redirecting to login...');
          window.location.href = '/login';
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadWorkspaceInfo = async () => {
    try {
      const info = await api.getWorkspaceInfo();
      setWorkspaceInfo(info);
    } catch (error: any) {
      console.error('Failed to load workspace info:', error);
      // 不阻塞主要功能，只是记录错误
    }
  };

  const handleCreateProject = async () => {
    if (!createPrompt.trim()) return;

    try {
      setIsLoading(true);
      const result = await api.createProjectFromPrompt({
        prompt: createPrompt,
        project_type: createProjectType,
        auto_execute: true,
        max_debug_attempts: 3
      });

      if (result.success && result.project_id) {
        // 重新加载项目列表
        await loadProjects();
        setShowCreateModal(false);
        setCreatePrompt('');
        
        // 如果有项目详情，直接打开
        if (result.project_detail && onOpenProject) {
          onOpenProject(result.project_detail);
        }
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('创建项目失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('确定要删除这个项目吗？')) return;

    try {
      await api.deleteProject(projectId);
      await loadProjects();
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('删除项目失败');
    }
  };

  const handleExecuteProject = async (project: Project) => {
    try {
      setIsLoading(true);
      const result = await api.executeProject({
        project_id: project.id,
        max_debug_attempts: 3
      });

      // 显示执行结果
      alert(`执行${result.success ? '成功' : '失败'}\n退出码: ${result.exit_code}\n${result.stdout || result.stderr}`);
    } catch (error) {
      console.error('Failed to execute project:', error);
      alert('执行项目失败');
    } finally {
      setIsLoading(false);
    }
  };

  const getProjectIcon = (type: string) => {
    switch (type) {
      case 'python':
        return <FileCode className="w-4 h-4 text-yellow-500" />;
      case 'javascript':
      case 'typescript':
        return <Coffee className="w-4 h-4 text-yellow-600" />;
      default:
        return <Code2 className="w-4 h-4" />;
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || project.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            项目管理
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            新建项目
          </button>
        </div>

        {/* Workspace Info */}
        {workspaceInfo && (
          <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                存储使用: {(workspaceInfo.total_size / 1024 / 1024).toFixed(2)} MB
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                项目数: {workspaceInfo.total_projects}
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${workspaceInfo.storage_used_percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索项目..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">所有类型</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
          </select>
        </div>
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || filterType !== 'all' ? '没有找到匹配的项目' : '还没有项目，点击"新建项目"开始'}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onOpenProject?.(project)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      {getProjectIcon(project.type)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <File className="w-3 h-3" />
                          {project.file_count} 文件
                        </span>
                        <span>
                          {(project.size / 1024).toFixed(1)} KB
                        </span>
                        <span>
                          {new Date(project.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExecuteProject(project);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="执行项目"
                    >
                      <Play className="w-4 h-4 text-green-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="删除项目"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                创建新项目
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  项目类型
                </label>
                <select
                  value={createProjectType}
                  onChange={(e) => setCreateProjectType(e.target.value as 'python' | 'javascript')}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  项目描述
                </label>
                <textarea
                  value={createPrompt}
                  onChange={(e) => setCreatePrompt(e.target.value)}
                  placeholder="描述你想要创建的项目，例如：创建一个Flask任务管理Web应用..."
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={6}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={!createPrompt.trim() || isLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      创建中...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      创建项目
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};