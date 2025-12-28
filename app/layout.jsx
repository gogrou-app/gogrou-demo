import "./globals.css";
import { AppProvider } from "./context/AppContext";
import Sidebar from "./Sidebar";

export const metadata = {
  title: "GOGROU DEMO",
  description: "Preview of GPC + GSS + AI",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body>
        <AppProvider>
          <div style={{ display: "flex" }}>
            <Sidebar />
            <main style={{ flex: 1 }}>{children}</main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
