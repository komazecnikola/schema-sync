import { webflow } from "@/lib/webflow";
export const runtime = "nodejs";

export async function GET() {
  const data = await webflow.listSites();
  // v2 can return either an array or { sites: [...] } depending on lib/typing
  const sites = Array.isArray(data) ? data : data?.sites ?? [];
  return Response.json(sites);
}
