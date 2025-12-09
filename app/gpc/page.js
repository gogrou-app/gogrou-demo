"use client";

import { useRouter } from "next/navigation";
import data from "./data";
import Image from "next/image";

export default function GpcList() {
  const router = useRouter();

  return (
    <div style={{ padding: "40px", color: "white" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>GPC – Product Center</h1>
      <p style={{ opacity: 0.7, marginBottom: "30px" }}>
        Ukázkový přehled nástrojů uložených v GPC:
      </p>

      {data.map((tool) => (
        <div
          key={tool.gpc_id}
          style={{
            background: "#111",
            padding: "20px",
            borderRadius: "14px",
            marginBottom: "25px",
            width: "460px",
          }}
        >
          <h2 style={{ fontSize: "20px", marginBottom: "10px" }}>{tool.name}</h2>

          <p><b>GTIN:</b> {tool.id}</p>
          <p><b>Výrobce:</b> {tool.manufacturer}</p>
          <p><b>Průměr:</b> {tool.diameter}</p>
          <p><b>Délka:</b> {tool.overall_length}</p>

          {/* Obrázek nástroje */}
          <div
            style={{
              marginTop: "12px",
              marginBottom: "18px",
              padding: "8px",
              border: "1px solid #333",
              width: "180px",
              height: "120px",
            }}
          >
            {tool.image ? (
              <Image
                src={tool.image}
                alt={tool.name}
                width={180}
                height={120}
                style={{ objectFit: "contain" }}
              />
            ) : (
              <div style={{ fontSize: "12px", opacity: 0.5 }}>No image</div>
            )}
          </div>

          {/* TLAČÍTKO → OPRAVENO NA gpc_id !!! */}
          <button
            onClick={() => router.push(`/gpc/${tool.gpc_id}`)}
            style={{
              padding: "10px 16px",
              background: "#333",
              color: "white",
              borderRadius: "8px",
              border: "1px solid #444",
              cursor: "pointer",
            }}
          >
            Detail →
          </button>
        </div>
      ))}
    </div>
  );
}
