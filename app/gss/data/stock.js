// /app/gss/data/stock.js
// GSS DEMO – skladové položky (provozní data)
// Napojení na GPC přes gpc_id (read-only z GPC)

export const stockItems = [
  {
    id: "MAIN-0001",
    gpc_id: "73-555-321-50391", // Sandvik vrták
    company: "DEMO",
    warehouse: "MAIN",
    quantity: 8,
    min: 5,
    max: 20,

    // GSS životní cyklus (patří do GSS, ne do GPC)
    resharpenable: false,
    max_resharpens: 0,
    service_provider: "MTTM (default)",
    note: "DEMO položka",
  },
  {
    id: "MAIN-0002",
    gpc_id: "73-555-321-50392", // Walter vrták
    company: "DEMO",
    warehouse: "MAIN",
    quantity: 0,
    min: 5,
    max: 20,
    resharpenable: false,
    max_resharpens: 0,
    service_provider: "MTTM (default)",
    note: "",
  },
  {
    id: "MAIN-0003",
    gpc_id: "73-555-321-50393", // Seco vrták
    company: "DEMO",
    warehouse: "MAIN",
    quantity: 3,
    min: 5,
    max: 20,
    resharpenable: false,
    max_resharpens: 0,
    service_provider: "MTTM (default)",
    note: "",
  },
  {
    id: "MAIN-0004",
    gpc_id: "73-777-100-00001", // Walter fréza
    company: "DEMO",
    warehouse: "MAIN",
    quantity: 2,
    min: 2,
    max: 10,
    resharpenable: true,
    max_resharpens: 6,
    service_provider: "MTTM (default)",
    note: "Brousitelná – DEMO",
  },
  {
    id: "MAIN-0005",
    gpc_id: "73-777-100-00002", // ISCAR fréza
    company: "DEMO",
    warehouse: "MAIN",
    quantity: 1,
    min: 2,
    max: 8,
    resharpenable: true,
    max_resharpens: 8,
    service_provider: "MTTM (default)",
    note: "",
  },
  {
    id: "MAIN-0006",
    gpc_id: "73-777-100-00003", // Seco fréza
    company: "DEMO",
    warehouse: "MAIN",
    quantity: 5,
    min: 3,
    max: 12,
    resharpenable: true,
    max_resharpens: 10,
    service_provider: "MTTM (default)",
    note: "",
  },
  {
    id: "MAIN-0007",
    gpc_id: "73-777-100-00004", // MTTM fréza
    company: "DEMO",
    warehouse: "MAIN",
    quantity: 4,
    min: 3,
    max: 15,
    resharpenable: true,
    max_resharpens: 12,
    service_provider: "MTTM (default)",
    note: "MTTM – DEMO flagship",
  },
];

// helper: find by id
export function getStockItemById(id) {
  return stockItems.find((s) => String(s.id) === String(id)) || null;
}
