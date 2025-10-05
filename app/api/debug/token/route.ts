// app/api/debug/token/route.ts
import { cookies } from "next/headers";
import { tokenStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const cookieToken = cookies().get("wf_token")?.value;
  const memToken = tokenStore.token;
  return Response.json({
    hasToken: !!(cookieToken || memToken),
    fromCookie: !!cookieToken,
    fromMemory: !!memToken,
  });
}
