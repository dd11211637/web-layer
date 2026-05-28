import type { Citation } from "../types/chat";

export function formatCitationLabel(citation: Citation): string {
  return `[${citation.citationId}] ${citation.title}`;
}

export function getCitationHref(citation: Citation): string | null {
  const sourceUrl = citation.sourceUrl?.trim();
  return sourceUrl ? sourceUrl : null;
}

export function formatCitationSource(citation: Citation): string {
  const href = getCitationHref(citation);

  if (href) {
    return href;
  }

  return citation.chunkId ? `${citation.docId} / ${citation.chunkId}` : citation.docId;
}

export function formatCitationScore(citation: Citation): string {
  if (typeof citation.score !== "number") {
    return "";
  }

  return `${Math.round(citation.score * 100)}%`;
}
