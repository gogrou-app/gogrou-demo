"use client";

import Link from "next/link";
import Image from "next/image";
import tools from "./data";

export default function GPC_List() {
  console.log("DEBUG: tools loaded →", tools);

  if (!Array.isArray(tools)) {
    console.error("❌ data.js neobsahuje pole nástrojů!");
  }

  return (
    <div style={{ padding: "40px", color: "white" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>
        GPC – Product Center
      </h1>
      <p style={{ opacity: 0.8, marginBottom: "30px" }}>
        Ukázkový přehled nástrojů uložených v GPC:
      </p>

      {tools.map((tool) => {
        const img = tool.image_local;

        if (!img) {
          console.warn("⚠️ Náhled obrázku chybí pro:", tool.name);
        }

        return (
          <div
            key={tool.gpc_id}
            style={{
              background: "#111",
              padding: "20px",
              marginBottom: "30px",
              borderRadius: "10px",
              width: "430px",
            }}
          >
            <h2 style={{ marginBottom: "10px" }}>{tool.name}</h2>

            <p><b>GTIN:</b> {tool.id}</p>
            <p><b>Výrobce:</b> {tool.manufacturer}</p>
            <p><b>Průměr:</b> {tool.diameter}</p>
            <p><b>Délka:</b> {tool.overall_length}</p>

            {/* Obrázek */}
            <div
              style={{
                border: "2px solid #333",
                width: "330px",
                height: "160px",
                margin: "15px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#000",
              }}
            >
              {img ? (
                <Image
                  src={img}
                  alt={tool.name}
                  width={330}
                  height={160}
                  style={{ objectFit: "contain" }}
                />
              ) : (
                <span style={{ opacity: 0.5 }}>Obrázek není k dispozici</span>
              )}
            </div>

            <Link
              href={`/gpc/${tool.gpc_id}`}
              style={{
                padding: "10px 18px",
                background: "#333",
                borderRadius: "6px",
                display: "inline-block",
                marginTop: "10px",
              }}
            >
              Detail →
            </Link>
          </div>
        );
      })}
    </div>
  );
}
