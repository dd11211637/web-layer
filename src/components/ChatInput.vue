<template>
  <form class="chat-input" @submit.prevent="submit">
    <textarea
      v-model="draft"
      :disabled="disabled"
      rows="3"
      placeholder="请输入问题"
      @keydown.enter.exact.prevent="submit"
      @keydown.shift.enter.stop
    />
    <button type="submit" :disabled="disabled || !draft.trim()">发送</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  disabled?: boolean;
}>();

const emit = defineEmits<{
  send: [query: string];
}>();

const draft = ref("");

function submit(): void {
  const query = draft.value.trim();

  if (!query) {
    return;
  }

  emit("send", query);
  draft.value = "";
}
</script>

<style scoped>
.chat-input {
  align-items: flex-end;
  background: #ffffff;
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr auto;
  padding: 12px;
}

textarea {
  border: 0;
  color: #101828;
  font: inherit;
  min-height: 72px;
  outline: none;
  resize: vertical;
}

button {
  background: #1b6f5f;
  border: 0;
  border-radius: 6px;
  color: #ffffff;
  cursor: pointer;
  min-height: 38px;
  padding: 0 16px;
}

button:disabled,
textarea:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
