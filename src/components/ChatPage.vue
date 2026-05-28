<template>
  <main class="chat-page">
    <section class="chat-shell" aria-label="AI knowledge question answering">
      <header class="chat-header">
        <div>
          <p class="eyebrow">AI Knowledge Q&A</p>
          <h1>模块 1：用户层</h1>
        </div>
        <button class="ghost-button" type="button" @click="clearMessages">清空对话</button>
      </header>

      <MessageList :messages="messages" @copy="copyAnswer" />
      <ErrorMessage v-if="errorMessage" :message="errorMessage" />
      <LoadingIndicator v-if="isLoading" text="正在生成回答" />
      <ChatInput :disabled="isLoading" @send="handleSend" />
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ChatInput from "./ChatInput.vue";
import ErrorMessage from "./ErrorMessage.vue";
import LoadingIndicator from "./LoadingIndicator.vue";
import MessageList from "./MessageList.vue";
import { createMockChatClient } from "../mock/mockChatClient";
import type { ChatMessage, ChatResponse, ChatStatus } from "../types/chat";
import { isErrorStatus, mapStatusToUserMessage } from "../utils/statusMapper";

const client = createMockChatClient();
const sessionId = "local-session-001";
const messages = ref<ChatMessage[]>([]);
const isLoading = ref(false);
const errorMessage = ref("");

function createId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createMessage(partial: Omit<ChatMessage, "id" | "createdAt">): ChatMessage {
  return {
    id: createId(),
    createdAt: new Date().toISOString(),
    ...partial
  };
}

function appendAssistantResponse(response: ChatResponse): void {
  messages.value.push(
    createMessage({
      role: "assistant",
      content: response.answer || response.message || mapStatusToUserMessage(response.status),
      status: response.status,
      traceId: response.traceId,
      citations: response.citations
    })
  );
}

async function handleSend(query: string): Promise<void> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    errorMessage.value = mapStatusToUserMessage("invalid_query");
    return;
  }

  messages.value.push(
    createMessage({
      role: "user",
      content: normalizedQuery
    })
  );

  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await client.sendChat({
      query: normalizedQuery,
      session_id: sessionId,
      stream: false
    });

    appendAssistantResponse(response);

    if (isErrorStatus(response.status)) {
      errorMessage.value = mapStatusToUserMessage(response.status);
    }
  } catch {
    const status: ChatStatus = "network_error";
    errorMessage.value = mapStatusToUserMessage(status);
    messages.value.push(
      createMessage({
        role: "assistant",
        content: errorMessage.value,
        status
      })
    );
  } finally {
    isLoading.value = false;
  }
}

async function copyAnswer(message: ChatMessage): Promise<void> {
  if (!navigator.clipboard || message.role !== "assistant") {
    return;
  }

  await navigator.clipboard.writeText(message.content);
}

function clearMessages(): void {
  messages.value = [];
  errorMessage.value = "";
}
</script>

<style scoped>
.chat-page {
  min-height: 100vh;
  background: #f7f8fa;
  color: #20242a;
  display: flex;
  justify-content: center;
  padding: 32px 16px;
}

.chat-shell {
  width: min(960px, 100%);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.chat-header h1 {
  font-size: 24px;
  line-height: 1.2;
  margin: 0;
}

.eyebrow {
  color: #667085;
  font-size: 13px;
  margin: 0 0 4px;
}

.ghost-button {
  background: #ffffff;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  color: #344054;
  cursor: pointer;
  min-height: 36px;
  padding: 0 14px;
}
</style>
