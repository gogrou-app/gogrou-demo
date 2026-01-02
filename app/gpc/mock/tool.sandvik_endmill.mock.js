// app/gpc/mock/tool.sandvik_endmill.mock.js

const toolSandvikEndMill = {
  // ================= CORE IDENTITY =================
  gpc_id: "73-555-321-60412", // interní GPC ID (demo)
  gpc_type_code: "STROJIRENSTVI::TOOL::MILL", // identita / tag

  gtin: "7323220",

  name: "CoroMill® Plura 2P342-1000-050A2-PM 1630",

  manufacturer: {
    name: "Sandvik Coromant",
    code: "SV"
  },

  // ================= BASIC CLASSIFICATION =================
  toolType: {
    label: "Fréza – monolitní",
    tsCode: "MILL_SOLID"
  },

  // ================= MARKET STATUS (MANUFACTURER) =================
  status: "active", // active | phase_out | discontinued
  replacement_gpc_id: null,

  // ================= BASIC DESCRIPTION =================
  description:
    "Monolitní tvrdokovová stopková fréza CoroMill® Plura pro vysoce produktivní frézování ocelí a nerezových materiálů.",

  application:
    "Hrubování a dokončování při bočním i čelním frézování.",

  // ================= KEY PARAMETERS =================
  keyParameters: [
    { label: "Průměr frézy", value: "10 mm", code: "A11" },
    { label: "Celková délka", value: "72 mm", code: "B5" },
    { label: "Délka břitu", value: "22 mm", code: "B4" },
    { label: "Počet zubů", value: "4", code: "D1" },
    { label: "Materiál nástroje", value: "Tvrdokov (HM)", code: "H4" },
    { label: "Povlak / třída", value: "1630", code: "H3" },
    { label: "Úhel šroubovice", value: "38°", code: "D3" }
  ],

  // ================= EXTENDED PARAMETERS =================
  extendedParameters: [
    { label: "Tolerance stopky", value: "h6", code: "C31" },
    { label: "Délka stopky", value: "30 mm", code: "C4" },
    { label: "Směr řezu", value: "Pravý", code: "F1" },
    { label: "Max. otáčky", value: "28 000 1/min", code: "D6" },
    { label: "Hmotnost", value: "0.085 kg", code: "D7" },
    { label: "Norma", value: "DIN 844", code: "J1" }
  ],

  // ================= MATERIAL & OPERATION =================
  compatibility: ["ISO P – oceli", "ISO M – nerez"],
  operationType: ["Frézování – boční", "Frézování – čelní"],

  // ================= DOCUMENTS =================
  documents: [
    {
      label: "Datasheet – ToolsUnited",
      type: "external",
      url: "https://www.toolsunited.com"
    }
  ],

  // ================= COMMERCIAL / EXTERNAL IDS =================
  identifiers: [
    {
      type: "Product name (TU)",
      value: "2P342-1000-050A2-PM 1630"
    }
  ],

  // ================= SYSTEM METADATA =================
  metadata: {
    source: "ToolsUnited",
    validated: true,
    createdAt: "2024-12-05",
    updatedAt: "2025-01-12"
  }
};

export default toolSandvikEndMill;
