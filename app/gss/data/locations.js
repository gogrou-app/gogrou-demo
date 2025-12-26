// /app/gss/data/locations.js
// GSS DEMO – definice skladů (počítají kusy) a míst pohybu (nepočítají kusy)

export const WAREHOUSES = [
  { id: "MAIN", name: "Hlavní sklad", is_main: true },
  { id: "STM01", name: "STM01" },
  { id: "CNC", name: "Výdejna CNC" }
];

export const PLACES = [
  {
    id: "SETUP",
    name: "Seřizovna",
    kind: "place"
  },
  {
    id: "PRODUCTION",
    name: "Výroba",
    kind: "group",
    children: [
      { id: "MAZAK_1", name: "CNC Mazak 1" },
      { id: "MAZAK_2", name: "CNC Mazak 2" }
    ]
  },
  {
    id: "SERVICE",
    name: "Servis",
    kind: "place"
  },
  {
    id: "GRINDING",
    name: "Brusírna",
    kind: "place"
  }
];

// Pomocná funkce – hezké jméno lokace podle kódu
export function resolveLocationLabel(loc) {
  // loc: { kind: "warehouse"|"place", id: string, childId?: string }
  if (!loc) return "Neznámé místo";

  if (loc.kind === "warehouse") {
    const wh = WAREHOUSES.find((w) => w.id === loc.id);
    return wh ? wh.name : `Sklad ${loc.id}`;
  }

  if (loc.kind === "place") {
    const p = PLACES.find((x) => x.id === loc.id);
    if (!p) return `Místo ${loc.id}`;

    if (p.kind === "group") {
      if (loc.childId) {
        const c = p.children?.find((y) => y.id === loc.childId);
        return c ? `${p.name} – ${c.name}` : `${p.name}`;
      }
      return p.name;
    }

    return p.name;
  }

  return "Neznámé místo";
}
