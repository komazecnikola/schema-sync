import { webflow } from "@/lib/webflow";
export const runtime = "nodejs";
export async function GET() {
  const data = await webflow.listSites();
  return Response.json(data);
}
