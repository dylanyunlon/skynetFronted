import axios, { AxiosInstance } from 'axios';
import { fixPreviewUrl } from '@/config/constants';

export interface VibeCodingMetaResponse {
  success: boolean;
  data: {
    conversation_id: string;
    content: string;
    intent_detected: 'vibe_coding_meta';
    metadata: {
      stage: 'meta_complete';
      vibe_data: {
        optimized_description: string;
        project_info: {
          type: string;
          technologies: string[];
          target_person: string;
          port: number;
        };
        meta_result: any;
        original_user_input: string;
      };
      suggestions: string[];
    };
  };
}

export interface VibeCodingGenerateResponse {
  success: boolean;
  data: {
    conversation_id: string;
    content: string;
    intent_detected: 'vibe_coding_generate';
    project_created: {
      success: boolean;
      project_id: string;
      project_name: string;
      project_type: string;
      files_created: number;
      workspace_path: string;
      preview_url?: string;
      execution_success: boolean;
      execution_error?: string;
    };
    metadata: {
      stage: 'generate_complete';
      suggestions: string[];
    };
  };
}

// Types
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface ChatResponse {
  success: boolean;
  data: {
    conversation_id: string;
    content: string;
    metadata?: {
      extracted_codes?: Array<{
        id: string;
        language: string;
        content: string;
        valid: boolean;
        saved: boolean;
      }>;
      executions?: Array<{
        code_id: string;
        success: boolean;
        output?: string;
        error?: string;
      }>;
      cron_jobs?: Array<{
        success: boolean;
        job_info?: {
          job_name: string;
          cron_expression: string;
        };
        next_run?: string;
      }>;
    };
    follow_up_questions?: string[];
  };
}

export interface ExecutionResponse {
  success: boolean;
  data: {
    result: {
      success: boolean;
      output?: string;
      error?: string;
      execution_time?: number;
    };
    report: string;
  };
}

export interface CronResponse {
  success: boolean;
  data: {
    job_name: string;
    cron_expression: string;
    next_run: string;
  };
}

export interface TemplatesResponse {
  success: boolean;
  templates: Record<string, Record<string, string>>;
}

// 新增：统一的 Vibe Coding 接口
export interface VibeCodingRequest {
  content: string;
  conversation_id: string;
  stage: 'meta' | 'generate';
  meta_result?: any;
  optimized_prompt?: string;
  original_user_input?: string;
}

export interface VibeCodingResponse {
  success: boolean;
  error?: string;
  stage?: string;
  metadata?: any;
  content?: string;
  project_created?: any;
  conversation_id?: string;
  timestamp?: string;
  data?: any;
}

// 项目相关接口
export interface Project {
  id: string;
  name: string;
  description: string;
  type: 'python' | 'javascript' | 'typescript' | 'mixed' | 'other';
  status: 'active' | 'archived' | 'template';
  created_at: string;
  updated_at: string;
  last_executed_at?: string;
  execution_count: number;
  file_count: number;
  size: number;
  entry_point?: string;
  git_repo?: string;
  dependencies: string[];
  settings: Record<string, any>;
  structure: Record<string, any>;
  preview_url?: string;
  files?: ProjectFile[];
}

export interface ProjectFile {
  path: string;
  content: string;
  language: string;
  size: number;
}

export interface WorkspaceInfo {
  user_id: string;
  total_projects: number;
  total_size: number;
  storage_used_percentage: number;
}

export interface ProjectListParams {
  status?: string;
  project_type?: string;
  limit?: number;
  offset?: number;
}

export interface FileOperation {
  operation: 'create' | 'update' | 'delete';
  file_path: string;
  content?: string;
}

export interface CreateProjectRequest {
  prompt: string;
  model?: string;
  auto_execute?: boolean;
  max_debug_attempts?: number;
  project_type?: string;
}

export interface ExecuteProjectRequest {
  project_id: string;
  entry_point?: string;
  env_vars?: Record<string, string>;
  max_debug_attempts?: number;
  timeout?: number;
}

export interface EditFileRequest {
  project_id: string;
  file_path: string;
  prompt: string;
  auto_format?: boolean;
  validate?: boolean;
}

export interface ProjectExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  preview_url?: string;
  execution_time?: number;
}

export interface TerminalSession {
  id: string;
  project_id: string;
  status: 'active' | 'closed';
  created_at: string;
}

// API Service Class
export class ChatBotAPIService {
  private api: AxiosInstance;
  private token: string | null = null;
  private baseURL: string;

  constructor(baseURL: string = import.meta.env.VITE_API_BASE_URL || 'https://baloonet.tech:17432') {
    this.baseURL = baseURL;
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '3000000'),
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
        } else if (config.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
          // 保持 form-urlencoded
        } else {
          config.headers['Content-Type'] = 'application/json';
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && !error.config._retry) {
          error.config._retry = true;
          
          const refreshed = await this.refreshToken();
          if (refreshed) {
            error.config.headers.Authorization = `Bearer ${this.token}`;
            return this.api(error.config);
          }
          
          this.token = null;
          localStorage.removeItem('chatbot_token');
          localStorage.removeItem('chatbot_refresh_token');
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Load token from localStorage
  loadToken(): void {
    const token = localStorage.getItem('chatbot_token');
    if (token) {
      this.token = token;
    }
  }

  // Authentication
  async login(username: string, password: string): Promise<{
    success: boolean;
    data?: {
      token: string;
      refresh_token: string;
      user: {
        id: string;
        username: string;
      };
    };
    error?: string;
  }> {
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('grant_type', 'password');

      const response = await this.api.post<AuthResponse & {
        user_id?: string;
        username?: string;
      }>('/api/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.access_token) {
        this.token = response.data.access_token;
        localStorage.setItem('chatbot_token', this.token);
        localStorage.setItem('chatbot_refresh_token', response.data.refresh_token);
        
        return {
          success: true,
          data: {
            token: response.data.access_token,
            refresh_token: response.data.refresh_token,
            user: {
              id: response.data.user_id || username,
              username: response.data.username || username
            }
          }
        };
      }

      return {
        success: false,
        error: 'Login failed',
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed',
      };
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('chatbot_refresh_token');
      if (!refreshToken) {
        return false;
      }

      const response = await this.api.post<AuthResponse>('/api/auth/refresh', {
        refresh_token: refreshToken
      });

      if (response.data.access_token) {
        this.token = response.data.access_token;
        localStorage.setItem('chatbot_token', this.token);
        if (response.data.refresh_token) {
          localStorage.setItem('chatbot_refresh_token', response.data.refresh_token);
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.token = null;
      localStorage.removeItem('chatbot_token');
      localStorage.removeItem('chatbot_refresh_token');
    }
  }

  // ==================== Vibe Coding API ====================

  async sendVibeCodingMeta(params: {
    content: string;
    conversation_id?: string;
    model?: string;
  }): Promise<VibeCodingMetaResponse> {
    try {
      console.log('[API] Sending Vibe Coding Meta request:', params);
      
      const response = await this.api.post('/api/v2/vibe/process', {
        content: params.content,
        conversation_id: params.conversation_id || `vibe_${Date.now()}`,
        stage: 'meta'
      });

      console.log('[API] Vibe Coding Meta response:', response.data);
      return this.normalizeVibeCodingResponse(response.data, 'meta') as VibeCodingMetaResponse;
    } catch (error: any) {
      console.error('Vibe Coding Meta error:', error);
      throw error;
    }
  }

  async sendVibeCodingGenerate(params: {
    content: string;
    conversation_id: string;
    meta_result: any;
    optimized_prompt: string;
    original_user_input: string;
    model?: string;
  }): Promise<VibeCodingGenerateResponse> {
    try {
      console.log('[API] Sending Vibe Coding Generate request:', params);
      
      const response = await this.api.post('/api/v2/vibe/process', {
        content: params.content,
        conversation_id: params.conversation_id,
        stage: 'generate',
        meta_result: params.meta_result,
        optimized_prompt: params.optimized_prompt,
        original_user_input: params.original_user_input
      });

      console.log('[API] Vibe Coding Generate response:', response.data);
      return this.normalizeVibeCodingResponse(response.data, 'generate') as VibeCodingGenerateResponse;
    } catch (error: any) {
      console.error('Vibe Coding Generate error:', error);
      throw error;
    }
  }

  async modifyVibeCodingRequirement(params: {
    content: string;
    conversation_id: string;
    previous_meta_result: any;
    model?: string;
  }): Promise<VibeCodingMetaResponse> {
    try {
      const response = await this.api.post('/api/v2/vibe/process', {
        content: `修改需求：${params.content}`,
        conversation_id: params.conversation_id,
        stage: 'meta',
        meta_result: params.previous_meta_result
      });

      return this.normalizeVibeCodingResponse(response.data, 'meta') as VibeCodingMetaResponse;
    } catch (error: any) {
      console.error('Vibe Coding Modify error:', error);
      throw error;
    }
  }

  // 新增：意图检测
  async detectVibeCodingIntent(text: string): Promise<{ is_vibe_intent: boolean; confidence: number }> {
    try {
      const response = await this.api.get(`/api/v2/vibe/intent/detect?text=${encodeURIComponent(text)}`);
      return response.data;
    } catch (error) {
      console.error('[API] Intent detection failed, using local detection:', error);
      const isVibe = detectVibeCodingIntent(text);
      return { is_vibe_intent: isVibe, confidence: isVibe ? 0.8 : 0.2 };
    }
  }

  // 响应格式标准化
  private normalizeVibeCodingResponse(response: any, expectedStage: 'meta' | 'generate'): VibeCodingResponse {
    console.log('[API] Normalizing response:', response);
    
    // 如果已经是标准格式
    if (response.success !== undefined) {
      // 修复预览URL
      if (response.project_created?.preview_url) {
        response.project_created.preview_url = fixPreviewUrl(response.project_created.preview_url);
      }
      
      if (response.metadata?.project_created?.preview_url) {
        response.metadata.project_created.preview_url = fixPreviewUrl(response.metadata.project_created.preview_url);
      }
      
      return response;
    }

    // 适配现有的响应格式
    if (response.data) {
      const stage = response.data.metadata?.stage || `${expectedStage}_complete`;
      
      // 处理预览URL
      let preview_url = response.data.project_created?.preview_url;
      if (preview_url) {
        preview_url = fixPreviewUrl(preview_url);
      }
      
      return {
        success: true,
        stage,
        metadata: {
          ...response.data.metadata,
          ...(response.data.project_created && {
            project_created: {
              ...response.data.project_created,
              preview_url
            }
          })
        },
        content: response.data.content,
        project_created: response.data.project_created ? {
          ...response.data.project_created,
          preview_url
        } : undefined,
        conversation_id: response.data.conversation_id,
        timestamp: new Date().toISOString(),
        data: response.data
      };
    }

    return {
      success: false,
      error: 'Unknown response format',
      stage: `${expectedStage}_processing`,
      timestamp: new Date().toISOString()
    };
  }

  // Chat methods
  async sendMessage(params: {
    content: string;
    model: string;
    conversation_id?: string;
    extract_code?: boolean;
    auto_execute?: boolean;
    setup_cron?: boolean;
    cron_expression?: string;
  }): Promise<ChatResponse> {
    try {
      const requestBody = {
        content: params.content,
        model: params.model,
        conversation_id: params.conversation_id,
        extract_code: params.extract_code,
        auto_execute: params.auto_execute,
        setup_cron: params.setup_cron,
        cron_expression: params.cron_expression,
      };

      console.log('Sending message with body:', requestBody);

      const response = await this.api.post<ChatResponse>('/api/chat/v2/message', requestBody);
      return response.data;
    } catch (error: any) {
      console.error('Send message error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }
  
  // Server-Sent Events for streaming responses
  createMessageStream(params: {
    content: string;
    model: string;
    conversation_id?: string;
    extract_code?: boolean;
    auto_execute?: boolean;
    onMessage: (data: any) => void;
    onError?: (error: any) => void;
    onComplete?: () => void;
  }): EventSource {
    const queryParams = new URLSearchParams({
      message: params.content,
      model: params.model,
      ...(params.conversation_id && { conversation_id: params.conversation_id }),
      ...(params.extract_code && { extract_code: 'true' }),
      ...(params.auto_execute && { auto_execute: 'true' }),
    });

    const url = `${this.baseURL}/api/chat/v2/stream?${queryParams}`;
    
    const eventSource = new EventSource(url, {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        params.onMessage(data);
      } catch (error) {
        console.error('Stream parse error:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Stream error:', error);
      params.onError?.(error);
      eventSource.close();
    };

    eventSource.addEventListener('done', () => {
      params.onComplete?.();
      eventSource.close();
    });

    return eventSource;
  }

  // Code execution
  async executeCode(
    codeId: string,
    parameters?: Record<string, string>,
    timeout: number = 30000
  ): Promise<ExecutionResponse> {
    try {
      if (!codeId || codeId.trim() === '') {
        throw new Error('Code ID is required');
      }
      
      const response = await this.api.post<ExecutionResponse>('/api/chat/v2/execute-code', {
        code_id: codeId.trim(),
        parameters: parameters || {},
        timeout,
      });
      return response.data;
    } catch (error) {
      console.error('Execute code error:', error);
      throw error;
    }
  }

  // Cron setup
  async setupCron(
    codeId: string,
    cronExpression: string,
    jobName?: string
  ): Promise<CronResponse> {
    try {
      const response = await this.api.post<CronResponse>('/api/chat/v2/setup-cron', {
        code_id: codeId,
        cron_expression: cronExpression,
        job_name: jobName,
      });
      return response.data;
    } catch (error) {
      console.error('Setup cron error:', error);
      throw error;
    }
  }

  // Get code templates
  async getCodeTemplates(
    language?: string,
    taskType?: string
  ): Promise<TemplatesResponse> {
    try {
      const params: any = {};
      if (language) params.language = language;
      if (taskType) params.task_type = taskType;

      const response = await this.api.get<TemplatesResponse>('/api/chat/v2/code-templates', {
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Get templates error:', error);
      throw error;
    }
  }

  // Conversation management
  async getConversations(limit: number = 20, offset: number = 0) {
    try {
      const response = await this.api.get('/api/chat/v2/conversations', {
        params: { limit, offset },
      });
      return response.data;
    } catch (error) {
      console.error('Get conversations error:', error);
      throw error;
    }
  }

  async getConversation(conversationId: string) {
    try {
      const response = await this.api.get(`/api/chat/v2/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Get conversation error:', error);
      throw error;
    }
  }

  async deleteConversation(conversationId: string) {
    try {
      const response = await this.api.delete(`/api/chat/v2/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Delete conversation error:', error);
      throw error;
    }
  }

  // File upload
  async uploadFile(file: File, conversationId?: string) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (conversationId) {
        formData.append('conversation_id', conversationId);
      }

      const response = await this.api.post('/api/chat/v2/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Upload file error:', error);
      throw error;
    }
  }

  // ==================== 项目管理 API ====================
  
  async getWorkspaceInfo(): Promise<WorkspaceInfo> {
    try {
      const response = await this.api.get('/api/v2/workspace/info');
      return response.data;
    } catch (error) {
      console.error('Get workspace info error:', error);
      throw error;
    }
  }

  async listProjects(params?: ProjectListParams): Promise<Project[]> {
    try {
      const response = await this.api.get('/api/v2/workspace/projects', { params });
      return response.data;
    } catch (error) {
      console.error('List projects error:', error);
      throw error;
    }
  }

  async getFileContent(projectId: string, filePath: string): Promise<ProjectFile> {
    try {
      const response = await this.api.get(
        `/api/v2/workspace/projects/${projectId}/files/${encodeURIComponent(filePath)}`
      );
      return response.data;
    } catch (error) {
      console.error('Get file content error:', error);
      throw error;
    }
  }

  async updateProjectFiles(
    projectId: string,
    operations: FileOperation[],
    commitMessage?: string
  ): Promise<{ success: boolean; updated_files: string[] }> {
    try {
      const response = await this.api.post(
        `/api/v2/workspace/projects/${projectId}/files`,
        {
          operations,
          commit_message: commitMessage
        }
      );
      return response.data;
    } catch (error) {
      console.error('Update project files error:', error);
      throw error;
    }
  }

  async deleteProject(projectId: string): Promise<{ success: boolean }> {
    try {
      const response = await this.api.delete(`/api/v2/workspace/projects/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Delete project error:', error);
      throw error;
    }
  }

  // ==================== AI Agent API ====================

  async createProjectFromPrompt(request: CreateProjectRequest): Promise<{
    success: boolean;
    project_id: string;
    preview_url?: string;
    project_detail?: Project;
    execution_result?: ProjectExecutionResult;
  }> {
    try {
      const response = await this.api.post('/api/v2/agent/create-project', {
        prompt: request.prompt,
        model: request.model || 'claude-opus-4-6',
        auto_execute: request.auto_execute ?? true,
        max_debug_attempts: request.max_debug_attempts ?? 3,
        project_type: request.project_type
      });
      
      const result = response.data;
      
      // 修复所有预览URL
      if (result.execution_result?.preview_url) {
        result.execution_result.preview_url = fixPreviewUrl(result.execution_result.preview_url);
        result.preview_url = result.execution_result.preview_url;
      }
      
      if (result.preview_url) {
        result.preview_url = fixPreviewUrl(result.preview_url);
      }
      
      if (result.project_detail) {
        if (result.preview_url) {
          result.project_detail.preview_url = result.preview_url;
        } else if (result.project_detail.preview_url) {
          result.project_detail.preview_url = fixPreviewUrl(result.project_detail.preview_url);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Create project from prompt error:', error);
      throw error;
    }
  }

  async getProjectDetail(projectId: string): Promise<Project> {
    try {
      // 首先尝试新的项目上下文API
      try {
        const response = await this.api.get(`/api/v2/vibe/project/${projectId}/context`);
        
        if (response.data.success && response.data.project_context) {
          const context = response.data.project_context;
          const projectInfo = context.project_info || {};
          
          // 修复预览URL
          let preview_url = projectInfo.preview_url;
          if (preview_url) {
            preview_url = fixPreviewUrl(preview_url);
          }
          
          return {
            id: projectInfo.id || projectId,
            name: projectInfo.name || '未命名项目',
            description: projectInfo.description || '',
            type: projectInfo.type || 'other',
            status: projectInfo.status || 'active',
            created_at: projectInfo.created_at || new Date().toISOString(),
            updated_at: projectInfo.updated_at || new Date().toISOString(),
            last_executed_at: null,
            execution_count: 0,
            file_count: context.project_files?.length || 0,
            size: 0,
            entry_point: 'index.html',
            git_repo: null,
            dependencies: context.tech_stack || [],
            settings: {},
            structure: {},
            preview_url
          } as Project;
        }
      } catch (contextError) {
        console.warn('Context API failed, trying workspace API:', contextError);
      }

      // 降级到工作空间API
      const response = await this.api.get(`/api/v2/workspace/projects/${projectId}`);
      const project = response.data;
      
      // 修复预览URL
      if (project.preview_url) {
        project.preview_url = fixPreviewUrl(project.preview_url);
      }
      
      return project;
    } catch (error) {
      console.error('Get project detail error:', error);
      throw error;
    }
  }

  async executeProject(request: ExecuteProjectRequest): Promise<ProjectExecutionResult> {
    try {
      const response = await this.api.post(
        `/api/v2/agent/execute-project/${request.project_id}`,
        {
          entry_point: request.entry_point,
          env_vars: request.env_vars,
          max_debug_attempts: request.max_debug_attempts ?? 3,
          timeout: request.timeout ?? 30000
        }
      );
      
      const result = response.data;
      
      // 修复预览URL
      if (result.preview_url) {
        result.preview_url = fixPreviewUrl(result.preview_url);
      }
      
      return result;
    } catch (error) {
      console.error('Execute project error:', error);
      throw error;
    }
  }

  async editProjectFile(request: EditFileRequest): Promise<{
    success: boolean;
    file_path: string;
    old_content: string;
    new_content: string;
    changes: string;
  }> {
    try {
      const response = await this.api.post(
        `/api/v2/agent/edit-file/${request.project_id}`,
        {
          file_path: request.file_path,
          prompt: request.prompt,
          auto_format: request.auto_format ?? true,
          validate: request.validate ?? true
        }
      );
      return response.data;
    } catch (error) {
      console.error('Edit project file error:', error);
      throw error;
    }
  }

  async sendVibeMessage(params: {
    content: string;
    model?: string;
    conversation_id?: string;
    enable_vibe_mode?: boolean;
  }): Promise<{
    success: boolean;
    data: {
      conversation_id: string;
      content: string;
      intent_detected: string;
      project_created?: boolean;
      project_id?: string;
      preview_url?: string;
      files_created?: number;
      processing_steps?: Array<{
        id: string;
        label: string;
        status: 'pending' | 'processing' | 'completed' | 'error';
        message?: string;
      }>;
    };
  }> {
    try {
      const requestBody = {
        message: params.content,
        model: params.model || 'claude-opus-4-6',
        conversation_id: params.conversation_id,
        enable_vibe_mode: params.enable_vibe_mode ?? true,
        include_project_context: true
      };

      const response = await this.api.post('/api/v2/chat', requestBody);
      
      // 修复预览URL
      if (response.data.data?.preview_url) {
        response.data.data.preview_url = fixPreviewUrl(response.data.data.preview_url);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Vibe message error:', error);
      throw error;
    }
  }

  async getProjectPreviewStatus(projectId: string): Promise<{
    status: 'ready' | 'building' | 'error';
    preview_url?: string;
    build_logs?: string[];
  }> {
    try {
      const response = await this.api.get(`/api/v2/projects/${projectId}/preview-status`);
      
      // 修复预览URL
      if (response.data.preview_url) {
        response.data.preview_url = fixPreviewUrl(response.data.preview_url);
      }
      
      return response.data;
    } catch (error) {
      console.error('Get preview status error:', error);
      throw error;
    }
  }

  getTokenStatus(): { hasToken: boolean; tokenPreview: string } {
    return {
      hasToken: !!this.token,
      tokenPreview: this.token ? `${this.token.substring(0, 10)}...` : 'No token'
    };
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('chatbot_token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('chatbot_token');
    localStorage.removeItem('chatbot_refresh_token');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
  
  // ==================== Terminal API ====================

  async createTerminalSession(projectId: string): Promise<TerminalSession> {
    try {
      const response = await this.api.post('/api/v2/terminal/sessions', {
        project_id: projectId
      });
      return response.data;
    } catch (error) {
      console.error('Create terminal session error:', error);
      throw error;
    }
  }

  createTerminalWebSocket(sessionId: string): WebSocket {
    const wsUrl = this.baseURL.replace('https://', 'wss://').replace('http://', 'ws://');
    const ws = new WebSocket(`${wsUrl}/api/v2/terminal/ws/${sessionId}?token=${this.token}`);
    return ws;
  }

  // 检查响应类型
  isVibeCodingResponse(response: any): 'meta' | 'generate' | null {
    if (!response?.data?.metadata) return null;
    
    const stage = response.data.metadata.stage;
    if (stage === 'meta_complete') return 'meta';
    if (stage === 'generate_complete') return 'generate';
    
    return null;
  }
}

// 工具函数
export const isVibeCodingMetaResponse = (response: any): response is VibeCodingMetaResponse => {
  return response?.data?.metadata?.stage === 'meta_complete';
};

export const isVibeCodingGenerateResponse = (response: any): response is VibeCodingGenerateResponse => {
  return response?.data?.metadata?.stage === 'generate_complete';
};

// 检测是否为项目创建意图 - 增强版本
export const detectVibeCodingIntent = (input: string): boolean => {
  if (!input || typeof input !== 'string') return false;
  
  const inputLower = input.toLowerCase().trim();
  
  // 扩展关键词列表
  const actionKeywords = [
    '创建', '生成', '搭建', '开发', '制作', '建立', '做一个', '写一个', '构建',
    'create', 'build', 'make', 'develop', 'generate'
  ];
  
  const targetKeywords = [
    '项目', '网站', '应用', '系统', '工具', '程序', '页面', '平台', '服务',
    'project', 'website', 'app', 'application', 'system', 'tool', 'page', 'platform'
  ];
  
  const intentKeywords = [
    '帮我', '我要', '我想', '能否', '可以', '请', '想要',
    'help me', 'i want', 'i need', 'can you', 'please'
  ];
  
  const hasAction = actionKeywords.some(keyword => inputLower.includes(keyword));
  const hasTarget = targetKeywords.some(keyword => inputLower.includes(keyword));
  const hasIntent = intentKeywords.some(keyword => inputLower.includes(keyword));
  
  // 长度检查
  const isSufficientLength = inputLower.length >= 8;
  
  // 排除纯问答
  const isNotQuestionOnly = !(
    inputLower.startsWith('什么是') || 
    inputLower.startsWith('如何') || 
    inputLower.startsWith('怎么') ||
    inputLower.startsWith('为什么') ||
    inputLower.startsWith('what is') ||
    inputLower.startsWith('how to') ||
    inputLower.startsWith('why')
  ) || hasAction;
  
  const result = (hasAction && hasTarget && isSufficientLength && isNotQuestionOnly) ||
                 (hasIntent && hasTarget && isSufficientLength);
  
  console.log('[detectVibeCodingIntent]', {
    input: inputLower.slice(0, 50),
    hasAction,
    hasTarget,
    hasIntent,
    isSufficientLength,
    isNotQuestionOnly,
    result
  });
  
  return result;
};

// Export singleton instance
export const api = new ChatBotAPIService();