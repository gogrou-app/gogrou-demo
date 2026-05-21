"use client";

import { useEffect, useRef, useState } from "react";
import tools from "../../gpc/data.js";

const ORGANIZATIONS_STORAGE_KEY = "gogrou_organizations";

const MODULE_LABELS = {
  GSS: "GSS",
  Toolshop: "Toolshop",
  Services: "Services",
  "GPC supplier data channel": "GPC datový kanál",
  "Promitea/RFQ": "Promitea RFQ",
};

const ORGANIZATION_STATUS_LABELS = {
  trial: "Zkušební režim",
  pending_payment: "Čeká na platbu",
  active: "Aktivní",
  paused: "Pozastavená",
  blocked: "Blokovaná",
  archived: "Archivovaná",
};

const readOrganizations = () => {
  try {
    const stored = localStorage.getItem(ORGANIZATIONS_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Nepodařilo se načíst gogrou_organizations.", error);
    return [];
  }
};

const readWarehouse = (organizationId) => {
  try {
    const stored = localStorage.getItem(`gss_wh_${organizationId}_MAIN`);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Nepodařilo se načíst tenant warehouse.", error);
    return [];
  }
};

const writeWarehouse = (organizationId, items) => {
  localStorage.setItem(`gss_wh_${organizationId}_MAIN`, JSON.stringify(items));
};

const labelFromMap = (labels, value) => labels[value] || value || "neuvedeno";

const formatModules = (modules) =>
  (modules && modules.length > 0 ? modules : []).map((module) => labelFromMap(MODULE_LABELS, module)).join(", ") || "žádné";

const countDmItems = (items) =>
  items.filter((item) => item.dmTracking || item.dm_mode || item.dmPieces || item.dmCode).length;

const normalizeSearch = (value) => String(value || "").toLowerCase().trim();

const formatBasicParameters = (tool) => {
  const params = [
    tool.geometry?.diameter_mm ? `D ${tool.geometry.diameter_mm} mm` : null,
    tool.geometry?.overall_length_mm ? `L ${tool.geometry.overall_length_mm} mm` : null,
    tool.geometry?.flutes ? `${tool.geometry.flutes} břity` : null,
    tool.tool_features?.coating ? tool.tool_features.coating : null,
    tool.tool_features?.material ? tool.tool_features.material : null,
  ].filter(Boolean);

  return params.join(" · ") || "základní parametry nejsou doplněné";
};

const createTenantGssItem = (tool) => ({
  id: crypto.randomUUID(),
  origin: "GPC",
  gpc_id: tool.gpc_id,
  gtin: tool.gtin || "",
  name: tool.name,
  manufacturer: tool.manufacturer || "",
  type: tool.type || "",
  tenantSettings: {
    min: "",
    max: "",
    warning: "",
    dmEnabled: false,
    sharpen: {
      enabled: false,
      cycles: "",
    },
  },
  stockSummary: {
    total: 0,
    available: 0,
    reserved: 0,
    production: 0,
    sharpening: 0,
  },
  createdAt: new Date().toISOString(),
});

export default function AppGssPage() {
  const warehouseSectionRef = useRef(null);
  const [organization, setOrganization] = useState(null);
  const [warehouseItems, setWarehouseItems] = useState([]);
  const [gpcQuery, setGpcQuery] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [warehouseHighlighted, setWarehouseHighlighted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const organizations = readOrganizations();
    const activeOrganization = organizations[0] || null;
    const organizationId = activeOrganization?.organizationId || activeOrganization?.id;

    setOrganization(activeOrganization);
    setWarehouseItems(organizationId ? readWarehouse(organizationId) : []);
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div style={wrap}>
        <div style={muted}>Načítám GSS...</div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div style={wrap}>
        <div style={box}>
          <h1 style={title}>GSS</h1>
          <div style={lead}>Nebyla nalezena žádná organizace.</div>
          <a href="/register" style={btnPrimary}>Registrovat organizaci</a>
        </div>
      </div>
    );
  }

  const organizationId = organization.organizationId || organization.id;
  const activeModules = organization.activatedModules || organization.selectedModules || [];
  const hasGssModule = activeModules.includes("GSS");
  const dmItemCount = countDmItems(warehouseItems);
  const normalizedGpcQuery = normalizeSearch(gpcQuery);
  const gpcResults = normalizedGpcQuery
    ? tools
        .filter((tool) => {
          const haystack = [
            tool.name,
            tool.gpc_id,
            tool.gtin,
            tool.manufacturer,
            tool.type,
          ].map(normalizeSearch).join(" ");

          return haystack.includes(normalizedGpcQuery);
        })
        .slice(0, 12)
    : [];

  const addGpcItemToGss = (tool) => {
    const exists = warehouseItems.some((item) => item.gpc_id === tool.gpc_id);
    if (exists) {
      setImportMessage("Položka už v tenant skladu existuje.");
      return;
    }

    const nextItems = [...warehouseItems, createTenantGssItem(tool)];
    setWarehouseItems(nextItems);
    writeWarehouse(organizationId, nextItems);
    setImportMessage("Položka byla převzata do hlavního skladu.");
  };

  const openWarehouseSection = () => {
    setWarehouseHighlighted(true);
    warehouseSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    window.setTimeout(() => {
      setWarehouseHighlighted(false);
    }, 1800);
  };

  return (
    <div style={wrap}>
      <h1 style={title}>GSS</h1>
      <div style={lead}>
        Tenant-aware GSS vstup pro aktuální organizaci. V MVP se aktivní tenant bere jako první organizace z `gogrou_organizations`.
      </div>

      <div style={box}>
        <h2 style={subtitle}>Organizace</h2>
        <div style={summaryGrid}>
          <div style={summaryItem}>
            <div style={summaryLabel}>Firma</div>
            <div style={summaryValue}>{organization.name}</div>
          </div>
          <div style={summaryItem}>
            <div style={summaryLabel}>Prefix</div>
            <div style={summaryValue}>{organization.prefix || "neuvedeno"}</div>
          </div>
          <div style={summaryItem}>
            <div style={summaryLabel}>Stav organizace</div>
            <div style={summaryValue}>{labelFromMap(ORGANIZATION_STATUS_LABELS, organization.status || "trial")}</div>
          </div>
          <div style={summaryItem}>
            <div style={summaryLabel}>Aktivní moduly</div>
            <div style={summaryValue}>{formatModules(activeModules)}</div>
          </div>
        </div>
      </div>

      {!hasGssModule ? (
        <div style={box}>
          <h2 style={subtitle}>GSS modul není pro tuto organizaci aktivní.</h2>
          <div style={muted}>
            Aktivaci modulu zatím řeší interní Gogrou správa organizací. Později bude napojená na subscription a billing.
          </div>
        </div>
      ) : (
        <>
          <div style={box}>
            <h2 style={subtitle}>Hlavní sklad organizace</h2>
            <div style={summaryGrid}>
              <div style={summaryItem}>
                <div style={summaryLabel}>Položky</div>
                <div style={summaryValue}>{warehouseItems.length}</div>
              </div>
              <div style={summaryItem}>
                <div style={summaryLabel}>DM položky</div>
                <div style={summaryValue}>{dmItemCount}</div>
              </div>
              <div style={summaryItem}>
                <div style={summaryLabel}>Min/max upozornění</div>
                <div style={summaryValue}>placeholder</div>
              </div>
              <div style={summaryItem}>
                <div style={summaryLabel}>Storage</div>
                <div style={summaryValue}>gss_wh_{organizationId}_MAIN</div>
              </div>
            </div>

            <div style={actions}>
              <button type="button" onClick={openWarehouseSection} style={btnPrimary}>Otevřít sklad</button>
              <a href="/gpc" style={btnSecondary}>Vyhledat v GPC</a>
              <button type="button" style={btnSecondary}>Přidat lokální položku</button>
            </div>
          </div>

          <div style={box}>
            <h2 style={subtitle}>Vyhledat v GPC</h2>
            <div style={hintBox}>
              Vyhledejte validovanou položku v GPC a převeďte ji do svého skladu.
            </div>
            <div style={muted}>
              GPC zůstává validovaná master databanka. Převzetím vznikne lokální tenant skladová položka v GSS.
            </div>
            <input
              value={gpcQuery}
              onChange={(event) => {
                setGpcQuery(event.target.value);
                setImportMessage("");
              }}
              placeholder="Hledat podle názvu, GPC ID, GTIN, výrobce nebo typu"
              style={input}
            />

            {importMessage ? <div style={message}>{importMessage}</div> : null}

            {normalizedGpcQuery && gpcResults.length === 0 ? (
              <div style={muted}>V GPC nebyla nalezena žádná položka.</div>
            ) : null}

            {gpcResults.length > 0 ? (
              <div style={resultList}>
                {gpcResults.map((tool) => {
                  const alreadyInWarehouse = warehouseItems.some((item) => item.gpc_id === tool.gpc_id);

                  return (
                    <div key={tool.gpc_id} style={resultItem}>
                      <div>
                        <div style={resultTitle}>{tool.name}</div>
                        <div style={meta}>
                          {tool.manufacturer || "Výrobce neuveden"} · {tool.type || "Typ neuveden"}
                        </div>
                        <div style={meta}>
                          GPC ID: {tool.gpc_id} {tool.gtin ? `· GTIN: ${tool.gtin}` : ""}
                        </div>
                        <div style={meta}>{formatBasicParameters(tool)}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => addGpcItemToGss(tool)}
                        disabled={alreadyInWarehouse}
                        style={alreadyInWarehouse ? btnDisabled : btnImport}
                      >
                        {alreadyInWarehouse ? "Již na skladu" : "Převzít do skladu"}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div ref={warehouseSectionRef} style={warehouseHighlighted ? highlightedBox : box}>
            <h2 style={subtitle}>Tenant skladové položky</h2>
            {warehouseItems.length === 0 ? (
              <div style={muted}>Tenant sklad zatím neobsahuje žádné položky převzaté z GPC.</div>
            ) : (
              <div style={resultList}>
                {warehouseItems.map((item) => (
                  <div key={item.id || item.gpc_id} style={resultItem}>
                    <div>
                      <div style={resultTitle}>{item.name || item.gpc_id}</div>
                      <div style={meta}>
                        {item.manufacturer || "Výrobce neuveden"} · {item.type || "Typ neuveden"}
                      </div>
                      <div style={meta}>
                        GPC ID: {item.gpc_id || "bez vazby"} {item.gtin ? `· GTIN: ${item.gtin}` : ""}
                      </div>
                      <div style={meta}>
                        Zásoba: celkem {item.stockSummary?.total ?? 0} · dostupné {item.stockSummary?.available ?? 0} · rezervace {item.stockSummary?.reserved ?? 0} · výroba {item.stockSummary?.production ?? 0} · broušení {item.stockSummary?.sharpening ?? 0}
                      </div>
                      <div style={meta}>
                        DM tracking: {item.tenantSettings?.dmEnabled ? "zapnuto" : "vypnuto"} · Broušení: {item.tenantSettings?.sharpen?.enabled ? "zapnuto" : "vypnuto"}
                      </div>
                      <div style={itemActions}>
                        <button type="button" style={btnSecondary}>Nastavení položky</button>
                        <button type="button" style={btnSecondary}>Naskladnit</button>
                        <button type="button" style={btnSecondary}>Otevřít detail</button>
                      </div>
                    </div>
                    <div style={stockSummary}>
                      <div>Celkem: {item.stockSummary?.total ?? 0}</div>
                      <div>Dostupné: {item.stockSummary?.available ?? 0}</div>
                      <div>Rezervace: {item.stockSummary?.reserved ?? 0}</div>
                      <div>Výroba: {item.stockSummary?.production ?? 0}</div>
                      <div>Broušení: {item.stockSummary?.sharpening ?? 0}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={box}>
            <h2 style={subtitle}>Nadnormativní zásoby</h2>
            <div style={muted}>
              Zde bude možné označit skladové položky jako nadnormativní a nabídnout je ostatním firmám.
            </div>
            <div style={offerInfo}>
              Rezervované kusy nebudou dostupné pro běžný výdej.
            </div>
            {dmItemCount > 0 ? (
              <div style={offerInfo}>
                V budoucnu bude možné rezervovat konkrétní DM kusy.
              </div>
            ) : null}
            <div style={actions}>
              <button type="button" style={btnSecondary}>Připravit nabídku</button>
            </div>
          </div>

          <div style={box}>
            <h2 style={subtitle}>Lokální nevalidované položky</h2>
            <div style={muted}>Lokální nevalidované položky budou doplněny v dalším kroku.</div>
          </div>

          <div style={box}>
            <h2 style={subtitle}>Doporučené další kroky</h2>
            <div style={steps}>
              <div>Převzít první položku z GPC</div>
              <div>Nastavit min/max</div>
              <div>Aktivovat DM tracking</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const wrap = {
  minHeight: "100vh",
  background: "#000",
  color: "#fff",
  padding: 32,
};

const title = {
  fontSize: 26,
  fontWeight: 900,
  marginBottom: 8,
};

const lead = {
  maxWidth: 860,
  fontSize: 14,
  lineHeight: 1.5,
  opacity: 0.7,
  marginBottom: 24,
};

const box = {
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 12,
  padding: 16,
  marginBottom: 20,
};

const highlightedBox = {
  ...box,
  border: "1px solid rgba(34,197,94,0.65)",
  background: "rgba(34,197,94,0.08)",
};

const subtitle = {
  fontSize: 18,
  fontWeight: 800,
  marginBottom: 12,
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 10,
};

const summaryItem = {
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  padding: 10,
};

const summaryLabel = {
  fontSize: 11,
  opacity: 0.55,
  marginBottom: 4,
};

const summaryValue = {
  fontSize: 15,
  fontWeight: 900,
};

const input = {
  width: "100%",
  padding: "9px 10px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "#000",
  color: "#fff",
  marginTop: 12,
};

const meta = {
  marginTop: 4,
  fontSize: 12,
  opacity: 0.62,
};

const message = {
  marginTop: 10,
  fontSize: 13,
  border: "1px solid rgba(34,197,94,0.35)",
  borderRadius: 8,
  padding: "9px 10px",
  background: "rgba(34,197,94,0.1)",
  color: "#d1fae5",
};

const resultList = {
  display: "grid",
  gap: 10,
  marginTop: 12,
};

const resultItem = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 12,
  alignItems: "center",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  padding: 10,
};

const resultTitle = {
  fontSize: 15,
  fontWeight: 900,
};

const stockSummary = {
  minWidth: 150,
  fontSize: 12,
  lineHeight: 1.5,
  opacity: 0.72,
};

const itemActions = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 10,
};

const actions = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 14,
};

const btnPrimary = {
  display: "inline-flex",
  padding: "10px 14px",
  borderRadius: 8,
  background: "rgba(124,58,237,0.35)",
  border: "1px solid rgba(124,58,237,0.6)",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
  textDecoration: "none",
};

const btnSecondary = {
  display: "inline-flex",
  padding: "10px 14px",
  borderRadius: 8,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.18)",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
  textDecoration: "none",
};

const btnImport = {
  display: "inline-flex",
  padding: "11px 16px",
  borderRadius: 8,
  background: "rgba(34,197,94,0.24)",
  border: "1px solid rgba(34,197,94,0.65)",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
  textDecoration: "none",
  whiteSpace: "nowrap",
};

const btnDisabled = {
  display: "inline-flex",
  padding: "11px 16px",
  borderRadius: 8,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "rgba(255,255,255,0.5)",
  fontWeight: 900,
  cursor: "not-allowed",
  textDecoration: "none",
  whiteSpace: "nowrap",
};

const steps = {
  display: "grid",
  gap: 8,
  fontSize: 14,
  opacity: 0.78,
};

const offerInfo = {
  marginTop: 8,
  fontSize: 13,
  opacity: 0.68,
};

const hintBox = {
  border: "1px solid rgba(59,130,246,0.4)",
  borderRadius: 8,
  padding: "10px 12px",
  background: "rgba(59,130,246,0.12)",
  color: "#dbeafe",
  fontSize: 13,
  fontWeight: 800,
  marginBottom: 10,
};

const muted = {
  opacity: 0.65,
};
