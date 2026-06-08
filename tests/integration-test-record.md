# 联调测试记录

本文档记录 Web 层和 Agent 层每次联调结果。真实联调记录需要保留 `trace_id`、请求参数、接口响应和处理结论。

## 记录模板

```
日期：
测试人：
Web 分支/提交：
Agent 分支/提交：
Agent 地址：
接口路径：
是否流式：
请求参数：
HTTP 状态：
业务 status：
trace_id：
页面表现：
问题：
结论：
后续动作：
```

## 联调记录

### 记录 001

```
日期：2026-06-08
测试人：djx
Web 分支/提交：main / 本次第四周提交
Agent 分支/提交：真实 Agent 暂不可用
Agent 地址：未配置，默认使用 Mock Client
接口路径：/api/chat
是否流式：是，Mock stream
请求参数：{"query":"项目 Q1 阶段需要完成哪些功能？","session_id":"local-session-001","stream":true}
HTTP 状态：Mock 本地静态数据，不涉及 HTTP Agent
业务 status：success
trace_id：trace-stream-001
页面表现：前端可按 token 增量追加回答，结束后展示引用来源和 trace_id。
问题：真实 Agent 地址尚未提供，无法完成线上接口联调。
结论：Mock 联调路径可用于 Demo；真实 Agent 可通过 `VITE_CHAT_CLIENT=agent` 和 `VITE_AGENT_BASE_URL` 切换。
后续动作：xdj 提供真实 Agent 地址后，按 `docs/接口约定.md` 复测普通响应和 SSE 响应。
```
