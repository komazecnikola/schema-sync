import { configStore, InstallConfig } from "@/lib/store";
import { webflow } from "@/lib/webflow";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const cfg = (await req.json()) as InstallConfig;

  // Save config (replace existing for that site)
  configStore.bySite.set(cfg.siteId, cfg);

  // Register webhooks (idempotency isn't handled here; good enough for dev)
  await webflow.createWebhook(cfg.siteId, {
    triggerType: "collection_item_created",
    url: `${process.env.APP_BASE_URL}/api/webhooks/cms`,
  });
  await webflow.createWebhook(cfg.siteId, {
    triggerType: "collection_item_changed",
    url: `${process.env.APP_BASE_URL}/api/webhooks/cms`,
  });

  return Response.json({ ok: true });
}
