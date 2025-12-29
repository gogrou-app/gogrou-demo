import "./globals.css";

export const metadata = {
  title: "GOGROU DEMO",
  description: "Demo platformy Gogrou",
};

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            width: "100%",
            backgroundColor: "#000",
            color: "#fff",
            fontFamily: "Arial, sans-serif",
          }}
        >
          {/* SIDEBAR */}
          <aside
            style={{
              width: "260px",
              padding: "20px",
              borderRight: "1px solid #222",
              boxSizing: "border-box",
            }}
          >
            <h2 style={{ marginBottom: "20px" }}>GOGROU<br />DEMO</h2>

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
              overflowY: "auto",
            }}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
