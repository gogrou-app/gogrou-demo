import "./globals.css";
import { AppProvider } from "./context/AppContext";
import Sidebar from "./Sidebar";

export const metadata = {
  title: "Gogrou DEMO",
  description: "Gogrou – unified manufacturing platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body style={{ display: "flex", minHeight: "100vh" }}>
        <AppProvider>
          <Sidebar />
          <main style={{ flex: 1, background: "#111" }}>
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
