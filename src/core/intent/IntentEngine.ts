import { Project } from '@/types';

export type IntentType = 
  | 'create_project'
  | 'execute_project' 
  | 'edit_file'
  | 'list_projects'
  | 'delete_project'
  | 'upload_file'
  | 'terminal_command'
  | 'setup_cron'
  | 'view_project'
  | 'help'
  | 'chat';

export interface IntentResult {
  intent: IntentType;
  confidence: number;
  extractedData?: {
    projectName?: string;
    projectType?: 'python' | 'javascript' | 'typescript';
    fileName?: string;
    cronExpression?: string;
    command?: string;
    language?: string;
    description?: string;
  };
  suggestions?: string[];
}

export interface IntentPattern {
  keywords: string[];
  requiredKeywords?: string[];
  excludeKeywords?: string[];
  intent: IntentType;
  confidence: number;
  extractor?: (input: string) => any;
}

export class IntentEngine {
  private patterns: IntentPattern[] = [
    // 项目创建
    {
      keywords: ['创建', '新建', '生成', '构建', '搭建', '开发', '制作'],
      requiredKeywords: ['项目', '应用', '网站', '系统', '工具', 'app', 'website'],
      intent: 'create_project',
      confidence: 0.9,
      extractor: this.extractProjectInfo
    },
    {
      keywords: ['创建', '新建', '生成'],
      requiredKeywords: ['react', 'vue', 'angular', 'flask', 'django', 'fastapi', 'express'],
      intent: 'create_project',
      confidence: 0.85,
      extractor: this.extractProjectInfo
    },

    // 项目执行
    {
      keywords: ['运行', '执行', '启动', '跑', 'run', 'execute', 'start'],
      requiredKeywords: ['项目', '应用', 'app'],
      intent: 'execute_project',
      confidence: 0.9,
      extractor: this.extractProjectName
    },

    // 文件编辑
    {
      keywords: ['修改', '编辑', '更新', '改', '优化', 'edit', 'modify', 'update'],
      requiredKeywords: ['文件', '代码', 'code', 'file'],
      intent: 'edit_file',
      confidence: 0.8,
      extractor: this.extractFileInfo
    },

    // 项目列表
    {
      keywords: ['显示', '查看', '列出', '列表', '展示', 'list', 'show'],
      requiredKeywords: ['项目', '应用', 'projects'],
      intent: 'list_projects',
      confidence: 0.9
    },
    {
      keywords: ['我的项目', '所有项目', '项目列表'],
      intent: 'list_projects',
      confidence: 0.95
    },

    // 项目查看
    {
      keywords: ['查看', '打开', '详情', 'view', 'open'],
      requiredKeywords: ['项目'],
      intent: 'view_project',
      confidence: 0.8,
      extractor: this.extractProjectName
    },

    // 项目删除
    {
      keywords: ['删除', '移除', '清除', 'delete', 'remove'],
      requiredKeywords: ['项目'],
      intent: 'delete_project',
      confidence: 0.85,
      extractor: this.extractProjectName
    },

    // 定时任务
    {
      keywords: ['定时', '计划', '定期', '每天', '每小时', 'cron', 'schedule'],
      requiredKeywords: ['运行', '执行'],
      intent: 'setup_cron',
      confidence: 0.8,
      extractor: this.extractCronInfo
    },

    // 终端命令
    {
      keywords: ['终端', '命令行', '命令', 'terminal', 'command', 'cmd'],
      intent: 'terminal_command',
      confidence: 0.7,
      extractor: this.extractCommand
    },

    // 文件上传
    {
      keywords: ['上传', '导入', 'upload', 'import'],
      requiredKeywords: ['文件'],
      intent: 'upload_file',
      confidence: 0.8
    },

    // 帮助
    {
      keywords: ['帮助', '教程', '指南', '使用', 'help', '/help'],
      intent: 'help',
      confidence: 1.0
    }
  ];

  // 项目类型检测关键词
  private projectTypeKeywords = {
    python: ['python', 'flask', 'django', 'fastapi', 'streamlit', '爬虫', '数据分析', '机器学习'],
    javascript: ['javascript', 'js', 'react', 'vue', 'angular', 'express', 'node', 'web应用'],
    typescript: ['typescript', 'ts', 'nest', 'next']
  };

  analyze(input: string, context?: { currentProject?: Project; recentProjects?: Project[] }): IntentResult {
    const cleanInput = input.toLowerCase().trim();
    let bestMatch: IntentResult = {
      intent: 'chat',
      confidence: 0.3
    };

    // 遍历所有模式
    for (const pattern of this.patterns) {
      const score = this.calculateScore(cleanInput, pattern);
      
      if (score > bestMatch.confidence) {
        bestMatch = {
          intent: pattern.intent,
          confidence: score,
          extractedData: pattern.extractor ? pattern.extractor(input) : undefined
        };
      }
    }

    // 基于上下文调整置信度
    if (context) {
      bestMatch = this.adjustWithContext(bestMatch, cleanInput, context);
    }

    // 生成建议
    bestMatch.suggestions = this.generateSuggestions(bestMatch.intent, bestMatch.extractedData);

    return bestMatch;
  }

  private calculateScore(input: string, pattern: IntentPattern): number {
    let score = 0;
    const words = input.split(/\s+/);

    // 检查必需关键词
    if (pattern.requiredKeywords) {
      const hasAllRequired = pattern.requiredKeywords.every(keyword => 
        input.includes(keyword.toLowerCase())
      );
      if (!hasAllRequired) return 0;
    }

    // 检查排除关键词
    if (pattern.excludeKeywords) {
      const hasExcluded = pattern.excludeKeywords.some(keyword =>
        input.includes(keyword.toLowerCase())
      );
      if (hasExcluded) return 0;
    }

    // 计算关键词匹配分数
    const matchedKeywords = pattern.keywords.filter(keyword =>
      input.includes(keyword.toLowerCase())
    );

    if (matchedKeywords.length > 0) {
      score = pattern.confidence * (matchedKeywords.length / pattern.keywords.length);
      
      // 精确匹配加分
      if (pattern.keywords.some(keyword => input === keyword.toLowerCase())) {
        score += 0.1;
      }
    }

    return Math.min(score, 1.0);
  }

  private adjustWithContext(
    result: IntentResult, 
    input: string, 
    context: { currentProject?: Project; recentProjects?: Project[] }
  ): IntentResult {
    // 如果当前有选中的项目，提高项目相关操作的置信度
    if (context.currentProject) {
      if (['execute_project', 'edit_file', 'view_project'].includes(result.intent)) {
        result.confidence += 0.1;
        result.extractedData = {
          ...result.extractedData,
          projectName: context.currentProject.name
        };
      }
    }

    // 如果输入中包含已存在项目的名称，调整意图
    if (context.recentProjects) {
      const mentionedProject = context.recentProjects.find(project =>
        input.includes(project.name.toLowerCase())
      );
      
      if (mentionedProject) {
        if (result.intent === 'chat' && input.includes('运行')) {
          result.intent = 'execute_project';
          result.confidence = 0.8;
        }
        
        result.extractedData = {
          ...result.extractedData,
          projectName: mentionedProject.name
        };
      }
    }

    return result;
  }

  private extractProjectInfo(input: string): any {
    const data: any = {};

    // 提取项目类型
    for (const [type, keywords] of Object.entries(this.projectTypeKeywords)) {
      if (keywords.some(keyword => input.toLowerCase().includes(keyword))) {
        data.projectType = type;
        break;
      }
    }

    // 提取项目描述（去除动词）
    const description = input
      .replace(/^(创建|新建|生成|构建|搭建|开发|制作)/, '')
      .replace(/(项目|应用|网站|系统|工具|app|website)$/, '')
      .trim();
    
    if (description) {
      data.description = description;
    }

    return data;
  }

  private extractProjectName(input: string): any {
    // 简单的项目名称提取，可以根据需要改进
    const match = input.match(/(?:运行|执行|启动|查看|打开|删除)(.+?)(?:项目|应用|$)/);
    if (match && match[1]) {
      return { projectName: match[1].trim() };
    }
    return {};
  }

  private extractFileInfo(input: string): any {
    const data: any = {};
    
    // 提取文件名
    const fileMatch = input.match(/(\w+\.\w+)/);
    if (fileMatch) {
      data.fileName = fileMatch[1];
    }

    // 提取编程语言
    const langKeywords = {
      python: ['python', 'py', '.py'],
      javascript: ['javascript', 'js', '.js', '.jsx'],
      typescript: ['typescript', 'ts', '.ts', '.tsx'],
      css: ['css', '.css', '样式'],
      html: ['html', '.html', '页面']
    };

    for (const [lang, keywords] of Object.entries(langKeywords)) {
      if (keywords.some(keyword => input.toLowerCase().includes(keyword))) {
        data.language = lang;
        break;
      }
    }

    return data;
  }

  private extractCronInfo(input: string): any {
    const data: any = {};
    
    // 提取时间表达式
    const timePatterns = {
      '每分钟': '* * * * *',
      '每小时': '0 * * * *',
      '每天': '0 0 * * *',
      '每周': '0 0 * * 0',
      '每月': '0 0 1 * *'
    };

    for (const [pattern, cron] of Object.entries(timePatterns)) {
      if (input.includes(pattern)) {
        data.cronExpression = cron;
        break;
      }
    }

    // 提取具体时间
    const timeMatch = input.match(/(\d{1,2})[点:](\d{2})?/);
    if (timeMatch) {
      const hour = timeMatch[1];
      const minute = timeMatch[2] || '0';
      data.cronExpression = `${minute} ${hour} * * *`;
    }

    return data;
  }

  private extractCommand(input: string): any {
    // 提取命令（移除"终端"、"命令"等前缀）
    const command = input
      .replace(/^(终端|命令行|命令|运行|执行)\s*/, '')
      .trim();
    
    return command ? { command } : {};
  }

  private generateSuggestions(intent: IntentType, extractedData?: any): string[] {
    const suggestions: string[] = [];

    switch (intent) {
      case 'create_project':
        suggestions.push(
          '创建一个React待办应用',
          '生成一个Flask博客系统',
          '构建一个数据分析工具'
        );
        break;

      case 'execute_project':
        suggestions.push(
          '运行我的Web应用',
          '执行最新的项目',
          '启动数据处理脚本'
        );
        break;

      case 'list_projects':
        suggestions.push(
          '显示Python项目',
          '查看最近的项目',
          '列出所有Web应用'
        );
        break;

      case 'edit_file':
        suggestions.push(
          '修改首页样式',
          '优化数据库配置',
          '编辑API接口'
        );
        break;

      case 'setup_cron':
        suggestions.push(
          '每天晚上8点运行爬虫',
          '每小时备份数据',
          '设置定时发送邮件'
        );
        break;

      case 'help':
        suggestions.push(
          '查看项目管理命令',
          '了解代码执行功能',
          '学习定时任务设置'
        );
        break;

      default:
        suggestions.push(
          '试试说："创建一个项目"',
          '或者："显示我的项目"',
          '输入 /help 查看帮助'
        );
    }

    return suggestions;
  }

  // 获取意图的友好描述
  getIntentDescription(intent: IntentType): string {
    const descriptions = {
      create_project: '🚀 创建新项目',
      execute_project: '▶️ 执行项目',
      edit_file: '📝 编辑文件',
      list_projects: '📁 查看项目列表',
      delete_project: '🗑️ 删除项目',
      view_project: '👁️ 查看项目详情',
      upload_file: '📤 上传文件',
      terminal_command: '💻 执行命令',
      setup_cron: '⏰ 设置定时任务',
      help: '❓ 获取帮助',
      chat: '💬 智能对话'
    };

    return descriptions[intent] || '💬 智能对话';
  }

  // 验证提取的数据是否完整
  validateExtractedData(intent: IntentType, data?: any): { valid: boolean; missing?: string[] } {
    const requirements = {
      create_project: [],
      execute_project: [],
      edit_file: ['fileName'],
      delete_project: ['projectName'],
      view_project: ['projectName'],
      setup_cron: ['cronExpression']
    };

    const required = requirements[intent] || [];
    if (required.length === 0) {
      return { valid: true };
    }

    const missing = required.filter(field => !data || !data[field]);
    return {
      valid: missing.length === 0,
      missing: missing.length > 0 ? missing : undefined
    };
  }
}