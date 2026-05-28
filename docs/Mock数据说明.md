# Mock 数据说明

Mock 数据用于支持 Web 层独立开发、异常状态验证和七月 Demo 演示。所有文件位于仓库根目录 `mock/`。

## Mock 文件清单

| 文件 | 场景 | 期望状态 |
| --- | --- | --- |
| `chat-success.json` | 正常完整回答，带外部引用链接 | `success` |
| `chat-stream-success.json` | 模拟流式响应事件 | `success` |
| `chat-no-relevant-context.json` | 知识库无相关内容 | `no_relevant_context` |
| `chat-retrieval-error.json` | 检索服务异常 | `retrieval_error` |
| `chat-llm-error.json` | 模型服务异常 | `llm_error` |
| `chat-invalid-query.json` | 空输入或非法问题 | `invalid_query` |
| `chat-citation-without-url.json` | 本地文档引用，没有 `source_url` | `success` |

## 使用原则

- Mock 响应字段必须与 `docs/接口约定.md` 保持一致；
- 异常场景也要返回 `trace_id`，便于页面联调展示；
- `success` 状态使用 `answer` 承载答案正文；
- 非 `success` 状态使用 `message` 承载兜底提示，`answer` 可以为空字符串；
- 异常场景的 `citations` 返回空数组；
- 无链接引用不要返回无效 URL，`source_url` 可为空字符串或省略；
- 如果 Agent 层新增字段，需要同步更新 `src/types/chat.ts` 和所有相关 Mock。

## 流式 Mock 格式

`chat-stream-success.json` 使用事件数组描述 SSE 过程：

```
{
  "trace_id": "trace-stream-001",
  "status": "success",
  "events": [
    { "event": "meta", "data": { "trace_id": "trace-stream-001", "status": "success" } },
    { "event": "token", "data": { "text": "Q1 阶段" } },
    { "event": "citations", "data": [] },
    { "event": "done", "data": { "trace_id": "trace-stream-001", "status": "success" } }
  ]
}
```

前端可以用该结构模拟 token 增量渲染，也可以转换为 SSE 文本进行解析器测试。
