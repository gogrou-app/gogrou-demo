// GSS – Skladové položky + DM kusy
// DEMO data – později API / DB

const gssStock = [
  {
    id: "STOCK-001",
    name: "Neznámá položka",
    type: "tool",
    mode: "DM",
    main_location: "warehouse:MAIN",

    dm_items: [
      {
        dm_code: "DM-SANDVIK-0001",
        status: "in_stock",
        location: "warehouse:MAIN",
        sharpen_count: 0
      },
      {
        dm_code: "DM-SANDVIK-0002",
        status: "in_production",
        location: "machine:CNC_MAZAK_01",
        sharpen_count: 1
      }
    ]
  },

  {
    id: "STOCK-002",
    name: "Testovací nástroj",
    type: "tool",
    mode: "DM",
    main_location: "warehouse:MAIN",

    dm_items: [
      {
        dm_code: "DM-TEST-0001",
        status: "in_stock",
        location: "warehouse:MAIN",
        sharpen_count: 0
      }
    ]
  }
];

export default gssStock;

/* =========================================================
   🔍 DM LOOKUP – READ ONLY (C2)
   ========================================================= */

// Najdi DM kus podle DM kódu (napříč celým GSS)
export function findDmByCode(dmCode) {
  for (const stock of gssStock) {
    const found = stock.dm_items.find(
      (dm) => dm.dm_code === dmCode
    );

    if (found) {
      return {
        stockId: stock.id,
        stockName: stock.name,
        ...found
      };
    }
  }

  return null;
}
