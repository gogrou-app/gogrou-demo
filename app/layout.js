import "./globals.css";
import Sidebar from "./Sidebar";

export const metadata = {
  title: "Gogrou Demo",
  description: "Preview of GPC + GSS + AI assistant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body style={{ margin: 0, background: "#000", color: "#fff" }}>
        <Sidebar />

        <div style={{ marginLeft: "220px", padding: "30px" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
