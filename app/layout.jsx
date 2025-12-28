export const dynamic = "force-dynamic";

import "./globals.css";
import Sidebar from "./Sidebar";
import { AppProvider } from "./context/AppContext";

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body style={{ display: "flex", minHeight: "100vh", background: "#0f172a" }}>
        <AppProvider>
          <Sidebar />
          <main style={{ flex: 1 }}>
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
