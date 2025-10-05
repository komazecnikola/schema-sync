// lib/webflow.ts
import { cookies } from "next/headers";
import { tokenStore } from "./store";

const API = "https://api.webflow.com/v2";

function getTokenFromCookieOrMemory(): string {
  // cookie is available per request (Node.js runtime)
  const c = cookies().get("wf_token")?.value;
  return c || tokenStore.token || "";
}

async function wf<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getTokenFromCookieOrMemory();
  if (!token) throw new Error("No access token. Connect Webflow first.");

  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Webflow API error ${res.status} on ${path}: ${txt}`);
  }
  return res.json() as Promise<T>;
}

export const webflow = {
  listSites: () => wf<any[]>(`/sites`),
  listCollections: (siteId: string) =>
    wf<{ collections: any[] }>(`/sites/${siteId}/collections`),
  getCollection: (collectionId: string) =>
    wf<any>(`/collections/${collectionId}`),
  createWebhook: (siteId: string, payload: any) =>
    wf<any>(`/sites/${siteId}/webhooks`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
