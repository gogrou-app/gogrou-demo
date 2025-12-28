"use client";

import { AppProvider } from "./context/AppContext";
import "./globals.css";
import Sidebar from "./Sidebar";

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
