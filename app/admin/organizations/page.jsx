"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "gogrou_organizations";

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

export default function OrganizationsAdminPage() {
  const [organizations, setOrganizations] = useState([]);
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

  return (
    <div style={wrap}>
      <h1 style={title}>Gogrou — správa organizací</h1>
      <div style={lead}>
        Interní MVP pohled pro Gogrou tým. Načítá organizace ze společného localStorage klíče `gogrou_organizations`.
      </div>

      <div style={box}>
        <h2 style={subtitle}>Organizace</h2>

        {organizations.length === 0 ? (
          <div style={empty}>Zatím není založena žádná organizace.</div>
        ) : (
          organizations.map((organization) => {
            const organizationId = organization.organizationId || organization.id;
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
                  <a href={`/admin/organizations/${encodeURIComponent(organizationId)}`} style={detailLink}>
                    Otevřít detail firmy
                  </a>

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

const subtitle = {
  fontSize: 18,
  fontWeight: 800,
  marginBottom: 12,
};

const empty = {
  opacity: 0.6,
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
  gap: 10,
  marginTop: 10,
  alignItems: "flex-end",
};

const detailLink = {
  display: "inline-flex",
  padding: "9px 12px",
  borderRadius: 8,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.18)",
  color: "#fff",
  fontWeight: 800,
  fontSize: 12,
  textDecoration: "none",
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
