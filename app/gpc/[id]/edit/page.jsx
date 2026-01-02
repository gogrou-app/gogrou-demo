"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import tools from "../../data";

const STATUS = [
  { key: "active", label: "AKTIVNÍ" },
  { key: "phasing_out", label: "VÝBĚHOVÁ" },
  { key: "discontinued", label: "UKONČENÁ" },
];

export default function GpcEditPage({ params }) {
  const id = params?.id;

  const initial = useMemo(() => {
    const t = tools.find((x) => String(x.gpc_id) === String(id));
    return t || null;
  }, [id]);

  const [status, setStatus] = useState(initial?.status || "active");
  const [name, setName] = useState(initial?.name || "");
  const [type, setType] = useState(initial?.type || "");
  const [manufacturer, setManufacturer] = useState(initial?.manufacturer || "");
  const [gtin, setGtin] = useState(initial?.gtin || "");
  const [imgMain, setImgMain] = useState(initial?.images?.main || "");
  const [imgDrawing, setImgDrawing] = useState(initial?.images?.drawing || "");
  const [notes, setNotes] = useState(initial?.notes || "");

  if (!initial) {
    return (
      <div style={wrap}>
        <div style={card}>
          <Link href="/gpc" style={backBtn}>← Zpět do GPC</Link>
          <div style={{ height: 12 }} />
          <h1 style={{ margin: 0, fontSize: 22 }}>Položka nenalezena</h1>
          <div style={{ opacity: 0.7, marginTop: 8 }}>GPC_ID: {String(id)}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div style={{ maxWidth: 900, width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <Link href="/gpc" style={backBtn}>← Zpět do GPC</Link>
          <Link href={`/gpc/${initial.gpc_id}`} style={viewBtn}>DETAIL</Link>
        </div>

        <div style={card}>
          <h1 style={{ margin: 0, fontSize: 22, lineHeight: 1.15 }}>EDIT – {initial.gpc_id}</h1>
          <div style={{ opacity: 0.75, marginTop: 6 }}>{initial.manufacturer}</div>

          <div style={grid2}>
            <Field label="STATUS (semafor)">
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={select}>
                {STATUS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="GTIN">
              <input value={gtin} onChange={(e) => setGtin(e.target.value)} style={input} placeholder="např. 08419421" />
            </Field>

            <Field label="Výrobce">
              <input value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} style={input} />
            </Field>

            <Field label="Typ">
              <input value={type} onChange={(e) => setType(e.target.value)} style={input} />
            </Field>

            <Field label="Název">
              <input value={name} onChange={(e) => setName(e.target.value)} style={input} />
            </Field>

            <Field label="Obrázek MAIN (path)">
              <input value={imgMain} onChange={(e) => setImgMain(e.target.value)} style={input} placeholder="/images/gpc/{gpc_id}_main.png" />
            </Field>

            <Field label="Obrázek DRAWING (path)">
              <input value={imgDrawing} onChange={(e) => setImgDrawing(e.target.value)} style={input} placeholder="/images/gpc/{gpc_id}_drawing.png" />
            </Field>

            <Field label="Poznámka" wide>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={textarea} rows={4} />
            </Field>
          </div>

          <div style={hr} />

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              type="button"
              style={btnGhost}
              onClick={() => {
                setStatus(initial.status || "active");
                setName(initial.name || "");
                setType(initial.type || "");
                setManufacturer(initial.manufacturer || "");
                setGtin(initial.gtin || "");
                setImgMain(initial.images?.main || "");
                setImgDrawing(initial.images?.drawing || "");
                setNotes(initial.notes || "");
              }}
            >
              Reset
            </button>

            <button
              type="button"
              style={btnPrimary}
              onClick={() => {
                alert(
                  "DEMO EDIT (bez ukládání)\n\n" +
                    JSON.stringify(
                      {
                        gpc_id: initial.gpc_id,
                        status,
                        gtin: gtin || null,
                        manufacturer,
                        type,
                        name,
                        images: { main: imgMain || null, drawing: imgDrawing || null },
                        notes: notes || null,
                      },
                      null,
                      2
                    )
                );
              }}
            >
              Uložit (DEMO)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, wide }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, gridColumn: wide ? "1 / -1" : "auto" }}>
      <div style={{ fontSize: 12, opacity: 0.75, fontWeight: 800, letterSpacing: 0.4 }}>{label}</div>
      {children}
    </div>
  );
}

const wrap = {
  minHeight: "calc(100vh - 40px)",
  padding: "18px 18px 40px",
  display: "flex",
  justifyContent: "center",
};

const card = {
  borderRadius: 18,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  padding: 16,
};

const grid2 = {
  marginTop: 14,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
};

const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.25)",
  color: "white",
  outline: "none",
  fontSize: 14,
};

const textarea = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.25)",
  color: "white",
  outline: "none",
  fontSize: 14,
  resize: "vertical",
};

const select = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.25)",
  color: "white",
  outline: "none",
  fontSize: 14,
};

const hr = { height: 1, background: "rgba(255,255,255,0.08)", margin: "16px 0" };

const backBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 12px",
  borderRadius: 12,
  textDecoration: "none",
  color: "white",
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.04)",
  fontWeight: 750,
};

const viewBtn = {
  display: "inline-flex",
  alignItems: "center",
  padding: "10px 12px",
  borderRadius: 12,
  textDecoration: "none",
  color: "white",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  fontWeight: 850,
};

const btnGhost = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "white",
  fontWeight: 850,
  cursor: "pointer",
};

const btnPrimary = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.10)",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
};
