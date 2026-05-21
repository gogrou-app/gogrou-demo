"use client";

import { useEffect, useState } from "react";

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

const labelFromMap = (labels, value) => labels[value] || value || "neuvedeno";

const formatModules = (modules) =>
  (modules && modules.length > 0 ? modules : []).map((module) => labelFromMap(MODULE_LABELS, module)).join(", ") || "žádné";

const countDmItems = (items) =>
  items.filter((item) => item.dmTracking || item.dm_mode || item.dmPieces || item.dmCode).length;

export default function AppGssPage() {
  const [organization, setOrganization] = useState(null);
  const [warehouseItems, setWarehouseItems] = useState([]);
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
              <a href={`/gss/company/${organizationId}`} style={btnPrimary}>Otevřít sklad</a>
              <a href="/gpc" style={btnSecondary}>Vyhledat v GPC</a>
              <button type="button" style={btnSecondary}>Přidat lokální položku</button>
            </div>
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

const muted = {
  opacity: 0.65,
};
