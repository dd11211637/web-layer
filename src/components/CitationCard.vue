<template>
  <article class="citation-card">
    <div>
      <p class="citation-title">{{ formatCitationLabel(citation) }}</p>
      <p v-if="citation.snippet" class="snippet">{{ citation.snippet }}</p>
      <p class="source">
        <a v-if="href" :href="href" target="_blank" rel="noreferrer">{{ href }}</a>
        <span v-else>{{ formatCitationSource(citation) }}</span>
      </p>
    </div>
    <span v-if="scoreLabel" class="score">{{ scoreLabel }}</span>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Citation } from "../types/chat";
import {
  formatCitationLabel,
  formatCitationScore,
  formatCitationSource,
  getCitationHref
} from "../utils/formatCitation";

const props = defineProps<{
  citation: Citation;
}>();

const href = computed(() => getCitationHref(props.citation));
const scoreLabel = computed(() => formatCitationScore(props.citation));
</script>

<style scoped>
.citation-card {
  align-items: flex-start;
  background: #f9fafb;
  border: 1px solid #eaecf0;
  border-radius: 8px;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 10px 12px;
}

.citation-title {
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 4px;
}

.snippet,
.source {
  color: #667085;
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
}

.source a {
  color: #1b6f5f;
}

.score {
  color: #667085;
  font-size: 12px;
  white-space: nowrap;
}
</style>
