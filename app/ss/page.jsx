"use client";

export default function SmartSplitPage() {
  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>
        SmartSplit
      </h1>

      <p style={{ opacity: 0.7, marginBottom: 24 }}>
        Skupinové nákupy a cenové akce (DEMO režim)
      </p>

      <div
        style={{
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 14,
          padding: 20,
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <p>
          🚧 SmartSplit modul zatím slouží pouze jako vizuální DEMO.
        </p>
        <p style={{ marginTop: 8, opacity: 0.7 }}>
          Logika bude doplněna později.
        </p>
      </div>
    </div>
  );
}
