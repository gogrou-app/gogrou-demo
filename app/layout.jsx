import "./globals.css";
import AppHeader from "./components/AppHeader";

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body
        style={{
          margin: 0,
          backgroundColor: "#000",
          color: "#fff",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
        }}
      >
        {/* LEVÉ MENU */}
        <aside
          style={{
            width: 220,
            height: "100vh",
            position: "fixed",
            top: 0,
            left: 0,
            backgroundColor: "#111",
            borderRight: "1px solid #222",
            padding: 20,
            boxSizing: "border-box",
          }}
        >
          <h2 style={{ margin: 0, lineHeight: 1.2 }}>
            GOGROU<br />DEMO
          </h2>

          <nav style={{ marginTop: 24 }}>
            <NavLink href="/">Dashboard</NavLink>
            <NavLink href="/gpc">GPC</NavLink>
            <NavLink href="/gss">GSS</NavLink>
            <NavLink href="/smartsplit">SmartSplit</NavLink>
            <NavLink href="/ai">AI Assistant</NavLink>
          </nav>
        </aside>

        {/* HLAVNÍ OBSAH */}
        <main
          style={{
            marginLeft: 220,
            minHeight: "100vh",
            boxSizing: "border-box",
          }}
        >
          {/* GLOBÁLNÍ HEADER – FIRMA / MODUL / SKLAD */}
          <AppHeader />

          {/* OBSAH STRÁNKY */}
          <div
            style={{
              padding: 30,
              boxSizing: "border-box",
            }}
          >
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}

/* ---------- POMOCNÉ KOMPONENTY ---------- */

function NavLink({ href, children }) {
  return (
    <a
      href={href}
      style={{
        display: "block",
        padding: "10px 0",
        color: "#ccc",
        textDecoration: "none",
        fontSize: 15,
      }}
      onMouseEnter={(e) => (e.target.style.color = "#fff")}
      onMouseLeave={(e) => (e.target.style.color = "#ccc")}
    >
      {children}
    </a>
  );
}
