// /app/gss/data/gssStock.js
// GSS DEMO – jednotná pravda o skladu
// - tracking_mode: "dm" = jedinečné DM kusy (každý kus má svůj život)
// - tracking_mode: "quantity" = jen množství (bez DM)
// - "dostupné kusy" = jen to, co je fyzicky na skladech (warehouse)
// - "v oběhu" = seřizovna/výroba/servis/brusírna (NEpočítá se do zásoby)

const gssStock = [
  // ============================================================
  // 1) SANDVIK – DM (brousitelný) – ukázka nových / ostřených / oběh
  // ============================================================
  {
    stockId: "STOCK-0001",
    gpc_id: "73-555-321-50391",

    // režim sledování
    tracking_mode: "dm", // "dm" | "quantity"
    dm_unique: true,
    sharpenable: true,

    // min/max hlavního skladu (pro NOVÉ kusy)
    policy: {
      min_new: 10,
      max_new: 20,
      warning_new: 12,

      // nadnormativ – automatika v % nad MAX (např. +20% => 120% MAX)
      overstock: {
        enabled: true,
        mode: "auto", // "auto" | "manual"
        percent_over_max: 20, // +20% nad max
        manual_qty: 0, // pokud mode="manual"
        discount_percent: 25 // pro DEMO (nadnormativ = nákupní - sleva)
      }
    },

    // DM kusy (každý má neměnný dm_code po celý život)
    dm_items: [
      {
        itemId: "ITEM-0001",
        dm_code: "DM-SANDVIK-0001",
        is_new: true,
        resharpen_count: 0,
        max_resharpen_count: 3,

        // dostupné = jen warehouse
        location: { kind: "warehouse", id: "MAIN" },

        // životní stav (UI / logika v DEMU)
        state: "in_stock" // in_stock | in_circulation | in_service | in_grinding | in_transit | retired
      },
      {
        itemId: "ITEM-0002",
        dm_code: "DM-SANDVIK-0002",
        is_new: false, // už ostřený kus
        resharpen_count: 1,
        max_resharpen_count: 3,
        location: { kind: "warehouse", id: "MAIN" },
        state: "in_stock"
      },

      // ukázka kusu v oběhu (NEpočítá se do zásoby)
      {
        itemId: "ITEM-0003",
        dm_code: "DM-SANDVIK-0003",
        is_new: true,
        resharpen_count: 0,
        max_resharpen_count: 3,
        location: { kind: "place", id: "PRODUCTION", childId: "MAZAK_1" },
        state: "in_circulation"
      }
    ]
  },

  // ============================================================
  // 2) SECO – quantity (nebrousitelné) – jen množství
  // ============================================================
  {
    stockId: "STOCK-0002",
    gpc_id: "73-777-100-00003",

    tracking_mode: "quantity",
    dm_unique: false,
    sharpenable: false,

    policy: {
      min_new: 5,
      max_new: 10,
      warning_new: 6,
      overstock: {
        enabled: true,
        mode: "manual",
        percent_over_max: 20,
        manual_qty: 3,
        discount_percent: 20
      }
    },

    // quantity režim – držíme odděleně nové/ostřené (pro DEMO logiku)
    // u nebrousitelného bude "resharpened" vždy 0, ale necháme strukturu jednotnou
    qty: {
      available_new: 12,
      available_resharpened: 0,
      in_circulation: 0
    }
  }
];

export default gssStock;
