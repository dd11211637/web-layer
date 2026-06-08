# Web 层功能说明

本文档说明 Q1 阶段 Web 层需要实现的功能范围。Web 层对应系统中的“用户层”，主要负责提供聊天页面，让用户可以输入问题、查看回答、查看引用来源，并在异常情况下得到明确提示。

## 一、模块目标

Web 层需要打通以下用户侧链路：

```text
用户输入问题
-> 前端校验输入
-> 调用 Agent 问答接口或 Mock Client
-> 展示回答生成过程
-> 展示最终答案
-> 展示引用来源
-> 异常状态兜底提示
```

Q1 阶段不要求实现登录、权限控制、多轮会话历史、文档解析、检索算法、Prompt 组装和 LLM 调用。

## 二、必须实现功能

### 1. 页面基础展示

功能说明：

- 提供一个 Web 聊天页面。
- 页面包含标题区、消息展示区、输入区和发送按钮。
- 页面打开后不能白屏，布局需要清晰稳定。

验收标准：

- 浏览器能正常打开页面。
- 聊天区、输入框、发送按钮正常显示。
- 长回答不会撑坏页面布局。

负责人：

- djx

### 2. 用户输入与发送

功能说明：

- 用户可以输入自然语言问题。
- 支持中文和英文输入。
- 支持 Enter 发送。
- 支持 Shift+Enter 换行。
- 空字符串和纯空格不能发送。
- 发送后展示用户消息。

验收标准：

- 输入有效问题后能触发发送。
- 空输入不会触发请求。
- Shift+Enter 只换行，不发送。
- 请求中避免重复发送。

负责人：

- djx

### 3. 消息展示

功能说明：

- 区分用户消息和助手回答。
- 展示助手回答内容。
- 展示回答生成中的 loading 状态。
- 支持清空当前对话。
- 支持复制助手回答。

验收标准：

- 用户问题和助手回答视觉上可区分。
- 请求中显示“正在生成回答”。
- 回答完成后 loading 消失。
- 点击清空后消息列表恢复初始状态。
- 点击复制后可复制助手回答正文。

负责人：

- djx

### 4. Agent 接口调用

功能说明：

- 封装 `/api/chat` 调用逻辑。
- 请求体至少包含 `query` 字段。
- 可选携带 `session_id` 和 `stream`。
- 支持普通 JSON 响应。
- 支持后续切换真实 Agent 服务地址。

验收标准：

- 能向 Agent 或 Mock Client 发送用户问题。
- 能接收 `answer`、`citations`、`status`、`trace_id`。
- 网络失败时页面不崩溃。

负责人：

- xdj

### 5. 流式输出

功能说明：

- 支持 SSE 或 fetch stream 形式的流式响应。
- 接收 `token` 事件后将文本追加到当前助手回答。
- 接收 `done` 事件后结束 loading。
- 接收 `error` 事件后展示错误提示。

验收标准：

- Mock stream 能演示逐步输出。
- token 到达后页面能增量渲染。
- 流式结束后回答内容保留。
- 流式异常时页面不白屏，并能继续发送新问题。

负责人：

- xdj

### 6. 引用来源展示

功能说明：

- 展示回答对应的 citations。
- 每条引用至少展示引用编号、标题、doc_id、chunk_id。
- 如果 `source_url` 存在，支持点击跳转。
- 如果 `source_url` 为空，展示本地文档信息作为兜底。
- 可展示相关度分数 `score` 和命中文本片段 `snippet`。

验收标准：

- 回答中的 `[1]` 能在引用列表中找到对应来源。
- source_url 为空时页面不生成空链接。
- citations 为空时页面不报错。

负责人：

- djx / xdj

### 7. 异常状态处理

功能说明：

Web 层需要识别并展示以下状态：

| status | 含义 | 页面提示 |
| --- | --- | --- |
| `success` | 正常回答 | 展示答案和引用 |
| `invalid_query` | 问题为空或非法 | 提示请输入有效问题 |
| `no_relevant_context` | 知识库信息不足 | 提示当前知识库没有足够信息 |
| `retrieval_error` | 检索服务异常 | 提示检索服务异常 |
| `llm_error` | 模型服务异常 | 提示模型服务异常 |
| `network_error` | 网络异常 | 提示网络连接异常 |
| `timeout_error` | 请求超时 | 提示请求超时 |
| `stream_error` | 流式中断 | 提示回答生成中断 |

验收标准：

- 异常状态都有中文可读提示。
- 异常后输入框和发送按钮恢复可用。
- 页面不白屏、不死锁。

负责人：

- xdj

### 8. Mock 演示能力

功能说明：

为了保证没有真实 Agent 时也能演示，Web 层需要提供 Mock Client 和 Mock 数据。

需要覆盖的 Mock 场景：

- 正常回答。
- 流式回答。
- 无相关文档。
- 检索异常。
- 模型异常。
- 引用无 source_url。

验收标准：

- Demo 时可以不依赖真实 Agent 独立演示。
- Mock 数据字段与接口约定一致。
- Mock stream 能演示 token 增量输出。

负责人：

- xdj

## 三、可选增强功能

以下功能不是 Q1 必须项，可以作为后续优化：

- 深色/浅色主题切换。
- 停止生成。
- 重新生成回答。
- 示例问题快捷入口。
- 导出对话为 Markdown。
- 多轮会话历史。
- 用户反馈按钮，例如“有帮助/无帮助”。

## 四、功能与文件对应关系

| 功能 | 主要文件 |
| --- | --- |
| 页面基础结构 | `src/components/ChatPage.vue` |
| 输入框 | `src/components/ChatInput.vue` |
| 消息列表 | `src/components/MessageList.vue` |
| 消息气泡 | `src/components/MessageBubble.vue` |
| 引用列表 | `src/components/CitationList.vue` |
| 引用卡片 | `src/components/CitationCard.vue` |
| loading 状态 | `src/components/LoadingIndicator.vue` |
| 错误提示 | `src/components/ErrorMessage.vue` |
| Agent API | `src/api/chatClient.ts` |
| 流式解析 | `src/api/streamParser.ts` |
| Mock Client | `src/mock/mockChatClient.ts` |
| 类型定义 | `src/types/chat.ts` |
| 状态映射 | `src/utils/statusMapper.ts` |
| 引用格式化 | `src/utils/formatCitation.ts` |
| Mock 数据 | `mock/*.json`、`public/mock/*.json` |

## 五、最终验收标准

Web 层完成后，应该满足：

- 页面可以正常打开。
- 用户可以输入并发送问题。
- 页面能展示用户问题和助手回答。
- 回答能以流式方式逐步展示，或在 Agent 不支持流式时用 Mock stream 演示。
- 回答结束后能展示引用来源。
- `trace_id` 可以展示或记录。
- 空输入、无相关文档、检索异常、模型异常、网络异常都有兜底提示。
- 无真实 Agent 时，可以使用 Mock Client 完成 Demo。
- 有真实 Agent 时，可以根据 `docs/接口约定.md` 进行联调。
