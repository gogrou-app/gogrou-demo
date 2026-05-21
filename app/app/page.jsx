"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "gogrou_organizations";

const MODULES = {
  GSS: {
    title: "GSS",
    description: "Sklad nástrojů, lokální položky, DM evidence a provozní pohyby.",
    href: "/gss",
  },
  Toolshop: {
    title: "Toolshop",
    description: "Obchodní nabídky, nákupní logika a budoucí zákaznické ceníky.",
    href: null,
  },
  Services: {
    title: "Services",
    description: "Služby jako broušení, povlakování, kalírna nebo poradenství.",
    href: null,
  },
  "GPC supplier data channel": {
    title: "GPC datový kanál",
    description: "Budoucí řízený kanál pro výrobce a dodavatele dat do GPC.",
    href: null,
  },
  "Promitea/RFQ": {
    title: "Promitea RFQ",
    description: "Poptávkové balíčky, exporty a budoucí napojení na Promitea.",
    href: null,
  },
};

const ORGANIZATION_STATUS_LABELS = {
  trial: "Zkušební režim",
  pending_payment: "Čeká na platbu",
  active: "Aktivní",
  paused: "Pozastavená",
  blocked: "Blokovaná",
  archived: "Archivovaná",
};

const BILLING_STATUS_LABELS = {
  trial: "Zkušební režim",
  active: "Aktivní",
  past_due: "Po splatnosti",
  cancelled: "Zrušeno",
};

const labelFromMap = (labels, value) => labels[value] || value || "neuvedeno";

const readOrganizations = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Nepodařilo se načíst gogrou_organizations.", error);
    return [];
  }
};

const formatDate = (value) => {
  if (!value) return "neuvedeno";
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};

const getModuleState = (organization) => {
  if (organization.status === "blocked" || organization.status === "archived") {
    return "neaktivní";
  }

  if (organization.billingStatus === "active" && organization.status === "active") {
    return "aktivní";
  }

  if (organization.billingStatus === "trial" || organization.status === "trial") {
    return "trial";
  }

  return "neaktivní";
};

export default function GogrouAppPage() {
  const [organization, setOrganization] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [placeholderModule, setPlaceholderModule] = useState("");

  useEffect(() => {
    const organizations = readOrganizations();
    setOrganization(organizations[0] || null);
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div style={wrap}>
        <div style={empty}>Načítám Gogrou...</div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div style={wrap}>
        <div style={emptyBox}>
          <h1 style={title}>Gogrou</h1>
          <div style={lead}>Nebyla nalezena žádná organizace.</div>
          <a href="/register" style={btnPrimary}>
            Registrovat organizaci
          </a>
        </div>
      </div>
    );
  }

  const activeModules = organization.activatedModules || organization.selectedModules || [];
  const moduleState = getModuleState(organization);

  return (
    <div style={wrap}>
      <h1 style={title}>Gogrou</h1>
      <div style={lead}>
        Zákaznický tenant shell. V MVP se jako aktuální tenant používá první organizace z `gogrou_organizations`.
      </div>

      <div style={box}>
        <h2 style={subtitle}>Organizace</h2>
        <div style={summaryGrid}>
          <div style={summaryItem}>
            <div style={summaryLabel}>Název</div>
            <div style={summaryValue}>{organization.name}</div>
          </div>
          <div style={summaryItem}>
            <div style={summaryLabel}>Prefix</div>
            <div style={summaryValue}>{organization.prefix || "neuvedeno"}</div>
          </div>
          <div style={summaryItem}>
            <div style={summaryLabel}>Stav organizace</div>
            <div style={summaryValue}>
              {labelFromMap(ORGANIZATION_STATUS_LABELS, organization.status || "trial")}
            </div>
          </div>
          <div style={summaryItem}>
            <div style={summaryLabel}>Billing status</div>
            <div style={summaryValue}>
              {labelFromMap(BILLING_STATUS_LABELS, organization.billingStatus || "trial")}
            </div>
          </div>
          <div style={summaryItem}>
            <div style={summaryLabel}>Datum vytvoření</div>
            <div style={summaryValue}>{formatDate(organization.createdAt)}</div>
          </div>
        </div>
      </div>

      <div style={box}>
        <h2 style={subtitle}>Aktivní moduly</h2>
        {activeModules.length === 0 ? (
          <div style={muted}>Organizace zatím nemá aktivní žádný modul.</div>
        ) : (
          <div style={moduleGrid}>
            {activeModules.map((moduleKey) => {
              const module = MODULES[moduleKey] || {
                title: moduleKey,
                description: "Modul je připravený v tenant modelu.",
                href: null,
              };

              return (
                <div key={moduleKey} style={moduleCard}>
                  <div style={moduleHeader}>
                    <h3 style={moduleTitle}>{module.title}</h3>
                    <span style={badge}>{moduleState}</span>
                  </div>
                  <div style={moduleDescription}>{module.description}</div>
                  {module.href ? (
                    <a href={module.href} style={btnSecondary}>
                      Otevřít modul
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPlaceholderModule(module.title)}
                      style={btnSecondary}
                    >
                      Otevřít modul
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {placeholderModule ? (
          <div style={placeholderInfo}>
            Modul {placeholderModule} je v MVP zatím placeholder. Routing a funkce budou doplněné později.
          </div>
        ) : null}
      </div>

      <div style={box}>
        <h2 style={subtitle}>Doporučené další kroky</h2>
        <div style={steps}>
          {activeModules.includes("GSS") ? <div>Otevřít GSS modul</div> : null}
          <div>Přidat první položku</div>
          <div>Pozvat uživatele</div>
          <div>Aktivovat billing</div>
        </div>
      </div>
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

const moduleGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};

const moduleCard = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  padding: 12,
};

const moduleHeader = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  alignItems: "center",
};

const moduleTitle = {
  fontSize: 16,
  fontWeight: 900,
  margin: 0,
};

const badge = {
  border: "1px solid rgba(34,197,94,0.35)",
  background: "rgba(34,197,94,0.12)",
  color: "rgba(187,247,208,0.95)",
  borderRadius: 999,
  padding: "4px 8px",
  fontSize: 12,
  fontWeight: 800,
};

const moduleDescription = {
  minHeight: 52,
  marginTop: 10,
  fontSize: 13,
  lineHeight: 1.45,
  opacity: 0.68,
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
  marginTop: 12,
  padding: "9px 12px",
  borderRadius: 8,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.18)",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
  textDecoration: "none",
};

const placeholderInfo = {
  marginTop: 12,
  fontSize: 13,
  opacity: 0.65,
};

const steps = {
  display: "grid",
  gap: 8,
  fontSize: 14,
  opacity: 0.78,
};

const emptyBox = {
  maxWidth: 720,
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 12,
  padding: 20,
};

const empty = {
  opacity: 0.6,
};

const muted = {
  opacity: 0.6,
};
