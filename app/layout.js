export const metadata = {
  title: "GOGROU DEMO",
  description: "Preview of GPC + GSS + AI assistant"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ 
        margin: 0,
        padding: 0,
        fontFamily: "Arial, sans-serif",
        background: "#0A0A0A",
        color: "white"
      }}>
        {children}
      </body>
    </html>
  );
}
