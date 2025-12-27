// /app/gss/data/gssStore.js
"use client";

import company from "./company";

const STORAGE_KEY = "gogrou_gss_stock";

/* ======================================================
   ZÁKLAD
====================================================== */

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

function saveGssState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* ======================================================
   GSS STOCK – ZALOŽENÍ POLOŽKY
====================================================== */

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

    last_movement: null,
    created_at: new Date().toISOString(),
  });

  saveGssState(state);
}

export function getMainWarehouseStock() {
  const state = getGssState();
  if (!state) return [];

  const main = state.warehouses.find((w) => w.is_default);
  return main ? main.stock : [];
}

/* ======================================================
   KROK 5 – PŘÍJEM NA HLAVNÍ SKLAD (IN)
====================================================== */

/**
 * Příjem z nákupu / dodavatele
 * – bezpečný
 * – bez historie (zatím)
 * – připravený na audit
 */
export function receiveToMainWarehouse({
  gss_stock_id,
  quantity,
  document_ref, // dodací list / faktura / cokoliv
}) {
  const state = getGssState();
  if (!state) return;

  const main = state.warehouses.find((w) => w.is_default);
  if (!main) return;

  const item = main.stock.find(
    (s) => String(s.gss_stock_id) === String(gss_stock_id)
  );

  if (!item) {
    alert("Položka ve skladu nenalezena.");
    return;
  }

  if (quantity <= 0) {
    alert("Počet kusů musí být větší než 0.");
    return;
  }

  item.quantity += quantity;
  item.last_movement = {
    type: "RECEIPT",
    quantity,
    document_ref,
    timestamp: new Date().toISOString(),
  };

  saveGssState(state);
}

/* ======================================================
   KROK 7 – VÝDEJ DO VÝROBY (OUT)
====================================================== */

/**
 * Výdej do výroby / na zakázku / stroj
 * – nikdy nejde do mínusu
 * – symetrie k příjmu
 */
export function issueToProduction({
  gss_stock_id,
  quantity,
  target_ref, // zakázka / stroj / pracoviště
}) {
  const state = getGssState();
  if (!state) return;

  const main = state.warehouses.find((w) => w.is_default);
  if (!main) return;

  const item = main.stock.find(
    (s) => String(s.gss_stock_id) === String(gss_stock_id)
  );

  if (!item) {
    alert("Položka ve skladu nenalezena.");
    return;
  }

  if (quantity <= 0) {
    alert("Počet kusů musí být větší než 0.");
    return;
  }

  if (item.quantity < quantity) {
    alert("Nedostatek kusů na skladě.");
    return;
  }

  item.quantity -= quantity;
  item.last_movement = {
    type: "ISSUE",
    quantity,
    target_ref,
    timestamp: new Date().toISOString(),
  };

  saveGssState(state);
}
