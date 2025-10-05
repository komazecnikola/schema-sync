import { webflow } from "@/lib/webflow";
export const runtime = "nodejs";

export async function GET(
  _: Request,
  { params }: { params: { collectionId: string } }
) {
  const col = await webflow.getCollection(params.collectionId);
  // Return only essential info so it’s readable
  const fields = (col.fields || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    slug: f.slug,
    type: f.type,
    metadata: f.metadata,
    reference: (f as any).reference,
    settings: (f as any).settings,
  }));
  return Response.json({ id: col.id, displayName: col.displayName, fields });
}
