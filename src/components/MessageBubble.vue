<template>
  <article class="message" :class="message.role">
    <div class="message-body">
      <p class="role">{{ roleLabel }}</p>
      <p class="content">{{ message.content }}</p>

      <div v-if="message.role === 'assistant'" class="message-meta">
        <span v-if="message.trace_id">trace_id: {{ message.trace_id }}</span>
        <button type="button" @click="$emit('copy')">复制回答</button>
      </div>

      <CitationList v-if="message.citations?.length" :citations="message.citations" />
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import CitationList from "./CitationList.vue";
import type { ChatMessage } from "../types/chat";

const props = defineProps<{
  message: ChatMessage;
}>();

defineEmits<{
  copy: [];
}>();

const roleLabel = computed(() => {
  if (props.message.role === "user") {
    return "用户";
  }

  if (props.message.role === "assistant") {
    return "助手";
  }

  return "系统";
});
</script>

<style scoped>
.message {
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.message-body {
  background: #ffffff;
  border: 1px solid #e4e7ec;
  border-radius: 8px;
  max-width: min(720px, 100%);
  padding: 14px 16px;
}

.user .message-body {
  background: #e8f3ef;
  border-color: #b7d8ce;
}

.role {
  color: #667085;
  font-size: 12px;
  margin: 0 0 6px;
}

.content {
  line-height: 1.7;
  margin: 0;
  white-space: pre-wrap;
}

.message-meta {
  align-items: center;
  color: #667085;
  display: flex;
  flex-wrap: wrap;
  font-size: 12px;
  gap: 10px;
  margin-top: 10px;
}

.message-meta button {
  background: transparent;
  border: 0;
  color: #1b6f5f;
  cursor: pointer;
  padding: 0;
}
</style>
