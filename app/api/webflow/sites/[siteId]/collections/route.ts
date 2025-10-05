import { webflow } from "@/lib/webflow";
export const runtime = "nodejs";

export async function GET(
  _: Request,
  { params }: { params: { siteId: string } }
) {
  const data = await webflow.listCollections(params.siteId);
  return Response.json(data.collections || []);
}
