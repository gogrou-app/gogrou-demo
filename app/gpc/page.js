"use client";

import Image from "next/image";
import Link from "next/link";
import tools from "./data";

export default function GPC_List() {
  return (
    <div style={{ padding: "40px", color: "white" }}>
      
      <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>GPC – Product Center</h1>
      <p style={{ marginBottom: "30px", opacity: 0.8 }}>
        Ukázkový přehled nástrojů uložených v GPC:
      </p>

      {tools.map((tool) => {
        const safeName = tool.safe_name || tool.name.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase();

        const imgPath = `/images/tools/${safeName}_main.png`;

        return (
          <div
            key={tool.gpc_id}
            style={{
              background: "#111",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "30px",
              width: "480px",
            }}
          >
            <h2 style={{ marginBottom: "10px" }}>{tool.name}</h2>

            <p><b>GTIN:</b> {tool.id}</p>
            <p><b>Výrobce:</b> {tool.manufacturer}</p>
            <p><b>Průměr:</b> {tool.diameter}</p>
            <p><b>Délka:</b> {tool.overall_length}</p>

            {/* OBRÁZEK */}
            <div
              style={{
                width: "260px",
                height: "120px",
                border: "1px solid #333",
                marginTop: "15px",
                marginBottom: "15px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <Image
                src={imgPath}
                alt={tool.name}
                width={260}
                height={120}
                style={{ objectFit: "contain" }}
                onError={() =>
                  console.warn("❗ Obrázek nenalezen:", imgPath)
                }
              />
            </div>

            <Link href={`/gpc/${tool.gpc_id}`}>
              <button
                style={{
                  background: "#333",
                  color: "white",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #444",
                  cursor: "pointer",
                }}
              >
                Detail →
              </button>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
