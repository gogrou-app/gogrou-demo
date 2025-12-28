// /app/gss/data/gssStore.js
"use client";

import companyTemplate from "./company";

const STORAGE_KEY = "gogrou_gss_state_v2";

/**
 * V2 struktura:
 * {
 *   companies: [
 *     {
 *       id, name,
 *       warehouses: [{ id, name, is_default, stock: [...] }]
 *     }
 *   ]
 * }
 */

function nowIso() {
  return new Date().toISOString();
}

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** ✅ Safari/Privacy-safe UUID */
function safeUUID() {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {}
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeNumber(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function ensureV2State() {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    const parsed = safeParse(raw);
    if (parsed?.companies?.length) return parsed;
  }

  // 🔁 MIGRACE ze starého klíče (pokud existuje)
  // (pokud máš jiný legacy key, dej ho sem taky)
  const legacyRaw =
    localStorage.getItem("gogrou_gss_state") || localStorage.getItem("gogrou_gss_stock");
  const legacy = legacyRaw ? safeParse(legacyRaw) : null;

  // Výchozí firma z template
  const defaultCompany = {
    id: companyTemplate.company_id || "company-demo",
    name: companyTemplate.name || "Gogrou Demo s.r.o.",
    warehouses: (companyTemplate.warehouses || []).map((w) => ({
      id: w.id || w.warehouse_id || safeUUID(),
      name: w.name || "Sklad",
      is_default: !!w.is_default,
      stock: [],
    })),
  };

  // když template nemá sklady, vytvoř 1 default
  if (!defaultCompany.warehouses.length) {
    defaultCompany.warehouses.push({
      id: "wh-main",
      name: "Hlavní sklad",
      is_default: true,
      stock: [],
    });
  }

  // pokud legacy existuje ve formátu { company_id, warehouses:[{...stock:[]}] }
  if (legacy?.warehouses?.length) {
    defaultCompany.warehouses = legacy.warehouses.map((w) => ({
      id: w.id || w.warehouse_id || safeUUID(),
      name: w.name || "Sklad",
      is_default: !!w.is_default,
      stock: Array.isArray(w.stock) ? w.stock : [],
    }));
  }

  const v2 = { companies: [defaultCompany] };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(v2));
  return v2;
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getDefaultCompany(state) {
  return state?.companies?.[0] || null;
}

function getCompanyById(state, companyId) {
  if (!state?.companies?.length) return null;
  if (!companyId) return getDefaultCompany(state);
  return state.companies.find((c) => String(c.id) === String(companyId)) || null;
}

function getDefaultWarehouse(company) {
  if (!company?.warehouses?.length) return null;
  return company.warehouses.find((w) => w.is_default) || company.warehouses[0];
}

function getWarehouseById(company, warehouseId) {
  if (!company?.warehouses?.length) return null;
  if (!warehouseId) return getDefaultWarehouse(company);
  return company.warehouses.find((w) => String(w.id) === String(warehouseId)) || null;
}

/**
 * PUBLIC: Vrátí celý stav (V2)
 */
export function getGssState() {
  return ensureV2State();
}

/**
 * PUBLIC: Vrátí stock konkrétní firmy + skladu
 * (když nedáš nic, vezme default firmu + default sklad)
 */
export function getMainWarehouseStock(companyId, warehouseId) {
  const state = ensureV2State();
  if (!state) return [];

  const company = getCompanyById(state, companyId);
  if (!company) return [];

  const wh = getWarehouseById(company, warehouseId);
  if (!wh) return [];

  return Array.isArray(wh.stock) ? wh.stock : [];
}

/**
 * PUBLIC: Najde jednu položku podle stockId (pro detail /app/gss/[stockId])
 * hledá napříč firmami i sklady
 */
export function getStockItemById(stockId) {
  const state = ensureV2State();
  if (!state) return null;

  for (const c of state.companies || []) {
    for (const w of c.warehouses || []) {
      const found = (w.stock || []).find(
        (s) => String(s.gss_stock_id) === String(stockId)
      );
      if (found) {
        return {
          item: found,
          company: { id: c.id, name: c.name },
          warehouse: { id: w.id, name: w.name },
        };
      }
    }
  }

  return null;
}

/**
 * PUBLIC: Přidání položky z GPC do konkrétní firmy + skladu
 * (když nedáš companyId/warehouseId, jde to do default firmy + default skladu)
 */
export function addStockItemFromGPC(tool, companyId, warehouseId) {
  const state = ensureV2State();
  if (!state) return;

  const company = getCompanyById(state, companyId);
  if (!company) {
    alert("Chybí firma v GSS stavu!");
    return;
  }

  const wh = getWarehouseById(company, warehouseId);
  if (!wh) {
    alert("Chybí sklad firmy!");
    return;
  }

  const exists = (wh.stock || []).find(
    (s) => String(s.gpc_id) === String(tool.gpc_id)
  );

  if (exists) {
    alert("Tato položka už je v tomto skladu založena.");
    return;
  }

  if (!Array.isArray(wh.stock)) wh.stock = [];

  wh.stock.push({
    gss_stock_id: safeUUID(),
    gpc_id: tool.gpc_id,
    name: tool.name,

    tracking_mode: "quantity", // DM později
    quantity: 0,

    min: null,
    max: null,

    last_doc_no: null,
    last_doc_type: null, // "receipt" | "issue" | null

    service_enabled: false,
    max_resharpen: 0, // X
    uses_count: 0,
    grinder: "MTTM",
    service_note: "",

    created_at: nowIso(),
    updated_at: nowIso(),
  });

  saveState(state);
}

/**
 * PUBLIC: Uloží min/max pro položku
 */
export function updateStockMinMax(stockId, min, max) {
  const state = ensureV2State();
  if (!state) return false;

  const ctx = getStockItemById(stockId);
  if (!ctx?.item) return false;

  ctx.item.min = normalizeNumber(min);
  ctx.item.max = normalizeNumber(max);
  ctx.item.updated_at = nowIso();

  saveState(state);
  return true;
}

/**
 * PUBLIC: Příjem +ks (jednoduše) + číslo dokladu
 */
export function receiveStock(stockId, qty, docNo = "") {
  const state = ensureV2State();
  if (!state) return false;

  const ctx = getStockItemById(stockId);
  if (!ctx?.item) return false;

  const q = Number(qty);
  if (!Number.isFinite(q) || q <= 0) {
    alert("Zadej kladné číslo pro příjem.");
    return false;
  }

  ctx.item.quantity = Number(ctx.item.quantity || 0) + q;
  ctx.item.last_doc_no = String(docNo || "").trim() || null;
  ctx.item.last_doc_type = "receipt";
  ctx.item.updated_at = nowIso();

  saveState(state);
  return true;
}

/**
 * PUBLIC: Výdej -ks (jednoduše) + číslo dokladu
 */
export function issueStock(stockId, qty, docNo = "") {
  const state = ensureV2State();
  if (!state) return false;

  const ctx = getStockItemById(stockId);
  if (!ctx?.item) return false;

  const q = Number(qty);
  if (!Number.isFinite(q) || q <= 0) {
    alert("Zadej kladné číslo pro výdej.");
    return false;
  }

  const current = Number(ctx.item.quantity || 0);
  if (q > current) {
    alert("Nelze vydat více, než je skladem.");
    return false;
  }

  ctx.item.quantity = current - q;
  ctx.item.last_doc_no = String(docNo || "").trim() || null;
  ctx.item.last_doc_type = "issue";
  ctx.item.updated_at = nowIso();

  saveState(state);
  return true;
}

/**
 * PUBLIC: Servisní nastavení položky
 */
export function updateServiceSettings(stockId, data) {
  const state = ensureV2State();
  if (!state) return false;

  const ctx = getStockItemById(stockId);
  if (!ctx?.item) return false;

  ctx.item.service_enabled = !!data.service_enabled;
  ctx.item.max_resharpen = Math.max(0, Number(data.max_resharpen || 0) || 0);
  ctx.item.grinder = String(data.grinder || "MTTM");
  ctx.item.service_note = String(data.service_note || "");
  ctx.item.updated_at = nowIso();

  saveState(state);
  return true;
}

/**
 * PUBLIC: Návrat z výroby = zvýší počitadlo použití
 */
export function returnFromProduction(stockId) {
  const state = ensureV2State();
  if (!state) return false;

  const ctx = getStockItemById(stockId);
  if (!ctx?.item) return false;

  ctx.item.uses_count = Number(ctx.item.uses_count || 0) + 1;
  ctx.item.updated_at = nowIso();

  saveState(state);
  return true;
}
