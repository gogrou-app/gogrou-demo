"use client";

import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

const DEMO_COMPANIES = [
  {
    id: "gogrou-demo",
    name: "Gogrou Demo s.r.o.",
    warehouses: [
      { id: "main", name: "Hlavní sklad", is_default: true },
      { id: "plant-a", name: "Výroba A" },
    ],
  },
  {
    id: "mttm",
    name: "MTTM s.r.o.",
    warehouses: [
      { id: "main", name: "Centrální sklad", is_default: true },
      { id: "plant-b", name: "Výroba B" },
    ],
  },
];

export function AppProvider({ children }) {
  const [companyId, setCompanyId] = useState(DEMO_COMPANIES[0].id);
  const [warehouseId, setWarehouseId] = useState(
    DEMO_COMPANIES[0].warehouses.find(w => w.is_default)?.id
  );

  const company = DEMO_COMPANIES.find(c => c.id === companyId);
  const warehouse = company?.warehouses.find(w => w.id === warehouseId);

  return (
    <AppContext.Provider
      value={{
        companies: DEMO_COMPANIES,
        company,
        warehouse,
        setCompanyId,
        setWarehouseId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
