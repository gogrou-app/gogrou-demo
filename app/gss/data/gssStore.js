// /app/gss/data/gssStore.js
"use client";

import company from "./company";

const STORAGE_KEY = "gogrou_gss_state";
const SERVICE_KEY = "gogrou_gss_service";

/**
 * =========================================================
 *  GSS STATE (firma + sklady + stock)
 * =========================================================
 */
export function getGssState() {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = {
      company_id: company.company_id,
      warehouses: company.warehouses.map((w) => ({
        ...w,
        stock: [],
      })),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(raw);
}

function saveGssState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Vrátí stock hlavního skladu
 */
export function getMainWarehouseStock() {
  const state = getGssState();
  if (!state) return [];

  const main = state.warehouses.find((w) => w.is_default);
  return main ? main.stock : [];
}

/**
 * Přidání položky z GPC do GSS (0 ks) v hlavním skladu
 */
export function addStockItemFromGPC(tool) {
  const state = getGssState();
  if (!state) return;

  const mainWarehouse = state.warehouses.find((w) => w.is_default);
  if (!mainWarehouse) {
    alert("Chybí hlavní sklad firmy!");
    return;
  }

  const exists = mainWarehouse.stock.find(
    (s) => String(s.gpc_id) === String(tool.gpc_id)
  );
  if (exists) {
    alert("Tato položka už je ve skladu založena.");
    return;
  }

  const newId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `STOCK-${Date.now()}`;

  mainWarehouse.stock.push({
    gss_stock_id: newId,
    gpc_id: tool.gpc_id,
    name: tool.name,

    // DEMO: zatím quantity (DM přijde později)
    tracking_mode: "quantity",
    quantity: 0,

    min: null,
    max: null,

    created_at: new Date().toISOString(),
  });

  saveGssState(state);

  // init servisních nastavení
  ensureServiceState();
  const map = getServiceMap();
  if (!map[newId]) {
    map[newId] = {
      sharpenable: false,
      max_resharpens: 0,
      service_provider: "MTTM",
      note: "",
      use_count: 0,
      service_count: 0,
      discarded_count: 0,
      last_recommendation: "",
      updated_at: new Date().toISOString(),
    };
    saveServiceMap(map);
  }
}

/**
 * =========================================================
 *  SERVICE SETTINGS (per GSS_STOCK)
 *  - sharpenable, max_resharpens, provider, note
 *  - use_count, service_count
 * =========================================================
 */
function ensureServiceState() {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(SERVICE_KEY);
  if (!raw) localStorage.setItem(SERVICE_KEY, JSON.stringify({}));
}

function getServiceMap() {
  ensureServiceState();
  const raw = localStorage.getItem(SERVICE_KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveServiceMap(map) {
  localStorage.setItem(SERVICE_KEY, JSON.stringify(map));
}

export function getServiceSettings(stockId) {
  const map = getServiceMap();
  return map[stockId] || null;
}

export function updateServiceSettings(stockId, settings) {
  const map = getServiceMap();
  map[stockId] = {
    ...(map[stockId] || {}),
    ...settings,
    updated_at: new Date().toISOString(),
  };
  saveServiceMap(map);
}

/**
 * NÁVRAT Z VÝROBY = zvýší use_count o 1 a vrátí nový stav
 */
export function registerReturnFromProduction(stockId) {
  const s = getServiceSettings(stockId) || {};
  const next = {
    ...s,
    use_count: Number(s.use_count || 0) + 1,
    updated_at: new Date().toISOString(),
  };
  updateServiceSettings(stockId, next);
  return next;
}

/**
 * NA SERVIS = zvýší service_count o 1
 */
export function registerSendToService(stockId) {
  const s = getServiceSettings(stockId) || {};
  const next = {
    ...s,
    service_count: Number(s.service_count || 0) + 1,
    updated_at: new Date().toISOString(),
  };
  updateServiceSettings(stockId, next);
  return next;
}

/**
 * VYŘADIT = jen evidenčně zvýší discarded_count
 */
export function registerDiscard(stockId) {
  const s = getServiceSettings(stockId) || {};
  const next = {
    ...s,
    discarded_count: Number(s.discarded_count || 0) + 1,
    updated_at: new Date().toISOString(),
  };
  updateServiceSettings(stockId, next);
  return next;
}

/**
 * Změna množství (příjem/výdej) – jednoduché, bez historie
 */
export function adjustQuantity(stockId, delta) {
  const state = getGssState();
  if (!state) return;

  const main = state.warehouses.find((w) => w.is_default);
  if (!main) return;

  const idx = main.stock.findIndex(
    (s) => String(s.gss_stock_id) === String(stockId)
  );
  if (idx === -1) return;

  const current = Number(main.stock[idx].quantity || 0);
  const next = Math.max(0, current + Number(delta || 0));

  main.stock[idx] = { ...main.stock[idx], quantity: next };
  saveGssState(state);
}

export function setMinMax(stockId, min, max) {
  const state = getGssState();
  if (!state) return;

  const main = state.warehouses.find((w) => w.is_default);
  if (!main) return;

  const idx = main.stock.findIndex(
    (s) => String(s.gss_stock_id) === String(stockId)
  );
  if (idx === -1) return;

  main.stock[idx] = {
    ...main.stock[idx],
    min: min === "" ? null : Number(min),
    max: max === "" ? null : Number(max),
  };
  saveGssState(state);
}
