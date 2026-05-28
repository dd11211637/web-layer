import type { ChatStreamEvent } from "../types/chat";

type SseField = {
  event?: string;
  data: string[];
};

function parseSseBlock(block: string): ChatStreamEvent | null {
  const field: SseField = { data: [] };

  for (const rawLine of block.split(/\r?\n/)) {
    const line = rawLine.trimEnd();

    if (!line || line.startsWith(":")) {
      continue;
    }

    const separatorIndex = line.indexOf(":");
    const name = separatorIndex >= 0 ? line.slice(0, separatorIndex) : line;
    const value = separatorIndex >= 0 ? line.slice(separatorIndex + 1).trimStart() : "";

    if (name === "event") {
      field.event = value;
    }

    if (name === "data") {
      field.data.push(value);
    }
  }

  if (!field.event || field.data.length === 0) {
    return null;
  }

  return {
    event: field.event,
    data: JSON.parse(field.data.join("\n"))
  } as ChatStreamEvent;
}

export async function* parseSseStream(stream: ReadableStream<Uint8Array>): AsyncGenerator<ChatStreamEvent> {
  const reader = stream.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split(/\r?\n\r?\n/);
      buffer = blocks.pop() ?? "";

      for (const block of blocks) {
        const event = parseSseBlock(block);

        if (event) {
          yield event;
        }
      }
    }

    buffer += decoder.decode();

    if (buffer.trim()) {
      const event = parseSseBlock(buffer);

      if (event) {
        yield event;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export function serializeMockEvents(events: ChatStreamEvent[]): string {
  return events
    .map((event) => [`event: ${event.event}`, `data: ${JSON.stringify(event.data)}`].join("\n"))
    .join("\n\n");
}
