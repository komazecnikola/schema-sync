// lib/store.ts

// ──────────────
// ACCESS TOKEN
// ──────────────
export const tokenStore = {
  token: "" as string, // stored in memory for dev only
};

// ──────────────
// INSTALL CONFIG
// ──────────────
export type InstallConfig = {
  siteId: string;
  blogCollectionId: string;
  faqMultiRefSlug: string; // multi-ref field slug on Blog
  faqCollectionId: string; // collection that multi-ref points to
  questionFieldSlug: string; // FAQ question field slug
  answerFieldSlug: string; // FAQ answer field slug
  outputFieldSlug: string; // plain-text field on Blog (for JSON-LD)
  autoPublish: boolean;
};

// Simple in-memory store for site configs
export const configStore = {
  bySite: new Map<string, InstallConfig>(),
};
