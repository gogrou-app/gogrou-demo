"use client";

export default function ContextBar({ company, module, warehouse, item }) {
  return (
    <div style={bar}>
      <strong>Firma:</strong> {company}
      {" • "}
      <strong>Modul:</strong> {module}
      {warehouse && <> {" • "} <strong>Sklad:</strong> {warehouse}</>}
      {item && <> {" • "} <strong>Položka:</strong> {item}</>}
    </div>
  );
}

const bar = {
  background: "#0a0a0a",
  border: "1px solid #222",
  borderRadius: 10,
  padding: "10px 16px",
  marginBottom: 24,
  fontSize: 13,
};
