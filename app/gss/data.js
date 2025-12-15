// /app/gss/data.js
// GSS DEMO – STAV SKLADU
// Jedna položka = jedna karta na skladě

const gssStock = [

  // =========================================
  // SANDVIK – vrták (brousitelný, DM)
  // =========================================
  {
    gss_stock_id: "STOCK-0001",
    gpc_id: "73-555-321-50391",

    tracking_mode: "dm",          // dm | quantity
    sharpenable: true,

    default_location: "warehouse:MAIN",
    source_document: "DL-2025-001",

    items: [
      {
        gss_item_id: "ITEM-0001",
        dm_code: "DM-SANDVIK-0001",
        status: "in_stock",
        location: "warehouse:MAIN",
        resharpen_count: 0,
        max_resharpen_count: 3
      },
      {
        gss_item_id: "ITEM-0002",
        dm_code: "DM-SANDVIK-0002",
        status: "in_stock",
        location: "warehouse:MAIN",
        resharpen_count: 1,
        max_resharpen_count: 3
      }
    ]
  },

  // =========================================
  // SECO – fréza MEGA (nebrousitelná → quantity)
  // =========================================
  {
    gss_stock_id: "STOCK-0002",
    gpc_id: "73-777-100-00003",

    tracking_mode: "quantity",
    sharpenable: false,

    default_location: "warehouse:MAIN",
    source_document: "DL-2025-002",

    quantity: 12
  }

];

export default gssStock;
