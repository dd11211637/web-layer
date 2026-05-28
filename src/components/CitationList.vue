<template>
  <section class="citation-list" aria-label="引用来源">
    <CitationCard v-for="citation in citations" :key="citation.citationId" :citation="citation" />
  </section>
</template>

<script setup lang="ts">
import CitationCard from "./CitationCard.vue";
import type { Citation } from "../types/chat";

defineProps<{
  citations: Citation[];
}>();
</script>

<style scoped>
.citation-list {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}
</style>
