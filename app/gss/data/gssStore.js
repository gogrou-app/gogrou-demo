// /app/gss/data/gssStore.js
// GSS STORE – LocalStorage (MVP DEMO)

const STORAGE_KEY = "gogrou_gss_stock";

/* =========================
   HELPERS
========================= */
function loadStock() {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveStock(stock) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stock));
}

/* =========================
   PUBLIC API
========================= */

// vrátí celý sklad
export function getGssStock() {
  return loadStock();
}

// přidání položky z GPC (0 ks)
export function addStockItemFromGPC(tool) {
  const stock = loadStock();

  const exists = stock.find(
    (item) => item.gpc_id === tool.gpc_id
  );

  if (exists) return; // už existuje → nic nedělej

  stock.push({
    stock_id: `STOCK-${tool.gpc_id}`,
    gpc_id: tool.gpc_id,
    name: tool.name,
    type: tool.type,
    manufacturer: tool.manufacturer,

    qty_new: 0,
    qty_sharpened: 0,

    min_qty: null,
    max_qty: null,

    created_at: new Date().toISOString(),
  });

  saveStock(stock);
}
