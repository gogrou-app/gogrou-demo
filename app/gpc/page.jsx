"use client";

import { useState } from "react";
import tools from "./data";

export default function GPCPage() {
  const [query, setQuery] = useState("");
  const [diameter, setDiameter] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  const filteredTools = tools.filter((tool) => {
    const q =
      tool.name.toLowerCase().includes(query.toLowerCase()) ||
      tool.gpc_id.includes(query) ||
      tool.manufacturer.toLowerCase().includes(query.toLowerCase());

    const d =
      !diameter || tool.geometry?.diameter_mm === Number(diameter);

    const t = !type || tool.type === type;
    const s = !status || tool.status === status;

    return q && d && t && s;
  });

  return (
    <div style={{ padding: 24 }}>
      <h1>GPC – Katalog nástrojů</h1>

      {/* FILTRY */}
      <div
        style={{
          display: "flex",
          gap: 12,
          margin: "16px 0",
          flexWrap: "wrap",
        }}
      >
        <input
          placeholder="Vyhledávání (název, výrobce, GPC ID)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <input
          placeholder="Ø (např. 10.5)"
          value={diameter}
          onChange={(e) => setDiameter(e.target.value)}
        />

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Typ – vše</option>
          <option value="Vrták – monolitní TK">Vrták</option>
          <option value="Fréza – monolitní TK">Fréza</option>
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Stav – vše</option>
          <option value="active">Aktivní</option>
          <option value="phaseout">Výběhová</option>
          <option value="ended">Ukončená</option>
        </select>
      </div>

      {/* SEZNAM */}
      <div style={{ display: "grid", gap: 16 }}>
        {filteredTools.map((tool) => (
          <div
            key={tool.gpc_id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 16,
              display: "flex",
              gap: 16,
            }}
          >
            <img
              src={tool.images.main}
              alt={tool.name}
              style={{ width: 120, objectFit: "contain" }}
            />

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{tool.name}</div>
              <div>{tool.manufacturer}</div>
              <div>{tool.type}</div>
              <div>Ø {tool.geometry?.diameter_mm} mm</div>

              {/* SEMAFOR */}
              <div
                style={{
                  marginTop: 6,
                  display: "inline-block",
                  padding: "2px 10px",
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 600,
                  background:
                    tool.status === "active"
                      ? "#2ecc71"
                      : tool.status === "phaseout"
                      ? "#f1c40f"
                      : "#e74c3c",
                }}
              >
                {tool.status === "active"
                  ? "AKTIVNÍ"
                  : tool.status === "phaseout"
                  ? "VÝBĚHOVÁ"
                  : "UKONČENÁ"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
