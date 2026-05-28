# Web Layer - AI Knowledge Q&A Demo

本仓库用于维护 AI 智能问答系统的 **模块 1：用户层**。

Q1 阶段，本模块的目标是提供一个可演示、可联调、可验收的 Web 聊天页面，打通：

```
用户输入问题 -> 调用 Agent 接口 -> 展示答案 -> 展示引用来源 -> 异常状态兜底
```

本模块不负责检索、Prompt 组装、LLM 调用、文档解析和向量存储，这些能力由 Agent 层、工具集、数据处理管线和数据持久化层完成。

## 1. 模块定位

用户层负责 AI 问答系统的 Web 交互入口，主要职责包括：

- 提供 Web 聊天页面；
- 支持用户输入问题；
- 调用 Agent 层问答接口；
- 支持答案流式展示；
- 展示引用来源；
- 处理无相关文档、检索异常、模型异常、网络异常等状态；
- 记录或展示 `trace_id`，方便联调排查；
- 提供 Mock 数据，支持前端独立开发和演示。

## 2. Q1 核心链路

Q1 阶段只验证一轮对话基础功能：

```
用户输入问题
  ↓
前端校验输入
  ↓
调用 Agent /api/chat
  ↓
接收 answer 或 message / citations / status / trace_id
  ↓
展示答案和引用
  ↓
异常时展示兜底提示
```

如 Agent 层暂不支持流式输出，Web 层至少需要支持完整答案展示；如 Agent 层支持 SSE 或 fetch stream，Web 层需要支持 token 增量渲染。

## 3. Q1 必须完成

- 页面能够正常加载；
- 用户能够输入并发送问题；
- 支持 Enter 发送、Shift + Enter 换行；
- 空输入和纯空格输入不会发送；
- 前端能够调用 Agent 接口或 Mock 接口；
- Agent 返回答案后，页面能够展示；
- 支持流式输出，或至少支持完整答案展示；
- 能展示引用来源；
- 能处理无相关文档情况；
- 能处理检索异常；
- 能处理模型异常；
- 能处理网络异常；
- 异常后页面不白屏、不死锁；
- 每次响应能记录或展示 `trace_id`；
- 支持复制回答；
- 支持清空当前对话；
- 页面整体能够支撑七月 Demo 展示。

## 4. 推荐技术方案

- 前端：Vue
- 开发语言：TypeScript
- 接口调用：HTTP / SSE / fetch stream
- Mock：本地 JSON 或 Mock Client
- 可选 BFF：Flask，用于路由转发、Mock 切换和接口适配

Q1 阶段不强制实现完整后端 BFF。如果 Agent 接口可以直接调用，前端可以直接对接 Agent。

## 5. 目录结构

```
web-layer/
  README.md
  .gitignore

  docs/
    模块1_用户层详细设计.md
    接口约定.md
    任务表.md
    协作规范.md
    Mock数据说明.md
    联调测试用例.md
    Demo验收清单.md

  mock/
    chat-success.json
    chat-stream-success.json
    chat-no-relevant-context.json
    chat-retrieval-error.json
    chat-llm-error.json
    chat-invalid-query.json
    chat-citation-without-url.json

  src/
    api/
      chatClient.ts
      streamParser.ts

    types/
      chat.ts

    components/
      ChatPage.vue
      ChatInput.vue
      MessageList.vue
      MessageBubble.vue
      CitationList.vue
      CitationCard.vue
      ErrorMessage.vue
      LoadingIndicator.vue

    mock/
      mockChatClient.ts

    utils/
      formatCitation.ts
      statusMapper.ts

  tests/
    manual-test-cases.md
    integration-test-record.md
```

## 6. 接口约定摘要

请求格式：

```
{
  "query": "项目 Q1 阶段需要完成哪些功能？",
  "session_id": "local-session-001",
  "stream": true
}
```

普通响应格式：

```
{
  "trace_id": "trace-001",
  "status": "success",
  "answer": "Q1 阶段需要打通用户提问、检索、生成答案和展示引用的基础链路。",
  "citations": [
    {
      "citation_id": 1,
      "title": "Q1 范围说明",
      "source_url": "https://example.com/doc/1",
      "doc_id": "doc_001",
      "chunk_id": "chunk_001",
      "score": 0.86,
      "snippet": "本次迭代目标：实现一轮对话的基础功能验证..."
    }
  ]
}
```

错误响应约定：

- `success` 状态使用 `answer` 承载答案正文；
- 非 `success` 状态使用 `message` 承载兜底提示，`answer` 可以为空字符串；
- 前端接口层保持 `trace_id`、`session_id` 等 snake_case 字段，前端内部消息模型使用 `traceId`、`createdAt` 等 camelCase 字段，并通过转换函数隔离。

错误响应示例：

```
{
  "trace_id": "trace-retrieval-error-001",
  "status": "retrieval_error",
  "answer": "",
  "message": "检索服务异常，请稍后重试。",
  "citations": []
}
```

状态枚举：

| status | 含义 |
| --- | --- |
| `success` | 正常返回答案 |
| `invalid_query` | 用户问题为空或非法 |
| `no_relevant_context` | 知识库没有足够信息 |
| `retrieval_error` | 检索服务异常 |
| `llm_error` | 模型服务异常 |
| `network_error` | 网络连接异常 |
| `timeout_error` | 请求超时 |
| `stream_error` | 流式响应中断或解析失败 |

## 7. Mock 场景

Mock 数据用于支持前端独立开发和七月 Demo 演示。

| 文件 | 场景 |
| --- | --- |
| `chat-success.json` | 正常回答 + 引用 |
| `chat-stream-success.json` | 流式输出 |
| `chat-no-relevant-context.json` | 无相关文档 |
| `chat-retrieval-error.json` | 检索异常 |
| `chat-llm-error.json` | 模型异常 |
| `chat-invalid-query.json` | 非法输入 |
| `chat-citation-without-url.json` | 引用无链接 |

## 8. 推荐分工

同学 A：页面与交互负责人

- 页面布局；
- 输入框；
- 消息组件；
- loading 状态；
- 错误提示组件；
- 引用卡片 UI；
- 复制回答；
- 清空对话；
- Demo 提示。

同学 B：接口与联调负责人

- Agent API 调用；
- 流式响应读取；
- `status` 状态映射；
- `citations` 数据解析；
- `trace_id` 处理；
- Mock 数据；
- 异常状态处理；
- 与 Agent 层联调。

模块负责人：Web-Agent Contract Owner

额外负责统一维护：

- 请求格式；
- 响应格式；
- 流式事件格式；
- `status` 枚举；
- `citations` 字段；
- `trace_id` 传递；
- 错误响应格式；
- Mock 数据与真实接口一致性。

## 9. Git 协作方式

主分支 `main` 只保存稳定版本。每个同学在自己的功能分支开发。

推荐分支：

```
git checkout -b feature/chat-ui
git checkout -b feature/api-stream
git checkout -b docs/module1-refine
```

开发完成后提交并推送，再通过 Pull Request 合并到 `main`。

## 10. Q1 验收标准

| 测试项 | 预期结果 |
| --- | --- |
| 页面加载 | 页面正常显示聊天区、输入框、发送按钮 |
| 正常问答 | 展示用户问题、助手答案、`trace_id` 和引用来源 |
| 空输入 | 不发送请求，提示请输入问题 |
| Shift + Enter | 换行但不发送 |
| 流式输出 | 答案逐步显示，结束后 loading 消失 |
| 无相关文档 | 展示“当前知识库没有足够信息回答该问题” |
| 检索异常 | 页面提示检索服务异常 |
| 模型异常 | 页面提示模型服务异常 |
| 网络异常 | 页面提示网络连接异常 |
| 引用展示 | 展示引用编号、标题、链接或 `doc_id` |
| 引用无链接 | 不生成无效链接，展示本地文档信息 |
| 清空对话 | 聊天区恢复初始状态 |
| 复制回答 | 成功复制答案正文 |

## 11. 当前阶段优先级

P0：

- 页面基础结构；
- 输入框发送；
- Agent API 调用；
- Mock 数据；
- 答案展示；
- 引用来源展示；
- 异常状态处理。

P1：

- 流式输出；
- `trace_id` 展示；
- 复制回答；
- 清空对话；
- 联调测试记录。

P2：

- 停止生成；
- 重新生成；
- 示例问题；
- 更完整的会话历史；
- 深色/浅色主题。
