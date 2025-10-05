// app/api/auth/callback/route.ts
import { requiredEnv } from "@/lib/env";
import { tokenStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) return new Response("Missing authorization code", { status: 400 });

  const CLIENT_ID = requiredEnv("WEBFLOW_CLIENT_ID");
  const CLIENT_SECRET = requiredEnv("WEBFLOW_CLIENT_SECRET");
  const REDIRECT = `${requiredEnv("APP_BASE_URL")}/api/auth/callback`;

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    redirect_uri: REDIRECT,
    grant_type: "authorization_code",
  });

  const res = await fetch("https://api.webflow.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const txt = await res.text();
    return new Response(`Token exchange failed: ${txt}`, { status: 400 });
  }

  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token)
    return new Response("No access_token", { status: 400 });

  // dev convenience: keep the in-memory copy too
  tokenStore.token = data.access_token;

  // persist per-browser via HTTP-only cookie (secure=false in local dev)
  const headers = new Headers({
    "Set-Cookie": [
      `wf_token=${encodeURIComponent(
        data.access_token
      )}; Path=/; HttpOnly; SameSite=Lax`,
      // add ;Secure when you’re on HTTPS
    ].join(""),
    Location: `${requiredEnv("APP_BASE_URL")}/?connected=1`,
  });

  return new Response(null, { status: 302, headers });
}
