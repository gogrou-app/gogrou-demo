import "./globals.css";
import AppHeader from "./components/AppHeader";

export const metadata = {
  title: "Gogrou DEMO",
  description: "Gogrou – výrobní a skladový systém",
};

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body
        style={{
          margin: 0,
          backgroundColor: "#000",
          color: "#fff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* SIDEBAR */}
        <aside
          style={{
            width: 220,
            height: "100vh",
            position: "fixed",
            top: 0,
            left: 0,
            background: "#111",
            borderRight: "1px solid #222",
            padding: 20,
            boxSizing: "border-box",
          }}
        >
          <h2 style={{ margin: 0 }}>
            GOGROU
            <br />
            DEMO
          </h2>

          <nav style={{ marginTop: 30 }}>
            <NavLink href="/">Dashboard</NavLink>
            <NavLink href="/gpc">GPC</NavLink>
            <NavLink href="/gss">GSS</NavLink>
            <NavLink href="/ss">SmartSplit</NavLink>
            <NavLink href="/ai">AI Assistant</NavLink>
          </nav>
        </aside>

        {/* HLAVIČKA – GLOBÁLNÍ KONTEXT */}
        <AppHeader />

        {/* OBSAH STRÁNKY */}
        <main
          style={{
            marginLeft: 220,
            padding: "100px 30px 30px 30px",
            boxSizing: "border-box",
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}

function NavLink({ href, children }) {
  return (
    <a
      href={href}
      style={{
        display: "block",
        padding: "10px 0",
        color: "#ccc",
        textDecoration: "none",
      }}
    >
      {children}
    </a>
  );
}
