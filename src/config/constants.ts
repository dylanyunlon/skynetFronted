// export const APP_CONFIG = {
//   name: 'Skynet Console',
//   version: '1.0.0',
//   description: 'AI-powered chat interface with code execution',
// };

// export const API_CONFIG = {
//   baseURL: import.meta.env.VITE_API_BASE_URL || 'https://baloonet.tech:17432',
//   timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '3000000'),
//   retryAttempts: 3,
//   retryDelay: 1000,
// };

// // 预览配置 - 核心修复
// export const PREVIEW_CONFIG = {
//   // 使用服务器外网IP替代localhost
//   serverHost: '8.163.12.28',
//   portRange: {
//     start: 17430,
//     end: 17450
//   },
//   // URL替换规则
//   urlReplacements: [
//     { from: 'localhost', to: '8.163.12.28' },
//     { from: '127.0.0.1', to: '8.163.12.28' },
//     { from: '0.0.0.0', to: '8.163.12.28' }
//   ]
// };

// export const FEATURES = {
//   codeExecution: import.meta.env.VITE_ENABLE_CODE_EXECUTION !== 'false',
//   cronJobs: import.meta.env.VITE_ENABLE_CRON_JOBS !== 'false',
//   fileUpload: import.meta.env.VITE_ENABLE_FILE_UPLOAD !== 'false',
//   darkMode: import.meta.env.VITE_ENABLE_DARK_MODE !== 'false',
//   vibeCoding: import.meta.env.VITE_ENABLE_VIBE_CODING !== 'false',
// };

// export const SHORTCUTS = {
//   sendMessage: { key: 'Enter', modifiers: ['ctrl', 'cmd'] },
//   newChat: { key: 'k', modifiers: ['ctrl', 'cmd'] },
//   toggleTheme: { key: 'd', modifiers: ['ctrl', 'cmd'] },
//   showHelp: { key: '/', modifiers: ['ctrl', 'cmd'] },
// };

// export const FILE_UPLOAD = {
//   maxSize: 10 * 1024 * 1024, // 10MB
//   allowedTypes: [
//     'text/plain',
//     'text/csv',
//     'application/json',
//     'application/xml',
//     'application/pdf',
//     'application/vnd.ms-excel',
//     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//   ],
//   allowedExtensions: ['.txt', '.csv', '.json', '.xml', '.pdf', '.xls', '.xlsx'],
// };

// // Vibe Coding 配置
// export const VIBE_CODING_CONFIG = {
//   // 支持的项目类型
//   supportedProjectTypes: [
//     'web', 'api', 'tool', 'script', 'mobile', 'desktop'
//   ],
//   // 默认技术栈建议
//   defaultTechStacks: {
//     web: ['HTML', 'CSS', 'JavaScript'],
//     api: ['Python', 'FastAPI'],
//     tool: ['Python'],
//     script: ['Python', 'Bash'],
//     mobile: ['React Native'],
//     desktop: ['Electron']
//   },
//   // 处理步骤配置
//   processingSteps: [
//     { id: '1', label: '理解需求', duration: 2000 },
//     { id: '2', label: '优化 Prompt', duration: 3000 },
//     { id: '3', label: 'AI 生成项目', duration: 5000 },
//     { id: '4', label: '创建工作空间', duration: 2000 },
//     { id: '5', label: '部署预览', duration: 3000 }
//   ],
//   // 意图检测关键词
//   intentKeywords: {
//     action: ['创建', '生成', '搭建', '开发', '制作', '建立', '做一个', '写一个', '构建',
//              'create', 'build', 'make', 'develop', 'generate'],
//     target: ['项目', '网站', '应用', '系统', '工具', '程序', '页面', '平台', '服务',
//              'project', 'website', 'app', 'application', 'system', 'tool', 'page', 'platform'],
//     intent: ['帮我', '我要', '我想', '能否', '可以', '请', '想要',
//              'help me', 'i want', 'i need', 'can you', 'please']
//   }
// };

// // 工具函数：修复预览URL
// export const fixPreviewUrl = (url: string): string => {
//   if (!url || typeof url !== 'string') {
//     return url;
//   }
  
//   let fixedUrl = url;
  
//   // 应用所有URL替换规则
//   PREVIEW_CONFIG.urlReplacements.forEach(({ from, to }) => {
//     const regex = new RegExp(from.replace('.', '\\.'), 'g');
//     fixedUrl = fixedUrl.replace(regex, to);
//   });
  
//   // 确保使用 http 协议（如果没有协议）
//   if (fixedUrl && !fixedUrl.startsWith('http://') && !fixedUrl.startsWith('https://')) {
//     fixedUrl = `http://${fixedUrl}`;
//   }
  
//   console.log(`[fixPreviewUrl] ${url} -> ${fixedUrl}`);
//   return fixedUrl;
// };

// // 工具函数：生成预览URL
// export const generatePreviewUrl = (port: number): string => {
//   return `http://${PREVIEW_CONFIG.serverHost}:${port}`;
// };

// // 工具函数：检测是否为预览URL
// export const isPreviewUrl = (url: string): boolean => {
//   if (!url || typeof url !== 'string') {
//     return false;
//   }
  
//   const previewHosts = [
//     PREVIEW_CONFIG.serverHost,
//     'localhost',
//     '127.0.0.1',
//     '0.0.0.0'
//   ];
  
//   // 检查是否包含预览主机
//   const hasPreviewHost = previewHosts.some(host => url.includes(host));
  
//   // 检查是否在预览端口范围内
//   const portMatch = url.match(/:(\d+)/);
//   if (portMatch) {
//     const port = parseInt(portMatch[1]);
//     const inPortRange = port >= PREVIEW_CONFIG.portRange.start && 
//                        port <= PREVIEW_CONFIG.portRange.end;
//     return hasPreviewHost && inPortRange;
//   }
  
//   return hasPreviewHost;
// };

// // 工具函数：检测 Vibe Coding 意图
// export const detectVibeCodingIntent = (input: string): boolean => {
//   if (!input || typeof input !== 'string' || input.trim().length < 5) {
//     return false;
//   }
  
//   const inputLower = input.toLowerCase().trim();
//   const { action, target, intent } = VIBE_CODING_CONFIG.intentKeywords;
  
//   const hasAction = action.some(keyword => inputLower.includes(keyword));
//   const hasTarget = target.some(keyword => inputLower.includes(keyword));
//   const hasIntent = intent.some(keyword => inputLower.includes(keyword));
  
//   // 排除纯问答
//   const questionStarters = ['什么是', '如何', '怎么', '为什么', 'what is', 'how to', 'why'];
//   const isNotQuestionOnly = !questionStarters.some(starter => inputLower.startsWith(starter)) || hasAction;
  
//   const result = (hasAction && hasTarget && isNotQuestionOnly) || (hasIntent && hasTarget);
  
//   if (result) {
//     console.log('[detectVibeCodingIntent] Detected vibe coding intent:', {
//       input: inputLower.slice(0, 50),
//       hasAction,
//       hasTarget,
//       hasIntent,
//       isNotQuestionOnly
//     });
//   }
  
//   return result;
// };

// // 工具函数：提取项目信息
// export const extractProjectInfo = (input: string) => {
//   const inputLower = input.toLowerCase();
  
//   // 提取项目类型
//   const getProjectType = (): string => {
//     if (inputLower.includes('网站') || inputLower.includes('website')) return 'web';
//     if (inputLower.includes('脚本') || inputLower.includes('script')) return 'script';
//     if (inputLower.includes('api') || inputLower.includes('接口')) return 'api';
//     if (inputLower.includes('工具') || inputLower.includes('tool')) return 'tool';
//     return 'web'; // 默认
//   };
  
//   // 提取端口号
//   const getPort = (): number => {
//     const portMatch = input.match(/端口.*?(\d{4,5})/);
//     return portMatch ? parseInt(portMatch[1]) : 17430;
//   };
  
//   // 提取人名
//   const getPersonName = (): string | null => {
//     const namePatterns = [
//       /姓名为(.+?)的/,
//       /名字是(.+?)的/,
//       /叫(.+?)的/,
//       /([甘晓婷|张三|李四|王五|赵六|孙七|周八|吴九|郑十])/
//     ];
    
//     for (const pattern of namePatterns) {
//       const match = input.match(pattern);
//       if (match) {
//         return match[1].trim();
//       }
//     }
//     return null;
//   };
  
//   // 提取技术栈
//   const getTechStack = (): string[] => {
//     const tech = VIBE_CODING_CONFIG.defaultTechStacks[getProjectType()] || ['HTML', 'CSS', 'JavaScript'];
    
//     // 根据输入调整技术栈
//     if (inputLower.includes('python')) {
//       return ['Python', 'Flask', 'HTML', 'CSS'];
//     }
//     if (inputLower.includes('react')) {
//       return ['React', 'JavaScript', 'HTML', 'CSS'];
//     }
//     if (inputLower.includes('vue')) {
//       return ['Vue.js', 'JavaScript', 'HTML', 'CSS'];
//     }
    
//     return tech;
//   };
  
//   return {
//     type: getProjectType(),
//     port: getPort(),
//     personName: getPersonName(),
//     techStack: getTechStack(),
//     complexity: inputLower.length > 50 ? 'medium' : 'simple'
//   };
// };

// // 调试工具
// export const DEBUG = {
//   logPreviewUrl: (original: string, fixed: string) => {
//     if (import.meta.env.DEV) {
//       console.group('🔧 Preview URL Fix');
//       console.log('Original:', original);
//       console.log('Fixed:', fixed);
//       console.log('Is Preview URL:', isPreviewUrl(fixed));
//       console.groupEnd();
//     }
//   },
  
//   logVibeCodingIntent: (input: string, detected: boolean) => {
//     if (import.meta.env.DEV) {
//       console.group('🎯 Vibe Coding Intent Detection');
//       console.log('Input:', input.slice(0, 100));
//       console.log('Detected:', detected);
//       if (detected) {
//         console.log('Project Info:', extractProjectInfo(input));
//       }
//       console.groupEnd();
//     }
//   }
// };

// src/config/constants.ts - 简化修复版本

export const APP_CONFIG = {
  name: 'Skynet Console',
  version: '1.0.0',
  description: 'AI-powered chat interface with code execution',
};

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://baloonet.tech:17432',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  retryAttempts: 3,
  retryDelay: 1000,
};

// 预览配置 - 简化并修复
export const PREVIEW_CONFIG = {
  // 固定服务器外网IP
  serverHost: '8.163.12.28',
  // 预览端口范围
  portRange: {
    start: 17430,
    end: 17450
  },
  // 默认端口
  defaultPort: 17430,
  // URL模板
  urlTemplate: 'http://8.163.12.28:{port}'
};

// 核心修复函数：预览URL处理
export const fixPreviewUrl = (url: string): string => {
  if (!url || typeof url !== 'string') {
    console.warn('[fixPreviewUrl] Invalid URL input:', url);
    return generatePreviewUrl(PREVIEW_CONFIG.defaultPort);
  }
  
  let fixedUrl = url.trim();
  
  console.log('[fixPreviewUrl] Original URL:', fixedUrl);
  
  // 替换localhost和本地IP为外网IP
  const replacements = [
    { from: /localhost/g, to: PREVIEW_CONFIG.serverHost },
    { from: /127\.0\.0\.1/g, to: PREVIEW_CONFIG.serverHost },
    { from: /0\.0\.0\.0/g, to: PREVIEW_CONFIG.serverHost }
  ];
  
  replacements.forEach(({ from, to }) => {
    if (from.test(fixedUrl)) {
      fixedUrl = fixedUrl.replace(from, to);
      console.log('[fixPreviewUrl] Applied replacement:', { from: from.source, to, result: fixedUrl });
    }
  });
  
  // 确保有协议
  if (!fixedUrl.startsWith('http://') && !fixedUrl.startsWith('https://')) {
    fixedUrl = `http://${fixedUrl}`;
    console.log('[fixPreviewUrl] Added protocol:', fixedUrl);
  }
  
  // 验证URL格式
  try {
    new URL(fixedUrl);
    console.log('[fixPreviewUrl] Final URL:', fixedUrl);
    return fixedUrl;
  } catch (error) {
    console.error('[fixPreviewUrl] Invalid URL format:', fixedUrl, error);
    return generatePreviewUrl(PREVIEW_CONFIG.defaultPort);
  }
};

// 生成预览URL
export const generatePreviewUrl = (port: number = PREVIEW_CONFIG.defaultPort): string => {
  const url = PREVIEW_CONFIG.urlTemplate.replace('{port}', port.toString());
  console.log('[generatePreviewUrl] Generated URL:', url, 'for port:', port);
  return url;
};

// 检测是否为预览URL
export const isPreviewUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    const urlObj = new URL(url);
    const isCorrectHost = urlObj.hostname === PREVIEW_CONFIG.serverHost;
    const port = parseInt(urlObj.port);
    const isInPortRange = port >= PREVIEW_CONFIG.portRange.start && port <= PREVIEW_CONFIG.portRange.end;
    
    const result = isCorrectHost && isInPortRange;
    console.log('[isPreviewUrl] Check result:', { url, isCorrectHost, port, isInPortRange, result });
    return result;
  } catch (error) {
    console.warn('[isPreviewUrl] URL parsing failed:', url, error);
    return false;
  }
};

// 提取端口号
export const extractPortFromUrl = (url: string): number | null => {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    const port = parseInt(urlObj.port);
    return isNaN(port) ? null : port;
  } catch (error) {
    // 尝试正则提取
    const match = url.match(/:(\d{4,5})/);
    return match ? parseInt(match[1]) : null;
  }
};

// Vibe Coding 配置
export const VIBE_CODING_CONFIG = {
  // 支持的项目类型
  supportedProjectTypes: [
    'web', 'api', 'tool', 'script', 'mobile', 'desktop'
  ],
  // 默认技术栈建议
  defaultTechStacks: {
    web: ['HTML', 'CSS', 'JavaScript'],
    api: ['Python', 'FastAPI'],
    tool: ['Python'],
    script: ['Python', 'Bash'],
    mobile: ['React Native'],
    desktop: ['Electron']
  },
  // 意图检测关键词
  intentKeywords: {
    action: ['创建', '生成', '搭建', '开发', '制作', '建立', '做一个', '写一个', '构建'],
    target: ['项目', '网站', '应用', '系统', '工具', '程序', '页面', '平台', '服务'],
    intent: ['帮我', '我要', '我想', '能否', '可以', '请', '想要']
  }
};

// 检测 Vibe Coding 意图
export const detectVibeCodingIntent = (input: string): boolean => {
  if (!input || typeof input !== 'string' || input.trim().length < 5) {
    return false;
  }
  
  const inputLower = input.toLowerCase().trim();
  const { action, target, intent } = VIBE_CODING_CONFIG.intentKeywords;
  
  const hasAction = action.some(keyword => inputLower.includes(keyword));
  const hasTarget = target.some(keyword => inputLower.includes(keyword));
  const hasIntent = intent.some(keyword => inputLower.includes(keyword));
  
  // 排除纯问答
  const questionStarters = ['什么是', '如何', '怎么', '为什么'];
  const isNotQuestionOnly = !questionStarters.some(starter => inputLower.startsWith(starter)) || hasAction;
  
  const result = (hasAction && hasTarget && isNotQuestionOnly) || (hasIntent && hasTarget);
  
  if (result) {
    console.log('[detectVibeCodingIntent] Detected vibe coding intent:', {
      input: inputLower.slice(0, 50),
      hasAction,
      hasTarget,
      hasIntent,
      isNotQuestionOnly
    });
  }
  
  return result;
};

// 预览工具类
export class PreviewHelper {
  static getDefaultUrl(): string {
    return generatePreviewUrl();
  }
  
  static fixUrl(url: string): string {
    return fixPreviewUrl(url);
  }
  
  static testConnection(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        resolve(false);
      }, 5000);
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        // 即使图片加载失败，服务可能仍在运行
        fetch(url, { method: 'HEAD', mode: 'no-cors' })
          .then(() => resolve(true))
          .catch(() => resolve(false));
      };
      
      img.src = `${url}/favicon.ico`;
    });
  }
  
  static async validatePreviewUrl(url: string): Promise<{
    isValid: boolean;
    isAccessible: boolean;
    fixedUrl: string;
    error?: string;
  }> {
    const fixedUrl = fixPreviewUrl(url);
    const isValid = isPreviewUrl(fixedUrl);
    
    try {
      const isAccessible = await this.testConnection(fixedUrl);
      return {
        isValid,
        isAccessible,
        fixedUrl
      };
    } catch (error) {
      return {
        isValid,
        isAccessible: false,
        fixedUrl,
        error: error.message
      };
    }
  }
}

// 调试工具
export const DEBUG = {
  enabled: import.meta.env.DEV,
  
  logPreviewUrl: (original: string, fixed: string) => {
    if (!DEBUG.enabled) return;
    
    console.group('🔧 Preview URL Fix');
    console.log('Original:', original);
    console.log('Fixed:', fixed);
    console.log('Is Preview URL:', isPreviewUrl(fixed));
    console.log('Port:', extractPortFromUrl(fixed));
    console.groupEnd();
  },
  
  logVibeCodingIntent: (input: string, detected: boolean) => {
    if (!DEBUG.enabled) return;
    
    console.group('🎯 Vibe Coding Intent Detection');
    console.log('Input:', input.slice(0, 100));
    console.log('Detected:', detected);
    console.groupEnd();
  },
  
  testPreviewUrl: async (url: string) => {
    if (!DEBUG.enabled) return;
    
    console.group('🌐 Preview URL Test');
    console.log('Testing URL:', url);
    
    const result = await PreviewHelper.validatePreviewUrl(url);
    console.log('Validation Result:', result);
    
    console.groupEnd();
    return result;
  }
};

// 默认导出常用函数
export {
  fixPreviewUrl as default,
  // generatePreviewUrl,
  // isPreviewUrl,
  // detectVibeCodingIntent,
  // extractPortFromUrl
};