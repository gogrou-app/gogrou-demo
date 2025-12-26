// GSS – STAV SKLADU (DEMO)
// KROK 2: NASKLADNĚNÍ DM KUSŮ NA HLAVNÍ SKLAD

const gssStock = [
  {
    gss_stock_id: "STOCK-TEST-001",

    // vazba na GPC
    gpc_id: "73-555-321-50391",

    tracking_mode: "dm",
    sharpenable: true,

    default_location: "warehouse:MAIN",

    // ============================
    // DM KUSY – NYNÍ UŽ EXISTUJÍ
    // ============================
    items: [
      {
        gss_item_id: "ITEM-0001",
        dm_code: "DM-TEST-0001",
        status: "in_stock",
        location: "warehouse:MAIN",
        resharpen_count: 0,
        max_resharpen_count: 3
      },
      {
        gss_item_id: "ITEM-0002",
        dm_code: "DM-TEST-0002",
        status: "in_stock",
        location: "warehouse:MAIN",
        resharpen_count: 0,
        max_resharpen_count: 3
      },
      {
        gss_item_id: "ITEM-0003",
        dm_code: "DM-TEST-0003",
        status: "in_stock",
        location: "warehouse:MAIN",
        resharpen_count: 1,
        max_resharpen_count: 3
      }
    ]
  }
];

export default gssStock;
