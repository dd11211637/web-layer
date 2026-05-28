import type { ChatStatus } from "../types/chat";

export const STATUS_LABELS: Record<ChatStatus, string> = {
  success: "回答完成",
  invalid_query: "请输入有效问题",
  no_relevant_context: "当前知识库没有足够信息回答该问题",
  retrieval_error: "检索服务异常，请稍后重试",
  llm_error: "模型服务异常，请稍后重试",
  network_error: "网络连接异常，请检查连接后重试",
  timeout_error: "请求超时，请稍后重试",
  stream_error: "回答生成中断，请重新发送"
};

export function mapStatusToUserMessage(status: ChatStatus): string {
  return STATUS_LABELS[status] ?? "服务暂时不可用，请稍后重试";
}

export function isErrorStatus(status: ChatStatus): boolean {
  return status !== "success";
}
