"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import tools from "../data";

const STATUS = {
  active: { label: "AKTIVNÍ", color: "#19c37d" },
  phase_out: { label: "VÝBĚHOVÁ", color: "#f4c152" },
  discontinued: { label: "UKONČENÁ", color: "#ff4d4f" },
};

function safeJsonParse(s, fallback) {
  try {
    const v = JSON.parse(s);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function normalizeStatus(v) {
  if (!v) return "active";
  if (v === "active" || v === "phase_out" || v === "discontinued") return v;
  // fallback for old labels
  const x = String(v).toLowerCase();
  if (x.includes("výběh") || x.includes("phase")) return "phase_out";
  if (x.includes("ukon") || x.includes("disc")) return "discontinued";
  return "active";
}

export default function GpcEditPage({ params }) {
  const router = useRouter();
  const id = params?.id;

  const baseTool = useMemo(() => {
    return (tools || []).find((t) => String(t.gpc_id) === String(id)) || null;
  }, [id]);

  const storageKey = useMemo(() => `gpc_edit_${id}`, [id]);

  const [form, setForm] = useState(null);
  const [rawJson, setRawJson] = useState("");
  const [mode, setMode] = useState("FORM"); // FORM | JSON
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    if (!id) return;

    const local = safeJsonParse(
      typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null,
      null
    );

    const initial = local || baseTool || {
      gpc_id: String(id),
      gtin: null,
      name: "",
      type: "",
      manufacturer: "",
      status: "active",
      images: { main: null, drawing: null },
      geometry: {
        diameter_mm: null,
        flute_length_mm: null,
        overall_length_mm: null,
        shank_diameter_mm: null,
        flutes: null,
        helix_angle_deg: null,
        point_angle_deg: null,
        corner_radius_mm: null,
        neck_length_mm: null,
      },
      cutting: {},
      tool_features: {},
      usage: {},
    };

    // normalize + migrate images field (supports old image_main/image_drawing)
    const migrated = {
      ...initial,
      status: normalizeStatus(initial.status),
      images: {
        main:
          initial?.images?.main ??
          initial?.image_main ??
          (initial?.image_main === "" ? null : initial?.image_main) ??
          null,
        drawing:
          initial?.images?.drawing ??
          initial?.image_drawing ??
          (initial?.image_drawing === "" ? null : initial?.image_drawing) ??
          null,
      },
    };

    setForm(migrated);
    setRawJson(JSON.stringify(migrated, null, 2));
  }, [id, baseTool, storageKey]);

  useEffect(() => {
    if (!form) return;
    setRawJson(JSON.stringify(form, null, 2));
  }, [form]);

  if (!id) return null;

  if (!form) {
    return (
      <div style={styles.wrap}>
        <div style={styles.header}>
          <h1 style={styles.h1}>GPC – Edit</h1>
          <div style={styles.sub}>Načítám…</div>
        </div>
      </div>
    );
  }

  const sem = STATUS[normalizeStatus(form.status)] || STATUS.active;

  function patch(p) {
    setForm((prev) => ({ ...prev, ...p }));
  }

  function patchNested(path, value) {
    setForm((prev) => {
      const next = { ...prev };
      let cur = next;
      for (let i = 0; i < path.length - 1; i++) {
        const k = path[i];
        cur[k] = { ...(cur[k] || {}) };
        cur = cur[k];
      }
      cur[path[path.length - 1]] = value;
      return next;
    });
  }

  function numberOrNull(v) {
    if (v === "" || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  function saveLocal(nextObj) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(nextObj));
      setSavedMsg("Uloženo (localStorage).");
      setTimeout(() => setSavedMsg(""), 1200);
    } catch {
      setSavedMsg("Uložení selhalo.");
      setTimeout(() => setSavedMsg(""), 1400);
    }
  }

  function onSave() {
    saveLocal(form);
  }

  function onResetToBase() {
    if (!confirm("Vrátit na původní data (a smazat lokální úpravy)?")) return;
    try {
      window.localStorage.removeItem(storageKey);
    } catch {}
    const base = baseTool || form;
    const migrated = {
      ...base,
      status: normalizeStatus(base.status),
      images: {
        main: base?.images?.main ?? base?.image_main ?? null,
        drawing: base?.images?.drawing ?? base?.image_drawing ?? null,
      },
    };
    setForm(migrated);
    setRawJson(JSON.stringify(migrated, null, 2));
    setSavedMsg("Reset hotový.");
    setTimeout(() => setSavedMsg(""), 1200);
  }

  function applyJson() {
    const parsed = safeJsonParse(rawJson, null);
    if (!parsed || typeof parsed !== "object") {
      setSavedMsg("JSON je neplatný.");
      setTimeout(() => setSavedMsg(""), 1400);
      return;
    }
    const next = {
      ...parsed,
      gpc_id: parsed.gpc_id ?? form.gpc_id ?? String(id),
      status: normalizeStatus(parsed.status),
      images: {
        main: parsed?.images?.main ?? parsed?.image_main ?? form?.images?.main ?? null,
        drawing: parsed?.images?.drawing ?? parsed?.image_drawing ?? form?.images?.drawing ?? null,
      },
    };
    setForm(next);
    saveLocal(next);
  }

  const mainImg = form?.images?.main || null;
  const drawImg = form?.images?.drawing || null;

  return (
    <div style={styles.wrap}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.h1}>GPC – Edit</h1>
          <div style={styles.sub}>
            {form.gpc_id}{" "}
            <span style={{ ...styles.badge, background: sem.color }}>{sem.label}</span>
          </div>
        </div>

        <div style={styles.actions}>
          <button style={styles.btn} onClick={() => router.push(`/gpc/${id}`)}>
            ← Zpět na detail
          </button>
          <button style={styles.btnPrimary} onClick={onSave}>
            Uložit
          </button>
          <button style={styles.btnDanger} onClick={onResetToBase}>
            Reset
          </button>
        </div>
      </div>

      <div style={styles.modeRow}>
        <button
          style={mode === "FORM" ? styles.tabActive : styles.tab}
          onClick={() => setMode("FORM")}
        >
          FORM
        </button>
        <button
          style={mode === "JSON" ? styles.tabActive : styles.tab}
          onClick={() => setMode("JSON")}
        >
          JSON
        </button>
        {savedMsg ? <div style={styles.toast}>{savedMsg}</div> : <div style={{ flex: 1 }} />}
      </div>

      {mode === "FORM" ? (
        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>STATUS (semafor)</div>
            <div style={styles.row}>
              <button
                style={{
                  ...styles.pill,
                  borderColor: STATUS.active.color,
                  background: normalizeStatus(form.status) === "active" ? "rgba(25,195,125,.15)" : "transparent",
                }}
                onClick={() => patch({ status: "active" })}
              >
                AKTIVNÍ
              </button>
              <button
                style={{
                  ...styles.pill,
                  borderColor: STATUS.phase_out.color,
                  background:
                    normalizeStatus(form.status) === "phase_out" ? "rgba(244,193,82,.15)" : "transparent",
                }}
                onClick={() => patch({ status: "phase_out" })}
              >
                VÝBĚHOVÁ
              </button>
              <button
                style={{
                  ...styles.pill,
                  borderColor: STATUS.discontinued.color,
                  background:
                    normalizeStatus(form.status) === "discontinued" ? "rgba(255,77,79,.15)" : "transparent",
                }}
                onClick={() => patch({ status: "discontinued" })}
              >
                UKONČENÁ
              </button>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTitle}>Základ</div>

            <label style={styles.label}>Název</label>
            <input
              style={styles.input}
              value={form.name ?? ""}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="Název nástroje"
            />

            <div style={styles.twoCol}>
              <div>
                <label style={styles.label}>Výrobce</label>
                <input
                  style={styles.input}
                  value={form.manufacturer ?? ""}
                  onChange={(e) => patch({ manufacturer: e.target.value })}
                  placeholder="Sandvik / Walter / …"
                />
              </div>
              <div>
                <label style={styles.label}>Typ (text)</label>
                <input
                  style={styles.input}
                  value={form.type ?? ""}
                  onChange={(e) => patch({ type: e.target.value })}
                  placeholder="Vrták / Fréza / …"
                />
              </div>
            </div>

            <div style={styles.twoCol}>
              <div>
                <label style={styles.label}>GTIN</label>
                <input
                  style={styles.input}
                  value={form.gtin ?? ""}
                  onChange={(e) => patch({ gtin: e.target.value || null })}
                  placeholder="např. 08419421"
                />
              </div>
              <div>
                <label style={styles.label}>GPC_ID (read-only)</label>
                <input style={{ ...styles.input, opacity: 0.7 }} value={form.gpc_id ?? ""} readOnly />
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTitle}>Obrázky (paths)</div>

            <label style={styles.label}>images.main</label>
            <input
              style={styles.input}
              value={form?.images?.main ?? ""}
              onChange={(e) => patchNested(["images", "main"], e.target.value || null)}
              placeholder="/images/gpc/{gpc_id}_main.png"
            />

            <label style={styles.label}>images.drawing</label>
            <input
              style={styles.input}
              value={form?.images?.drawing ?? ""}
              onChange={(e) => patchNested(["images", "drawing"], e.target.value || null)}
              placeholder="/images/gpc/{gpc_id}_drawing.png"
            />

            <div style={styles.imgRow}>
              <div style={styles.imgBox}>
                <div style={styles.imgLabel}>MAIN</div>
                {mainImg ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mainImg} alt="main" style={styles.img} />
                ) : (
                  <div style={styles.imgEmpty}>—</div>
                )}
              </div>
              <div style={styles.imgBox}>
                <div style={styles.imgLabel}>DRAWING</div>
                {drawImg ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={drawImg} alt="drawing" style={styles.img} />
                ) : (
                  <div style={styles.imgEmpty}>—</div>
                )}
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTitle}>Geometrie</div>

            <div style={styles.twoCol}>
              <div>
                <label style={styles.label}>Ø (mm)</label>
                <input
                  style={styles.input}
                  value={form?.geometry?.diameter_mm ?? ""}
                  onChange={(e) => patchNested(["geometry", "diameter_mm"], numberOrNull(e.target.value))}
                  placeholder="např. 10.5"
                />
              </div>
              <div>
                <label style={styles.label}>Počet zubů</label>
                <input
                  style={styles.input}
                  value={form?.geometry?.flutes ?? ""}
                  onChange={(e) => patchNested(["geometry", "flutes"], numberOrNull(e.target.value))}
                  placeholder="např. 2 / 4 / 6"
                />
              </div>
            </div>

            <div style={styles.twoCol}>
              <div>
                <label style={styles.label}>LC (délka břitu, mm)</label>
                <input
                  style={styles.input}
                  value={form?.geometry?.flute_length_mm ?? ""}
                  onChange={(e) => patchNested(["geometry", "flute_length_mm"], numberOrNull(e.target.value))}
                  placeholder="např. 56"
                />
              </div>
              <div>
                <label style={styles.label}>OAL (celková délka, mm)</label>
                <input
                  style={styles.input}
                  value={form?.geometry?.overall_length_mm ?? ""}
                  onChange={(e) => patchNested(["geometry", "overall_length_mm"], numberOrNull(e.target.value))}
                  placeholder="např. 118"
                />
              </div>
            </div>

            <div style={styles.twoCol}>
              <div>
                <label style={styles.label}>Ø stopky (mm)</label>
                <input
                  style={styles.input}
                  value={form?.geometry?.shank_diameter_mm ?? ""}
                  onChange={(e) => patchNested(["geometry", "shank_diameter_mm"], numberOrNull(e.target.value))}
                  placeholder="např. 12"
                />
              </div>
              <div>
                <label style={styles.label}>R (mm)</label>
                <input
                  style={styles.input}
                  value={form?.geometry?.corner_radius_mm ?? ""}
                  onChange={(e) => patchNested(["geometry", "corner_radius_mm"], numberOrNull(e.target.value))}
                  placeholder="např. 0.8"
                />
              </div>
            </div>

            <div style={styles.twoCol}>
              <div>
                <label style={styles.label}>Úhel šroubovice (°)</label>
                <input
                  style={styles.input}
                  value={form?.geometry?.helix_angle_deg ?? ""}
                  onChange={(e) => patchNested(["geometry", "helix_angle_deg"], numberOrNull(e.target.value))}
                  placeholder="např. 30"
                />
              </div>
              <div>
                <label style={styles.label}>Úhel hrotu (°)</label>
                <input
                  style={styles.input}
                  value={form?.geometry?.point_angle_deg ?? ""}
                  onChange={(e) => patchNested(["geometry", "point_angle_deg"], numberOrNull(e.target.value))}
                  placeholder="např. 140"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.card}>
          <div style={styles.cardTitle}>JSON</div>
          <textarea
            style={styles.textarea}
            value={rawJson}
            onChange={(e) => setRawJson(e.target.value)}
            spellCheck={false}
          />
          <div style={styles.actionsRight}>
            <button style={styles.btnPrimary} onClick={applyJson}>
              Použít + uložit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    padding: 28,
    color: "#fff",
    background: "#000",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  headerRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 12,
  },
  h1: { margin: 0, fontSize: 34, fontWeight: 800, letterSpacing: 0.3 },
  sub: { marginTop: 6, color: "rgba(255,255,255,.7)" },
  badge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    marginLeft: 10,
    fontSize: 12,
    fontWeight: 800,
    color: "#000",
  },
  actions: { display: "flex", gap: 10, flexWrap: "wrap" },
  actionsRight: { display: "flex", justifyContent: "flex-end", marginTop: 10, gap: 10 },
  btn: {
    background: "rgba(255,255,255,.08)",
    border: "1px solid rgba(255,255,255,.12)",
    color: "#fff",
    padding: "10px 12px",
    borderRadius: 10,
    cursor: "pointer",
  },
  btnPrimary: {
    background: "rgba(25,195,125,.2)",
    border: "1px solid rgba(25,195,125,.4)",
    color: "#fff",
    padding: "10px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 800,
  },
  btnDanger: {
    background: "rgba(255,77,79,.15)",
    border: "1px solid rgba(255,77,79,.4)",
    color: "#fff",
    padding: "10px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 800,
  },
  modeRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    margin: "10px 0 16px",
  },
  tab: {
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.12)",
    color: "rgba(255,255,255,.85)",
    padding: "8px 12px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 800,
  },
  tabActive: {
    background: "rgba(255,255,255,.12)",
    border: "1px solid rgba(255,255,255,.22)",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 800,
  },
  toast: {
    marginLeft: 10,
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,.1)",
    border: "1px solid rgba(255,255,255,.14)",
    color: "rgba(255,255,255,.9)",
    fontWeight: 700,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 14,
    maxWidth: 980,
  },
  card: {
    background: "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03))",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 18,
    padding: 16,
    maxWidth: 980,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 900,
    letterSpacing: 0.6,
    color: "rgba(255,255,255,.85)",
    marginBottom: 10,
  },
  row: { display: "flex", gap: 10, flexWrap: "wrap" },
  pill: {
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,.18)",
    background: "transparent",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },
  label: { display: "block", marginTop: 10, marginBottom: 6, color: "rgba(255,255,255,.75)", fontSize: 12 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(0,0,0,.35)",
    color: "#fff",
    outline: "none",
  },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  imgRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 },
  imgBox: {
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,.12)",
    overflow: "hidden",
    background: "rgba(0,0,0,.25)",
  },
  imgLabel: {
    padding: "8px 10px",
    borderBottom: "1px solid rgba(255,255,255,.12)",
    fontSize: 12,
    color: "rgba(255,255,255,.75)",
    fontWeight: 800,
  },
  img: { width: "100%", height: 220, objectFit: "contain", display: "block", background: "#000" },
  imgEmpty: { height: 220, display: "grid", placeItems: "center", color: "rgba(255,255,255,.35)" },
  textarea: {
    width: "100%",
    minHeight: 520,
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(0,0,0,.45)",
    color: "#fff",
    outline: "none",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 12,
    lineHeight: 1.4,
  },
};
