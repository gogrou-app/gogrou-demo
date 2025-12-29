export default function GSSPage() {
  return (
    <>
      <h1>Sklad nástrojů</h1>
      <p style={{ opacity: 0.7, marginBottom: "24px" }}>
        Zde spravujete skutečný sklad nástrojů firmy
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div className="card">
          <strong>Sandvik Coromant – Vrták</strong><br />
          Celkem: 12 ks | MIN: 8 | MAX: 20 | <span style={{ color: "lime" }}>OK</span>
        </div>

        <div className="card">
          <strong>Walter – Fréza</strong><br />
          Celkem: 5 ks | MIN: 6 | MAX: 15 | <span style={{ color: "red" }}>POD MIN</span>
        </div>

        <div className="card">
          <strong>HSS – Vrták</strong><br />
          Celkem: 22 ks | MIN: 10 | MAX: 18 | <span style={{ color: "orange" }}>NAD MAX</span>
        </div>
      </div>
    </>
  );
}
