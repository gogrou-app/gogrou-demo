"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ===========================
// Helpers
// ===========================
const ORGANIZATIONS_STORAGE_KEY = "gogrou_organizations";
const LEGACY_GSS_COMPANIES_STORAGE_KEY = "gss_companies";

const generatePrefix = (name, existing) => {
  const base = name
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .padEnd(2, "X")
    .slice(0, 2);

  for (let i = 1; i <= 99; i++) {
    const p = `${base}${String(i).padStart(2, "0")}`;
    if (!existing.includes(p)) return p;
  }
  return `${base}99`;
};

const MVP_ROLES = ["ADMIN", "POWER_USER", "USER"];
const COMPANY_TYPES = [
  "manufacturing_company",
  "tool_manufacturer",
  "tool_supplier",
  "coating_service",
  "heat_treatment_service",
  "grinding_service",
  "consulting",
  "trading_company",
  "other",
];
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
const AVAILABLE_MODULES = [
  "GSS",
  "GPC supplier data channel",
  "Toolshop",
  "Services",
  "Promitea/RFQ",
];
const MODULE_LABELS = {
  GSS: "GSS",
  "GPC supplier data channel": "Datový kanál GPC",
  Toolshop: "Toolshop",
  Services: "Služby",
  "Promitea/RFQ": "Promitea / poptávky",
};
const SUBSCRIPTION_PLAN_LABELS = {
  trial_mvp: "MVP zkušební režim",
};
const BILLING_STATUS_LABELS = {
  trial: "Zkušební režim",
  active: "Aktivní",
  past_due: "Po splatnosti",
  cancelled: "Zrušeno",
};
const COMPANY_STATUS_LABELS = {
  draft: "Rozpracovaná",
  trial: "Zkušební režim",
  pending_payment: "Čeká na platbu",
  active: "Aktivní",
  paused: "Pozastavená",
  blocked: "Blokovaná",
  archived: "Archivovaná",
};
const COMPANY_STATUS_OPTIONS = [
  { value: "trial", label: "Zkušební režim" },
  { value: "pending_payment", label: "Čeká na platbu" },
  { value: "active", label: "Aktivní" },
  { value: "paused", label: "Pozastavená" },
  { value: "blocked", label: "Blokovaná" },
  { value: "archived", label: "Archivovaná" },
];
const LANGUAGE_OPTIONS = [
  { value: "cs", label: "Čeština" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "it", label: "Italiano" },
  { value: "pl", label: "Polski" },
];
const LANGUAGE_LABELS = Object.fromEntries(
  LANGUAGE_OPTIONS.map((option) => [option.value, option.label])
);

const createSubscription = (selectedModules) => ({
  selectedModules,
  subscriptionPlan: "trial_mvp",
  billingStatus: "trial",
  paymentProvider: "",
  paymentConfirmedAt: null,
  activatedModules: selectedModules,
});

const labelFromMap = (labels, value) => labels[value] || value;

const formatLabels = (labels, values) => values.map((value) => labelFromMap(labels, value)).join(", ");

const formatDate = (value) => {
  if (!value) return "neuvedeno";
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};

const createMainWarehouse = () => ({
  id: "MAIN",
  name: "Hlavní sklad",
  type: "MAIN",
});

const createAdminUser = (companyId) => ({
  id: crypto.randomUUID(),
  name: "Administrátor",
  email: "",
  phone: "",
  role: "ADMIN",
  active: true,
  companyId,
});

const safeParseArray = (value, label) => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn(`Nepodařilo se načíst ${label}.`, error);
    return [];
  }
};

const readOrganizations = () => {
  const storedOrganizations = localStorage.getItem(ORGANIZATIONS_STORAGE_KEY);
  if (storedOrganizations) {
    return safeParseArray(storedOrganizations, ORGANIZATIONS_STORAGE_KEY);
  }

  const legacyCompanies = localStorage.getItem(LEGACY_GSS_COMPANIES_STORAGE_KEY);
  return safeParseArray(legacyCompanies, LEGACY_GSS_COMPANIES_STORAGE_KEY);
};

const normalizeCompany = (company) => {
  const companyId = company.companyId || company.organizationId || company.id;
  const billingStatus = company.billingStatus || "trial";
  const selectedModules = Array.isArray(company.selectedModules) && company.selectedModules.length > 0
    ? company.selectedModules
    : Array.isArray(company.activeModules) && company.activeModules.length > 0
      ? company.activeModules
      : ["GSS"];
  const storedActivatedModules = Array.isArray(company.activatedModules) && company.activatedModules.length > 0
    ? company.activatedModules
    : Array.isArray(company.activeModules) && company.activeModules.length > 0
      ? company.activeModules
      : selectedModules;
  const activatedModules = billingStatus === "trial" || billingStatus === "active"
    ? storedActivatedModules
    : [];
  const users = Array.isArray(company.users) && company.users.length > 0
    ? company.users.map((user) => ({
        ...user,
        companyId: user.companyId || companyId,
        role: MVP_ROLES.includes(user.role) ? user.role : "USER",
        active: user.active !== false,
      }))
    : [createAdminUser(companyId)];

  return {
    ...company,
    companyId,
    organizationId: company.organizationId || companyId,
    status: company.status || "active",
    ico: company.ico || "",
    dic: company.dic || "",
    address: company.address || "",
    country: company.country || "CZ",
    language: company.language || "cs",
    companyEmail: company.companyEmail || company.contactEmail || "",
    companyPhone: company.companyPhone || "",
    website: company.website || "",
    responsiblePerson: company.responsiblePerson || company.contactName || "",
    responsibleEmail: company.responsibleEmail || company.contactEmail || "",
    responsiblePhone: company.responsiblePhone || company.contactPhone || "",
    companyTypes: Array.isArray(company.companyTypes) && company.companyTypes.length > 0
      ? company.companyTypes
      : ["manufacturing_company"],
    selectedModules,
    subscriptionPlan: company.subscriptionPlan || "trial_mvp",
    billingStatus,
    paymentProvider: company.paymentProvider || "",
    paymentConfirmedAt: company.paymentConfirmedAt || null,
    activatedModules,
    createdAt: company.createdAt || new Date().toISOString(),
    users,
    warehouses: Array.isArray(company.warehouses) && company.warehouses.length > 0
      ? company.warehouses
      : [createMainWarehouse()],
  };
};

// ===========================
// Page
// ===========================
export default function GSSPage() {
  const router = useRouter();

  const [companies, setCompanies] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    ico: "",
    dic: "",
    address: "",
    country: "CZ",
    language: "cs",
    companyEmail: "",
    companyPhone: "",
    website: "",
    responsiblePerson: "",
    responsibleEmail: "",
    responsiblePhone: "",
    companyTypes: ["manufacturing_company"],
    selectedModules: ["GSS"],
  });

  // ===== LOAD =====
  useEffect(() => {
    setCompanies(readOrganizations().map(normalizeCompany));
    setLoaded(true);
  }, []);

  // ===== SAVE =====
  useEffect(() => {
    if (!loaded || !dirty) return;
    localStorage.setItem(ORGANIZATIONS_STORAGE_KEY, JSON.stringify(companies));
    setDirty(false);
  }, [companies, loaded, dirty]);

  // ===== CREATE COMPANY =====
  const createCompany = () => {
    if (!form.name.trim()) return;

    const prefixes = companies.map((c) => c.prefix);
    const prefix = generatePrefix(form.name, prefixes);
    const companyId = crypto.randomUUID();

    const company = {
      id: companyId,
      companyId,
      organizationId: companyId,
      name: form.name.trim(),
      prefix,
      ico: form.ico.trim(),
      dic: form.dic.trim(),
      address: form.address.trim(),
      country: form.country.trim() || "CZ",
      language: form.language.trim() || "cs",
      companyEmail: form.companyEmail.trim(),
      companyPhone: form.companyPhone.trim(),
      website: form.website.trim(),
      responsiblePerson: form.responsiblePerson.trim(),
      responsibleEmail: form.responsibleEmail.trim(),
      responsiblePhone: form.responsiblePhone.trim(),
      contactName: form.responsiblePerson.trim(),
      contactEmail: form.responsibleEmail.trim(),
      contactPhone: form.responsiblePhone.trim(),
      companyTypes: form.companyTypes,
      ...createSubscription(form.selectedModules),
      status: "trial",
      createdAt: new Date().toISOString(),
      users: [createAdminUser(companyId)],
      warehouses: [createMainWarehouse()],
    };

    setCompanies((prev) => [...prev, company]);
    setDirty(true);
    localStorage.setItem(`gss_wh_${companyId}_MAIN`, JSON.stringify([]));
    setForm({
      name: "",
      ico: "",
      dic: "",
      address: "",
      country: "CZ",
      language: "cs",
      companyEmail: "",
      companyPhone: "",
      website: "",
      responsiblePerson: "",
      responsibleEmail: "",
      responsiblePhone: "",
      companyTypes: ["manufacturing_company"],
      selectedModules: ["GSS"],
    });
  };

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

  const estimatedFeeLabel = form.selectedModules.length > 0
    ? "Orientační měsíční poplatek bude dopočten podle zvolených modulů."
    : "Vyberte modul pro orientační měsíční poplatek.";

  const updateCompanyStatus = (companyId, status) => {
    setCompanies((prev) =>
      prev.map((company) =>
        company.companyId === companyId || company.id === companyId
          ? { ...company, status }
          : company
      )
    );
    setDirty(true);
  };

  const normalizedCompanySearch = companySearch.trim().toLowerCase();
  const filteredCompanies = normalizedCompanySearch
    ? companies.filter((company) =>
        [company.name, company.prefix, company.ico]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedCompanySearch))
      )
    : companies;

  // ===========================
  // UI
  // ===========================
  return (
    <div style={wrap}>
      <h1 style={title}>GSS MVP prototyp</h1>
      <div style={lead}>
        Tento pohled je dočasný GSS prototyp. Registrace a interní správa organizací jsou nad GSS a patří do `/register` a `/admin/organizations`. Produkční tenant vstup do GSS bude přes `/app/gss`.
      </div>

      {/* CREATE */}
      <div style={box}>
        <h2 style={subtitle}>Dočasné GSS založení organizace</h2>
        <div style={note}>
          Tento formulář zůstává jen pro GSS MVP prototyp. Nové organizace se ukládají do společného klíče `gogrou_organizations`; primární správa je v `/admin/organizations`.
        </div>
        <input
          value={form.name}
          onChange={(e) => updateForm("name", e.target.value)}
          placeholder="Název firmy"
          style={input}
        />
        <div style={grid}>
          <input
            value={form.ico}
            onChange={(e) => updateForm("ico", e.target.value)}
            placeholder="IČO"
            style={input}
          />
          <input
            value={form.dic}
            onChange={(e) => updateForm("dic", e.target.value)}
            placeholder="DIČ"
            style={input}
          />
          <input
            value={form.address}
            onChange={(e) => updateForm("address", e.target.value)}
            placeholder="Adresa"
            style={input}
          />
          <input
            value={form.country}
            onChange={(e) => updateForm("country", e.target.value)}
            placeholder="Země"
            style={input}
          />
          <input
            value={form.companyEmail}
            onChange={(e) => updateForm("companyEmail", e.target.value)}
            placeholder="Firemní e-mail"
            style={input}
          />
          <input
            value={form.companyPhone}
            onChange={(e) => updateForm("companyPhone", e.target.value)}
            placeholder="Firemní telefon"
            style={input}
          />
          <select
            value={form.language}
            onChange={(e) => updateForm("language", e.target.value)}
            style={input}
          >
            {LANGUAGE_OPTIONS.map((language) => (
              <option key={language.value} value={language.value}>
                {language.label}
              </option>
            ))}
          </select>
          <input
            value={form.website}
            onChange={(e) => updateForm("website", e.target.value)}
            placeholder="Web"
            style={input}
          />
          <input
            value={form.responsiblePerson}
            onChange={(e) => updateForm("responsiblePerson", e.target.value)}
            placeholder="Zodpovědná osoba"
            style={input}
          />
          <input
            value={form.responsibleEmail}
            onChange={(e) => updateForm("responsibleEmail", e.target.value)}
            placeholder="E-mail zodpovědné osoby"
            style={input}
          />
          <input
            value={form.responsiblePhone}
            onChange={(e) => updateForm("responsiblePhone", e.target.value)}
            placeholder="Telefon zodpovědné osoby"
            style={input}
          />
        </div>
        <div style={sectionLabel}>Typy firmy</div>
        <div style={checkboxGrid}>
          {COMPANY_TYPES.map((type) => (
            <label key={type} style={checkboxLabel}>
              <input
                type="checkbox"
                checked={form.companyTypes.includes(type)}
                onChange={() => toggleArrayValue("companyTypes", type)}
              />
              {labelFromMap(COMPANY_TYPE_LABELS, type)}
            </label>
          ))}
        </div>
        <div style={sectionLabel}>Vybrané moduly</div>
        <div style={checkboxGrid}>
          {AVAILABLE_MODULES.map((module) => (
            <label key={module} style={checkboxLabel}>
              <input
                type="checkbox"
                checked={form.selectedModules.includes(module)}
                onChange={() => toggleArrayValue("selectedModules", module)}
              />
              {labelFromMap(MODULE_LABELS, module)}
            </label>
          ))}
        </div>
        <div style={billingBox}>
          <b>Předplatné</b>
          <div style={meta}>
            Plán: {SUBSCRIPTION_PLAN_LABELS.trial_mvp} · Stav předplatného: {BILLING_STATUS_LABELS.trial} · Platební brána bude doplněna
          </div>
          <div style={meta}>{estimatedFeeLabel}</div>
        </div>
        <button onClick={createCompany} style={btnPrimary}>
          Založit firmu
        </button>
      </div>

      {/* LIST */}
      <div style={box}>
        <h2 style={subtitle}>Firmy</h2>
        <input
          value={companySearch}
          onChange={(e) => setCompanySearch(e.target.value)}
          placeholder="Hledat podle názvu firmy, prefixu nebo IČO"
          style={input}
        />

        {companies.length === 0 ? (
          <div style={{ opacity: 0.6 }}>
            Zatím není založena žádná firma
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div style={{ opacity: 0.6 }}>
            Nebyla nalezena žádná firma.
          </div>
        ) : (
          filteredCompanies.map((c) => (
            <div
              key={c.id}
              style={item}
              onClick={() => router.push(`/gss/company/${c.id}`)}
            >
              <b>{c.name}</b>{" "}
              <span style={{ opacity: 0.6 }}>({c.prefix})</span>
              <div style={meta}>
                {c.ico ? `IČO ${c.ico} · ` : ""}
                {c.country || "CZ"} · {labelFromMap(LANGUAGE_LABELS, c.language || "cs")}
              </div>
              <div style={meta}>
                Typy firmy: {formatLabels(COMPANY_TYPE_LABELS, c.companyTypes || ["manufacturing_company"])}
              </div>
              <div style={meta}>
                Stav firmy: {labelFromMap(COMPANY_STATUS_LABELS, c.status || "active")} · Stav předplatného: {labelFromMap(BILLING_STATUS_LABELS, c.billingStatus || "trial")}
              </div>
              <div style={meta}>
                Aktivní moduly: {formatLabels(MODULE_LABELS, c.activatedModules || c.selectedModules || ["GSS"])}
              </div>
              <div style={meta}>
                Datum vytvoření: {formatDate(c.createdAt)}
              </div>
              <div style={meta}>
                Zodpovědná osoba: {c.responsiblePerson || "nedoplněna"}
                {c.responsibleEmail ? ` · ${c.responsibleEmail}` : ""}
              </div>
              <div style={statusRow} onClick={(e) => e.stopPropagation()}>
                <label style={statusLabel}>
                  Změnit stav firmy
                  <select
                    value={c.status || "active"}
                    onChange={(e) => updateCompanyStatus(c.companyId || c.id, e.target.value)}
                    style={statusSelect}
                  >
                    {COMPANY_STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => router.push(`/gss/company/${c.id}`)}
                  style={btnSecondary}
                >
                  Otevřít detail firmy
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ===========================
// Styles
// ===========================
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
  maxWidth: 820,
  fontSize: 14,
  lineHeight: 1.5,
  opacity: 0.7,
  marginBottom: 24,
};

const note = {
  fontSize: 13,
  lineHeight: 1.45,
  opacity: 0.65,
  marginBottom: 14,
};

const subtitle = {
  fontSize: 18,
  fontWeight: 800,
  marginBottom: 12,
};

const box = {
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 12,
  padding: 16,
  marginBottom: 20,
};

const input = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "#000",
  color: "#fff",
  marginBottom: 10,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 10,
};

const checkboxGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 8,
  marginBottom: 14,
};

const checkboxLabel = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  fontSize: 13,
  opacity: 0.85,
};

const sectionLabel = {
  margin: "10px 0 8px",
  fontSize: 13,
  fontWeight: 800,
  opacity: 0.75,
};

const billingBox = {
  border: "1px solid rgba(255,255,255,0.10)",
  padding: 10,
  marginBottom: 14,
};

const btnPrimary = {
  padding: "10px 14px",
  borderRadius: 8,
  background: "rgba(124,58,237,0.35)",
  border: "1px solid rgba(124,58,237,0.6)",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};

const btnSecondary = {
  padding: "8px 12px",
  borderRadius: 8,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.18)",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const item = {
  padding: 12,
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  cursor: "pointer",
};

const meta = {
  marginTop: 4,
  fontSize: 12,
  opacity: 0.6,
};

const statusRow = {
  marginTop: 10,
  display: "flex",
  alignItems: "end",
  gap: 10,
  flexWrap: "wrap",
};

const statusLabel = {
  display: "inline-flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 12,
  opacity: 0.85,
};

const statusSelect = {
  minWidth: 220,
  padding: 8,
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "#000",
  color: "#fff",
};
