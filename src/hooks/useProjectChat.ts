import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { Project, CreateProjectRequest } from '@/types';

interface ProjectCommand {
  command: string;
  description: string;
  usage: string;
}

export const PROJECT_COMMANDS: ProjectCommand[] = [
  {
    command: '/new',
    description: '创建新项目',
    usage: '/new <项目描述>'
  },
  {
    command: '/list',
    description: '列出所有项目',
    usage: '/list'
  },
  {
    command: '/open',
    description: '打开项目',
    usage: '/open <项目ID>'
  },
  {
    command: '/run',
    description: '运行当前项目',
    usage: '/run [入口文件]'
  },
  {
    command: '/edit',
    description: '编辑文件',
    usage: '/edit <文件路径>'
  },
  {
    command: '/delete',
    description: '删除项目',
    usage: '/delete <项目ID>'
  },
  {
    command: '/workspace',
    description: '查看工作空间信息',
    usage: '/workspace'
  }
];

export function useProjectChat() {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const detectProjectType = (prompt: string): CreateProjectRequest['project_type'] => {
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('python') || lowerPrompt.includes('flask') || lowerPrompt.includes('django')) {
      return 'python';
    }
    if (lowerPrompt.includes('javascript') || lowerPrompt.includes('node') || lowerPrompt.includes('react')) {
      return 'javascript';
    }
    if (lowerPrompt.includes('typescript')) {
      return 'typescript';
    }
    return undefined;
  };

  const processProjectCommand = useCallback(async (
    input: string
  ): Promise<{
    isCommand: boolean;
    response?: string;
    action?: () => void;
  }> => {
    const parts = input.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    if (!command.startsWith('/')) {
      return { isCommand: false };
    }

    setIsProcessing(true);

    try {
      switch (command) {
        case '/new': {
          if (!args) {
            return {
              isCommand: true,
              response: '❌ 请提供项目描述\n用法: /new <项目描述>'
            };
          }

          const projectType = detectProjectType(args);
          const result = await api.createProjectFromPrompt({
            prompt: args,
            project_type: projectType,
            auto_execute: true,
            max_debug_attempts: 3
          });

          if (result.success && result.project_id) {
            const project = result.project_detail || await api.getProjectDetail(result.project_id);
            setCurrentProject(project);

            let response = `✅ 项目创建成功！\n`;
            response += `📁 项目名称: ${project.name}\n`;
            response += `🆔 项目ID: ${project.id}\n`;
            response += `📄 文件数: ${project.file_count}\n`;

            if (result.execution_result) {
              response += `\n🚀 自动执行结果:\n`;
              response += `退出码: ${result.execution_result.exit_code || 0}\n`;
              if (result.execution_result.stdout) {
                response += `输出:\n${result.execution_result.stdout.slice(0, 500)}`;
                if (result.execution_result.stdout.length > 500) {
                  response += '\n... (输出已截断)';
                }
              }
            }

            return {
              isCommand: true,
              response,
              action: () => {
                // 可以触发打开项目编辑器
                window.dispatchEvent(new CustomEvent('open-project', { detail: project }));
              }
            };
          } else {
            return {
              isCommand: true,
              response: '❌ 创建项目失败'
            };
          }
        }

        case '/list': {
          const projects = await api.listProjects({ status: 'active' });
          
          if (projects.length === 0) {
            return {
              isCommand: true,
              response: '📋 没有找到项目'
            };
          }

          let response = `📋 找到 ${projects.length} 个项目:\n\n`;
          projects.forEach((project, index) => {
            const icon = project.status === 'active' ? '🟢' : '🔴';
            response += `${icon} ${index + 1}. ${project.name}\n`;
            response += `   ID: ${project.id}\n`;
            response += `   类型: ${project.type}\n`;
            response += `   文件数: ${project.file_count}\n`;
            response += `   创建时间: ${new Date(project.created_at).toLocaleDateString()}\n\n`;
          });

          return { isCommand: true, response };
        }

        case '/open': {
          if (!args) {
            return {
              isCommand: true,
              response: '❌ 请提供项目ID\n用法: /open <项目ID>'
            };
          }

          const project = await api.getProjectDetail(args);
          setCurrentProject(project);

          return {
            isCommand: true,
            response: `✅ 已打开项目: ${project.name}`,
            action: () => {
              window.dispatchEvent(new CustomEvent('open-project', { detail: project }));
            }
          };
        }

        case '/run': {
          if (!currentProject) {
            return {
              isCommand: true,
              response: '❌ 请先打开一个项目'
            };
          }

          const entryPoint = args || undefined;
          const result = await api.executeProject({
            project_id: currentProject.id,
            entry_point: entryPoint,
            max_debug_attempts: 3
          });

          let response = `🚀 执行${result.success ? '成功' : '失败'}\n`;
          response += `退出码: ${result.exit_code || 0}\n`;
          
          if (result.stdout) {
            response += `\n📤 输出:\n${result.stdout}`;
          }
          
          if (result.stderr) {
            response += `\n❌ 错误:\n${result.stderr}`;
          }

          if (result.debug_attempts && result.debug_attempts > 0) {
            response += `\n🔧 调试次数: ${result.debug_attempts}`;
          }

          return { isCommand: true, response };
        }

        case '/delete': {
          if (!args) {
            return {
              isCommand: true,
              response: '❌ 请提供项目ID\n用法: /delete <项目ID>'
            };
          }

          await api.deleteProject(args);
          
          if (currentProject?.id === args) {
            setCurrentProject(null);
          }

          return {
            isCommand: true,
            response: `✅ 项目已删除`
          };
        }

        case '/workspace': {
          const info = await api.getWorkspaceInfo();
          
          let response = '📊 工作空间信息:\n';
          response += `👤 用户ID: ${info.user_id}\n`;
          response += `📁 项目总数: ${info.total_projects}\n`;
          response += `💾 存储使用: ${(info.total_size / 1024 / 1024).toFixed(2)} MB\n`;
          response += `📊 使用率: ${info.storage_used_percentage.toFixed(1)}%`;

          return { isCommand: true, response };
        }

        case '/help': {
          let response = '🤖 项目管理命令:\n';
          response += '==================================================\n';
          PROJECT_COMMANDS.forEach(cmd => {
            response += `${cmd.command} - ${cmd.description}\n`;
            response += `   用法: ${cmd.usage}\n\n`;
          });
          response += '==================================================';

          return { isCommand: true, response };
        }

        default: {
          return {
            isCommand: true,
            response: `❌ 未知命令: ${command}\n输入 /help 查看可用命令`
          };
        }
      }
    } catch (error) {
      console.error('Project command error:', error);
      return {
        isCommand: true,
        response: `❌ 执行命令失败: ${error}`
      };
    } finally {
      setIsProcessing(false);
    }
  }, [currentProject]);

  const suggestProjectActions = useCallback((content: string): string[] => {
    const suggestions: string[] = [];
    const lowerContent = content.toLowerCase();

    // 根据对话内容建议项目操作
    if (lowerContent.includes('创建') || lowerContent.includes('新建')) {
      suggestions.push('使用 /new 命令创建新项目');
    }

    if (lowerContent.includes('项目') && !currentProject) {
      suggestions.push('使用 /list 查看所有项目');
    }

    if (currentProject) {
      suggestions.push(`运行当前项目: /run`);
      suggestions.push(`查看项目文件: 点击左侧"项目"标签`);
    }

    if (lowerContent.includes('python') || lowerContent.includes('flask') || lowerContent.includes('web')) {
      suggestions.push('创建 Python Web 应用: /new 创建一个Flask任务管理应用');
    }

    if (lowerContent.includes('监控') || lowerContent.includes('系统')) {
      suggestions.push('创建监控脚本: /new 创建一个Python系统监控脚本');
    }

    return suggestions;
  }, [currentProject]);

  return {
    currentProject,
    isProcessing,
    processProjectCommand,
    suggestProjectActions,
    PROJECT_COMMANDS
  };
}