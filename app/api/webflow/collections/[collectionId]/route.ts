import { webflow } from "@/lib/webflow";
export const runtime = "nodejs";

export async function GET(
  _: Request,
  { params }: { params: { collectionId: string } }
) {
  const col = await webflow.getCollection(params.collectionId);
  return Response.json(col);
}
