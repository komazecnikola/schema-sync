// lib/env.ts
export function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `[ENV] Missing ${name}. Did you set it in .env.local and restart the server?`
    );
  }
  return v;
}
