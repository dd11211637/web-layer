import type { Citation } from "../types/chat";

export function formatCitationLabel(citation: Citation): string {
  return `[${citation.citation_id}] ${citation.title}`;
}

export function getCitationHref(citation: Citation): string | null {
  const sourceUrl = citation.source_url?.trim();
  return sourceUrl ? sourceUrl : null;
}

export function formatCitationSource(citation: Citation): string {
  const href = getCitationHref(citation);

  if (href) {
    return href;
  }

  return citation.chunk_id ? `${citation.doc_id} / ${citation.chunk_id}` : citation.doc_id;
}

export function formatCitationScore(citation: Citation): string {
  if (typeof citation.score !== "number") {
    return "";
  }

  return `${Math.round(citation.score * 100)}%`;
}
