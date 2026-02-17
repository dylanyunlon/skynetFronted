// src/components/Unified/LovableStyleWaiting.tsx
import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Target, Image, Eye, Package, Database, 
  Code, Globe, Bot, Sparkles, Zap, FileText, Palette,
  Settings, CheckCircle, Activity, Clock, ArrowRight
} from 'lucide-react';
import { VibeCodingStage } from '@/types';

interface LovableStyleWaitingProps {
  stage: VibeCodingStage;
  loading: boolean;
  userInput?: string;
  className?: string;
}

const LovableStyleWaiting: React.FC<LovableStyleWaitingProps> = ({
  stage,
  loading,
  userInput,
  className = ""
}) => {
  const [animationOffset, setAnimationOffset] = useState(0);

  // Lovable风格的功能特性列表
  const features = [
    {
      icon: MessageSquare,
      text: "与AI在聊天框中交流需求",
      description: "自然语言描述你想要的应用"
    },
    {
      icon: Target,
      text: "选择特定元素进行修改",
      description: "精确控制每个组件的样式和功能"
    },
    {
      icon: Image,
      text: "上传图片作为设计参考",
      description: "基于截图快速生成相似界面"
    },
    {
      icon: Eye,
      text: "实时预览你的修改",
      description: "所见即所得的开发体验"
    },
    {
      icon: Package,
      text: "为每次编辑设置自定义知识",
      description: "个性化的代码生成规则"
    },
    {
      icon: Database,
      text: "暂未有连接后端服务",
      description: "并不能一键集成数据库和认证"
    },
    {
      icon: Code,
      text: "通过GitHub协作开发",
      description: "版本控制和团队协作"
    },
    {
      icon: Globe,
      text: "准备就绪即可部署",
      description: "一键发布到生产环境"
    },
    {
      icon: Bot,
      text: "AI智能代码生成",
      description: "基于最佳实践的代码输出"
    },
    {
      icon: Sparkles,
      text: "现代化组件库",
      description: "React + Tailwind CSS"
    },
    {
      icon: Zap,
      text: "快速原型开发",
      description: "从想法到可用应用仅需几分钟"
    },
    {
      icon: FileText,
      text: "自动生成文档",
      description: "代码注释和使用说明"
    },
    {
      icon: Palette,
      text: "响应式设计",
      description: "自适应移动端和桌面端"
    },
    {
      icon: Settings,
      text: "可扩展架构",
      description: "支持复杂业务逻辑"
    }
  ];

  // 处理中的状态特性
  const processingFeatures = [
    {
      icon: Activity,
      text: "🤖 AI正在分析你的需求",
      description: "理解项目类型和功能要求"
    },
    {
      icon: Clock,
      text: "🏗️ 设计项目架构中",
      description: "优化组件结构和数据流"
    },
    {
      icon: Code,
      text: "⚛️ 生成React组件",
      description: "创建可复用的UI组件"
    },
    {
      icon: Palette,
      text: "🎨 应用样式和布局",
      description: "Tailwind CSS响应式设计"
    },
    {
      icon: Database,
      text: "🔗 配置API和数据库",
      description: "建立数据连接和状态管理"
    },
    {
      icon: Zap,
      text: "⚡ 优化性能和打包",
      description: "代码分割和懒加载优化"
    },
    {
      icon: Globe,
      text: "🚀 准备部署预览",
      description: "生成可访问的项目链接"
    },
    {
      icon: CheckCircle,
      text: "✨ 项目创建完成",
      description: "可以开始使用和进一步定制"
    }
  ];

  // 根据状态选择要显示的特性
  const currentFeatures = loading && (stage === 'meta_processing' || stage === 'generate_processing') 
    ? processingFeatures 
    : features;

  // 无限滚动动画
  useEffect(() => {
    if (!loading && stage === 'idle') return;

    const interval = setInterval(() => {
      setAnimationOffset(prev => {
        const newOffset = prev - 1;
        // 当滚动完一轮后重置
        if (Math.abs(newOffset) >= currentFeatures.length * 64) {
          return 0;
        }
        return newOffset;
      });
    }, 50); // 50ms间隔，创造流畅的滚动效果

    return () => clearInterval(interval);
  }, [loading, stage, currentFeatures.length]);

  // 如果不是等待状态，显示空闲界面
  if (!loading && stage === 'idle') {
    return (
      <div className={`flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-center space-y-6 p-8 max-w-md">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center animate-float">
            <Bot className="w-10 h-10 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">准备开始创建</h3>
            <p className="text-gray-600">
              在左侧聊天框中描述你想创建的应用，AI将为你实时生成完整的项目
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg text-blue-700 animate-fade-in-up">
              💡 "创建一个PPT展示应用"
            </div>
            <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg text-green-700 animate-fade-in-up" 
                 style={{ animationDelay: '0.2s' }}>
              💡 "构建一个ACCESS课设网站"
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg text-purple-700 animate-fade-in-up" 
                 style={{ animationDelay: '0.4s' }}>
              💡 "设计一个数据仪表板"
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* 头部状态指示器 */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              瞬间秒撒
              <div className="ml-2 flex space-x-1">
                {[1, 2, 3].map(i => (
                  <div 
                    key={i} 
                    className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              {stage === 'meta_processing' ? '正在分析需求和规划项目架构...' :
               stage === 'generate_processing' ? '正在生成代码和构建项目...' :
               '正在处理你的请求...'}
            </p>
          </div>
        </div>

        {/* 用户输入回显 */}
        {userInput && (
          <div className="mt-3 p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200">
            <div className="flex items-start space-x-2">
              <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-blue-900">正在构建</div>
                <div className="text-sm text-blue-700 truncate">
                  "{userInput.length > 80 ? userInput.slice(0, 80) + '...' : userInput}"
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lovable风格的滚动特性列表 */}
      <div className="w-full relative mx-auto h-80 overflow-hidden bg-gray-50/50">
        {/* 顶部渐变遮罩 */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-gray-50 to-transparent" />
        
        {/* 滚动内容 */}
        <div 
          className="animate-slide-up"
          style={{ 
            transform: `translateY(${animationOffset}px)`,
            transition: 'none' // 移除CSS transition，使用JavaScript控制
          }}
        >
          {/* 渲染两倍的内容以实现无缝循环 */}
          {[...currentFeatures, ...currentFeatures].map((feature, index) => {
            const Icon = feature.icon;
            const isProcessing = loading && (stage === 'meta_processing' || stage === 'generate_processing');
            
            return (
              <div 
                key={`${feature.text}-${index}`}
                className="flex items-center gap-3 p-4 transition-colors hover:bg-white/50"
              >
                <Icon className={`shrink-0 h-5 w-5 ${
                  isProcessing 
                    ? 'text-blue-500' 
                    : 'text-gray-500'
                } ${
                  isProcessing && index % 8 === (Math.floor(Date.now() / 1000) % 8)
                    ? 'animate-pulse' 
                    : ''
                }`} />
                <div className="min-w-0 flex-1">
                  <span className={`text-sm ${
                    isProcessing ? 'text-blue-700 font-medium' : 'text-gray-600'
                  }`}>
                    {feature.text}
                  </span>
                  {feature.description && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {feature.description}
                    </div>
                  )}
                </div>
                {isProcessing && index % 8 === (Math.floor(Date.now() / 1000) % 8) && (
                  <ArrowRight className="w-4 h-4 text-blue-500 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
        
        {/* 底部渐变遮罩 */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-gray-50 to-transparent" />
      </div>

      {/* 底部状态栏 */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Activity className="w-4 h-4 text-gray-500" />
            <span>AI引擎运行中</span>
          </div>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>实时处理</span>
            </div>
            <div>
              {stage === 'meta_processing' ? '分析阶段' :
               stage === 'generate_processing' ? '生成阶段' :
               '准备中'}
            </div>
          </div>
        </div>
        
        {/* 进度条 */}
        <div className="mt-3 w-full bg-gray-500 rounded-full h-1.5 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-500 h-1.5 rounded-full animate-progress-bar" />
        </div>
      </div>
    </div>
  );
};

export default LovableStyleWaiting;