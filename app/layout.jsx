export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body style={{ margin: 0, background: "#000", color: "#fff", fontFamily: "Arial, sans-serif" }}>
        <div style={{ display: "flex", minHeight: "100vh" }}>

          {/* SIDEBAR */}
          <aside
            style={{
              width: "240px",
              padding: "24px",
              borderRight: "1px solid #222",
              boxSizing: "border-box"
            }}
          >
            <h2 style={{ marginBottom: "24px" }}>GOGROU<br />DEMO</h2>

            <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <a href="/">Dashboard</a>
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
              maxWidth: "1200px"
            }}
          >
            {children}
          </main>

        </div>
      </body>
    </html>
  );
}
