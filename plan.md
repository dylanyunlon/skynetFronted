#  SkyNet Agentic Loop 改造计划
## Claude Code 风格前端 — 基于实际代码审计

> **日期**: 2026-02-26
> **后端仓库**: `github.com/dylanyunlon/skynetCheapBuy.git`
> **前端仓库**: `github.com/dylanyunlon/skynetFronted.git`
> **后端路径**: `/root/dylan/skynetCheapBuy/skynetCheapBuy`
> **前端路径**: `/root/dylan/skynetCheapBuy/skynetFronted`（与后端并列）
> **参考文档**: Claude Code Agent Loop v0~v4 (claudecn.com/en/docs/claude-code/advanced/agent-loop/)

---

## 现有代码审计摘要

### 已有文件清单（前端 skynetFronted）

| 文件 | 功能 | 行数 |
|------|------|------|
| `src/types/agentic.ts` | 全事件类型定义（26种事件） | 156行 |
| `src/hooks/useAgenticLoop.ts` | SSE 流式 hook（v10） | 396行 |
| `src/components/Agentic/AgenticChat.tsx` | 主聊天界面（v11） | 604行 |
| `src/components/Agentic/AgenticWorkspace.tsx` | 工作区布局 | 141行 |
| `src/components/AgenticLoop.tsx` | 早期版本（可废弃/合并） | 565行 |

### 已有文件清单（后端 skynetCheapBuy）

| 文件 | 功能 |
|------|------|
| `app/core/agents/agentic_loop.py` | Agent Loop v9（2089行） |
| `app/core/agents/tool_registry.py` | 工具注册表 |
| `app/core/agents/context_manager.py` | 上下文管理 |
| `app/core/agents/event_stream.py` | SSE 事件构建器 |
| `app/core/agents/debug_agent.py` | 调试/回滚/测试 |
| `app/core/agents/loop_scheduler.py` | 调度器/管线优化 |
| `app/core/agents/permission_gate.py` | 权限门控 |

---

## Phase 1: 文件查看功能 — claudecode功能.txt #2 #3

### 1.1 View truncated section of xxx.py（#2）
- √ `types/agentic.ts` 已定义 `view_truncated` 工具类型
- √ `TOOL_DISPLAY` 已有 `view_truncated: { label: 'View section', icon: '👁' }`
- √ `AgenticChat.tsx` `ToolBlock` 组件可渲染 `view_truncated` 工具调用
- √ `ToolResultMeta` 已有 `truncated`, `filename`, `total_lines`, `truncated_range`
- × 缺少: 展开后的 **语法高亮** 代码预览（目前只显示纯文本 `<pre>`）
- × 缺少: truncated range 的 **行号指示器**（如 "Lines 150-200 of 500"）
- × 缺少: "View full file" 快捷跳转按钮

### 1.2 Viewed 3 files（#3）
- √ `types/agentic.ts` 已定义 `batch_read` 工具类型
- √ `TOOL_DISPLAY` 已有 `batch_read: { label: 'Read files', icon: '📑' }`
- √ `ToolResultMeta` 已有 `files_read`, `files_errored`
- × 缺少: 批量文件的 **聚合标题** "Viewed 3 files"（目前每个文件单独一块）
- × 缺少: 展开后的 **文件列表** 逐个显示（类似 Claude Code 折叠列表）
- × 缺少: 每个文件可独立展开/收起的 **嵌套折叠**

---

## Phase 2: Web 搜索 & 抓取 — claudecode功能.txt #4 #5

### 2.1 Searched the web + 结果列表（#4）
- √ `web_search` 工具类型完整定义
- √ `WebSearchResults` 组件已实现（搜索结果链接列表）
- √ `ToolResultMeta.result_titles` 数组已正确传递
- √ `ToolResultMeta.results_count` 显示结果数量
- × 缺少: 搜索关键词 **高亮加粗** 显示（目前只显示 "Query: xxx"）
- × 缺少: Claude Code 风格的搜索结果卡片布局（标题 + 域名 + snippet 三行式）
- × 缺少: 结果域名 **favicon** 图标

### 2.2 Fetched: [page title]（#5）
- √ `web_fetch` 工具类型完整定义
- √ `TOOL_DISPLAY` 已有 `web_fetch: { label: 'Fetch page', icon: '📥' }`
- √ `ToolResultMeta` 已有 `title`, `url`, `content_length`
- × 缺少: Fetched 卡片的 **标题显示**（目前只显示 "Fetch page" 而非实际页面标题）
- × 缺少: 抓取内容的 **摘要预览**（展开后显示前 N 行文本）

---

## Phase 3: 命令执行 — claudecode功能.txt #6 #7 #8

### 3.1 Ran N commands 聚合（#6 #7）
- √ `batch_commands` 工具类型完整定义
- √ `BatchCommandsResults` 组件已实现（子命令成功/失败列表）
- √ `ToolResultMeta.results` 数组支持多命令结果
- × 缺少: Claude Code 风格的聚合标题 **"Ran 7 commands"** 自动计数
- × 缺少: 每个命令的 **"Script"** 标签 + 展开查看脚本内容
- × 缺少: 命令描述文本（如 "Copy files to workspace and analyze"）

### 3.2 Ran a command + edited a file（#8）
- √ `bash` 工具渲染已实现（显示 `$ command`）
- √ `run_script` 工具渲染已实现（显示脚本预览）
- √ `edit_file` 工具渲染已实现（显示 diff）
- × 缺少: **混合操作标题** "Ran a command, edited a file"（目前各自独立显示）
- × 缺少: 命令和编辑操作之间的 **关联展示**

### 3.3 Ran N commands, viewed a file, edited a file 混合（#11）
- √ `TurnSummaryBlock` 已有聚合统计（"N commands run, N files viewed"）
- × 缺少: 标题格式对齐 Claude Code — "Ran 14 commands, viewed a file, edited a file"
- × 缺少: 混合操作的 **时间线式** 展开视图

---

## Phase 4: 文件编辑 & Diff — claudecode功能.txt #8 #9 #12 #14

### 4.1 编辑文件 Diff 显示
- √ `DiffDisplay` 组件已实现（+N, -N 统计）
- √ `ToolBlock` 展开后有完整 **unified diff** 视图（绿/红着色）
- √ `editStats` 行内显示 filename + `+3 -4` 统计
- √ `ToolResultMeta.unified_diff` / `diff` / `diff_display` 多来源支持
- × 缺少: **side-by-side diff** 视图切换（目前只有 unified）
- × 缺少: diff 中的 **行号** 显示

### 4.2 编辑描述文本（#9）
- √ `toolDescription` 字段已支持，显示在 ToolBlock header
- √ 如 "Replace scalar XOR with VALU XOR" 已可渲染
- √ 已实现完整

### 4.3 Revert 还原（#12 #14）
- √ `revert` 事件类型完整定义
- √ `InfoBlock` 中 revert 渲染已实现（橙色还原卡片）
- √ `revert_edit` / `revert_to_checkpoint` 工具类型已注册
- √ `revertPath`, `revertDescription` 字段完整
- √ 已实现完整

---

## Phase 5: 测试 & 调试 — claudecode功能.txt #10 #11

### 5.1 测试执行（#10）
- √ `test_result` 事件类型完整
- √ `DebugBlock` 中 test_result 渲染已实现（passed/failed + 通过率）
- √ `testPassed`, `testTotal`, `testPassedCount`, `testFailedCount`, `testDurationS`
- √ 后端 `TestRunner` 已对接
- × 缺少: 测试 **输出日志** 展开查看

### 5.2 调试循环（#11 部分）
- √ `debug_start` / `debug_result` 事件类型完整
- √ `DebugBlock` 组件已实现（cycle N/M + passed/failed + diagnosis）
- √ 后端 `DebugAgent` + `debug_test` 工具完整
- √ 已实现完整

---

## Phase 6: 进度 & 状态显示

### 6.1 Done 完成标记
- √ 每个 ToolBlock 完成后显示 ✓ (CheckCircle)
- √ 全局 "Done" 摘要条（turns + tool calls + duration + cost）
- √ 已实现完整

### 6.2 加载状态
- √ Spinner（Loader2 animate-spin）
- √ 状态点（绿色 animate-pulse = running）
- √ elapsed 计时器
- √ 已实现完整

### 6.3 Context Compact / Heartbeat
- √ `context_compact` 事件 → tokens 压缩提示
- √ `heartbeat` 事件 → elapsed 更新
- √ 已实现完整

---

## Phase 7: 高级功能

### 7.1 SubAgent
- √ `subagent_start` / `subagent_result` 事件完整
- √ SubAgent 卡片渲染（粉色边框 + GitBranch 图标）
- √ 后端 SubAgent 调用机制已实现
- √ 已实现完整

### 7.2 Todo / Plan
- √ `todo_update` 事件 → `TodoStatus` 进度条
- √ `todo_write` / `todo_read` 工具已注册
- × 缺少: Todo 列表 **交互式** 展示（可勾选/展开每个 Todo 项）

### 7.3 Approval / Permission Gate
- √ `approval_wait` 事件 → 黄色警告卡片
- √ 后端 `PermissionGate` 风险等级判断
- × 缺少: 前端 **Approve/Deny 按钮** 交互（目前只展示，无法回应）

### 7.4 Chunk Schedule
- √ `chunk_schedule` 事件 → 调度信息显示
- √ 后端 `ChunkScheduler` 已实际接入
- √ 已实现完整

---

## Phase 8: 视觉对齐 Claude Code — 关键差距

### 8.1 聚合标题格式（核心差距）
- × **"Ran 7 commands"** — 目前 batch_commands 不显示聚合计数标题
- × **"Viewed 3 files"** — 目前 batch_read 不显示聚合计数标题
- × **"Ran 14 commands, viewed a file, edited a file"** — 目前 TurnSummary 格式不对齐
- × **"Searched the web → 10 results"** — 目前搜索结果数量不在标题行显示
- × **"Fetched: [title]"** — 目前标题显示 "Fetch page" 而非实际页面标题

### 8.2 每步操作的文字描述
- × 缺少: 命令步骤下方的描述文本（如 "Copy files to workspace and analyze current architecture"）
- × 缺少: "Script" 标签与描述文本的分离显示

### 8.3 View main loop section（#13）
- × 缺少: 特定的 "View the main loop section to understand what to restructure" 展示
- 实质上等同于 `view_truncated` + 自定义描述，需确保描述文本正确传递

### 8.4 Restructure main loop（#15）
- × 缺少: 重构操作的 `+20` 统计展示
- 实质上等同于 `edit_file` + 大量新增行，需确保 diff 统计正确

---

## 综合进度表（claudecode功能.txt 15项对照）

| # | 功能 | 后端 | 前端类型 | 前端渲染 | 聚合标题 | 状态 |
|---|------|------|---------|---------|---------|------|
| 1 | tree 目录结构 | √ list_dir | √ 定义 | √ 渲染 | — | √ 完成 |
| 2 | View truncated section | √ view_truncated | √ 定义 | √ 基础渲染 | × | ⚠️ 缺高亮+行号 |
| 3 | Viewed 3 files | √ batch_read | √ 定义 | √ 基础渲染 | × 缺聚合 | ⚠️ 缺聚合标题 |
| 4 | Searched the web 10 results | √ web_search | √ 定义 | √ 结果列表 | × 缺格式 | ⚠️ 缺卡片布局 |
| 5 | Fetched: [title] | √ web_fetch | √ 定义 | √ 基础渲染 | × 缺标题 | ⚠️ 缺标题显示 |
| 6 | Ran 7 commands | √ batch_commands | √ 定义 | √ 子列表 | × 缺计数 | ⚠️ 缺聚合标题 |
| 7 | Ran 3 commands | √ batch_commands | √ 定义 | √ 子列表 | × 缺计数 | ⚠️ 缺聚合标题 |
| 8 | Ran a command + edited file | √ bash + edit_file | √ 定义 | √ 各自渲染 | × 缺混合 | ⚠️ 缺混合标题 |
| 9 | Convert IDX UPDATE (+11,-13) | √ edit_file | √ 定义 | √ diff显示 | √ 有统计 | √ 完成 |
| 10 | Test VALU XOR changes | √ debug_test | √ 定义 | √ pass/fail | — | √ 完成 |
| 11 | Ran 14 commands, viewed, edited | √ turn event | √ 定义 | √ TurnSummary | × 缺格式 | ⚠️ 缺格式对齐 |
| 12 | Revert + edited | √ revert_edit | √ 定义 | √ 还原卡片 | — | √ 完成 |
| 13 | View main loop section | √ view_truncated | √ 定义 | √ 基础渲染 | — | √ 完成 |
| 14 | Revert VALU XOR back | √ revert_edit | √ 定义 | √ 还原卡片 | — | √ 完成 |
| 15 | Restructure main loop +20 | √ edit_file | √ 定义 | √ diff显示 | √ 有统计 | √ 完成 |

**统计**: √ 完成 8/15 | ⚠️ 部分完成 7/15 | × 未开始 0/15

---

## 待实现任务清单（按优先级排序）

### P0 — 聚合标题渲染（解决 7 个 ⚠️ 的核心问题）

- [ ] **TASK-01**: `ToolBlock` 改造 — `batch_commands` 自动生成 "Ran N commands" 聚合标题
  - 文件: `src/components/Agentic/AgenticChat.tsx` → ToolBlock 组件
  - 修改: 当 `tool === 'batch_commands'` 时，标题从 `ToolResultMeta.total_commands` 动态生成
  - 预期: "Ran 7 commands" + 展开后显示每个命令的 Script + 描述

- [ ] **TASK-02**: `ToolBlock` 改造 — `batch_read` 自动生成 "Viewed N files" 聚合标题
  - 文件: `src/components/Agentic/AgenticChat.tsx` → ToolBlock 组件
  - 修改: 当 `tool === 'batch_read'` 时，标题从 `ToolResultMeta.files_read` 动态生成
  - 预期: "Viewed 3 files" + 展开后显示文件列表

- [ ] **TASK-03**: `ToolBlock` 改造 — `web_search` 标题增加结果数
  - 文件: `src/components/Agentic/AgenticChat.tsx` → ToolBlock 组件
  - 修改: 当 `tool === 'web_search'` 时，标题显示查询词 + "N results"
  - 预期: "Searched the web" → "VLIW SIMD parallel..." → "10 results"

- [ ] **TASK-04**: `ToolBlock` 改造 — `web_fetch` 标题显示页面标题
  - 文件: `src/components/Agentic/AgenticChat.tsx` → ToolBlock 组件
  - 修改: 当 `tool === 'web_fetch'` 且 `ToolResultMeta.title` 存在时，标题显示实际页面标题
  - 预期: "Fetched: Anthropic's original take home assignment open sourced"

- [ ] **TASK-05**: `TurnSummaryBlock` 改造 — 对齐 Claude Code 格式
  - 文件: `src/components/Agentic/AgenticChat.tsx` → TurnSummaryBlock 组件
  - 修改: display 文本格式改为 "Ran N commands, viewed a file, edited a file"
  - 预期: 匹配 claudecode功能.txt #11 格式

### P1 — 视觉增强

- [ ] **TASK-06**: 命令步骤增加描述文本
  - 文件: `src/components/Agentic/AgenticChat.tsx` → ToolBlock 展开区域
  - 修改: 在 Script 展示前增加描述行（来自 `toolDescription`）
  - 预期: "Copy files to workspace and analyze current architecture" → Script → Done

- [ ] **TASK-07**: View truncated 增加行号指示
  - 文件: `src/components/Agentic/AgenticChat.tsx` → ToolBlock 展开区域
  - 修改: 当 `tool === 'view_truncated'` 时显示 "Lines X-Y of Z"
  - 预期: `truncated_range` + `total_lines` 渲染

- [ ] **TASK-08**: Web 搜索结果卡片布局优化
  - 文件: `src/components/Agentic/AgenticChat.tsx` → WebSearchResults 组件
  - 修改: 三行式布局（标题 / URL+域名 / snippet），增加域名 favicon 占位

### P2 — 交互增强

- [ ] **TASK-09**: Todo 列表交互式展示
  - 文件: `src/components/Agentic/AgenticChat.tsx` → InfoBlock → todo_update
  - 修改: 展开 TodoStatus.todos 列表，每项显示状态图标

- [ ] **TASK-10**: Approval 按钮交互
  - 文件: `src/components/Agentic/AgenticChat.tsx` → InfoBlock → approval_wait
  - 新增: Approve / Deny 按钮 + 回调 API

- [ ] **TASK-11**: Side-by-side diff 视图
  - 文件: 新建 `src/components/Agentic/DiffViewer.tsx`
  - 新增: 左右对比 diff 视图组件，ToolBlock 可切换 unified/split 模式

### P3 — 代码质量

- [ ] **TASK-12**: 合并/清理旧 AgenticLoop.tsx
  - `src/components/AgenticLoop.tsx`（565行）是早期版本，功能已被 `Agentic/AgenticChat.tsx` 完全覆盖
  - 确认 App.tsx 不再引用后安全删除

---

## 新增/修改文件位置清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| **修改** | `src/components/Agentic/AgenticChat.tsx` | TASK-01~08 核心改造 |
| **修改** | `src/types/agentic.ts` | 如需新增字段 |
| **修改** | `src/hooks/useAgenticLoop.ts` | 如需新增事件处理 |
| **新建** | `src/components/Agentic/DiffViewer.tsx` | TASK-11 side-by-side diff |
| **删除** | `src/components/AgenticLoop.tsx` | TASK-12 清理旧代码 |

---

## 本地运行命令

```bash
# === 前端 ===
cd /root/dylan/skynetCheapBuy/skynetFronted
npm install          # 首次安装依赖
npm run dev          # 开发模式 (Vite HMR)
npm run build        # 生产构建
npm run preview      # 预览构建结果

# === 后端 ===
cd /root/dylan/skynetCheapBuy/skynetCheapBuy
# 已有部署脚本:
bash deploy.sh       # 或根据现有方式运行

# === Git 操作 ===
cd /root/dylan/skynetCheapBuy/skynetFronted
git add -A
git commit -m "feat: Claude Code style aggregated titles for agentic blocks"
git push origin main

cd /root/dylan/skynetCheapBuy/skynetCheapBuy
git add -A
git commit -m "feat: enhanced agentic loop event metadata"
git push origin main
```

---

> **下一步**: 执行 TASK-01 ~ TASK-05（P0 聚合标题改造），这是解决当前 7/15 项 ⚠️ 的最直接手段。完成后将 ⚠️ 全部转为 √。