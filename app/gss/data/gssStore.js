// /app/gss/data/gssStore.js
// GSS – jednoduchý LocalStorage store pro DEMO

const STORAGE_KEY = "GSS_STOCK_DATA";

// ==================================================
// LOAD
// ==================================================
export function loadGssStock() {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("GSS load error", e);
    return [];
  }
}

// ==================================================
// SAVE
// ==================================================
export function saveGssStock(stock) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stock));
}

// ==================================================
// ADD STOCK (z GPC)
// ==================================================
export function addGssStockItem(newStockItem) {
  const stock = loadGssStock();

  const exists = stock.find(
    (s) => s.gpc_id === newStockItem.gpc_id
  );

  if (exists) return stock;

  const updated = [...stock, newStockItem];
  saveGssStock(updated);
  return updated;
}

// ==================================================
// UPDATE STOCK
// ==================================================
export function updateGssStock(stockId, updater) {
  const stock = loadGssStock();

  const updated = stock.map((s) =>
    s.gss_stock_id === stockId ? updater(s) : s
  );

  saveGssStock(updated);
  return updated;
}

// ==================================================
// CLEAR (jen pro DEMO / RESET)
// ==================================================
export function clearGssStock() {
  localStorage.removeItem(STORAGE_KEY);
}
