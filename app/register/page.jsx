"use client";

import { useEffect, useState } from "react";

const COMPANY_TYPES = [
  "manufacturing_company",
  "tool_manufacturer",
  "tool_supplier",
  "grinding_service",
  "coating_service",
  "heat_treatment_service",
  "trading_company",
  "consulting",
  "other",
];

const COMPANY_TYPE_LABELS = {
  manufacturing_company: "Výrobní firma",
  tool_manufacturer: "Výrobce nástrojů",
  tool_supplier: "Dodavatel nástrojů",
  grinding_service: "Brusírna",
  coating_service: "Povlakovna",
  heat_treatment_service: "Kalírna / tepelné zpracování",
  trading_company: "Obchodní firma",
  consulting: "Poradenství",
  other: "Ostatní",
};

const AVAILABLE_MODULES = [
  "GSS",
  "Toolshop",
  "Services",
  "GPC supplier data channel",
  "Promitea/RFQ",
];

const MODULE_LABELS = {
  GSS: "GSS",
  Toolshop: "Toolshop",
  Services: "Services",
  "GPC supplier data channel": "GPC datový kanál",
  "Promitea/RFQ": "Promitea RFQ",
};

const LANGUAGE_OPTIONS = [
  { value: "cs", label: "Čeština" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "it", label: "Italiano" },
  { value: "pl", label: "Polski" },
];

const initialForm = {
  name: "",
  ico: "",
  dic: "",
  address: "",
  country: "CZ",
  language: "cs",
  companyEmail: "",
  companyPhone: "",
  website: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  companyTypes: ["manufacturing_company"],
  selectedModules: ["GSS"],
};

const removeLegalForm = (name) =>
  name
    .replace(/\bspol\.?\s*s\s*r\.?\s*o\.?\b/gi, " ")
    .replace(/\bs\.?\s*r\.?\s*o\.?\b/gi, " ")
    .replace(/\ba\.?\s*s\.?\b/gi, " ")
    .replace(/\bv\.?\s*o\.?\s*s\.?\b/gi, " ")
    .replace(/\bk\.?\s*s\.?\b/gi, " ");

const createPrefixBase = (name) => {
  const cleanName = removeLegalForm(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, " ")
    .trim();

  const words = cleanName.split(/\s+/).filter(Boolean);
  const letters = words.length > 1
    ? words.map((word) => word[0]).join("")
    : cleanName.replace(/[^A-Z0-9]/g, "");

  return letters.padEnd(2, "X").slice(0, 2);
};

const createUniquePrefix = (name, organizations) => {
  const base = createPrefixBase(name);
  const existingPrefixes = organizations.map((organization) => organization.prefix);

  for (let i = 1; i <= 99; i++) {
    const prefix = `${base}${String(i).padStart(2, "0")}`;
    if (!existingPrefixes.includes(prefix)) return prefix;
  }

  return `${base}99`;
};

const createTrialSubscription = (selectedModules) => ({
  selectedModules,
  subscriptionPlan: "trial_mvp",
  billingStatus: "trial",
  paymentProvider: "",
  paymentConfirmedAt: null,
  activatedModules: selectedModules,
});

const readOrganizations = () => {
  try {
    const stored = localStorage.getItem("gogrou_organizations");
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Nepodařilo se načíst gogrou_organizations.", error);
    return [];
  }
};

const formatModules = (modules) =>
  modules.map((module) => MODULE_LABELS[module] || module).join(", ");

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [organizations, setOrganizations] = useState([]);
  const [createdOrganization, setCreatedOrganization] = useState(null);
  const [organizationCount, setOrganizationCount] = useState(0);

  useEffect(() => {
    const storedOrganizations = readOrganizations();
    setOrganizations(storedOrganizations);
    setOrganizationCount(storedOrganizations.length);
  }, []);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field, value) => {
    setForm((prev) => {
      const current = prev[field];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];

      return {
        ...prev,
        [field]: field === "selectedModules" && next.length === 0 ? ["GSS"] : next,
      };
    });
  };

  const createOrganization = () => {
    if (!form.name.trim()) return;

    const storedOrganizations = readOrganizations();
    const prefix = createUniquePrefix(form.name, storedOrganizations);
    const organizationId = crypto.randomUUID();

    const organization = {
      id: organizationId,
      organizationId,
      name: form.name.trim(),
      prefix,
      ico: form.ico.trim(),
      dic: form.dic.trim(),
      address: form.address.trim(),
      country: form.country.trim() || "CZ",
      language: form.language,
      companyEmail: form.companyEmail.trim(),
      companyPhone: form.companyPhone.trim(),
      website: form.website.trim(),
      contactName: form.contactName.trim(),
      contactEmail: form.contactEmail.trim(),
      contactPhone: form.contactPhone.trim(),
      companyTypes: form.companyTypes,
      status: "trial",
      createdAt: new Date().toISOString(),
      ...createTrialSubscription(form.selectedModules),
    };

    const nextOrganizations = [...storedOrganizations, organization];
    localStorage.setItem("gogrou_organizations", JSON.stringify(nextOrganizations));
    setOrganizations(nextOrganizations);
    setCreatedOrganization(organization);
    setOrganizationCount(nextOrganizations.length);
    setForm(initialForm);
  };

  const previewPrefix = form.name.trim()
    ? createUniquePrefix(form.name, organizations)
    : null;

  if (createdOrganization) {
    const hasGssModule = createdOrganization.activatedModules.includes("GSS");

    return (
      <div style={wrap}>
        <div style={confirmationBox}>
          <h1 style={title}>Organizace byla vytvořena</h1>
          <div style={lead}>
            Firma se registruje jednou. Dalším krokem je pokračovat do Gogrou a používat aktivované moduly.
          </div>

          <div style={summaryGrid}>
            <div style={summaryItem}>
              <div style={summaryLabel}>Organizace</div>
              <div style={summaryValue}>{createdOrganization.name}</div>
            </div>
            <div style={summaryItem}>
              <div style={summaryLabel}>Interní prefix</div>
              <div style={summaryValue}>{createdOrganization.prefix}</div>
            </div>
            <div style={summaryItem}>
              <div style={summaryLabel}>Vybrané moduly</div>
              <div style={summaryValue}>{formatModules(createdOrganization.activatedModules)}</div>
            </div>
            <div style={summaryItem}>
              <div style={summaryLabel}>Stav</div>
              <div style={summaryValue}>MVP zkušební režim</div>
            </div>
          </div>

          <div style={portalNote}>
            Finální zákaznický portál bude `/app`. Protože zatím neexistuje, pokračování vede dočasně do interní správy organizací.
          </div>

          <div style={actionRow}>
            <a href="/admin/organizations" style={btnLink}>
              Pokračovat do Gogrou
            </a>
            {hasGssModule ? (
              <a href="/gss" style={btnSecondaryLink}>
                Otevřít GSS modul
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => setCreatedOrganization(null)}
              style={btnGhost}
            >
              Registrovat jinou firmu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <h1 style={title}>Gogrou — registrace organizace</h1>
      <div style={lead}>
        Gogrou je modulární platforma pro firmy v nástrojářském a výrobním ekosystému. Organizace si vybírá moduly podle svých potřeb. GSS je pouze jeden z modulů, ne vstupní brána do celé aplikace.
      </div>

      <div style={box}>
        <h2 style={subtitle}>Údaje firmy</h2>
        <div style={nameField}>
          <input
            value={form.name}
            onChange={(event) => updateForm("name", event.target.value)}
            placeholder="Název firmy"
            style={input}
          />
          <div style={prefixInline}>
            Interní prefix: <b>{previewPrefix || "doplní se automaticky"}</b>
          </div>
        </div>
        <div style={grid}>
          <input
            value={form.ico}
            onChange={(event) => updateForm("ico", event.target.value)}
            placeholder="IČO"
            style={input}
          />
          <input
            value={form.dic}
            onChange={(event) => updateForm("dic", event.target.value)}
            placeholder="DIČ"
            style={input}
          />
          <input
            value={form.address}
            onChange={(event) => updateForm("address", event.target.value)}
            placeholder="Adresa"
            style={input}
          />
          <input
            value={form.country}
            onChange={(event) => updateForm("country", event.target.value)}
            placeholder="Země"
            style={input}
          />
          <select
            value={form.language}
            onChange={(event) => updateForm("language", event.target.value)}
            style={input}
          >
            {LANGUAGE_OPTIONS.map((language) => (
              <option key={language.value} value={language.value}>
                {language.label}
              </option>
            ))}
          </select>
          <input
            value={form.companyEmail}
            onChange={(event) => updateForm("companyEmail", event.target.value)}
            placeholder="Firemní email"
            style={input}
          />
          <input
            value={form.companyPhone}
            onChange={(event) => updateForm("companyPhone", event.target.value)}
            placeholder="Firemní telefon"
            style={input}
          />
          <input
            value={form.website}
            onChange={(event) => updateForm("website", event.target.value)}
            placeholder="Web"
            style={input}
          />
        </div>
      </div>

      <div style={box}>
        <h2 style={subtitle}>Kontaktní osoba</h2>
        <div style={grid}>
          <input
            value={form.contactName}
            onChange={(event) => updateForm("contactName", event.target.value)}
            placeholder="Jméno"
            style={input}
          />
          <input
            value={form.contactEmail}
            onChange={(event) => updateForm("contactEmail", event.target.value)}
            placeholder="Email"
            style={input}
          />
          <input
            value={form.contactPhone}
            onChange={(event) => updateForm("contactPhone", event.target.value)}
            placeholder="Telefon"
            style={input}
          />
        </div>
      </div>

      <div style={box}>
        <h2 style={subtitle}>Typy organizace</h2>
        <div style={checkboxGrid}>
          {COMPANY_TYPES.map((type) => (
            <label key={type} style={checkboxLabel}>
              <input
                type="checkbox"
                checked={form.companyTypes.includes(type)}
                onChange={() => toggleArrayValue("companyTypes", type)}
              />
              {COMPANY_TYPE_LABELS[type]}
            </label>
          ))}
        </div>
      </div>

      <div style={box}>
        <h2 style={subtitle}>Aktivní moduly</h2>
        <div style={checkboxGrid}>
          {AVAILABLE_MODULES.map((module) => (
            <label key={module} style={checkboxLabel}>
              <input
                type="checkbox"
                checked={form.selectedModules.includes(module)}
                onChange={() => toggleArrayValue("selectedModules", module)}
              />
              {MODULE_LABELS[module]}
            </label>
          ))}
        </div>
      </div>

      <div style={box}>
        <h2 style={subtitle}>Subscription / trial info</h2>
        <div style={meta}>
          Registrace v MVP ukládá organizaci lokálně do prohlížeče. Neřeší backend DB, skutečný login, auth ani platební bránu.
        </div>
        <div style={meta}>
          Nová organizace začíná v režimu MVP trial. Budoucí fee bude určeno podle aktivních modulů a obchodních podmínek.
        </div>
        <div style={meta}>
          Moduly se v cílové aplikaci aktivují podle trial režimu nebo zaplaceného předplatného.
        </div>
      </div>

      <button onClick={createOrganization} style={btnPrimary}>
        Vytvořit organizaci
      </button>
      <div style={countMeta}>Lokálně uložených organizací: {organizationCount}</div>
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
  padding: 12,
  marginBottom: 14,
};

const subtitle = {
  fontSize: 16,
  fontWeight: 800,
  marginBottom: 10,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 10,
};

const nameField = {
  maxWidth: 360,
  marginBottom: 6,
};

const input = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "#000",
  color: "#fff",
  marginBottom: 6,
};

const prefixInline = {
  fontSize: 11,
  opacity: 0.52,
  marginTop: -2,
  marginBottom: 4,
};

const checkboxGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 8,
};

const checkboxLabel = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  fontSize: 13,
  opacity: 0.85,
};

const meta = {
  marginTop: 4,
  fontSize: 13,
  lineHeight: 1.45,
  opacity: 0.65,
};

const btnPrimary = {
  padding: "9px 13px",
  borderRadius: 8,
  background: "rgba(124,58,237,0.35)",
  border: "1px solid rgba(124,58,237,0.6)",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};

const confirmationBox = {
  maxWidth: 860,
  border: "1px solid rgba(34,197,94,0.35)",
  background: "rgba(34,197,94,0.12)",
  color: "rgba(187,247,208,0.95)",
  padding: 22,
  borderRadius: 12,
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 10,
  marginTop: 16,
};

const summaryItem = {
  border: "1px solid rgba(187,247,208,0.22)",
  borderRadius: 8,
  padding: 10,
};

const summaryLabel = {
  fontSize: 11,
  opacity: 0.65,
  marginBottom: 4,
};

const summaryValue = {
  fontSize: 15,
  fontWeight: 900,
};

const portalNote = {
  marginTop: 16,
  fontSize: 13,
  opacity: 0.85,
};

const actionRow = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginTop: 16,
};

const btnLink = {
  display: "inline-flex",
  padding: "10px 14px",
  borderRadius: 8,
  background: "rgba(34,197,94,0.18)",
  border: "1px solid rgba(34,197,94,0.45)",
  color: "rgba(187,247,208,0.95)",
  fontWeight: 900,
  textDecoration: "none",
};

const btnSecondaryLink = {
  display: "inline-flex",
  padding: "10px 14px",
  borderRadius: 8,
  background: "rgba(124,58,237,0.22)",
  border: "1px solid rgba(124,58,237,0.5)",
  color: "#fff",
  fontWeight: 900,
  textDecoration: "none",
};

const btnGhost = {
  padding: "10px 14px",
  borderRadius: 8,
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.22)",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const countMeta = {
  marginTop: 10,
  fontSize: 12,
  opacity: 0.45,
};
