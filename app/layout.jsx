import "./globals.css";
import Sidebar from "./Sidebar";

export const metadata = {
  title: "GOGROU DEMO",
  description: "Gogrou demo aplikace",
};

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#000",
          color: "#fff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            width: "100%",
          }}
        >
          <Sidebar />

          <main
            style={{
              flex: 1,
              minWidth: 0,
              padding: "22px 28px",
              overflowX: "hidden",
            }}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
