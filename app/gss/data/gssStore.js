// /app/gss/data/gssStore.js
"use client";

import company from "./company";

const STORAGE_KEY = "gogrou_gss_stock";

/**
 * Vrátí celý GSS stav (firma + sklady + položky)
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

/**
 * Uloží celý GSS stav
 */
function saveGssState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Přidání položky z GPC do GSS
 * → vznikne GSS STOCK (0 ks) v HLAVNÍM skladu
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

  mainWarehouse.stock.push({
    gss_stock_id: crypto.randomUUID(),
    gpc_id: tool.gpc_id,
    name: tool.name,

    tracking_mode: "quantity",
    quantity: 0,

    min: null,
    max: null,

    // pohybový základ – připraveno, ale zatím skryté
    last_movement: null,

    created_at: new Date().toISOString(),
  });

  saveGssState(state);
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

/* =========================================================
   === KROK 6 – ZÁKLAD POHYBU (READ-ONLY, BEZ HISTORIE) ===
   ========================================================= */

/**
 * PŘÍJEM NA SKLAD
 * – zvýší quantity
 * – uloží poslední pohyb (bez historie)
 */
export function receiveToMainWarehouse({
  gss_stock_id,
  quantity,
  document,
}) {
  const state = getGssState();
  if (!state) return;

  const mainWarehouse = state.warehouses.find((w) => w.is_default);
  if (!mainWarehouse) return;

  const item = mainWarehouse.stock.find(
    (s) => s.gss_stock_id === gss_stock_id
  );

  if (!item) return;

  const qty = Number(quantity);
  if (!qty || qty <= 0) {
    alert("Zadej platné množství.");
    return;
  }

  item.quantity += qty;

  item.last_movement = {
    type: "RECEIPT",
    direction: "IN",
    quantity: qty,
    document: document || null,
    at: new Date().toISOString(),
  };

  saveGssState(state);
}

/**
 * Vrátí poslední pohyb položky (read-only)
 */
export function getLastMovement(gss_stock_id) {
  const state = getGssState();
  if (!state) return null;

  const mainWarehouse = state.warehouses.find((w) => w.is_default);
  if (!mainWarehouse) return null;

  const item = mainWarehouse.stock.find(
    (s) => s.gss_stock_id === gss_stock_id
  );

  return item?.last_movement || null;
}

issueToProduction(...)
