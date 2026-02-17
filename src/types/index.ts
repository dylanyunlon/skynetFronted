

export interface WorkspaceInfo {
  user_id: string;
  total_projects: number;
  total_size: number;
  storage_used_percentage: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: 'active' | 'archived' | 'deleted';
  created_at: string;
  updated_at: string;
  last_executed_at?: string;
  execution_count: number;
  file_count: number;
  size: number;
  entry_point?: string;
  git_repo?: string;
  dependencies?: string[];
  settings?: Record<string, any>;
  structure?: Record<string, any>;
  preview_url?: string;
}

export interface ProjectFile {
  path: string;
  content: string;
  language: string;
  size: number;
}

export interface FileOperation {
  operation: 'create' | 'update' | 'delete';
  file_path: string;
  content?: string;
}

export interface ProjectListParams {
  status?: 'active' | 'archived';
  project_type?: string;
  limit?: number;
  offset?: number;
}

// ==================== AI Agent 相关类型 ====================

export interface CreateProjectRequest {
  prompt: string;
  model?: string;
  auto_execute?: boolean;
  max_debug_attempts?: number;
  project_type?: 'python' | 'javascript' | 'typescript';
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
  exit_code?: number;
  stdout?: string;
  stderr?: string;
  execution_time?: number;
  debug_attempts?: number;
  debug_logs?: string[];
  preview_url?: string;
}

// ==================== Terminal 相关类型 ====================

export interface TerminalSession {
  session_id: string;
  project_id: string;
  created_at: string;
  status: 'active' | 'closed';
}

// ==================== 聊天相关类型 ====================

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: {
    extracted_codes?: ExtractedCode[];
    executions?: ExecutionResult[];
    cron_jobs?: CronJob[];
  };
}

export interface ExtractedCode {
  id: string;
  language: string;
  content: string;
  valid: boolean;
  saved: boolean;
}

export interface ExecutionResult {
  code_id: string;
  success: boolean;
  output?: string;
  error?: string;
}

export interface CronJob {
  success: boolean;
  job_info?: {
    job_name: string;
    cron_expression: string;
  };
  next_run?: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  model?: string;
}

// ==================== 用户相关类型 ====================

export interface User {
  id: string;
  username: string;
  email?: string;
  is_active: boolean;
  is_superuser?: boolean;
  created_at?: string;
}
export interface Project {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: 'active' | 'archived' | 'deleted';
  created_at: string;
  updated_at: string;
  last_executed_at?: string;
  execution_count: number;
  file_count: number;
  size: number;
  entry_point?: string;
  git_repo?: string;
  dependencies?: string[];
  settings?: Record<string, any>;
  structure?: Record<string, any>;
  preview_url?: string;  // 添加预览URL字段
}

export interface ProjectExecutionResult {
  success: boolean;
  exit_code?: number;
  stdout?: string;
  stderr?: string;
  execution_time?: number;
  debug_attempts?: number;
  debug_logs?: string[];
  preview_url?: string;  // 添加预览URL字段
}



// ==================== Vibe Coding 相关类型 ====================

// Vibe Coding 阶段枚举
export type VibeCodingStage = 
  | 'idle'                // 空闲状态
  | 'meta_processing'     // Meta阶段处理中
  | 'meta_complete'       // Meta阶段完成
  | 'generate_processing' // Generate阶段处理中  
  | 'generate_complete'   // Generate阶段完成
  | 'error';              // 错误状态

// Vibe Coding 特征
export interface VibeCodingFeatures {
  requires_meta_prompt: boolean;
  complexity_level: 'simple' | 'medium' | 'complex';
  expected_output: 'text' | 'project' | 'modification' | 'execution';
  user_expertise: 'beginner' | 'intermediate' | 'expert';
  project_type: string;
  stage: VibeCodingStage;
}

// Vibe Coding 项目信息
export interface VibeCodingProjectInfo {
  type: string;
  technologies: string[];
  target_person?: string;
  port?: number;
  name?: string;
  description?: string;
}

// Vibe Coding Meta 响应
export interface VibeCodingMetaData {
  stage: 'meta_complete';
  vibe_data: {
    optimized_description: string;
    project_info: VibeCodingProjectInfo;
    meta_result: any;
    original_user_input: string;
  };
  suggestions: string[];
}

// Vibe Coding Generate 响应
export interface VibeCodingGenerateData {
  stage: 'generate_complete';
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
  suggestions: string[];
}

// 扩展现有 Message 接口以支持 Vibe Coding
export interface VibeCodingMessage extends Message {
  metadata?: {
    stage?: VibeCodingStage;
    vibe_data?: VibeCodingMetaData['vibe_data'];
    project_created?: VibeCodingGenerateData['project_created'];
    suggestions?: string[];
    intent_detected?: string;
    vibe_coding?: boolean;
  } & Message['metadata'];
}

// Vibe Coding 会话状态
export interface VibeCodingSession {
  id: string;
  stage: VibeCodingStage;
  original_input: string;
  conversation_id: string;
  meta_response?: VibeCodingMetaData;
  generate_response?: VibeCodingGenerateData;
  created_at: Date;
  updated_at: Date;
}

// Vibe Coding Hook 状态
export interface VibeCodingHookState {
  stage: VibeCodingStage;
  loading: boolean;
  error: string | null;
  session: VibeCodingSession | null;
  currentProject: Project | null;
}

// Vibe Coding Hook 动作
export interface VibeCodingHookActions {
  startVibeCoding: (userInput: string, conversationId?: string) => Promise<void>;
  confirmGenerate: (confirmMessage?: string) => Promise<void>;
  modifyRequirement: (modificationRequest: string) => Promise<void>;
  reset: () => void;
  retryLastAction: () => Promise<void>;
}

// 处理步骤接口
export interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message?: string;
  timestamp?: Date;
}

// Vibe Coding 配置
export interface VibeCodingConfig {
  enabled: boolean;
  auto_detect_intent: boolean;
  default_model: string;
  meta_temperature: number;
  generate_temperature: number;
  max_retries: number;
  timeout: number;
  fallback_enabled: boolean;
}

// 意图检测结果
export interface IntentDetectionResult {
  isVibeCoding: boolean;
  confidence: number;
  features: VibeCodingFeatures;
  suggestedAction: 'start_meta' | 'continue_chat' | 'modify_requirement';
}

// 项目预览状态
export interface ProjectPreviewState {
  mode: 'desktop' | 'tablet' | 'mobile';
  showCode: boolean;
  isFullscreen: boolean;
  currentFile: string | null;
  loading: boolean;
  error: string | null;
}

// Vibe Coding 事件
export interface VibeCodingEvent {
  type: 'stage_change' | 'error' | 'project_created' | 'requirement_modified' | 'preview_ready';
  payload: any;
  timestamp: Date;
}

// 项目创建事件
export interface ProjectCreatedEvent extends VibeCodingEvent {
  type: 'project_created';
  payload: {
    project: Project;
    session: VibeCodingSession;
    preview_url?: string;
  };
}

// 扩展现有 Project 接口以支持 Vibe Coding
export interface VibeCodingProject extends Project {
  vibe_created?: boolean;
  vibe_session_id?: string;
  original_prompt?: string;
  enhanced_prompt?: string;
  meta_data?: VibeCodingMetaData;
}

// UI 组件 Props 类型
export interface VibeCodingChatProps {
  onProjectCreated?: (project: Project) => void;
  onProjectUpdated?: (project: Project) => void;
  onStageChange?: (stage: VibeCodingStage) => void;
  initialProject?: Project;
  autoDetectIntent?: boolean;
  showStepIndicator?: boolean;
}

export interface VibeCodingStepIndicatorProps {
  steps: ProcessingStep[];
  currentStep?: string;
  onStepClick?: (stepId: string) => void;
}

export interface VibeCodingProjectPreviewProps {
  project: Project;
  previewState: ProjectPreviewState;
  onPreviewStateChange: (state: Partial<ProjectPreviewState>) => void;
  onRefresh: () => void;
}

// 错误类型
export interface VibeCodingError {
  code: string;
  message: string;
  stage: VibeCodingStage;
  details?: any;
  timestamp: Date;
}

// API 响应类型守卫
export type VibeCodingResponseType<T> = T extends { data: { metadata: { stage: 'meta_complete' } } } 
  ? 'meta' 
  : T extends { data: { metadata: { stage: 'generate_complete' } } }
  ? 'generate'
  : 'unknown';

// 工具函数类型
export type VibeCodingIntentDetector = (input: string) => IntentDetectionResult;
export type VibeCodingStageProcessor = (stage: VibeCodingStage, data: any) => Promise<any>;
export type VibeCodingErrorHandler = (error: VibeCodingError) => void;