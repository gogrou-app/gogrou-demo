"use client";

import tools from "./data";
import Link from "next/link";
import Image from "next/image";

export default function GpcPage() {
  return (
    <div style={{ padding: "30px", color: "white" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "25px" }}>GPC – Seznam nástrojů</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {tools.map((tool) => (
          <div
            key={tool.gpc_id}
            style={{
              background: "#111",
              padding: "18px",
              borderRadius: "10px",
              border: "1px solid #333",
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            {/* OBRÁZEK */}
            <Image
              src={tool.image_main}
              alt={tool.name}
              width={120}
              height={40}
              style={{ objectFit: "contain" }}
            />

            {/* TEXT */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "18px", fontWeight: "bold" }}>{tool.name}</div>
              <div style={{ opacity: 0.7 }}>GPC ID: {tool.gpc_id}</div>
            </div>

            {/* DETAIL */}
            <Link
              href={`/gpc/${tool.gpc_id}`}
              style={{
                padding: "10px 14px",
                background: "#444",
                color: "white",
                borderRadius: "6px",
                textDecoration: "none",
                fontWeight: "bold",
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
