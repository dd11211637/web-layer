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

export interface ApiCitation {
  citation_id: number;
  title: string;
  source_url?: string;
  doc_id: string;
  chunk_id?: string;
  score?: number;
  snippet?: string;
}

export interface Citation {
  citationId: number;
  title: string;
  sourceUrl?: string;
  docId: string;
  chunkId?: string;
  score?: number;
  snippet?: string;
}

export interface ChatRequest {
  query: string;
  session_id?: string;
  stream?: boolean;
}

export interface ChatApiResponse {
  trace_id: string;
  status: ChatStatus;
  answer?: string;
  message?: string;
  citations: ApiCitation[];
}

export interface ChatResponse {
  traceId: string;
  status: ChatStatus;
  answer: string;
  message?: string;
  citations: Citation[];
}

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  status?: ChatStatus;
  traceId?: string;
  citations?: Citation[];
  createdAt: string;
}

export type ChatApiStreamEvent =
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
      data: ApiCitation[];
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

export type ChatStreamEvent =
  | {
      event: "meta";
      data: {
        traceId: string;
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
        traceId?: string;
        status: ChatStatus;
        message: string;
      };
    }
  | {
      event: "done";
      data: {
        traceId: string;
        status: ChatStatus;
      };
    };

export interface ChatClient {
  sendChat(request: ChatRequest): Promise<ChatResponse>;
  streamChat(request: ChatRequest): AsyncGenerator<ChatStreamEvent>;
}

export function toCitation(apiCitation: ApiCitation): Citation {
  return {
    citationId: apiCitation.citation_id,
    title: apiCitation.title,
    sourceUrl: apiCitation.source_url,
    docId: apiCitation.doc_id,
    chunkId: apiCitation.chunk_id,
    score: apiCitation.score,
    snippet: apiCitation.snippet
  };
}

export function toApiCitation(citation: Citation): ApiCitation {
  return {
    citation_id: citation.citationId,
    title: citation.title,
    source_url: citation.sourceUrl,
    doc_id: citation.docId,
    chunk_id: citation.chunkId,
    score: citation.score,
    snippet: citation.snippet
  };
}

export function getApiResponseText(response: ChatApiResponse): string {
  return response.answer?.trim() || response.message?.trim() || "";
}

export function toChatResponse(response: ChatApiResponse): ChatResponse {
  return {
    traceId: response.trace_id,
    status: response.status,
    answer: getApiResponseText(response),
    message: response.message,
    citations: response.citations.map(toCitation)
  };
}

export function toChatStreamEvent(event: ChatApiStreamEvent): ChatStreamEvent {
  switch (event.event) {
    case "meta":
      return {
        event: "meta",
        data: {
          traceId: event.data.trace_id,
          status: event.data.status
        }
      };
    case "citations":
      return {
        event: "citations",
        data: event.data.map(toCitation)
      };
    case "error":
      return {
        event: "error",
        data: {
          traceId: event.data.trace_id,
          status: event.data.status,
          message: event.data.message
        }
      };
    case "done":
      return {
        event: "done",
        data: {
          traceId: event.data.trace_id,
          status: event.data.status
        }
      };
    default:
      return event;
  }
}
