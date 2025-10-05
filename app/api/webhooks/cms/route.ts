export const runtime = "nodejs";

export async function POST(req: Request) {
  // Webflow will POST here. For now, just acknowledge receipt.
  return Response.json({ ok: true });
}
