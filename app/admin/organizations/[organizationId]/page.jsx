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

const getOrganizationId = (organization) => organization?.id || organization?.organizationId || "";

const normalizeLookupValue = (value) => decodeURIComponent(String(value || "")).trim().toLowerCase();

const findOrganization = (organizations, routeId) => {
  const normalizedRouteId = normalizeLookupValue(routeId);
  return organizations.find((organization) => (
    normalizeLookupValue(organization.id) === normalizedRouteId ||
    normalizeLookupValue(organization.organizationId) === normalizedRouteId ||
    normalizeLookupValue(organization.prefix) === normalizedRouteId ||
    normalizeLookupValue(organization.name) === normalizedRouteId
  )) || null;
};

export default function OrganizationDetailPage() {
  const params = useParams();
  const [organization, setOrganization] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [requestedId, setRequestedId] = useState("");

  useEffect(() => {
    const routeId = Array.isArray(params?.organizationId) ? params.organizationId[0] : params?.organizationId;
    const organizations = readOrganizations();
    const matchedOrganization = findOrganization(organizations, routeId);
    const fallbackOrganization = !matchedOrganization && organizations.length === 1 ? organizations[0] : null;

    setRequestedId(decodeURIComponent(String(routeId || "")));
    setOrganizations(organizations);
    setOrganization(matchedOrganization || fallbackOrganization);
    setLoaded(true);
  }, [params]);

  if (!loaded) {
    return (
      <div style={wrap}>
        <div style={debugVersion}>ORG DETAIL DEBUG VERSION</div>
        <div style={muted}>Načítám detail firmy...</div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div style={wrap}>
        <div style={debugVersion}>ORG DETAIL DEBUG VERSION</div>
        <div style={box}>
          <h1 style={title}>Firma nenalezena</h1>
          <div style={lead}>
            V localStorage klíči `gogrou_organizations` nebyla nalezena organizace pro ID `{requestedId || "neuvedeno"}`.
          </div>
          <div style={debugBox}>
            <div style={debugTitle}>Diagnostika localStorage</div>
            <div style={debugLine}>Hledané organizationId z URL: {requestedId || "neuvedeno"}</div>
            <div style={debugLine}>Počet organizací načtených z localStorage: {organizations.length}</div>
            <div style={debugTitle}>Dostupné organizace</div>
            {organizations.length === 0 ? (
              <div style={debugLine}>Žádná organizace není v `gogrou_organizations` dostupná.</div>
            ) : (
              <div style={debugList}>
                {organizations.map((availableOrganization, index) => (
                  <div key={`${availableOrganization.id || availableOrganization.organizationId || availableOrganization.prefix || index}`} style={debugItem}>
                    <div>ID: {availableOrganization.id || "chybí"}</div>
                    <div>Organization ID: {availableOrganization.organizationId || "chybí"}</div>
                    <div>Prefix: {availableOrganization.prefix || "chybí"}</div>
                    <div>Název: {availableOrganization.name || "bez názvu"}</div>
                  </div>
                ))}
              </div>
            )}
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
  const isSingleOrganizationFallback = organizations.length === 1 && normalizeLookupValue(getOrganizationId(organization)) !== normalizeLookupValue(requestedId);

  return (
    <div style={wrap}>
      <div style={debugVersion}>ORG DETAIL DEBUG VERSION</div>
      <a href="/admin/organizations" style={btnSecondary}>Zpět na seznam firem</a>

      {isSingleOrganizationFallback ? (
        <div style={warningBox}>
          ID v URL nesedí, ale byla nalezena jediná organizace v localStorage.
        </div>
      ) : null}

      <div style={box}>
        <h1 style={title}>{organization.name || "Organizace bez názvu"}</h1>
        <div style={lead}>
          Detail organizace načtený ze stejného localStorage klíče `gogrou_organizations` jako seznam.
        </div>

        <div style={summaryGrid}>
          <Summary label="Organization ID" value={getOrganizationId(organization)} />
          <Summary label="Legacy organizationId" value={organization.organizationId || "neuvedeno"} />
          <Summary label="Hledané ID z URL" value={requestedId || "neuvedeno"} />
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

const debugVersion = {
  display: "inline-flex",
  padding: "7px 10px",
  borderRadius: 8,
  background: "rgba(250,204,21,0.18)",
  border: "1px solid rgba(250,204,21,0.55)",
  color: "#fde68a",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 0,
  marginBottom: 12,
};

const warningBox = {
  border: "1px solid rgba(250,204,21,0.55)",
  background: "rgba(250,204,21,0.12)",
  color: "#fde68a",
  borderRadius: 10,
  padding: 12,
  marginTop: 16,
  fontSize: 13,
  fontWeight: 800,
};

const debugBox = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  padding: 12,
  marginBottom: 16,
  background: "rgba(255,255,255,0.04)",
};

const debugTitle = {
  fontSize: 12,
  fontWeight: 900,
  opacity: 0.8,
  margin: "8px 0 6px",
};

const debugLine = {
  fontSize: 12,
  opacity: 0.68,
  overflowWrap: "anywhere",
};

const debugList = {
  display: "grid",
  gap: 8,
};

const debugItem = {
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  padding: 8,
  fontSize: 12,
  opacity: 0.72,
  overflowWrap: "anywhere",
};
