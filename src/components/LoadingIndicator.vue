<template>
  <div class="loading-indicator" role="status">
    <span class="dot" />
    <span class="dot" />
    <span class="dot" />
    <span>{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    text?: string;
  }>(),
  {
    text: "加载中"
  }
);
</script>

<style scoped>
.loading-indicator {
  align-items: center;
  color: #667085;
  display: flex;
  gap: 6px;
  min-height: 28px;
}

.dot {
  animation: pulse 1s infinite ease-in-out;
  background: #1b6f5f;
  border-radius: 999px;
  height: 6px;
  width: 6px;
}

.dot:nth-child(2) {
  animation-delay: 0.12s;
}

.dot:nth-child(3) {
  animation-delay: 0.24s;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.3;
    transform: translateY(0);
  }

  50% {
    opacity: 1;
    transform: translateY(-2px);
  }
}
</style>
