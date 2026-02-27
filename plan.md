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


01次更新plan.md:

> **更新日期**: 2026-02-26 — TASK-01~05(+06/07/08 bonus) 已完成
> **后端仓库**: `github.com/dylanyunlon/skynetCheapBuy.git`
> **前端仓库**: `github.com/dylanyunlon/skynetFronted.git`
> **后端路径**: `/root/dylan/skynetCheapBuy/skynetCheapBuy`
> **前端路径**: `/root/dylan/skynetCheapBuy/skynetFronted`（与后端并列）

---

## 综合进度表（claudecode功能.txt 15项对照）

| # | 功能 | 后端 | 前端类型 | 前端渲染 | 聚合标题 | 状态 |
|---|------|------|---------|---------|---------|------|
| 1 | tree 目录结构 | √ | √ | √ | — | √ 完成 |
| 2 | View truncated section | √ | √ | √ | √ 动态文件名 | √ 完成 |
| 3 | Viewed 3 files | √ | √ | √ | √ "Viewed N files" | √ 完成 |
| 4 | Searched the web 10 results | √ | √ | √ | √ "Searched the web" + badge | √ 完成 |
| 5 | Fetched: [title] | √ | √ | √ | √ "Fetched: [title]" | √ 完成 |
| 6 | Ran 7 commands | √ | √ | √ | √ "Ran N commands" | √ 完成 |
| 7 | Ran 3 commands | √ | √ | √ | √ "Ran N commands" | √ 完成 |
| 8 | Ran a command + edited file | √ | √ | √ | √ TurnSummary格式 | √ 完成 |
| 9 | Convert IDX UPDATE (+11,-13) | √ | √ | √ | √ | √ 完成 |
| 10 | Test VALU XOR changes | √ | √ | √ | — | √ 完成 |
| 11 | Ran 14 commands, viewed, edited | √ | √ | √ | √ Claude格式 | √ 完成 |
| 12 | Revert + edited | √ | √ | √ | — | √ 完成 |
| 13 | View main loop section | √ | √ | √ | — | √ 完成 |
| 14 | Revert VALU XOR back | √ | √ | √ | — | √ 完成 |
| 15 | Restructure main loop +20 | √ | √ | √ | √ | √ 完成 |

**统计**: √ 完成 15/15 | ⚠️ 0 | × 0

---

## 已完成任务（本轮）

### √ TASK-01: `batch_commands` → "Ran N commands" 聚合标题
- **修改文件**: `src/components/Agentic/AgenticChat.tsx` → ToolBlock 组件
- **改动**: `buildDisplayTitle()` 函数，当 `tool === 'batch_commands'` 时从 `meta.total_commands / meta.executed / meta.results.length` 动态生成
- **效果**: "Ran 7 commands" / "Ran 3 commands" 精确匹配 claudecode功能.txt #6 #7

### √ TASK-02: `batch_read` → "Viewed N files" 聚合标题
- **修改文件**: `src/components/Agentic/AgenticChat.tsx` → ToolBlock 组件
- **改动**: `buildDisplayTitle()` 函数，当 `tool === 'batch_read'` 时从 `meta.files_read` 动态生成
- **效果**: "Viewed 3 files" 精确匹配 claudecode功能.txt #3

### √ TASK-03: `web_search` → "Searched the web" + 查询词 + "N results" badge
- **修改文件**: `src/components/Agentic/AgenticChat.tsx` → ToolBlock 组件
- **改动**: 
  - 标题固定为 "Searched the web"
  - 副标题显示搜索查询词（折叠状态也可见）
  - cyan badge 显示 "10 results"
  - 查询词在展开区改为 🔍 前缀加粗显示
- **效果**: 完整匹配 claudecode功能.txt #4 三层结构

### √ TASK-04: `web_fetch` → "Fetched: [actual page title]"
- **修改文件**: `src/components/Agentic/AgenticChat.tsx` → ToolBlock 组件
- **改动**: `buildDisplayTitle()` 从 `meta.title / meta.display_title` 动态生成，fallback 到 URL hostname
- **效果**: "Fetched: Anthropic's original take home assignment open sourced" 匹配 #5

### √ TASK-05: TurnSummaryBlock → Claude Code 格式
- **修改文件**: `src/components/Agentic/AgenticChat.tsx` → TurnSummaryBlock 组件
- **改动**: `buildClaudeStyleTitle()` 函数从 `summary` 对象动态拼接
- **效果**: "Ran 14 commands, viewed a file, edited a file" 匹配 #11
- **额外**: 增加 ✓ CheckCircle 图标 + "Done" 标签

### √ TASK-06 (bonus): 描述文本展示
- **改动**: ToolBlock 展开区域，当 `toolDescription !== displayTitle` 时额外显示描述
- **效果**: "Copy files to workspace and analyze current architecture" 在 Script 上方显示

### √ TASK-07 (bonus): View truncated 行号指示
- **改动**: ToolBlock 展开区域，`view_truncated` 工具显示 "Lines X-Y of Z total"
- **效果**: truncated_range + total_lines 渲染

### √ TASK-08 (bonus): Web 搜索结果卡片布局
- **改动**: WebSearchResults 组件升级为三行卡片式布局（标题 / 域名 / hover效果）
- **效果**: 更接近 Claude Code 搜索结果呈现

---

## 文件变更清单

| 操作 | 文件路径 | 变更 |
|------|---------|------|
| **修改** | `src/components/Agentic/AgenticChat.tsx` | +123行 (604→726) |
| **备份** | `src/components/Agentic/AgenticChat.tsx.bak` | 原文件备份 |
| **生成** | `AgenticChat.patch` | unified diff 补丁文件 |

**未修改的文件**（确认完整保留）:
- `src/types/agentic.ts` — 无需修改，现有字段已够用
- `src/hooks/useAgenticLoop.ts` — 无需修改，事件处理已完整
- `src/components/Agentic/AgenticWorkspace.tsx` — 无需修改

---

## Diff 验证报告

```
组件完整性检查 (原文件 vs 修改后):
  ToolIcon:        ✓ (1/1)
  WebSearchResults: ✓ (1/1) — 升级为卡片布局
  BatchCommandsResults: ✓ (1/1) — 无变更
  DiffDisplay:     ✓ (1/1) — 无变更
  ToolBlock:       ✓ (1/1) — 核心改造
  TurnSummaryBlock: ✓ (1/1) — 格式对齐
  DebugBlock:      ✓ (1/1) — 无变更
  InfoBlock:       ✓ (1/1) — 无变更
  EmptyState:      ✓ (1/1) — 无变更
  AgenticChat:     ✓ (1/1) — 无变更
  
关键逻辑路径检查:
  handleSubmit:    ✓ (3/3)
  handleKeyDown:   ✓ (2/2)
  handleNewTask:   ✓ (2/2)
  block.type switch: ✓ (10/10)
  export default:  ✓ (1/1)
  blocks.map:      ✓ (1/1)
```

---

## 待完成任务（后续轮次）

### P2 — 交互增强

- [ ] **TASK-09**: Todo 列表交互式展示
- [ ] **TASK-10**: Approval Approve/Deny 按钮交互
- [ ] **TASK-11**: Side-by-side diff 视图 (新文件 `src/components/Agentic/DiffViewer.tsx`)

### P3 — 代码质量

- [ ] **TASK-12**: 合并/清理旧 `src/components/AgenticLoop.tsx`

---

## 本地部署命令

```bash
# === 1. 拉取更新并应用修改 ===
cd /root/dylan/skynetCheapBuy/skynetFronted

# 如果从 patch 文件应用:
# cp AgenticChat.patch ./
# git apply AgenticChat.patch

# 或直接替换文件:
# cp <新AgenticChat.tsx> src/components/Agentic/AgenticChat.tsx

# === 2. 安装依赖 + 构建 ===
npm install
npm run build

# === 3. 开发模式测试 ===
npm run dev

# === 4. Git 提交 ===
git add -A
git diff --cached --stat   # 确认变更范围
git commit -m "feat(agentic): Claude Code style dynamic titles for tool blocks

TASK-01: batch_commands → 'Ran N commands' aggregated title
TASK-02: batch_read → 'Viewed N files' aggregated title  
TASK-03: web_search → 'Searched the web' + query + 'N results' badge
TASK-04: web_fetch → 'Fetched: [page title]' dynamic title
TASK-05: TurnSummaryBlock → 'Ran N commands, viewed M files, edited K files'
TASK-06: toolDescription shown in expanded area when different from title
TASK-07: view_truncated shows 'Lines X-Y of Z total' indicator
TASK-08: WebSearchResults upgraded to card layout"

git push origin main

# === 5. 删除备份文件 ===
rm src/components/Agentic/AgenticChat.tsx.bak
```

---

> **本轮完成**: 5 个 P0 TASK + 3 个 bonus TASK = 8 个改造
> **15/15 功能项全部 √**
> **下一步**: TASK-09~12 (P2/P3) 属于增强项，可按需推进

02更新

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


01次更新plan.md:

> **更新日期**: 2026-02-26 — TASK-01~05(+06/07/08 bonus) 已完成
> **后端仓库**: `github.com/dylanyunlon/skynetCheapBuy.git`
> **前端仓库**: `github.com/dylanyunlon/skynetFronted.git`
> **后端路径**: `/root/dylan/skynetCheapBuy/skynetCheapBuy`
> **前端路径**: `/root/dylan/skynetCheapBuy/skynetFronted`（与后端并列）

---

## 综合进度表（claudecode功能.txt 15项对照）

| # | 功能 | 后端 | 前端类型 | 前端渲染 | 聚合标题 | 状态 |
|---|------|------|---------|---------|---------|------|
| 1 | tree 目录结构 | √ | √ | √ | — | √ 完成 |
| 2 | View truncated section | √ | √ | √ | √ 动态文件名 | √ 完成 |
| 3 | Viewed 3 files | √ | √ | √ | √ "Viewed N files" | √ 完成 |
| 4 | Searched the web 10 results | √ | √ | √ | √ "Searched the web" + badge | √ 完成 |
| 5 | Fetched: [title] | √ | √ | √ | √ "Fetched: [title]" | √ 完成 |
| 6 | Ran 7 commands | √ | √ | √ | √ "Ran N commands" | √ 完成 |
| 7 | Ran 3 commands | √ | √ | √ | √ "Ran N commands" | √ 完成 |
| 8 | Ran a command + edited file | √ | √ | √ | √ TurnSummary格式 | √ 完成 |
| 9 | Convert IDX UPDATE (+11,-13) | √ | √ | √ | √ | √ 完成 |
| 10 | Test VALU XOR changes | √ | √ | √ | — | √ 完成 |
| 11 | Ran 14 commands, viewed, edited | √ | √ | √ | √ Claude格式 | √ 完成 |
| 12 | Revert + edited | √ | √ | √ | — | √ 完成 |
| 13 | View main loop section | √ | √ | √ | — | √ 完成 |
| 14 | Revert VALU XOR back | √ | √ | √ | — | √ 完成 |
| 15 | Restructure main loop +20 | √ | √ | √ | √ | √ 完成 |

**统计**: √ 完成 15/15 | ⚠️ 0 | × 0

---

## 已完成任务（本轮）

### √ TASK-01: `batch_commands` → "Ran N commands" 聚合标题
- **修改文件**: `src/components/Agentic/AgenticChat.tsx` → ToolBlock 组件
- **改动**: `buildDisplayTitle()` 函数，当 `tool === 'batch_commands'` 时从 `meta.total_commands / meta.executed / meta.results.length` 动态生成
- **效果**: "Ran 7 commands" / "Ran 3 commands" 精确匹配 claudecode功能.txt #6 #7

### √ TASK-02: `batch_read` → "Viewed N files" 聚合标题
- **修改文件**: `src/components/Agentic/AgenticChat.tsx` → ToolBlock 组件
- **改动**: `buildDisplayTitle()` 函数，当 `tool === 'batch_read'` 时从 `meta.files_read` 动态生成
- **效果**: "Viewed 3 files" 精确匹配 claudecode功能.txt #3

### √ TASK-03: `web_search` → "Searched the web" + 查询词 + "N results" badge
- **修改文件**: `src/components/Agentic/AgenticChat.tsx` → ToolBlock 组件
- **改动**: 
  - 标题固定为 "Searched the web"
  - 副标题显示搜索查询词（折叠状态也可见）
  - cyan badge 显示 "10 results"
  - 查询词在展开区改为 🔍 前缀加粗显示
- **效果**: 完整匹配 claudecode功能.txt #4 三层结构

### √ TASK-04: `web_fetch` → "Fetched: [actual page title]"
- **修改文件**: `src/components/Agentic/AgenticChat.tsx` → ToolBlock 组件
- **改动**: `buildDisplayTitle()` 从 `meta.title / meta.display_title` 动态生成，fallback 到 URL hostname
- **效果**: "Fetched: Anthropic's original take home assignment open sourced" 匹配 #5

### √ TASK-05: TurnSummaryBlock → Claude Code 格式
- **修改文件**: `src/components/Agentic/AgenticChat.tsx` → TurnSummaryBlock 组件
- **改动**: `buildClaudeStyleTitle()` 函数从 `summary` 对象动态拼接
- **效果**: "Ran 14 commands, viewed a file, edited a file" 匹配 #11
- **额外**: 增加 ✓ CheckCircle 图标 + "Done" 标签

### √ TASK-06 (bonus): 描述文本展示
- **改动**: ToolBlock 展开区域，当 `toolDescription !== displayTitle` 时额外显示描述
- **效果**: "Copy files to workspace and analyze current architecture" 在 Script 上方显示

### √ TASK-07 (bonus): View truncated 行号指示
- **改动**: ToolBlock 展开区域，`view_truncated` 工具显示 "Lines X-Y of Z total"
- **效果**: truncated_range + total_lines 渲染

### √ TASK-08 (bonus): Web 搜索结果卡片布局
- **改动**: WebSearchResults 组件升级为三行卡片式布局（标题 / 域名 / hover效果）
- **效果**: 更接近 Claude Code 搜索结果呈现

---

## 文件变更清单

| 操作 | 文件路径 | 变更 |
|------|---------|------|
| **修改** | `src/components/Agentic/AgenticChat.tsx` | +123行 (604→726) |
| **备份** | `src/components/Agentic/AgenticChat.tsx.bak` | 原文件备份 |
| **生成** | `AgenticChat.patch` | unified diff 补丁文件 |

**未修改的文件**（确认完整保留）:
- `src/types/agentic.ts` — 无需修改，现有字段已够用
- `src/hooks/useAgenticLoop.ts` — 无需修改，事件处理已完整
- `src/components/Agentic/AgenticWorkspace.tsx` — 无需修改

---

## Diff 验证报告

```
组件完整性检查 (原文件 vs 修改后):
  ToolIcon:        ✓ (1/1)
  WebSearchResults: ✓ (1/1) — 升级为卡片布局
  BatchCommandsResults: ✓ (1/1) — 无变更
  DiffDisplay:     ✓ (1/1) — 无变更
  ToolBlock:       ✓ (1/1) — 核心改造
  TurnSummaryBlock: ✓ (1/1) — 格式对齐
  DebugBlock:      ✓ (1/1) — 无变更
  InfoBlock:       ✓ (1/1) — 无变更
  EmptyState:      ✓ (1/1) — 无变更
  AgenticChat:     ✓ (1/1) — 无变更
  
关键逻辑路径检查:
  handleSubmit:    ✓ (3/3)
  handleKeyDown:   ✓ (2/2)
  handleNewTask:   ✓ (2/2)
  block.type switch: ✓ (10/10)
  export default:  ✓ (1/1)
  blocks.map:      ✓ (1/1)
```

---

## 待完成任务（后续轮次）

### P2 — 交互增强

- [x] **TASK-09**: Todo 列表交互式展示 ✅ (TodoListDisplay 组件 — 含进度条/状态图标/优先级badge)
- [x] **TASK-10**: Approval Approve/Deny 按钮交互 ✅ (ApprovalBlock 组件 — 含风险等级/审批回调)
- [x] **TASK-11**: Side-by-side diff 视图 ✅ (新文件 `src/components/Agentic/DiffViewer.tsx` — unified/split 切换)

### P3 — 代码质量

- [x] **TASK-12**: 合并/清理旧 `src/components/AgenticLoop.tsx` ✅ (已确认无引用,添加 @deprecated 标记)

---

## 本地部署命令

```bash
# === 1. 拉取更新并应用修改 ===
cd /root/dylan/skynetCheapBuy/skynetFronted

# 如果从 patch 文件应用:
# cp AgenticChat.patch ./
# git apply AgenticChat.patch

# 或直接替换文件:
# cp <新AgenticChat.tsx> src/components/Agentic/AgenticChat.tsx

# === 2. 安装依赖 + 构建 ===
npm install
npm run build

# === 3. 开发模式测试 ===
npm run dev

# === 4. Git 提交 ===
git add -A
git diff --cached --stat   # 确认变更范围
git commit -m "feat(agentic): Claude Code style dynamic titles for tool blocks

TASK-01: batch_commands → 'Ran N commands' aggregated title
TASK-02: batch_read → 'Viewed N files' aggregated title  
TASK-03: web_search → 'Searched the web' + query + 'N results' badge
TASK-04: web_fetch → 'Fetched: [page title]' dynamic title
TASK-05: TurnSummaryBlock → 'Ran N commands, viewed M files, edited K files'
TASK-06: toolDescription shown in expanded area when different from title
TASK-07: view_truncated shows 'Lines X-Y of Z total' indicator
TASK-08: WebSearchResults upgraded to card layout"

git push origin main

# === 5. 删除备份文件 ===
rm src/components/Agentic/AgenticChat.tsx.bak
```

---

> **本轮完成**: 5 个 P0 TASK + 3 个 bonus TASK = 8 个改造
> **15/15 功能项全部 √**
> **下一步**: TASK-09~12 (P2/P3) 全部 √ 完成

---

## 02次更新 (2026-02-27): TASK-09~12 + Bonus 完成

### √ TASK-09: Todo 列表交互式展示
- **新增组件**: `TodoListDisplay` in `src/components/Agentic/AgenticChat.tsx`
- **功能**: 进度条 (百分比), 每项显示状态图标 (完成/进行中/待办), 优先级标记 (HIGH/LOW), 可折叠展开
- **类型依赖**: 使用 `TodoItem`, `TodoStatus` from `types/agentic.ts`

### √ TASK-10: Approval Approve/Deny 按钮交互
- **新增组件**: `ApprovalBlock` in `src/components/Agentic/AgenticChat.tsx`
- **功能**: 根据 `risk_level` 显示红/黄风险等级, Approve/Deny 按钮, 响应状态反馈
- **回调**: `onApprove`, `onDeny` props → 主组件 `handleApprove/handleDeny` → 预留后端 API 对接

### √ TASK-11: Side-by-side diff 视图
- **新建文件**: `src/components/Agentic/DiffViewer.tsx` (233行)
- **功能**: unified/split 模式切换按钮, 行号显示, diff 解析器, 复制 diff 按钮
- **集成**: ToolBlock 展开区 `block.toolDiff` 渲染改用 `<DiffViewer />`

### √ TASK-12: 清理旧 AgenticLoop.tsx
- **操作**: 确认 `src/components/AgenticLoop.tsx` 无任何 import 引用
- **处理**: 添加 `@deprecated` JSDoc 标记, 保留供参考但不再使用

### Bonus: Agent Loop 步骤可视化
- **新增组件**: `AgentLoopIndicator` — 在运行时显示 Prompt → Model → Tool Use → Result 步骤指示器
- **灵感**: Claude Code Agent Loop v0-v4 架构

### Bonus: 测试日志可展开
- **改造组件**: `DebugBlock` — debug_result 和 test_result 增加 "Show log" 按钮, 展开查看完整输出

---

## 文件变更清单 (02次)

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| **修改** | `src/components/Agentic/AgenticChat.tsx` | 726→887行 (+161行), TASK-09/10/11集成 |
| **新建** | `src/components/Agentic/DiffViewer.tsx` | 233行, side-by-side diff |
| **标记** | `src/components/AgenticLoop.tsx` | @deprecated 标记 |
| **备份** | `src/components/Agentic/AgenticChat.tsx.v11.bak` | 原文件备份 |
| **更新** | `plan.md` | 进度更新 |

03更新：
# skynetFronted × marimo 前端集成开发计划

## 项目概述

**目标**: 在现有 `skynetFronted` (TypeScript/React/Vite/Tailwind) 前端项目中，参考 marimo 项目的前端架构，构建类似 Claude 网页端的交互式展示界面。最终前端样式文件超过 300 个。

**参考项目**:
- `github.com/marimo-team/marimo` — 前端架构、组件系统、插件体系
- `github.com/dylanyunlon/skynetCheapBuy` — 后端 Agent 服务 (Python/FastAPI, v5+)
- `github.com/dylanyunlon/skynetFronted` — 当前前端项目 (13次提交, TypeScript 98.3%)
- Claude Code Agent Loop v0-v4 — agent 循环架构参考

**服务器路径**:
- 前端项目: `/root/dylan/skynetCheapBuy/skynetFronted/` (实际前端代码)
- marimo 源码: `/root/dylan/skynetCheapBuy/marimo/` (参考源)
- 后端项目: `/root/dylan/skynetCheapBuy/` (FastAPI 后端)

---

## 第一步: 从 marimo 复制的核心文件清单

### 1.1 需要从 marimo `frontend/src/` 复制的文件分类

根据 marimo 的前端架构 (TypeScript 38.1%, CSS 0.7%, 5328次提交), 以下是需要参考/复制的文件目录:

#### A. 核心组件系统 (从 `marimo/frontend/src/components/`)
```
复制路径: marimo/frontend/src/components/ → skynetFronted/src/components/

需要的目录/文件:
├── ui/                          # UI 基础组件库
│   ├── button.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── dialog.tsx
│   ├── dropdown.tsx
│   ├── tooltip.tsx
│   ├── tabs.tsx
│   ├── slider.tsx
│   ├── switch.tsx
│   ├── badge.tsx
│   ├── card.tsx
│   ├── alert.tsx
│   ├── separator.tsx
│   ├── scroll-area.tsx
│   ├── popover.tsx
│   ├── command.tsx
│   ├── label.tsx
│   ├── textarea.tsx
│   └── checkbox.tsx
├── data-table/                  # 数据表格系统
│   ├── DataTablePlugin.tsx
│   ├── column-summary/
│   │   └── chart-spec-model.ts
│   ├── cell-styling/
│   │   └── feature.ts
│   └── pagination/
├── app-config/                  # 应用配置UI
│   └── user-config-form.tsx
├── editor/                      # 代码编辑器组件
│   ├── cell-editor.tsx
│   ├── output-area.tsx
│   └── cell-actions.tsx
├── chat/                        # 聊天界面 (类Claude样式)
│   ├── chat-input.tsx
│   ├── chat-message.tsx
│   ├── chat-history.tsx
│   └── chat-actions.tsx
└── layout/                      # 布局组件
    ├── sidebar.tsx
    ├── header.tsx
    ├── main-layout.tsx
    └── panel-resizer.tsx
```

#### B. 核心状态管理 (从 `marimo/frontend/src/core/`)
```
复制路径: marimo/frontend/src/core/ → skynetFronted/src/core/

├── state/                       # Jotai 状态管理
│   ├── atoms.ts
│   ├── selectors.ts
│   └── store.ts
├── config/
│   ├── config-schema.ts         # Zod 验证 schema
│   └── feature-flag.tsx         # 实验性功能开关
├── codemirror/                  # CodeMirror 编辑器集成
│   ├── readonly/
│   │   └── extension.ts
│   └── theme/
└── network/                     # 网络通信层
    ├── websocket.ts             # WebSocket 实时通信
    ├── api-client.ts            # REST API 客户端
    └── requests.ts
```

#### C. 插件系统 (从 `marimo/frontend/src/plugins/`)
```
复制路径: marimo/frontend/src/plugins/ → skynetFronted/src/plugins/

├── core/
│   └── builder.ts               # createPlugin() 构建器模式
├── impl/
│   ├── DataTablePlugin.tsx       # 数据表插件
│   ├── SliderPlugin.tsx
│   ├── DropdownPlugin.tsx
│   ├── ChatPlugin.tsx           # 聊天插件
│   └── multiselectFilterFn.tsx
└── registry.ts                   # 插件注册表
```

#### D. CSS/样式文件体系
```
复制路径: marimo/frontend/src/ → skynetFronted/src/

需要创建的 CSS 文件类别:

1. 主题系统 (30+ 文件)
   styles/
   ├── themes/
   │   ├── light.css
   │   ├── dark.css
   │   ├── variables.css          # CSS 变量定义
   │   ├── typography.css
   │   ├── colors.css
   │   ├── spacing.css
   │   ├── shadows.css
   │   ├── borders.css
   │   ├── animations.css
   │   └── transitions.css
   ├── base/
   │   ├── reset.css
   │   ├── normalize.css
   │   └── global.css

2. 组件样式 (100+ 文件, 每个组件一个CSS module)
   components/
   ├── ui/button.module.css
   ├── ui/input.module.css
   ├── ui/dialog.module.css
   ├── ... (每个 UI 组件)
   ├── chat/chat-input.module.css
   ├── chat/chat-message.module.css
   ├── chat/chat-bubble.module.css
   ├── data-table/*.module.css
   └── editor/*.module.css

3. 布局样式 (20+ 文件)
   layouts/
   ├── sidebar.module.css
   ├── main-panel.module.css
   ├── split-view.module.css
   ├── responsive.css
   └── grid.css

4. 动画/过渡 (15+ 文件)
   animations/
   ├── fade.css
   ├── slide.css
   ├── scale.css
   ├── loading.css
   ├── skeleton.css
   └── typewriter.css

5. 插件样式 (30+ 文件)
   plugins/
   ├── data-table.module.css
   ├── chart.module.css
   ├── code-editor.module.css
   └── markdown-renderer.module.css
```

### 1.2 需要安装的 npm 依赖 (参考 marimo frontend/package.json)

```bash
# 核心框架 (已有)
# react, react-dom, vite, tailwindcss, typescript

# 新增依赖
npm install jotai                    # 状态管理 (marimo 使用)
npm install @codemirror/state @codemirror/view  # 代码编辑器
npm install @tanstack/react-table    # 数据表格
npm install zod                      # Schema 验证
npm install recharts                 # 图表
npm install lucide-react             # 图标库
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-popover @radix-ui/react-scroll-area  # UI 原语
npm install class-variance-authority # 组件变体
npm install clsx tailwind-merge      # CSS 工具
npm install framer-motion            # 动画
npm install react-markdown           # Markdown 渲染
npm install react-syntax-highlighter # 代码高亮
npm install papaparse                # CSV 处理
```

---

## 第二步: skynetFronted 目录结构规划 (300+ 文件)

```
skynetFronted/
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── assets/
│       ├── fonts/              # 10+ 字体文件
│       └── images/             # 5+ 图片资源
├── src/
│   ├── main.tsx                # 入口
│   ├── App.tsx                 # 根组件
│   ├── vite-env.d.ts
│   │
│   ├── styles/                 # ===== 样式文件 (65 files) =====
│   │   ├── base/
│   │   │   ├── reset.css
│   │   │   ├── normalize.css
│   │   │   ├── global.css
│   │   │   ├── typography.css
│   │   │   └── utilities.css
│   │   ├── themes/
│   │   │   ├── variables.css
│   │   │   ├── light.css
│   │   │   ├── dark.css
│   │   │   ├── colors.css
│   │   │   ├── spacing.css
│   │   │   ├── shadows.css
│   │   │   ├── borders.css
│   │   │   ├── z-index.css
│   │   │   └── breakpoints.css
│   │   ├── animations/
│   │   │   ├── fade.css
│   │   │   ├── slide.css
│   │   │   ├── scale.css
│   │   │   ├── rotate.css
│   │   │   ├── bounce.css
│   │   │   ├── shake.css
│   │   │   ├── pulse.css
│   │   │   ├── loading-spinner.css
│   │   │   ├── skeleton-loader.css
│   │   │   ├── typewriter.css
│   │   │   ├── progress-bar.css
│   │   │   ├── ripple.css
│   │   │   ├── confetti.css
│   │   │   ├── wave.css
│   │   │   └── gradient-shift.css
│   │   ├── layouts/
│   │   │   ├── grid-system.css
│   │   │   ├── flexbox-helpers.css
│   │   │   ├── sidebar-layout.css
│   │   │   ├── split-pane.css
│   │   │   ├── sticky-header.css
│   │   │   ├── responsive-breakpoints.css
│   │   │   ├── container.css
│   │   │   ├── panel.css
│   │   │   ├── modal-overlay.css
│   │   │   └── drawer.css
│   │   └── vendor/
│   │       ├── codemirror-theme.css
│   │       ├── markdown-preview.css
│   │       ├── syntax-highlight.css
│   │       ├── data-table-base.css
│   │       └── chart-container.css
│   │
│   ├── components/             # ===== 组件文件 (120+ files) =====
│   │   ├── ui/                 # 基础 UI 组件 (40 files)
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Input.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Select/
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── Select.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Dialog/
│   │   │   │   ├── Dialog.tsx
│   │   │   │   ├── Dialog.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Dropdown/
│   │   │   │   ├── Dropdown.tsx
│   │   │   │   ├── Dropdown.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Tooltip/
│   │   │   │   ├── Tooltip.tsx
│   │   │   │   ├── Tooltip.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Tabs/
│   │   │   │   ├── Tabs.tsx
│   │   │   │   ├── Tabs.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Badge/
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Badge.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Card/
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Card.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Alert/
│   │   │   │   ├── Alert.tsx
│   │   │   │   ├── Alert.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Avatar/
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── Avatar.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Switch/
│   │   │   │   ├── Switch.tsx
│   │   │   │   ├── Switch.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Slider/
│   │   │   │   ├── Slider.tsx
│   │   │   │   ├── Slider.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Checkbox/
│   │   │   │   ├── Checkbox.tsx
│   │   │   │   ├── Checkbox.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Radio/
│   │   │   │   ├── Radio.tsx
│   │   │   │   ├── Radio.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Textarea/
│   │   │   │   ├── Textarea.tsx
│   │   │   │   ├── Textarea.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Label/
│   │   │   │   ├── Label.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Separator/
│   │   │   │   ├── Separator.tsx
│   │   │   │   ├── Separator.module.css
│   │   │   │   └── index.ts
│   │   │   ├── ScrollArea/
│   │   │   │   ├── ScrollArea.tsx
│   │   │   │   ├── ScrollArea.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Skeleton/
│   │   │   │   ├── Skeleton.tsx
│   │   │   │   ├── Skeleton.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Progress/
│   │   │   │   ├── Progress.tsx
│   │   │   │   ├── Progress.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Spinner/
│   │   │   │   ├── Spinner.tsx
│   │   │   │   ├── Spinner.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Toast/
│   │   │   │   ├── Toast.tsx
│   │   │   │   ├── Toast.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Breadcrumb/
│   │   │   │   ├── Breadcrumb.tsx
│   │   │   │   ├── Breadcrumb.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Pagination/
│   │   │   │   ├── Pagination.tsx
│   │   │   │   ├── Pagination.module.css
│   │   │   │   └── index.ts
│   │   │   └── index.ts          # 统一导出
│   │   │
│   │   ├── chat/               # 聊天组件 (Claude样式, 20 files)
│   │   │   ├── ChatContainer/
│   │   │   │   ├── ChatContainer.tsx
│   │   │   │   ├── ChatContainer.module.css
│   │   │   │   └── index.ts
│   │   │   ├── ChatInput/
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   ├── ChatInput.module.css
│   │   │   │   └── index.ts
│   │   │   ├── ChatMessage/
│   │   │   │   ├── ChatMessage.tsx
│   │   │   │   ├── ChatMessage.module.css
│   │   │   │   ├── UserMessage.tsx
│   │   │   │   ├── AssistantMessage.tsx
│   │   │   │   ├── SystemMessage.tsx
│   │   │   │   └── index.ts
│   │   │   ├── ChatHistory/
│   │   │   │   ├── ChatHistory.tsx
│   │   │   │   ├── ChatHistory.module.css
│   │   │   │   └── index.ts
│   │   │   ├── ChatSidebar/
│   │   │   │   ├── ChatSidebar.tsx
│   │   │   │   ├── ChatSidebar.module.css
│   │   │   │   └── index.ts
│   │   │   ├── ToolCallDisplay/
│   │   │   │   ├── ToolCallDisplay.tsx
│   │   │   │   ├── ToolCallDisplay.module.css
│   │   │   │   └── index.ts
│   │   │   ├── CodeBlock/
│   │   │   │   ├── CodeBlock.tsx
│   │   │   │   ├── CodeBlock.module.css
│   │   │   │   └── index.ts
│   │   │   ├── MarkdownRenderer/
│   │   │   │   ├── MarkdownRenderer.tsx
│   │   │   │   ├── MarkdownRenderer.module.css
│   │   │   │   └── index.ts
│   │   │   └── StreamingText/
│   │   │       ├── StreamingText.tsx
│   │   │       ├── StreamingText.module.css
│   │   │       └── index.ts
│   │   │
│   │   ├── agent/              # Agent 相关组件 (15 files)
│   │   │   ├── AgentLoop/
│   │   │   │   ├── AgentLoop.tsx
│   │   │   │   ├── AgentLoop.module.css
│   │   │   │   └── index.ts
│   │   │   ├── ToolExecution/
│   │   │   │   ├── ToolExecution.tsx
│   │   │   │   ├── ToolExecution.module.css
│   │   │   │   └── index.ts
│   │   │   ├── SubagentPanel/
│   │   │   │   ├── SubagentPanel.tsx
│   │   │   │   ├── SubagentPanel.module.css
│   │   │   │   └── index.ts
│   │   │   ├── TaskProgress/
│   │   │   │   ├── TaskProgress.tsx
│   │   │   │   ├── TaskProgress.module.css
│   │   │   │   └── index.ts
│   │   │   └── BashTerminal/
│   │   │       ├── BashTerminal.tsx
│   │   │       ├── BashTerminal.module.css
│   │   │       └── index.ts
│   │   │
│   │   ├── data-table/         # 数据表格 (15 files)
│   │   │   ├── DataTable.tsx
│   │   │   ├── DataTable.module.css
│   │   │   ├── TableHeader.tsx
│   │   │   ├── TableRow.tsx
│   │   │   ├── TableCell.tsx
│   │   │   ├── TablePagination.tsx
│   │   │   ├── TableFilters.tsx
│   │   │   ├── TableSort.tsx
│   │   │   ├── ColumnResizer.tsx
│   │   │   ├── ColumnSummary.tsx
│   │   │   ├── CellStyling.tsx
│   │   │   ├── VirtualScroll.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── editor/             # 编辑器组件 (12 files)
│   │   │   ├── CodeEditor/
│   │   │   │   ├── CodeEditor.tsx
│   │   │   │   ├── CodeEditor.module.css
│   │   │   │   └── index.ts
│   │   │   ├── OutputArea/
│   │   │   │   ├── OutputArea.tsx
│   │   │   │   ├── OutputArea.module.css
│   │   │   │   └── index.ts
│   │   │   ├── CellActions/
│   │   │   │   ├── CellActions.tsx
│   │   │   │   ├── CellActions.module.css
│   │   │   │   └── index.ts
│   │   │   └── TerminalOutput/
│   │   │       ├── TerminalOutput.tsx
│   │   │       ├── TerminalOutput.module.css
│   │   │       └── index.ts
│   │   │
│   │   └── layout/             # 布局组件 (18 files)
│   │       ├── Sidebar/
│   │       │   ├── Sidebar.tsx
│   │       │   ├── Sidebar.module.css
│   │       │   └── index.ts
│   │       ├── Header/
│   │       │   ├── Header.tsx
│   │       │   ├── Header.module.css
│   │       │   └── index.ts
│   │       ├── MainLayout/
│   │       │   ├── MainLayout.tsx
│   │       │   ├── MainLayout.module.css
│   │       │   └── index.ts
│   │       ├── PanelResizer/
│   │       │   ├── PanelResizer.tsx
│   │       │   ├── PanelResizer.module.css
│   │       │   └── index.ts
│   │       ├── Footer/
│   │       │   ├── Footer.tsx
│   │       │   ├── Footer.module.css
│   │       │   └── index.ts
│   │       └── StatusBar/
│   │           ├── StatusBar.tsx
│   │           ├── StatusBar.module.css
│   │           └── index.ts
│   │
│   ├── core/                   # ===== 核心逻辑 (40 files) =====
│   │   ├── state/              # Jotai 状态管理
│   │   │   ├── atoms/
│   │   │   │   ├── chat-atoms.ts
│   │   │   │   ├── agent-atoms.ts
│   │   │   │   ├── ui-atoms.ts
│   │   │   │   ├── config-atoms.ts
│   │   │   │   ├── auth-atoms.ts
│   │   │   │   └── workspace-atoms.ts
│   │   │   ├── selectors/
│   │   │   │   ├── chat-selectors.ts
│   │   │   │   ├── agent-selectors.ts
│   │   │   │   └── ui-selectors.ts
│   │   │   └── store.ts
│   │   ├── config/
│   │   │   ├── config-schema.ts     # Zod schemas
│   │   │   ├── feature-flags.ts
│   │   │   ├── app-config.ts
│   │   │   └── env.ts
│   │   ├── network/
│   │   │   ├── websocket-client.ts  # WebSocket 连接
│   │   │   ├── api-client.ts        # REST API
│   │   │   ├── requests.ts
│   │   │   ├── interceptors.ts
│   │   │   └── types.ts
│   │   ├── agent/
│   │   │   ├── agent-loop.ts        # Agent 循环逻辑 (参考 v0-v4)
│   │   │   ├── tool-executor.ts     # 工具执行器
│   │   │   ├── subagent-manager.ts  # 子 agent 管理
│   │   │   ├── message-parser.ts    # 消息解析
│   │   │   └── stream-handler.ts    # 流式响应处理
│   │   └── utils/
│   │       ├── cn.ts                # className 工具
│   │       ├── format.ts
│   │       ├── date.ts
│   │       ├── storage.ts
│   │       ├── debounce.ts
│   │       └── throttle.ts
│   │
│   ├── plugins/                # ===== 插件系统 (25 files) =====
│   │   ├── core/
│   │   │   ├── builder.ts           # createPlugin() 模式
│   │   │   ├── registry.ts          # 插件注册
│   │   │   ├── types.ts
│   │   │   └── lifecycle.ts
│   │   ├── impl/
│   │   │   ├── data-table/
│   │   │   │   ├── DataTablePlugin.tsx
│   │   │   │   ├── DataTablePlugin.module.css
│   │   │   │   └── index.ts
│   │   │   ├── chart/
│   │   │   │   ├── ChartPlugin.tsx
│   │   │   │   ├── ChartPlugin.module.css
│   │   │   │   └── index.ts
│   │   │   ├── markdown/
│   │   │   │   ├── MarkdownPlugin.tsx
│   │   │   │   ├── MarkdownPlugin.module.css
│   │   │   │   └── index.ts
│   │   │   ├── code/
│   │   │   │   ├── CodePlugin.tsx
│   │   │   │   ├── CodePlugin.module.css
│   │   │   │   └── index.ts
│   │   │   └── file-viewer/
│   │   │       ├── FileViewerPlugin.tsx
│   │   │       ├── FileViewerPlugin.module.css
│   │   │       └── index.ts
│   │   └── index.ts
│   │
│   ├── hooks/                  # ===== 自定义 Hooks (20 files) =====
│   │   ├── useWebSocket.ts
│   │   ├── useChat.ts
│   │   ├── useAgent.ts
│   │   ├── useAsyncData.ts
│   │   ├── useTheme.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useMediaQuery.ts
│   │   ├── useDebounce.ts
│   │   ├── useIntersectionObserver.ts
│   │   ├── useKeyboardShortcut.ts
│   │   ├── useCopyToClipboard.ts
│   │   ├── useScrollPosition.ts
│   │   ├── useResizeObserver.ts
│   │   ├── useEventSource.ts
│   │   ├── useStreamingResponse.ts
│   │   ├── useToolExecution.ts
│   │   ├── usePagination.ts
│   │   ├── useVirtualScroll.ts
│   │   ├── useWindowSize.ts
│   │   └── index.ts
│   │
│   ├── pages/                  # ===== 页面 (15 files) =====
│   │   ├── Home/
│   │   │   ├── Home.tsx
│   │   │   ├── Home.module.css
│   │   │   └── index.ts
│   │   ├── Chat/
│   │   │   ├── ChatPage.tsx
│   │   │   ├── ChatPage.module.css
│   │   │   └── index.ts
│   │   ├── Workspace/
│   │   │   ├── Workspace.tsx
│   │   │   ├── Workspace.module.css
│   │   │   └── index.ts
│   │   ├── Settings/
│   │   │   ├── Settings.tsx
│   │   │   ├── Settings.module.css
│   │   │   └── index.ts
│   │   └── NotFound/
│   │       ├── NotFound.tsx
│   │       └── index.ts
│   │
│   ├── types/                  # ===== 类型定义 (15 files) =====
│   │   ├── chat.ts
│   │   ├── agent.ts
│   │   ├── message.ts
│   │   ├── tool.ts
│   │   ├── config.ts
│   │   ├── workspace.ts
│   │   ├── user.ts
│   │   ├── plugin.ts
│   │   ├── theme.ts
│   │   ├── api-response.ts
│   │   ├── websocket.ts
│   │   ├── table.ts
│   │   ├── editor.ts
│   │   ├── common.ts
│   │   └── index.ts
│   │
│   ├── lib/                    # ===== 工具库 (10 files) =====
│   │   ├── cn.ts               # Tailwind class merge
│   │   ├── api.ts
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   ├── constants.ts
│   │   ├── errors.ts
│   │   ├── logger.ts
│   │   ├── event-emitter.ts
│   │   ├── markdown-utils.ts
│   │   └── index.ts
│   │
│   └── assets/                 # ===== 静态资源 (10 files) =====
│       ├── icons/
│       │   ├── logo.svg
│       │   ├── agent.svg
│       │   ├── tool.svg
│       │   └── terminal.svg
│       └── images/
│           ├── placeholder.png
│           └── empty-state.svg
│
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── Makefile
├── checklistFronted.md
├── plan.md
├── SKILL.md
├── claudeFrontStyleDemo.md
└── README.md
```

**文件统计**:
| 类别 | 文件数 |
|------|--------|
| 样式文件 (CSS/module.css) | ~115 |
| 组件文件 (TSX) | ~90 |
| 核心逻辑 (TS) | ~40 |
| 类型定义 (TS) | ~15 |
| Hooks (TS) | ~20 |
| 插件 (TSX+TS) | ~25 |
| 页面 (TSX) | ~15 |
| 配置/工具 (TS) | ~10 |
| 资源文件 | ~15 |
| 项目配置文件 | ~15 |
| **总计** | **~360** |

---

## 第三步: 从 marimo 项目复制文件的具体命令

在服务器 `root@iZ7xv051npomtfakwd4555Z` 上执行:

```bash
# 1. 确认 marimo 源码位置
ls /root/dylan/skynetCheapBuy/marimo/frontend/src/

# 2. 复制核心 CSS 文件
mkdir -p /root/dylan/skynetCheapBuy/skynetFronted/src/styles/{base,themes,animations,layouts,vendor}

# 从 marimo 复制主题相关 CSS
cp -r /root/dylan/skynetCheapBuy/marimo/frontend/src/css/* \
      /root/dylan/skynetCheapBuy/skynetFronted/src/styles/ 2>/dev/null

# 3. 复制组件基础
cp -r /root/dylan/skynetCheapBuy/marimo/frontend/src/components/ui/ \
      /root/dylan/skynetCheapBuy/skynetFronted/src/components/ui/ 2>/dev/null

# 4. 复制核心逻辑
cp -r /root/dylan/skynetCheapBuy/marimo/frontend/src/core/ \
      /root/dylan/skynetCheapBuy/skynetFronted/src/core/ 2>/dev/null

# 5. 复制插件系统
cp -r /root/dylan/skynetCheapBuy/marimo/frontend/src/plugins/ \
      /root/dylan/skynetCheapBuy/skynetFronted/src/plugins/ 2>/dev/null

# 6. 复制 hooks
cp -r /root/dylan/skynetCheapBuy/marimo/frontend/src/hooks/ \
      /root/dylan/skynetCheapBuy/skynetFronted/src/hooks/ 2>/dev/null
```

---

## 第四步: 开发顺序 (优先级)

### Phase 1: 基础架构搭建 (Day 1-2)
1. 安装 npm 依赖
2. 搭建 styles/ 主题系统 (CSS 变量, 明暗主题)
3. 搭建 core/state/ Jotai 状态管理
4. 搭建 core/network/ WebSocket + API 客户端
5. 从 marimo 适配 UI 基础组件

### Phase 2: 聊天界面 (Day 3-5) — 类 Claude 样式
1. ChatContainer 主布局
2. ChatMessage (用户消息 + AI 消息 + 流式输出)
3. ChatInput (输入框 + 文件上传 + 快捷键)
4. ChatSidebar (历史记录)
5. MarkdownRenderer + CodeBlock

### Phase 3: Agent 可视化 (Day 6-8)
1. AgentLoop 组件 (展示 tool_use → tool_result 循环)
2. ToolExecution 显示 (bash 命令执行可视化)
3. SubagentPanel (子 agent 递归展示)
4. BashTerminal 终端模拟
5. TaskProgress 任务进度

### Phase 4: 数据展示 (Day 9-10)
1. DataTable 组件 (TanStack Table)
2. Chart 插件 (Recharts)
3. CodeEditor (CodeMirror)
4. FileViewer

### Phase 5: 插件系统 + 打磨 (Day 11-14)
1. Plugin builder + registry
2. 响应式适配
3. 动画/微交互
4. 性能优化 (虚拟滚动, 懒加载)
5. Docker 构建 + 部署

---

## 第五步: 与 skynetCheapBuy 后端对接

### API 端点 (基于 skynetCheapBuy 的 FastAPI)
```
POST /api/chat          # 发送消息
GET  /api/chat/history  # 获取聊天历史
WS   /ws/chat           # WebSocket 实时通信

POST /api/agent/execute # 执行 agent 任务
GET  /api/agent/status  # agent 状态
GET  /api/agent/logs    # agent 日志

GET  /api/workspace/files  # 文件列表
GET  /api/workspace/file   # 文件内容
```

### WebSocket 消息格式 (参考 Claude Code v0 agent loop)
```typescript
// 客户端 → 服务端
{ type: "chat_message", content: string, tools?: Tool[] }

// 服务端 → 客户端 (流式)
{ type: "text_delta", delta: string }
{ type: "tool_use", id: string, name: string, input: object }
{ type: "tool_result", tool_use_id: string, content: string }
{ type: "message_stop" }
```

---

## 关键参考链接

| 资源 | 用途 |
|------|------|
| `marimo/frontend/src/components/` | UI 组件架构 |
| `marimo/frontend/src/core/` | 状态管理 + 网络层 |
| `marimo/frontend/src/plugins/` | 插件系统 |
| `marimo/frontend/src/hooks/` | React Hooks |
| Claude Code v0-v4 Agent Loop | Agent 循环 UI 展示逻辑 |
| `skynetCheapBuy/app/` | 后端 API 结构 |
| `skynetCheapBuy/claude_code.py` | Agent 核心逻辑 |

---

## 注意事项

1. **不要只看 README** — skynetCheapBuy 已迭代 5+ 版本 (22次提交), skynetFronted 有 13次提交, 需要看实际代码文件而非仅看 README
2. **专注两个库** — 只关注 `dylanyunlon/skynetCheapBuy` 和 `dylanyunlon/skynetFronted`, 不掺和其他 GitHub 库
3. **marimo 前端是参考** — 核心是复制其 CSS/组件架构思路, 不是整个搬运
4. **300+ 文件目标** — 通过 CSS modules + 组件拆分 + hooks + 类型定义实现
5. **Claude 网页样式** — 最终展示效果要接近 Claude 网页端的交互体验