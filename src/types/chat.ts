export const CHAT_STATUSES = [
  "success",
  "invalid_query",
  "no_relevant_context",
  "retrieval_error",
  "llm_error",
  "network_error",
  "timeout_error",
  "stream_error"
] as const;

export type ChatStatus = (typeof CHAT_STATUSES)[number];

export interface Citation {
  citation_id: number;
  title: string;
  source_url?: string;
  doc_id: string;
  chunk_id?: string;
  score?: number;
  snippet?: string;
}

export interface ChatRequest {
  query: string;
  session_id?: string;
  stream?: boolean;
}

export interface ChatResponse {
  trace_id: string;
  status: ChatStatus;
  answer: string;
  citations: Citation[];
}

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  status?: ChatStatus;
  trace_id?: string;
  citations?: Citation[];
  created_at: string;
}

export type ChatStreamEvent =
  | {
      event: "meta";
      data: {
        trace_id: string;
        status: ChatStatus;
      };
    }
  | {
      event: "token";
      data: {
        text: string;
      };
    }
  | {
      event: "citations";
      data: Citation[];
    }
  | {
      event: "error";
      data: {
        trace_id?: string;
        status: ChatStatus;
        message: string;
      };
    }
  | {
      event: "done";
      data: {
        trace_id: string;
        status: ChatStatus;
      };
    };

export interface ChatClient {
  sendChat(request: ChatRequest): Promise<ChatResponse>;
  streamChat(request: ChatRequest): AsyncGenerator<ChatStreamEvent>;
}
