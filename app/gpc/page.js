"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { tools } from "./data";

export default function GpcList() {

  // --------------------------------------------------------
  // 🔍 LOGOVÁNÍ, ABYCHOM VIDĚLI CO SE DĚJE V PRODUKCI
  // --------------------------------------------------------
  useEffect(() => {
    console.log("📦 GPC – načteno", tools.length, "nástrojů");
    tools.forEach((t) => {
      console.log("👉 Nástroj:", t.gpc_id, t.name, "image:", t.image);
    });
  }, []);

  return (
    <div style={{ padding: "40px", color: "white" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>GPC – Product Center</h1>
      <p style={{ opacity: 0.7, marginBottom: "30px" }}>
        Ukázkový přehled nástrojů uložených v GPC:
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "30px", maxWidth: "600px" }}>
        {tools.map((tool) => (
          <div
            key={tool.gpc_id}
            style={{
              background: "#111",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #333",
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
                width: "200px",
                height: "100px",
                marginTop: "15px",
                border: "1px solid #333",
                background: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                src={tool.image}
                width={200}
                height={100}
                alt={tool.name}
                onError={(e) => {
                  console.log("❌ Obrázek se nenačetl →", tool.gpc_id, tool.image);
                  e.target.src = "/images/fallback.png";
                }}
                style={{ objectFit: "contain" }}
              />
            </div>

            <Link
              href={`/gpc/${tool.gpc_id}`}
              style={{
                display: "inline-block",
                marginTop: "15px",
                padding: "10px 16px",
                borderRadius: "8px",
                border: "1px solid #555",
                textDecoration: "none",
                color: "white",
                background: "#333",
              }}
            >
              Detail →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
