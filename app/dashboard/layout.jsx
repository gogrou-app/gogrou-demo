export default function DashboardLayout({ children }) {
  return (
    <>
      {/* SIDEBAR */}
      <aside
        style={{
          width: "260px",
          backgroundColor: "#111",
          padding: "20px",
          boxSizing: "border-box",
          flexShrink: 0,
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>GOGROU DEMO</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <a href="/dashboard">Dashboard</a>
          <a href="/gpc">GPC</a>
          <a href="/gss">GSS</a>
          <a href="/ss">SmartSplit</a>
          <a href="/ai">AI Asistent</a>
        </nav>
      </aside>

      {/* CONTENT */}
      <main
        style={{
          flex: 1,
          padding: "32px",
          boxSizing: "border-box",
          overflowX: "hidden",
        }}
      >
        {children}
      </main>
    </>
  );
}
