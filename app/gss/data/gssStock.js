// /app/gss/data/gssStock.js
// GSS STOCK – POLOŽKY NA SKLADĚ (BEZ KUSŮ)
// Stav: položka existuje, ale není naskladněna

const gssStock = [
  {
    gss_stock_id: "STOCK-TEST-001",

    // vazba na GPC
    gpc_id: "73-777-100-00003", // SECO 980100-MEGA

    // režim sledování
    tracking_mode: "dm", // dm | quantity
    sharpenable: true,

    // kde položka patří
    warehouse_id: "WH-MAIN-001",

    // NASTAVENÍ (zatím prázdné)
    settings: {
      min_new: null,
      max_new: null,
      max_resharpened: null,
    },

    // ⛔ ŽÁDNÉ KUSY
    items: [],

    // historie naskladnění
    created_at: "2025-12-26T00:00:00Z",
  },
];

export default gssStock;
