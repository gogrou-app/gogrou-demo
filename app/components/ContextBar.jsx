"use client";

export default function ContextBar({
  company,
  module,
  warehouse,
  item,
}) {
  return (
    <div
      style={{
        background: "#0a0a0a",
        border: "1px solid #1f2937",
        borderRadius: 10,
        padding: "10px 16px",
        marginBottom: 24,
        fontSize: 13,
        color: "#9ca3af",
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <span>
        <strong style={{ color: "#e5e7eb" }}>Firma:</strong>{" "}
        {company}
      </span>

      <span>•</span>

      <span>
        <strong style={{ color: "#e5e7eb" }}>Modul:</strong>{" "}
        {module}
      </span>

      {warehouse && (
        <>
          <span>•</span>
          <span>
            <strong style={{ color: "#e5e7eb" }}>Sklad:</strong>{" "}
            {warehouse}
          </span>
        </>
      )}

      {item && (
        <>
          <span>•</span>
          <span>
            <strong style={{ color: "#e5e7eb" }}>Položka:</strong>{" "}
            {item}
          </span>
        </>
      )}
    </div>
  );
}
