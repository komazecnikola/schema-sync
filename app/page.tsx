export default function Home() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>FAQ JSON-LD App</h1>
      <p>Connect your Webflow workspace or site to continue.</p>
      <a
        href="/api/auth/start"
        style={{
          display: "inline-block",
          padding: "10px 16px",
          border: "1px solid #444",
          borderRadius: 8,
          textDecoration: "none",
          marginTop: 12,
        }}
      >
        Connect Webflow
      </a>
    </main>
  );
}
