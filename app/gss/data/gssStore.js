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
        stock: [], // GSS STOCK položky
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

    tracking_mode: "quantity", // DM později
    quantity: 0,

    min: null,
    max: null,

    created_at: new Date().toISOString(),

    // připraveno do budoucna
    last_receipt: null,
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

/**
 * Uloží změny jedné GSS STOCK položky
 */
export function saveStockItem(updatedItem) {
  const state = getGssState();
  if (!state) return;

  const main = state.warehouses.find((w) => w.is_default);
  if (!main) return;

  const index = main.stock.findIndex(
    (s) => s.gss_stock_id === updatedItem.gss_stock_id
  );
  if (index === -1) return;

  main.stock[index] = updatedItem;
  saveGssState(state);
}

/**
 * PŘÍJEM NA SKLAD (quantity režim)
 * ✔ navýší stav
 * ✔ uloží doklad (bez historie – zatím)
 */
export function receiveStock({
  gssStockId,
  amount,
  document,
}) {
  const state = getGssState();
  if (!state) return;

  const main = state.warehouses.find((w) => w.is_default);
  if (!main) return;

  const item = main.stock.find(
    (s) => s.gss_stock_id === gssStockId
  );
  if (!item) return;

  item.quantity += amount;

  item.last_receipt = {
    ...document,
    amount,
    received_at: new Date().toISOString(),
  };

  saveGssState(state);
}
