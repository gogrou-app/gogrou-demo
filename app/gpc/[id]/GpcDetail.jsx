// app/gpc/[id]/GpcDetail.jsx

import React from "react";

export default function GpcDetail({ tool }) {
  if (!tool) return null;

  const {
    name,
    manufacturer,
    toolType,
    gpcId,
    status, // active | phase_out | discontinued
    replacementGpcId,
    description,
    keyParameters,
    extendedParameters,
    compatibility,
    documents,
    identifiers,
    metadata
  } = tool;

  return (
    <div className="gpc-detail">

      {/* ================= HEADER ================= */}
      <header className="gpc-header">
        <div className="gpc-header-main">
          <h1>{name}</h1>
          <div className="gpc-subtitle">
            {manufacturer} · {toolType} · {gpcId}
          </div>
        </div>

        <div className="gpc-status">
          <StatusDot status={status} />
          {status === "phase_out" && replacementGpcId && (
            <div className="gpc-replacement">
              Nahrazeno položkou: <strong>{replacementGpcId}</strong>
            </div>
          )}
        </div>
      </header>

      {/* ============== BASIC DESCRIPTION ============== */}
      <section className="gpc-section">
        <h2>Základní popis</h2>
        <p>{description}</p>
      </section>

      {/* ============== KEY PARAMETERS ============== */}
      <section className="gpc-section">
        <h2>Klíčové parametry</h2>
        <div className="gpc-grid">
          {keyParameters.map((p) => (
            <ParamCard key={p.code} param={p} />
          ))}
        </div>
      </section>

      {/* ============== EXTENDED PARAMETERS ============== */}
      <section className="gpc-section">
        <h2>Technické detaily</h2>
        <div className="gpc-table">
          {extendedParameters.map((p) => (
            <ParamRow key={p.code} param={p} />
          ))}
        </div>
      </section>

      {/* ============== COMPATIBILITY ============== */}
      <section className="gpc-section">
        <h2>Materiálová a aplikační kompatibilita</h2>
        <ul>
          {compatibility.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>

      {/* ============== DOCUMENTS ============== */}
      <section className="gpc-section">
        <h2>Dokumentace</h2>
        <ul>
          {documents.map((d) => (
            <li key={d.url}>
              <a href={d.url} target="_blank" rel="noreferrer">
                {d.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* ============== IDENTIFIERS ============== */}
      <section className="gpc-section">
        <h2>Obchodní identita</h2>
        <ul>
          {identifiers.map((i) => (
            <li key={i.type}>
              {i.type}: {i.value}
            </li>
          ))}
        </ul>
      </section>

      {/* ============== METADATA ============== */}
      <section className="gpc-section muted">
        <h2>Systémová metadata</h2>
        <ul>
          <li>Zdroj dat: {metadata.source}</li>
          <li>Validace: {metadata.validated ? "ANO" : "NE"}</li>
          <li>Poslední aktualizace: {metadata.updatedAt}</li>
        </ul>
      </section>
    </div>
  );
}

/* ================= SUBCOMPONENTS ================= */

function StatusDot({ status }) {
  const color =
    status === "active"
      ? "green"
      : status === "phase_out"
      ? "yellow"
      : "red";

  const label =
    status === "active"
      ? "Aktivní"
      : status === "phase_out"
      ? "Výběhová"
      : "Ukončená";

  return (
    <div className={`status-dot ${color}`} title={label}>
      ● {label}
    </div>
  );
}

function ParamCard({ param }) {
  return (
    <div className="param-card">
      <div className="param-label">{param.label}</div>
      <div className="param-value">{param.value}</div>
      <div className="param-code">{param.code}</div>
    </div>
  );
}

function ParamRow({ param }) {
  return (
    <div className="param-row">
      <div className="param-label">{param.label}</div>
      <div className="param-value">{param.value}</div>
      <div className="param-code">{param.code}</div>
    </div>
  );
}
