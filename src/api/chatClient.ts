import type { ChatApiResponse, ChatClient, ChatRequest, ChatResponse, ChatStreamEvent } from "../types/chat";
import { parseSseStream } from "./streamParser";
import { toChatResponse, toChatStreamEvent } from "../types/chat";

export interface ChatClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
  headers?: Record<string, string>;
}

function buildUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

function createTimeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController();
  window.setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

export function createChatClient(options: ChatClientOptions = {}): ChatClient {
  const baseUrl = options.baseUrl ?? "";
  const timeoutMs = options.timeoutMs ?? 30000;
  const headers = options.headers ?? {};

  async function sendChat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(buildUrl(baseUrl, "/api/chat"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers
      },
      body: JSON.stringify({
        ...request,
        stream: false
      }),
      signal: createTimeoutSignal(timeoutMs)
    });

    if (!response.ok) {
      throw new Error(`Chat request failed with HTTP ${response.status}`);
    }

    const payload = (await response.json()) as ChatApiResponse;
    return toChatResponse(payload);
  }

  async function* streamChat(request: ChatRequest): AsyncGenerator<ChatStreamEvent> {
    const response = await fetch(buildUrl(baseUrl, "/api/chat"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...headers
      },
      body: JSON.stringify({
        ...request,
        stream: true
      }),
      signal: createTimeoutSignal(timeoutMs)
    });

    if (!response.ok) {
      throw new Error(`Chat stream failed with HTTP ${response.status}`);
    }

    if (!response.body) {
      throw new Error("Chat stream response body is empty");
    }

    for await (const event of parseSseStream(response.body)) {
      yield toChatStreamEvent(event);
    }
  }

  return {
    sendChat,
    streamChat
  };
}
