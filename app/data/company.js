// /app/data/company.js
// DEMO FIRMA – ZÁKLAD PRO GSS

const company = {
  company_id: "COMP-001",
  name: "DEMO Manufacturing s.r.o.",

  settings: {
    // odkud se smí vydávat do výroby
    production_issue_from: "CHILD", // MAIN | CHILD
  },

  warehouses: {
    main: {
      warehouse_id: "WH-MAIN-001",
      name: "Hlavní sklad",
      type: "MAIN",
    },

    child: {
      warehouse_id: "WH-CHILD-001",
      name: "Výrobní sklad",
      type: "CHILD",
    },
  },
};

export default company;
