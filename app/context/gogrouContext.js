// /app/context/gogrouContext.js
"use client";

/**
 * Centrální kontext Gogrou DEMO
 * Jediný zdroj pravdy:
 * firma / modul / sklad
 */

const STORAGE_KEY = "gogrou_context";

/**
 * Výchozí DEMO stav
 * (zatím jedna firma, jeden modul, jeden sklad)
 */
const DEFAULT_CONTEXT = {
  company: {
    id: "gogrou-demo",
    name: "Gogrou Demo s.r.o.",
  },

  module: {
    id: "GSS",
    label: "GSS – Skladový systém",
  },

  warehouse: {
    id: "MAIN",
    label: "Hlavní sklad",
  },
};

/**
 * Načtení kontextu
 */
export function getGogrouContext() {
  if (typeof window === "undefined") return DEFAULT_CONTEXT;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONTEXT));
    return DEFAULT_CONTEXT;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONTEXT));
    return DEFAULT_CONTEXT;
  }
}

/**
 * Uložení celého kontextu
 */
export function setGogrouContext(newContext) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newContext));
}

/**
 * Pomocné SET funkce (budeme používat později)
 */
export function setCompany(company) {
  const ctx = getGogrouContext();
  setGogrouContext({
    ...ctx,
    company,
  });
}

export function setModule(module) {
  const ctx = getGogrouContext();
  setGogrouContext({
    ...ctx,
    module,
  });
}

export function setWarehouse(warehouse) {
  const ctx = getGogrouContext();
  setGogrouContext({
    ...ctx,
    warehouse,
  });
}
