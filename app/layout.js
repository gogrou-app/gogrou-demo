import "./globals.css";
import Sidebar from "./Sidebar";

export const metadata = {
  title: "GOGROU DEMO",
  description: "Preview GPC + GSS + AI Assistant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body style={{ margin: 0, padding: 0 }}>
        <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
          <Sidebar />

          <main style={{ padding: "40px", width: "100%", background: "#111", color: "#fff" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
