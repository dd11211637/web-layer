<template>
  <section class="message-list" aria-live="polite">
    <p v-if="messages.length === 0" class="empty-state">当前还没有对话。</p>
    <MessageBubble
      v-for="message in messages"
      :key="message.id"
      :message="message"
      @copy="$emit('copy', message)"
    />
  </section>
</template>

<script setup lang="ts">
import MessageBubble from "./MessageBubble.vue";
import type { ChatMessage } from "../types/chat";

defineProps<{
  messages: ChatMessage[];
}>();

defineEmits<{
  copy: [message: ChatMessage];
}>();
</script>

<style scoped>
.message-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  min-height: 360px;
}

.empty-state {
  align-items: center;
  background: #ffffff;
  border: 1px dashed #d0d5dd;
  border-radius: 8px;
  color: #667085;
  display: flex;
  justify-content: center;
  min-height: 220px;
}
</style>
