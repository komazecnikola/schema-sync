import { requiredEnv } from "@/lib/env";

export const runtime = "nodejs";

export async function GET() {
  const CLIENT_ID = requiredEnv("WEBFLOW_CLIENT_ID");
  const REDIRECT = `${requiredEnv("APP_BASE_URL")}/api/auth/callback`;
  const SCOPES = requiredEnv("OAUTH_SCOPES");

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT,
    scope: SCOPES, // space-delimited is fine; URLSearchParams will encode
    state: crypto.randomUUID(),
  });

  const authUrl = `https://webflow.com/oauth/authorize?${params.toString()}`;

  // Use manual 302 Location to avoid the “immutable” redirect edge case
  return new Response(null, {
    status: 302,
    headers: { Location: authUrl },
  });
}
