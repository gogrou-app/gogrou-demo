export default function Page() {
  return (
    <div style={{ padding: "40px" }}>
      <h1>GSS – Gogrou Storage System</h1>
      <p>Zde bude mini-demo GSS (skladový systém):</p>

      <ul style={{ marginTop: "20px", fontSize: "18px", lineHeight: "1.6" }}>
        <li>Evidence položek</li>
        <li>DM kódy a sledování pohybu</li>
        <li>Minima / maxima / objednávky</li>
        <li>Napojení na Promiteu</li>
      </ul>
    </div>
  );
}
