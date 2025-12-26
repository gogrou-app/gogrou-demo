// GSS – STAV SKLADU (DEMO)
// Jedna položka = jedna karta v GSS
// ZATÍM BEZ KUSŮ – pouze existence položky ve skladu

const gssStock = [
  {
    gss_stock_id: "STOCK-TEST-001",

    // vazba na GPC
    gpc_id: "73-555-321-50391",

    // dm = sledování po kusech (DM kód)
    // quantity = jen počet
    tracking_mode: "dm",

    // zda se nástroj brousí
    sharpenable: true,

    // výchozí fyzické umístění
    default_location: "warehouse:MAIN",

    // ZATÍM ŽÁDNÉ KUSY
    items: []
  }
];

export default gssStock;
