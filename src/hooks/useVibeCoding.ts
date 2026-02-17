// src/hooks/useVibeCoding.ts - 修复版本：移除对 ai_generated 字段的依赖
import { useState, useCallback, useRef } from 'react';
import { 
  api, 
  isVibeCodingMetaResponse, 
  isVibeCodingGenerateResponse,
  detectVibeCodingIntent 
} from '@/services/api';
import { 
  VibeCodingStage, 
  VibeCodingHookState, 
  VibeCodingHookActions,
  VibeCodingSession,
  Project,
  VibeCodingError
} from '@/types';

export const useVibeCoding = (): VibeCodingHookState & VibeCodingHookActions => {
  const [state, setState] = useState<VibeCodingHookState>({
    stage: 'idle',
    loading: false,
    error: null,
    session: null,
    currentProject: null
  });

  const sessionRef = useRef<VibeCodingSession | null>(null);

  // 改进的AI生成项目检测 - 不依赖 ai_generated 字段
  const isAIGeneratedProject = useCallback((project: Project | any): boolean => {
    if (!project) return false;
    
    // 多重检测策略，不依赖 ai_generated 字段
    const checks = [
      // 描述检查
      project.description && project.description.includes('[AI生成]'),
      
      // 名称模式检查
      project.name && (
        project.name.includes('AI生成') || 
        project.name.includes('的web项目') ||
        project.name.includes('的script项目') ||
        project.name.includes('个人网站')
      ),
      
      // 元数据检查
      project.meta_prompt_data && project.meta_prompt_data.creation_method === 'pure_ai_generation',
      
      // 元数据中的AI标记
      project.meta_prompt_data && project.meta_prompt_data.ai_generated === true,
      
      // 响应数据检查
      project.ai_response && typeof project.ai_response === 'string' && 
      project.ai_response.includes('bash_script'),
      
      // 项目特征检查
      project.file_count > 0 && project.type === 'web' && project.status !== 'template'
    ];
    
    // 至少满足2个条件就认为是AI生成
    const passedChecks = checks.filter(check => check === true).length;
    const isAI = passedChecks >= 2;
    
    console.log(`[isAIGeneratedProject] Checks passed: ${passedChecks}/6, Result: ${isAI}`, {
      project_id: project.id,
      name: project.name,
      checks: {
        description_marker: project.description?.includes('[AI生成]'),
        name_pattern: project.name?.includes('AI生成') || project.name?.includes('个人网站'),
        creation_method: project.meta_prompt_data?.creation_method === 'pure_ai_generation',
        meta_ai_generated: project.meta_prompt_data?.ai_generated === true,
        bash_script_in_response: project.ai_response?.includes('bash_script'),
        project_characteristics: project.file_count > 0 && project.type === 'web'
      }
    });
    
    return isAI;
  }, []);

  // 增强的项目数据验证 - 不依赖 ai_generated 字段
  const validateAIGeneration = useCallback((projectData: any): boolean => {
    const validationChecks = [
      // 基础数据检查
      projectData?.success === true,
      
      // 响应中的AI生成标记（这个可以保留，因为是API响应，不是数据库字段）
      projectData?.ai_generated === true || 
      projectData?.pure_ai_generation === true ||
      projectData?.creation_method === 'pure_ai_generation',
      
      // 项目ID和名称检查
      projectData?.project_id && 
      projectData.project_id !== 'undefined' && 
      projectData.project_id !== 'null',
      
      // 项目名称检查
      projectData?.project_name && 
      projectData.project_name !== 'undefined' && 
      projectData.project_name !== 'null',
      
      // 文件创建检查
      (projectData?.files_created && projectData.files_created > 0) ||
      (projectData?.file_count && projectData.file_count > 0),
      
      // 执行成功检查
      projectData?.execution_success === true ||
      projectData?.project_created === true ||
      projectData?.no_fallback_used === true ||
      projectData?.bash_script_executed === true
    ];
    
    const passedValidations = validationChecks.filter(check => check === true).length;
    const isValid = passedValidations >= 4; // 至少通过4个验证
    
    console.log(`[validateAIGeneration] Validations passed: ${passedValidations}/6, Valid: ${isValid}`, {
      projectData: {
        success: projectData?.success,
        ai_generated: projectData?.ai_generated,
        pure_ai_generation: projectData?.pure_ai_generation,
        project_id: projectData?.project_id,
        project_name: projectData?.project_name,
        files_created: projectData?.files_created,
        execution_success: projectData?.execution_success,
        bash_script_executed: projectData?.bash_script_executed
      }
    });
    
    return isValid;
  }, []);

  // 智能预览URL生成
  const generateIntelligentPreviewUrl = useCallback((projectData: any, port: number = 17430): string => {
    const serverHost = '8.163.12.28';
    
    // 策略1: 使用项目数据中的预览URL
    if (projectData?.preview_url && 
        projectData.preview_url !== 'None' && 
        projectData.preview_url !== 'undefined' && 
        projectData.preview_url !== 'null') {
      let url = projectData.preview_url;
      // 修复localhost为实际IP
      url = url.replace(/localhost/g, serverHost).replace(/127\.0\.0\.1/g, serverHost);
      console.log(`[generateIntelligentPreviewUrl] Using project preview URL: ${url}`);
      return url;
    }
    
    // 策略2: 使用部署信息中的URL
    if (projectData?.deployment_info?.preview_url && 
        projectData.deployment_info.preview_url !== 'None') {
      let url = projectData.deployment_info.preview_url;
      url = url.replace(/localhost/g, serverHost).replace(/127\.0\.0\.1/g, serverHost);
      console.log(`[generateIntelligentPreviewUrl] Using deployment preview URL: ${url}`);
      return url;
    }
    
    // 策略3: 使用指定端口或默认端口
    const finalPort = projectData?.port || projectData?.deployment_info?.port || port;
    const generatedUrl = `http://${serverHost}:${finalPort}`;
    console.log(`[generateIntelligentPreviewUrl] Generated URL with port ${finalPort}: ${generatedUrl}`);
    return generatedUrl;
  }, []);

  // 增强的项目对象创建 - 不依赖 ai_generated 字段
  const createEnhancedProjectObject = useCallback((projectData: any): Project => {
    console.group('🏗️ Creating Enhanced AI Project Object (No ai_generated field)');
    console.log('Input project data:', projectData);
    
    // 验证AI生成
    const isValidAI = validateAIGeneration(projectData);
    console.log('AI validation result:', isValidAI);
    
    // 提取基础信息
    const projectId = projectData.project_id || `ai_${Date.now()}`;
    const projectName = projectData.project_name || 'AI生成项目';
    const projectType = projectData.project_type || 'web';
    const fileCount = projectData.files_created || projectData.file_count || 0;
    
    // 生成智能预览URL
    const previewUrl = generateIntelligentPreviewUrl(projectData);
    
    // 构建增强的描述
    const baseDescription = projectData.description || '由AI自动生成的项目';
    const enhancedDescription = isValidAI ? 
      `[AI生成] ${baseDescription}` : 
      `[可能AI生成] ${baseDescription}`;
    
    // 构建项目对象 - 不包含 ai_generated 字段
    const project: Project = {
      id: projectId,
      name: projectName,
      description: enhancedDescription,
      type: projectType,
      status: projectData.deployment_info?.status || (isValidAI ? 'active' : 'created'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_executed_at: new Date().toISOString(),
      execution_count: 1,
      file_count: fileCount,
      size: 0,
      entry_point: 'index.html',
      git_repo: null,
      dependencies: [],
      settings: {},
      structure: {},
      preview_url: previewUrl,
      
      // AI相关标记 - 存储在meta_prompt_data中
      meta_prompt_data: {
        creation_method: 'pure_ai_generation',
        ai_generated: isValidAI,  // 存储在元数据中
        ai_validated: isValidAI,
        original_data: projectData,
        created_at: new Date().toISOString(),
        no_template_used: true,
        pure_ai_generation: true
      }
    };
    
    console.log('Final enhanced project object (no ai_generated field):', project);
    console.groupEnd();
    
    return project;
  }, [validateAIGeneration, generateIntelligentPreviewUrl]);

  // 确认生成项目 - 增强版本
  const confirmGenerate = useCallback(async (confirmMessage = "确认生成项目") => {
    console.group('🚀 [confirmGenerate] Starting Enhanced AI Project Generation (No ai_generated field)');
    console.log('Confirm message:', confirmMessage);

    const currentSession = sessionRef.current;
    if (!currentSession || !currentSession.meta_response) {
      console.error('[confirmGenerate] Missing session or meta_response');
      setState(prev => ({
        ...prev,
        error: '缺少Meta阶段数据，无法生成项目'
      }));
      console.groupEnd();
      return;
    }

    setState(prev => ({
      ...prev,
      stage: 'generate_processing',
      loading: true,
      error: null
    }));

    try {
      console.log('📤 Sending Enhanced AI Generate Request...');

      const response = await api.sendVibeCodingGenerate({
        content: confirmMessage,
        conversation_id: currentSession.conversation_id,
        meta_result: currentSession.meta_response,
        optimized_prompt: currentSession.meta_response.vibe_data?.optimized_description || '',
        original_user_input: currentSession.original_input,
        force_ai_generation: true,
        no_template_fallback: true
      });

      console.log('📥 Enhanced AI Generate Response:', response);

      if (response.success) {
        let projectCreated;

        // 多重数据提取策略
        if (response.project_created) {
          projectCreated = response.project_created;
          console.log('✅ Found project_created in root response');
        } else if (response.data?.metadata?.project_created) {
          projectCreated = response.data.metadata.project_created;
          console.log('✅ Found project_created in metadata');
        } else if (response.data?.project_created) {
          projectCreated = response.data.project_created;
          console.log('✅ Found project_created in data');
        } else {
          console.error('❌ No project_created found in AI response');
          throw new Error('AI代码生成失败：响应中未找到项目创建数据，可能存在降级到模板的情况');
        }

        // 验证AI生成的完整性
        const isValidAI = validateAIGeneration(projectCreated);
        if (!isValidAI) {
          console.warn('⚠️ AI generation validation failed, but continuing...');
        }

        // 检查是否使用了模板降级
        if (projectCreated.fallback === true || projectCreated.template_used === true) {
          throw new Error('检测到模板降级策略被使用，这违反了纯AI生成的要求');
        }

        console.group('🏗️ Building Enhanced AI Project Object');
        console.log('Project created data:', projectCreated);

        // 更新会话
        const updatedSession: VibeCodingSession = {
          ...currentSession,
          stage: 'generate_complete',
          generate_response: {
            stage: 'generate_complete',
            project_created: projectCreated,
            suggestions: ['查看预览', '修改项目', '添加功能'],
            ai_generation_verified: isValidAI,
            no_template_used: true
          },
          updated_at: new Date()
        };

        sessionRef.current = updatedSession;

        // 创建增强的项目对象
        const project = createEnhancedProjectObject(projectCreated);
        
        console.log('🏆 Final Enhanced AI Project:', project);
        console.log('🌐 Preview URL:', project.preview_url);
        console.log('🤖 AI Generated Verified:', isAIGeneratedProject(project));
        console.groupEnd();

        // 尝试获取详细项目信息
        if (project.id && project.id !== 'undefined') {
          try {
            const detailedProject = await api.getProjectDetail(project.id);
            if (detailedProject) {
              // 合并详细信息，保持AI生成标记
              Object.assign(project, detailedProject, { 
                preview_url: project.preview_url,
                description: project.description,
                meta_prompt_data: project.meta_prompt_data
              });
              console.log('✅ Merged with detailed project info');
            }
          } catch (error) {
            console.warn('⚠️ Failed to fetch detailed project info:', error);
          }
        }

        setState(prev => ({
          ...prev,
          stage: 'generate_complete',
          loading: false,
          session: updatedSession,
          currentProject: project
        }));

        console.log('✅ Enhanced AI Generate Stage Completed');
        console.groupEnd();
      } else {
        throw new Error(response.error || 'AI代码生成失败：响应格式无效');
      }

    } catch (error: any) {
      console.error('❌ Enhanced AI Generate Stage Failed:', error);
      console.groupEnd();
      
      const errorInfo: VibeCodingError = {
        code: 'AI_GENERATE_ENHANCED_FAILED',
        message: error.message || 'AI项目生成失败',
        stage: 'generate_processing',
        details: error,
        timestamp: new Date()
      };

      setState(prev => ({
        ...prev,
        stage: 'error',
        loading: false,
        error: errorInfo.message
      }));
    }
  }, [validateAIGeneration, createEnhancedProjectObject, isAIGeneratedProject]);

  // 开始 Vibe Coding 流程 - 增强版本
  const startVibeCoding = useCallback(async (userInput: string, conversationId?: string) => {
    console.log('[useVibeCoding] Starting Enhanced AI Vibe Coding Process (No ai_generated field)');

    if (!detectVibeCodingIntent(userInput)) {
      console.log('[useVibeCoding] Not a Vibe Coding intent');
      return;
    }

    const newSession: VibeCodingSession = {
      id: `vibe_enhanced_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      stage: 'meta_processing',
      original_input: userInput,
      conversation_id: conversationId || `conv_enhanced_${Date.now()}`,
      created_at: new Date(),
      updated_at: new Date()
    };

    sessionRef.current = newSession;

    setState(prev => ({
      ...prev,
      stage: 'meta_processing',
      loading: true,
      error: null,
      session: newSession
    }));

    try {
      console.log('[useVibeCoding] Sending Enhanced Meta Request');
      
      const response = await api.sendVibeCodingMeta({
        content: userInput,
        conversation_id: newSession.conversation_id,
        force_ai_enhancement: true,
        disable_fallback: true
      });

      console.log('[useVibeCoding] Enhanced Meta Response:', response);

      if (response.success) {
        let metaResponseData;
        
        if (response.data?.metadata?.vibe_data) {
          metaResponseData = response.data.metadata;
        } else if (response.data?.metadata) {
          metaResponseData = response.data.metadata;
        } else {
          // 创建增强的meta响应数据
          metaResponseData = {
            stage: 'meta_complete',
            vibe_data: {
              optimized_description: response.data?.content || '项目需求已通过系统排班',
              project_info: {
                type: 'web',
                technologies: ['html', 'css', 'javascript'],
                target_person: '用户',
                port: 17430,
                ai_enhanced: true,
                creation_method: 'pure_ai_generation'
              },
              meta_result: response.data,
              original_user_input: userInput,
              ai_optimized: true,
              enhanced: true
            },
            suggestions: ['确认生成AI项目', '修改需求', '重新优化']
          };
        }

        const updatedSession: VibeCodingSession = {
          ...newSession,
          stage: 'meta_complete',
          meta_response: metaResponseData,
          updated_at: new Date()
        };

        sessionRef.current = updatedSession;

        setState(prev => ({
          ...prev,
          stage: 'meta_complete',
          loading: false,
          session: updatedSession
        }));

        console.log('[useVibeCoding] Enhanced Meta Stage Completed');
      } else {
        throw new Error(response.error || 'Meta阶段AI优化失败');
      }

    } catch (error: any) {
      console.error('[useVibeCoding] Enhanced Meta Stage Failed:', error);
      
      const errorInfo: VibeCodingError = {
        code: 'META_STAGE_ENHANCED_FAILED',
        message: error.message || '需求分析失败',
        stage: 'meta_processing',
        details: error,
        timestamp: new Date()
      };

      setState(prev => ({
        ...prev,
        stage: 'error',
        loading: false,
        error: errorInfo.message
      }));
    }
  }, []);

  // 修改需求 - 增强版本
  const modifyRequirement = useCallback(async (modificationRequest: string) => {
    console.log('[useVibeCoding] Enhanced Requirement Modification');
    
    const currentSession = sessionRef.current;
    if (!currentSession) {
      setState(prev => ({ ...prev, error: '没有当前会话' }));
      return;
    }

    setState(prev => ({
      ...prev,
      stage: 'meta_processing',
      loading: true,
      error: null
    }));

    try {
      const modifiedInput = `${currentSession.original_input}\n\n修改要求：${modificationRequest}`;
      
      const response = await api.sendVibeCodingMeta({
        content: modifiedInput,
        conversation_id: currentSession.conversation_id,
        force_ai_enhancement: true,
        disable_fallback: true,
        modification: true
      });

      if (response.success) {
        let metaResponseData;
        
        if (response.data?.metadata?.vibe_data) {
          metaResponseData = response.data.metadata;
        } else {
          metaResponseData = {
            stage: 'meta_complete',
            vibe_data: {
              optimized_description: response.data?.content || '项目需求已重新优化',
              project_info: {
                type: 'web',
                technologies: ['html', 'css', 'javascript'],
                target_person: '用户',
                port: 17430,
                ai_enhanced: true,
                modified: true,
                creation_method: 'pure_ai_generation'
              },
              meta_result: response.data,
              original_user_input: modifiedInput,
              ai_optimized: true,
              enhanced: true,
              modification_applied: true
            },
            suggestions: ['确认生成修改后项目', '继续修改', '重新优化']
          };
        }

        const updatedSession: VibeCodingSession = {
          ...currentSession,
          stage: 'meta_complete',
          meta_response: metaResponseData,
          updated_at: new Date()
        };

        sessionRef.current = updatedSession;

        setState(prev => ({
          ...prev,
          stage: 'meta_complete',
          loading: false,
          session: updatedSession
        }));

        console.log('[useVibeCoding] Enhanced Requirement Modified');
      } else {
        throw new Error(response.error || '需求修改失败');
      }

    } catch (error: any) {
      console.error('[useVibeCoding] Enhanced Requirement Modification Failed:', error);
      
      setState(prev => ({
        ...prev,
        stage: 'error',
        loading: false,
        error: error.message || '需求修改失败'
      }));
    }
  }, []);

  // 重置状态
  const reset = useCallback(() => {
    console.log('[useVibeCoding] Enhanced Reset');
    sessionRef.current = null;
    setState({
      stage: 'idle',
      loading: false,
      error: null,
      session: null,
      currentProject: null
    });
  }, []);

  // 重试最后一次操作
  const retryLastAction = useCallback(async () => {
    console.log('[useVibeCoding] Enhanced Retry Last Action');
    
    const currentSession = sessionRef.current;
    if (!currentSession) {
      setState(prev => ({ ...prev, error: '没有可重试的操作' }));
      return;
    }

    if (currentSession.stage === 'meta_processing' || 
        (currentSession.stage === 'error' && !currentSession.meta_response)) {
      await startVibeCoding(currentSession.original_input, currentSession.conversation_id);
    } else if (currentSession.stage === 'meta_complete') {
      await confirmGenerate();
    }
  }, [startVibeCoding, confirmGenerate]);

  // 获取当前项目的预览URL
  const getCurrentPreviewUrl = useCallback((): string | null => {
    if (state.currentProject?.preview_url) {
      return state.currentProject.preview_url;
    }
    
    if (sessionRef.current?.meta_response?.vibe_data?.project_info?.port) {
      const port = sessionRef.current.meta_response.vibe_data.project_info.port;
      return generateIntelligentPreviewUrl({}, port);
    }
    
    return generateIntelligentPreviewUrl({});
  }, [state.currentProject, generateIntelligentPreviewUrl]);

  // 手动修复预览URL
  const fixCurrentProjectPreviewUrl = useCallback(() => {
    if (state.currentProject && (!state.currentProject.preview_url || state.currentProject.preview_url === 'undefined')) {
      const port = sessionRef.current?.meta_response?.vibe_data?.project_info?.port || 17430;
      const newPreviewUrl = generateIntelligentPreviewUrl({}, port);
      
      setState(prev => ({
        ...prev,
        currentProject: prev.currentProject ? {
          ...prev.currentProject,
          preview_url: newPreviewUrl
        } : null
      }));
      
      console.log(`[fixCurrentProjectPreviewUrl] Fixed preview URL: ${newPreviewUrl}`);
      return newPreviewUrl;
    }
    return state.currentProject?.preview_url || null;
  }, [state.currentProject, generateIntelligentPreviewUrl]);

  // 验证当前项目是否为AI生成
  const validateCurrentProject = useCallback((): boolean => {
    if (!state.currentProject) return false;
    
    const isValid = isAIGeneratedProject(state.currentProject);
    
    console.log('[validateCurrentProject] AI Project Validation:', {
      project: state.currentProject,
      isValid,
      description: state.currentProject.description,
      meta_prompt_data: state.currentProject.meta_prompt_data
    });
    
    return isValid;
  }, [state.currentProject, isAIGeneratedProject]);

  // 获取项目生成摘要
  const getProjectSummary = useCallback((): string => {
    if (!state.currentProject) return '';
    
    const isAI = isAIGeneratedProject(state.currentProject);
    const validation = validateAIGeneration(state.currentProject);
    
    const summary = [
      `项目名称: ${state.currentProject.name}`,
      `项目类型: ${state.currentProject.type}`,
      `文件数量: ${state.currentProject.file_count}`,
      `AI生成验证: ${isAI ? '✅ 通过' : '❌ 未通过'}`,
      `数据完整性: ${validation ? '✅ 完整' : '❌ 不完整'}`,
      `预览地址: ${state.currentProject.preview_url || '未设置'}`,
      `状态: ${state.currentProject.status}`,
      `创建方法: ${state.currentProject.meta_prompt_data?.creation_method || '未知'}`,
      `描述: ${state.currentProject.description || '无'}`
    ].join('\n');
    
    return summary;
  }, [state.currentProject, isAIGeneratedProject, validateAIGeneration]);

  // 获取增强的AI生成状态
  const getAIGenerationStatus = useCallback(() => {
    if (!state.currentProject) return null;
    
    const isAI = isAIGeneratedProject(state.currentProject);
    const validation = validateAIGeneration(state.currentProject);
    
    return {
      isAIGenerated: isAI,
      isValidated: validation,
      hasAIMarker: state.currentProject.description?.includes('[AI生成]') || false,
      hasAINamePattern: state.currentProject.name?.includes('AI生成') || false,
      hasMetaData: !!state.currentProject.meta_prompt_data,
      creationMethod: state.currentProject.meta_prompt_data?.creation_method || 'unknown',
      metaAIGenerated: state.currentProject.meta_prompt_data?.ai_generated || false,
      description: state.currentProject.description,
      name: state.currentProject.name,
      confidence: isAI && validation ? 'high' : isAI ? 'medium' : 'low'
    };
  }, [state.currentProject, isAIGeneratedProject, validateAIGeneration]);

  // 强制标记项目为AI生成 - 通过元数据和描述
  const forceMarkAsAIGenerated = useCallback(() => {
    if (!state.currentProject) return false;
    
    setState(prev => ({
      ...prev,
      currentProject: prev.currentProject ? {
        ...prev.currentProject,
        description: prev.currentProject.description?.includes('[AI生成]') ? 
          prev.currentProject.description : 
          `[AI生成] ${prev.currentProject.description || '项目'}`,
        meta_prompt_data: {
          ...prev.currentProject.meta_prompt_data,
          creation_method: 'pure_ai_generation',
          ai_generated: true,  // 存储在元数据中
          force_marked: true,
          marked_at: new Date().toISOString()
        }
      } : null
    }));
    
    console.log('[forceMarkAsAIGenerated] Project marked as AI generated (via meta_prompt_data)');
    return true;
  }, [state.currentProject]);

  // 调试信息获取
  const getDebugInfo = useCallback(() => {
    return {
      stage: state.stage,
      loading: state.loading,
      error: state.error,
      hasSession: !!state.session,
      hasProject: !!state.currentProject,
      sessionData: sessionRef.current ? {
        id: sessionRef.current.id,
        stage: sessionRef.current.stage,
        hasMetaResponse: !!sessionRef.current.meta_response,
        hasGenerateResponse: !!sessionRef.current.generate_response
      } : null,
      projectData: state.currentProject ? {
        id: state.currentProject.id,
        name: state.currentProject.name,
        meta_ai_generated: state.currentProject.meta_prompt_data?.ai_generated,
        preview_url: state.currentProject.preview_url,
        description: state.currentProject.description,
        creation_method: state.currentProject.meta_prompt_data?.creation_method
      } : null,
      aiStatus: getAIGenerationStatus(),
      timestamp: new Date().toISOString(),
      note: 'Using meta_prompt_data.ai_generated instead of direct ai_generated field'
    };
  }, [state, getAIGenerationStatus]);

  return {
    ...state,
    startVibeCoding,
    confirmGenerate,
    modifyRequirement,
    reset,
    retryLastAction,
    getCurrentPreviewUrl,
    fixCurrentProjectPreviewUrl,
    validateCurrentProject,
    getProjectSummary,
    getAIGenerationStatus,
    forceMarkAsAIGenerated,
    isAIGeneratedProject,
    getDebugInfo
  };
};

// 工具Hook：用于生成处理步骤 - 增强版本
export const useVibeCodingSteps = (stage: VibeCodingStage) => {
  const steps = [
    { id: '1', label: '理解需求', status: 'pending' as const },
    { id: '2', label: '合法化输入', status: 'pending' as const },
    { id: '3', label: '系统执行', status: 'pending' as const },
    { id: '4', label: '部署', status: 'pending' as const },
    { id: '5', label: '验证编译', status: 'pending' as const }
  ];

  switch (stage) {
    case 'meta_processing':
      steps[0].status = 'processing';
      steps[1].status = 'processing';
      break;
    case 'meta_complete':
      steps[0].status = 'completed';
      steps[1].status = 'completed';
      break;
    case 'generate_processing':
      steps[0].status = 'completed';
      steps[1].status = 'completed';
      steps[2].status = 'processing';
      steps[3].status = 'processing';
      steps[4].status = 'processing';
      break;
    case 'generate_complete':
      steps.forEach(step => { step.status = 'completed'; });
      break;
    case 'error':
      const processingIndex = steps.findIndex(step => step.status === 'processing');
      if (processingIndex >= 0) {
        steps[processingIndex].status = 'error';
      }
      break;
  }

  return steps;
};

// 工具Hook：检测Vibe Coding意图 - 增强版本
export const useVibeCodingIntentDetection = () => {
  return useCallback((input: string) => {
    const isVibe = detectVibeCodingIntent(input);
    console.log(`[useVibeCodingIntentDetection] Input: "${input.substring(0, 50)}...", Is Vibe: ${isVibe}`);
    return isVibe;
  }, []);
};

// 导出类型守卫函数
export { isVibeCodingMetaResponse, isVibeCodingGenerateResponse, detectVibeCodingIntent };