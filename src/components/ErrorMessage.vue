<template>
  <p class="error-message" role="alert">{{ message }}</p>
</template>

<script setup lang="ts">
defineProps<{
  message: string;
}>();
</script>

<style scoped>
.error-message {
  background: #fff4ed;
  border: 1px solid #ffd6ae;
  border-radius: 8px;
  color: #9a3412;
  margin: 0;
  padding: 10px 12px;
}
</style>
