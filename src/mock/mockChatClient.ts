import type {
  ChatApiResponse,
  ChatApiStreamEvent,
  ChatClient,
  ChatRequest,
  ChatResponse,
  ChatStatus,
  ChatStreamEvent
} from "../types/chat";
import { getApiResponseText, toChatResponse, toChatStreamEvent } from "../types/chat";

export type MockScenario =
  | "success"
  | "stream-success"
  | "no-relevant-context"
  | "retrieval-error"
  | "llm-error"
  | "invalid-query"
  | "citation-without-url";

const MOCK_FILES: Record<MockScenario, string> = {
  success: "chat-success.json",
  "stream-success": "chat-stream-success.json",
  "no-relevant-context": "chat-no-relevant-context.json",
  "retrieval-error": "chat-retrieval-error.json",
  "llm-error": "chat-llm-error.json",
  "invalid-query": "chat-invalid-query.json",
  "citation-without-url": "chat-citation-without-url.json"
};

interface MockStreamPayload {
  trace_id: string;
  status: ChatStatus;
  events: ChatApiStreamEvent[];
}

export interface MockChatClientOptions {
  mockBasePath?: string;
  defaultScenario?: MockScenario;
  delayMs?: number;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function pickScenario(request: ChatRequest, fallback: MockScenario): MockScenario {
  const query = request.query.trim().toLowerCase();

  if (!query) {
    return "invalid-query";
  }

  if (query.includes("无相关") || query.includes("no context")) {
    return "no-relevant-context";
  }

  if (query.includes("检索异常") || query.includes("retrieval")) {
    return "retrieval-error";
  }

  if (query.includes("模型异常") || query.includes("llm")) {
    return "llm-error";
  }

  if (query.includes("无链接") || query.includes("local citation")) {
    return "citation-without-url";
  }

  if (request.stream) {
    return "stream-success";
  }

  return fallback;
}

async function loadJson<T>(mockBasePath: string, scenario: MockScenario): Promise<T> {
  const response = await fetch(`${mockBasePath.replace(/\/$/, "")}/${MOCK_FILES[scenario]}`);

  if (!response.ok) {
    throw new Error(`Mock file not found: ${MOCK_FILES[scenario]}`);
  }

  return response.json() as Promise<T>;
}

export function createMockChatClient(options: MockChatClientOptions = {}): ChatClient {
  const mockBasePath = options.mockBasePath ?? "/mock";
  const defaultScenario = options.defaultScenario ?? "success";
  const delayMs = options.delayMs ?? 180;

  async function sendChat(request: ChatRequest): Promise<ChatResponse> {
    const scenario = pickScenario(request, defaultScenario);

    if (scenario === "stream-success") {
      const streamPayload = await loadJson<MockStreamPayload>(mockBasePath, scenario);
      const answer = streamPayload.events
        .filter((event) => event.event === "token")
        .map((event) => (event.event === "token" ? event.data.text : ""))
        .join("");
      const citationsEvent = streamPayload.events.find((event) => event.event === "citations");

      return toChatResponse({
        trace_id: streamPayload.trace_id,
        status: streamPayload.status,
        answer,
        citations: citationsEvent?.event === "citations" ? citationsEvent.data : []
      });
    }

    await wait(delayMs);
    return toChatResponse(await loadJson<ChatApiResponse>(mockBasePath, scenario));
  }

  async function* streamChat(request: ChatRequest): AsyncGenerator<ChatStreamEvent> {
    const scenario = pickScenario({ ...request, stream: true }, "stream-success");

    if (scenario === "stream-success") {
      const payload = await loadJson<MockStreamPayload>(mockBasePath, scenario);

      for (const event of payload.events) {
        await wait(delayMs);
        yield toChatStreamEvent(event);
      }

      return;
    }

    const response = await loadJson<ChatApiResponse>(mockBasePath, scenario);
    const text = getApiResponseText(response);

    await wait(delayMs);
    yield toChatStreamEvent({
      event: "meta",
      data: {
        trace_id: response.trace_id,
        status: response.status
      }
    });

    if (text) {
      await wait(delayMs);
      yield toChatStreamEvent({
        event: "token",
        data: {
          text
        }
      });
    }

    if (response.citations.length > 0) {
      await wait(delayMs);
      yield toChatStreamEvent({
        event: "citations",
        data: response.citations
      });
    }

    if (response.status !== "success") {
      await wait(delayMs);
      yield toChatStreamEvent({
        event: "error",
        data: {
          trace_id: response.trace_id,
          status: response.status,
          message: text
        }
      });
    }

    await wait(delayMs);
    yield toChatStreamEvent({
      event: "done",
      data: {
        trace_id: response.trace_id,
        status: response.status
      }
    });
  }

  return {
    sendChat,
    streamChat
  };
}
