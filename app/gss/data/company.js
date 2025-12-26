// /app/gss/data/company.js
// DEMO – firma + hlavní sklad

const company = {
  company_id: "DEMO-001",
  name: "Gogrou Demo s.r.o.",

  warehouses: [
    {
      warehouse_id: "WH-MAIN",
      name: "Hlavní sklad",
      type: "MAIN",
      is_default: true,
    },
  ],
};

export default company;
