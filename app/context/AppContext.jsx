"use client";
import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [company, setCompany] = useState("gogrou");
  const [module, setModule] = useState("GSS");
  const [warehouse, setWarehouse] = useState("main");

  return (
    <AppContext.Provider
      value={{
        company,
        setCompany,
        module,
        setModule,
        warehouse,
        setWarehouse,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
