import "./globals.css";
import GogrouHeader from "./components/GogrouHeader";

export const metadata = {
  title: "Gogrou DEMO",
  description: "Gogrou – výrobní a skladový systém",
};

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body style={{ margin: 0, background: "#000" }}>
        <GogrouHeader />
        {children}
      </body>
    </html>
  );
}
