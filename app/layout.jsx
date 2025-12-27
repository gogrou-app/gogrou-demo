import "./globals.css";
import { AppProvider } from "./context/AppContext";

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
