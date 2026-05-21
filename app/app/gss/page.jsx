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
  items.filter((item) => item.tenantSettings?.dmEnabled || item.dmTracking || item.dm_mode || item.dmPieces || item.dmCode).length;

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

const defaultLocalItemForm = {
  name: "",
  manufacturer: "",
  type: "",
  gtin: "",
  internalCode: "",
  dimensionNote: "",
  diameter: "",
  length: "",
  material: "",
  insertShape: "",
  dmEnabled: false,
  sharpenEnabled: false,
};

const isDrillOrMill = (type) => {
  const normalized = normalizeSearch(type);
  return normalized.includes("vrtak") || normalized.includes("vrták") || normalized.includes("freza") || normalized.includes("fréza") || normalized.includes("drill") || normalized.includes("mill");
};

const isInsert = (type) => {
  const normalized = normalizeSearch(type);
  return normalized.includes("britova") || normalized.includes("břitová") || normalized.includes("desticka") || normalized.includes("destička") || normalized.includes("insert");
};

const validateLocalItemForm = (form) => {
  const hasCommonRequired = form.name.trim() && form.type.trim();
  const hasIdentifier = form.gtin.trim() || form.internalCode.trim() || form.dimensionNote.trim();

  if (!hasCommonRequired || !hasIdentifier) {
    return false;
  }

  if (isDrillOrMill(form.type)) {
    return Boolean(form.diameter.trim() && (form.length.trim() || form.dimensionNote.trim()) && form.material.trim());
  }

  if (isInsert(form.type)) {
    return Boolean(form.insertShape.trim() && form.dimensionNote.trim() && form.material.trim());
  }

  return true;
};

const createLocalTenantGssItem = (form) => ({
  id: crypto.randomUUID(),
  origin: "LOCAL",
  validationStatus: "unvalidated",
  tenantOnly: true,
  gpc_id: "",
  gtin: form.gtin.trim(),
  name: form.name.trim(),
  manufacturer: form.manufacturer.trim() || "neznámý",
  type: form.type.trim(),
  localFields: {
    internalCode: form.internalCode.trim(),
    dimensionNote: form.dimensionNote.trim(),
    diameter: form.diameter.trim(),
    length: form.length.trim(),
    material: form.material.trim() || "neznámý",
    insertShape: form.insertShape.trim(),
  },
  tenantSettings: {
    min: "",
    max: "",
    warning: "",
    dmEnabled: form.dmEnabled,
    sharpen: {
      enabled: form.sharpenEnabled,
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
  const localItemSectionRef = useRef(null);
  const [organization, setOrganization] = useState(null);
  const [warehouseItems, setWarehouseItems] = useState([]);
  const [gpcQuery, setGpcQuery] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [showLocalItemForm, setShowLocalItemForm] = useState(false);
  const [localItemForm, setLocalItemForm] = useState(defaultLocalItemForm);
  const [localItemMessage, setLocalItemMessage] = useState("");
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

  const openLocalItemForm = () => {
    setShowLocalItemForm(true);
    window.setTimeout(() => {
      localItemSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const updateLocalItemForm = (field, value) => {
    setLocalItemForm((current) => ({
      ...current,
      [field]: value,
    }));
    setLocalItemMessage("");
  };

  const addLocalItemToGss = (event) => {
    event.preventDefault();

    if (!validateLocalItemForm(localItemForm)) {
      setLocalItemMessage("Pro založení lokální položky je nutné doplnit minimální povinné údaje.");
      return;
    }

    const nextItems = [...warehouseItems, createLocalTenantGssItem(localItemForm)];
    setWarehouseItems(nextItems);
    writeWarehouse(organizationId, nextItems);
    setLocalItemForm(defaultLocalItemForm);
    setLocalItemMessage("Lokální nevalidovaná položka byla založena v tenant skladu.");
    setShowLocalItemForm(false);
    openWarehouseSection();
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
              <button type="button" onClick={openLocalItemForm} style={btnSecondary}>Přidat lokální položku</button>
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
                      {item.origin === "LOCAL" ? (
                        <div style={badgeWarning}>Lokální nevalidovaná položka</div>
                      ) : null}
                      <div style={meta}>
                        {item.manufacturer || "Výrobce neuveden"} · {item.type || "Typ neuveden"}
                      </div>
                      <div style={meta}>
                        {item.origin === "LOCAL" ? `Interní kód: ${item.localFields?.internalCode || "neuveden"}` : `GPC ID: ${item.gpc_id || "bez vazby"}`} {item.gtin ? `· GTIN: ${item.gtin}` : ""}
                      </div>
                      {item.origin === "LOCAL" ? (
                        <div style={meta}>
                          Rozměr / poznámka: {item.localFields?.dimensionNote || "neuvedeno"} · Materiál: {item.localFields?.material || "neznámý"}
                        </div>
                      ) : null}
                      {item.validationStatus === "unvalidated" ? (
                        <div style={meta}>Validation: unvalidated · tenantOnly: ano</div>
                      ) : null}
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
            <div style={hintBox}>
              Lokální položky slouží pro rychlé zavedení položek, které ještě nejsou validované v GPC.
            </div>
            <div style={muted}>
              Lokální položka existuje pouze v tenant GSS, nemění GPC a funguje okamžitě pro provoz firmy.
            </div>
            <div style={offerInfo}>
              Později bude možné odeslat položku k validaci, propojit ji s GPC a doplnit technická data a výrobce.
            </div>
            <div style={actions}>
              <button type="button" onClick={openLocalItemForm} style={btnPrimary}>Přidat lokální položku</button>
            </div>

            {showLocalItemForm ? (
              <form ref={localItemSectionRef} onSubmit={addLocalItemToGss} style={formBox}>
                <div style={formGrid}>
                  <label style={fieldLabel}>
                    Název položky
                    <input
                      value={localItemForm.name}
                      onChange={(event) => updateLocalItemForm("name", event.target.value)}
                      style={input}
                    />
                  </label>
                  <label style={fieldLabel}>
                    Výrobce
                    <input
                      value={localItemForm.manufacturer}
                      onChange={(event) => updateLocalItemForm("manufacturer", event.target.value)}
                      placeholder="neznámý, pokud není známý"
                      style={input}
                    />
                  </label>
                  <label style={fieldLabel}>
                    Typ položky
                    <select
                      value={localItemForm.type}
                      onChange={(event) => updateLocalItemForm("type", event.target.value)}
                      style={input}
                    >
                      <option value="">Vyberte typ</option>
                      <option value="Vrták">Vrták</option>
                      <option value="Fréza">Fréza</option>
                      <option value="Břitová destička">Břitová destička</option>
                      <option value="Ostatní">Ostatní</option>
                    </select>
                  </label>
                  <label style={fieldLabel}>
                    GTIN volitelné
                    <input
                      value={localItemForm.gtin}
                      onChange={(event) => updateLocalItemForm("gtin", event.target.value)}
                      style={input}
                    />
                  </label>
                  <label style={fieldLabel}>
                    Interní kód zákazníka
                    <input
                      value={localItemForm.internalCode}
                      onChange={(event) => updateLocalItemForm("internalCode", event.target.value)}
                      style={input}
                    />
                  </label>
                  <label style={fieldLabel}>
                    Rozměr / poznámka
                    <input
                      value={localItemForm.dimensionNote}
                      onChange={(event) => updateLocalItemForm("dimensionNote", event.target.value)}
                      style={input}
                    />
                  </label>
                  <label style={fieldLabel}>
                    Průměr
                    <input
                      value={localItemForm.diameter}
                      onChange={(event) => updateLocalItemForm("diameter", event.target.value)}
                      placeholder="povinné pro vrták / frézu"
                      style={input}
                    />
                  </label>
                  <label style={fieldLabel}>
                    Délka
                    <input
                      value={localItemForm.length}
                      onChange={(event) => updateLocalItemForm("length", event.target.value)}
                      placeholder="nebo poznámka k rozměru"
                      style={input}
                    />
                  </label>
                  <label style={fieldLabel}>
                    Materiál
                    <input
                      value={localItemForm.material}
                      onChange={(event) => updateLocalItemForm("material", event.target.value)}
                      placeholder="neznámý, pokud není známý"
                      style={input}
                    />
                  </label>
                  <label style={fieldLabel}>
                    Tvar / typ destičky
                    <input
                      value={localItemForm.insertShape}
                      onChange={(event) => updateLocalItemForm("insertShape", event.target.value)}
                      placeholder="povinné pro břitovou destičku"
                      style={input}
                    />
                  </label>
                </div>

                <div style={checkRow}>
                  <label style={checkLabel}>
                    <input
                      type="checkbox"
                      checked={localItemForm.dmEnabled}
                      onChange={(event) => updateLocalItemForm("dmEnabled", event.target.checked)}
                    />
                    DM tracking
                  </label>
                  <label style={checkLabel}>
                    <input
                      type="checkbox"
                      checked={localItemForm.sharpenEnabled}
                      onChange={(event) => updateLocalItemForm("sharpenEnabled", event.target.checked)}
                    />
                    Brousitelná
                  </label>
                </div>

                <div style={muted}>
                  Povinně: název, typ, výrobce nebo neznámý a alespoň jeden identifikátor: GTIN, interní kód nebo rozměr / poznámka.
                </div>
                {localItemMessage ? <div style={localItemMessage.includes("nutné") ? errorMessage : message}>{localItemMessage}</div> : null}

                <div style={actions}>
                  <button type="submit" style={btnImport}>Vytvořit lokální položku</button>
                  <button type="button" onClick={() => setShowLocalItemForm(false)} style={btnSecondary}>Zavřít</button>
                </div>
              </form>
            ) : localItemMessage ? (
              <div style={message}>{localItemMessage}</div>
            ) : null}
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

const errorMessage = {
  marginTop: 10,
  fontSize: 13,
  border: "1px solid rgba(239,68,68,0.45)",
  borderRadius: 8,
  padding: "9px 10px",
  background: "rgba(239,68,68,0.12)",
  color: "#fecaca",
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

const formBox = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  padding: 12,
  marginTop: 14,
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 10,
  marginBottom: 12,
};

const fieldLabel = {
  display: "grid",
  gap: 6,
  fontSize: 12,
  fontWeight: 800,
  color: "rgba(255,255,255,0.82)",
};

const checkRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: 14,
  marginBottom: 12,
};

const checkLabel = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  fontSize: 13,
  fontWeight: 800,
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

const badgeWarning = {
  display: "inline-flex",
  marginTop: 6,
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid rgba(245,158,11,0.45)",
  background: "rgba(245,158,11,0.12)",
  color: "#fde68a",
  fontSize: 11,
  fontWeight: 900,
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
