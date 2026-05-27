"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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

const COMPANY_TYPE_LABELS = {
  manufacturing_company: "Výrobní firma",
  tool_manufacturer: "Výrobce nástrojů",
  tool_supplier: "Dodavatel nástrojů",
  coating_service: "Povlakovna",
  heat_treatment_service: "Kalírna / tepelné zpracování",
  grinding_service: "Brusírna",
  consulting: "Poradenství",
  trading_company: "Obchodní firma",
  other: "Ostatní",
};

const labelFromMap = (labels, value) => labels[value] || value || "neuvedeno";

const formatList = (values, labels = {}) =>
  (values && values.length > 0 ? values : []).map((value) => labelFromMap(labels, value)).join(", ") || "žádné";

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

const toLookupString = (value) => String(value ?? "").trim();

const safeDecodeURIComponent = (value) => {
  const stringValue = toLookupString(value);

  try {
    return decodeURIComponent(stringValue);
  } catch {
    return stringValue;
  }
};

const getOrganizationId = (organization) =>
  toLookupString(organization?.id) || toLookupString(organization?.organizationId);

const normalizeLookupValue = (value) => safeDecodeURIComponent(value).trim().toLowerCase();

const getRouteId = (params) => {
  const value = Array.isArray(params?.organizationId) ? params.organizationId[0] : params?.organizationId;
  return toLookupString(value);
};

const getOrganizationLookupValues = (organization) => [
  organization?.id,
  organization?.organizationId,
  getOrganizationId(organization),
  organization?.prefix,
  organization?.name,
];

const findOrganization = (organizations, routeId) => {
  const normalizedRouteId = normalizeLookupValue(routeId);
  if (!normalizedRouteId) return null;

  return organizations.find((organization) =>
    getOrganizationLookupValues(organization).some((value) => normalizeLookupValue(value) === normalizedRouteId)
  ) || null;
};

export default function OrganizationDetailPage() {
  const params = useParams();
  const [organization, setOrganization] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const routeId = getRouteId(params);
    const organizations = readOrganizations();
    const matchedOrganization = findOrganization(organizations, routeId);
    const fallbackOrganization = !matchedOrganization && organizations.length === 1 ? organizations[0] : null;

    setOrganization(matchedOrganization || fallbackOrganization);
    setLoaded(true);
  }, [params]);

  if (!loaded) {
    return (
      <div style={wrap}>
        <div style={muted}>Načítám detail firmy...</div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div style={wrap}>
        <div style={box}>
          <h1 style={title}>Firma nenalezena</h1>
          <div style={lead}>
            V localStorage klíči `gogrou_organizations` nebyla nalezena odpovídající organizace.
          </div>
          <a href="/admin/organizations" style={btnSecondary}>Zpět na seznam organizací</a>
        </div>
      </div>
    );
  }

  const modules = organization.activatedModules || organization.selectedModules || [];
  const companyTypes = organization.companyTypes || organization.organizationTypes || [];
  const contactName = organization.contactName || organization.responsiblePerson || "nedoplněna";
  const contactEmail = organization.contactEmail || organization.responsibleEmail || "";
  const contactPhone = organization.contactPhone || organization.responsiblePhone || "";

  return (
    <div style={wrap}>
      <a href="/admin/organizations" style={btnSecondary}>Zpět na seznam firem</a>

      <div style={box}>
        <h1 style={title}>{organization.name || "Organizace bez názvu"}</h1>
        <div style={lead}>
          Detail organizace načtený ze stejného localStorage klíče `gogrou_organizations` jako seznam.
        </div>

        <div style={summaryGrid}>
          <Summary label="Organization ID" value={getOrganizationId(organization)} />
          <Summary label="Prefix" value={organization.prefix || "neuvedeno"} />
          <Summary label="IČO" value={organization.ico || "neuvedeno"} />
          <Summary label="DIČ" value={organization.dic || "neuvedeno"} />
          <Summary label="Země" value={organization.country || "neuvedeno"} />
          <Summary label="Jazyk" value={organization.language || "neuvedeno"} />
          <Summary label="Stav" value={labelFromMap(ORGANIZATION_STATUS_LABELS, organization.status || "trial")} />
          <Summary label="Billing status" value={labelFromMap(BILLING_STATUS_LABELS, organization.billingStatus || "trial")} />
          <Summary label="Vytvořeno" value={formatDate(organization.createdAt)} />
        </div>
      </div>

      <div style={box}>
        <h2 style={subtitle}>Moduly a typ firmy</h2>
        <div style={meta}>Aktivní moduly: {formatList(modules, MODULE_LABELS)}</div>
        <div style={meta}>Typy firmy: {formatList(companyTypes, COMPANY_TYPE_LABELS)}</div>
      </div>

      <div style={box}>
        <h2 style={subtitle}>Kontakt</h2>
        <div style={meta}>Firemní e-mail: {organization.companyEmail || organization.email || "neuvedeno"}</div>
        <div style={meta}>Firemní telefon: {organization.companyPhone || "neuvedeno"}</div>
        <div style={meta}>Web: {organization.website || "neuvedeno"}</div>
        <div style={meta}>Adresa: {organization.address || "neuvedeno"}</div>
        <div style={meta}>
          Zodpovědná osoba: {contactName}
          {contactEmail ? ` · ${contactEmail}` : ""}
          {contactPhone ? ` · ${contactPhone}` : ""}
        </div>
      </div>
    </div>
  );
}

function Summary({ label, value }) {
  return (
    <div style={summaryItem}>
      <div style={summaryLabel}>{label}</div>
      <div style={summaryValue}>{value}</div>
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
  margin: "12px 0 8px",
};

const lead = {
  maxWidth: 860,
  fontSize: 14,
  lineHeight: 1.5,
  opacity: 0.7,
  marginBottom: 18,
};

const box = {
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 12,
  padding: 16,
  marginTop: 16,
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
  overflowWrap: "anywhere",
};

const meta = {
  marginTop: 6,
  fontSize: 13,
  opacity: 0.72,
};

const btnSecondary = {
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

const muted = {
  opacity: 0.65,
};
