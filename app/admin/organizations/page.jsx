"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "gogrou_organizations";
const ACTIVE_ORGANIZATION_STORAGE_KEY = "activeOrganizationId";

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

const BILLING_STATUS_LABELS = {
  trial: "Zkušební režim",
  active: "Aktivní",
  past_due: "Po splatnosti",
  cancelled: "Zrušeno",
};

const ORGANIZATION_STATUS_OPTIONS = [
  "trial",
  "pending_payment",
  "active",
  "paused",
  "blocked",
  "archived",
];

const BILLING_STATUS_OPTIONS = ["trial", "active", "past_due", "cancelled"];

const COMPANY_TYPE_OPTIONS = [
  { value: "manufacturing_company", label: "Výrobní firma" },
  { value: "tool_manufacturer", label: "Výrobce nástrojů" },
  { value: "tool_supplier", label: "Dodavatel nástrojů" },
  { value: "grinding_service", label: "Brusírna" },
  { value: "coating_service", label: "Povlakovna" },
  { value: "heat_treatment_service", label: "Kalírna / tepelné zpracování" },
  { value: "trading_company", label: "Obchodní firma" },
  { value: "consulting", label: "Poradenství" },
  { value: "other", label: "Ostatní" },
];

const MODULE_OPTIONS = [
  { value: "GSS", label: "GSS" },
  { value: "Promitea/RFQ", label: "Promitea / RFQ" },
  { value: "GPC supplier data channel", label: "GPC datový kanál" },
  { value: "Toolshop", label: "Toolshop" },
  { value: "Services", label: "Služby" },
];

const defaultNewOrganizationForm = {
  name: "",
  prefix: "",
  ico: "",
  companyType: "manufacturing_company",
  modules: ["GSS"],
};

const labelFromMap = (labels, value) => labels[value] || value || "neuvedeno";

const formatModules = (modules) =>
  (modules && modules.length > 0 ? modules : []).map((module) => labelFromMap(MODULE_LABELS, module)).join(", ") || "žádné";

const formatDate = (value) => {
  if (!value) return "neuvedeno";
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};

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

const writeOrganizations = (organizations) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(organizations));
};

const toLookupString = (value) => String(value ?? "").trim();

const getOrganizationRouteId = (organization) =>
  toLookupString(organization?.id) || toLookupString(organization?.organizationId);

export default function OrganizationsAdminPage() {
  const [organizations, setOrganizations] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newOrganizationForm, setNewOrganizationForm] = useState(defaultNewOrganizationForm);
  const [createMessage, setCreateMessage] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setOrganizations(readOrganizations());
    setLoaded(true);
  }, []);

  const updateOrganization = (organizationId, field, value) => {
    setOrganizations((prev) => {
      const nextOrganizations = prev.map((organization) =>
        organization.organizationId === organizationId || organization.id === organizationId
          ? { ...organization, [field]: value }
          : organization
      );
      writeOrganizations(nextOrganizations);
      return nextOrganizations;
    });
  };

  const openOrganizationGss = (organizationId) => {
    if (!organizationId) return;
    localStorage.setItem(ACTIVE_ORGANIZATION_STORAGE_KEY, organizationId);
    window.location.href = "/app/gss";
  };

  const updateNewOrganizationForm = (field, value) => {
    setNewOrganizationForm((current) => ({
      ...current,
      [field]: value,
    }));
    setCreateMessage("");
  };

  const toggleNewOrganizationModule = (module) => {
    setNewOrganizationForm((current) => {
      const modules = current.modules.includes(module)
        ? current.modules.filter((item) => item !== module)
        : [...current.modules, module];

      return {
        ...current,
        modules,
      };
    });
    setCreateMessage("");
  };

  const openCreateForm = () => {
    setShowCreateForm(true);
    setCreateMessage("");
  };

  const createOrganization = (event) => {
    event.preventDefault();

    const name = newOrganizationForm.name.trim();
    const prefix = newOrganizationForm.prefix.trim().toUpperCase();
    const ico = newOrganizationForm.ico.trim();
    const modules = newOrganizationForm.modules.length > 0 ? newOrganizationForm.modules : ["GSS"];

    if (!name || !prefix) {
      setCreateMessage("Doplňte název firmy a prefix.");
      return;
    }

    const now = new Date().toISOString();
    const organizationId = crypto.randomUUID();
    const organization = {
      id: organizationId,
      organizationId,
      name,
      prefix,
      ico,
      country: "CZ",
      language: "cs",
      companyTypes: [newOrganizationForm.companyType],
      selectedModules: modules,
      activatedModules: modules,
      status: "trial",
      billingStatus: "trial",
      subscriptionPlan: "trial_mvp",
      paymentProvider: "",
      paymentConfirmedAt: "",
      mainWarehouse: {
        id: "MAIN",
        name: "Hlavní sklad",
      },
      createdAt: now,
      updatedAt: now,
    };

    const nextOrganizations = [organization, ...organizations];
    writeOrganizations(nextOrganizations);
    localStorage.setItem(ACTIVE_ORGANIZATION_STORAGE_KEY, organizationId);
    setOrganizations(nextOrganizations);
    setNewOrganizationForm(defaultNewOrganizationForm);
    setCreateMessage("");
    window.location.href = "/app/gss";
  };

  return (
    <div style={wrap}>
      <h1 style={title}>Gogrou — správa organizací</h1>
      <div style={lead}>
        Interní MVP pohled pro Gogrou tým. Načítá organizace ze společného localStorage klíče `gogrou_organizations`.
      </div>

      <div style={box}>
        <div style={topRow}>
          <h2 style={subtitle}>Organizace</h2>
          <button type="button" onClick={openCreateForm} style={compactButton}>+ Nová firma</button>
        </div>

        {showCreateForm ? (
          <form onSubmit={createOrganization} style={formBox}>
            <div style={formGrid}>
              <label style={controlLabel}>
                Název firmy
                <input
                  value={newOrganizationForm.name}
                  onChange={(event) => updateNewOrganizationForm("name", event.target.value)}
                  style={input}
                />
              </label>
              <label style={controlLabel}>
                Prefix
                <input
                  value={newOrganizationForm.prefix}
                  onChange={(event) => updateNewOrganizationForm("prefix", event.target.value)}
                  placeholder="např. AH01"
                  style={input}
                />
              </label>
              <label style={controlLabel}>
                IČO
                <input
                  value={newOrganizationForm.ico}
                  onChange={(event) => updateNewOrganizationForm("ico", event.target.value)}
                  style={input}
                />
              </label>
              <label style={controlLabel}>
                Typ firmy
                <select
                  value={newOrganizationForm.companyType}
                  onChange={(event) => updateNewOrganizationForm("companyType", event.target.value)}
                  style={select}
                >
                  {COMPANY_TYPE_OPTIONS.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <div style={sectionLabel}>Aktivní moduly</div>
            <div style={moduleGrid}>
              {MODULE_OPTIONS.map((module) => (
                <label key={module.value} style={checkLabel}>
                  <input
                    type="checkbox"
                    checked={newOrganizationForm.modules.includes(module.value)}
                    onChange={() => toggleNewOrganizationModule(module.value)}
                  />
                  {module.label}
                </label>
              ))}
            </div>

            {createMessage ? <div style={errorMessage}>{createMessage}</div> : null}

            <div style={formActions}>
              <button type="submit" style={detailLink}>Uložit a otevřít GSS</button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateMessage("");
                }}
                style={gssLink}
              >
                Zavřít
              </button>
            </div>
          </form>
        ) : null}

        {organizations.length === 0 ? (
          <div style={emptyState}>
            <div style={empty}>Zatím není založena žádná organizace.</div>
            <button type="button" onClick={openCreateForm} style={detailLink}>Založit první firmu</button>
          </div>
        ) : (
          organizations.map((organization) => {
            const organizationId = getOrganizationRouteId(organization);
            const detailOrganizationId = getOrganizationRouteId(organization);
            const detailUrl = `/admin/organizations/${encodeURIComponent(detailOrganizationId || "")}`;
            const modules = organization.activatedModules || organization.selectedModules || [];
            const contactName = organization.contactName || organization.responsiblePerson || "nedoplněna";
            const contactEmail = organization.contactEmail || organization.responsibleEmail || "";

            return (
              <div key={organizationId} style={item}>
                <div style={itemHeader}>
                  <div>
                    <b>{organization.name}</b>{" "}
                    <span style={muted}>({organization.prefix || "bez prefixu"})</span>
                  </div>
                  <div style={badge}>{labelFromMap(ORGANIZATION_STATUS_LABELS, organization.status || "trial")}</div>
                </div>

                <div style={meta}>
                  IČO: {organization.ico || "neuvedeno"} · Billing: {labelFromMap(BILLING_STATUS_LABELS, organization.billingStatus || "trial")} · Vytvořeno: {formatDate(organization.createdAt)}
                </div>
                <div style={meta}>Aktivní moduly: {formatModules(modules)}</div>
                <div style={meta}>
                  Zodpovědná osoba: {contactName}
                  {contactEmail ? ` · ${contactEmail}` : ""}
                </div>

                <div style={controls}>
                  <div style={detailAction}>
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = detailUrl;
                      }}
                      style={detailLink}
                    >
                      Otevřít detail firmy
                    </button>
                    <button
                      type="button"
                      onClick={() => openOrganizationGss(organizationId)}
                      style={gssLink}
                    >
                      Otevřít GSS
                    </button>
                  </div>

                  <label style={controlLabel}>
                    Stav organizace
                    <select
                      value={organization.status || "trial"}
                      onChange={(event) => updateOrganization(organizationId, "status", event.target.value)}
                      style={select}
                    >
                      {ORGANIZATION_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {labelFromMap(ORGANIZATION_STATUS_LABELS, status)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label style={controlLabel}>
                    Billing status
                    <select
                      value={organization.billingStatus || "trial"}
                      onChange={(event) => updateOrganization(organizationId, "billingStatus", event.target.value)}
                      style={select}
                    >
                      {BILLING_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {labelFromMap(BILLING_STATUS_LABELS, status)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            );
          })
        )}
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
};

const topRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  marginBottom: 12,
};

const subtitle = {
  fontSize: 18,
  fontWeight: 800,
  margin: 0,
};

const empty = {
  opacity: 0.6,
};

const emptyState = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 12,
  padding: "12px 0",
};

const compactButton = {
  display: "inline-flex",
  justifyContent: "center",
  padding: "8px 12px",
  borderRadius: 8,
  background: "#fff",
  border: "1px solid #fff",
  color: "#000",
  fontWeight: 900,
  fontSize: 13,
  cursor: "pointer",
};

const formBox = {
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 10,
  padding: 14,
  marginBottom: 16,
  background: "rgba(255,255,255,0.04)",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
};

const input = {
  minWidth: 0,
  padding: 8,
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "#000",
  color: "#fff",
};

const sectionLabel = {
  marginTop: 14,
  marginBottom: 8,
  fontSize: 12,
  fontWeight: 800,
  opacity: 0.85,
};

const moduleGrid = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
};

const checkLabel = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: 8,
  padding: "7px 9px",
  fontSize: 12,
};

const formActions = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 14,
};

const errorMessage = {
  marginTop: 10,
  color: "#fecaca",
  fontSize: 13,
};

const item = {
  padding: 12,
  borderBottom: "1px solid rgba(255,255,255,0.1)",
};

const itemHeader = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
};

const muted = {
  opacity: 0.6,
};

const badge = {
  border: "1px solid rgba(124,58,237,0.45)",
  background: "rgba(124,58,237,0.16)",
  borderRadius: 999,
  padding: "4px 8px",
  fontSize: 12,
  fontWeight: 800,
};

const meta = {
  marginTop: 4,
  fontSize: 12,
  opacity: 0.65,
};

const controls = {
  display: "flex",
  flexWrap: "wrap",
  gap: 14,
  marginTop: 14,
  alignItems: "flex-end",
};

const detailLink = {
  display: "inline-flex",
  justifyContent: "center",
  padding: "12px 16px",
  borderRadius: 8,
  background: "#fff",
  border: "1px solid #fff",
  color: "#000",
  fontWeight: 800,
  fontSize: 13,
  textDecoration: "none",
  minWidth: 190,
  cursor: "pointer",
};

const gssLink = {
  display: "inline-flex",
  justifyContent: "center",
  padding: "9px 12px",
  borderRadius: 8,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.18)",
  color: "#fff",
  fontWeight: 800,
  fontSize: 12,
  minWidth: 190,
  cursor: "pointer",
};

const detailAction = {
  display: "inline-flex",
  flexDirection: "column",
  gap: 3,
};

const controlLabel = {
  display: "inline-flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 12,
  opacity: 0.85,
};

const select = {
  minWidth: 210,
  padding: 8,
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "#000",
  color: "#fff",
};
