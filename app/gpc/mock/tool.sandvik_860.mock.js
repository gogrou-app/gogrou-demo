// app/gpc/mock/tool.sandvik_860.mock.js

const toolSandvik860 = {
  // ================= CORE IDENTITY =================
  gpc_id: "73-555-321-50391", // interní GPC ID (demo)
  gpc_type_code: "STROJIRENSTVI::TOOL::DRILL", // pouze identita / tag

  gtin: "8419421",

  name: "860.1-1050-056A1-MM M2BM",

  manufacturer: {
    name: "Sandvik Coromant",
    code: "SV"
  },

  // ================= BASIC CLASSIFICATION =================
  toolType: {
    label: "Vrták – monolitní",
    tsCode: "DRILL_SOLID"
  },

  // ================= MARKET STATUS (MANUFACTURER) =================
  status: "active", // active | phase_out | discontinued
  replacement_gpc_id: null,

  // ================= BASIC DESCRIPTION =================
  description:
    "Monolitní tvrdokovový vrták CoroDrill® 860-MM s vnitřním chlazením pro produktivní vrtání širokého spektra materiálů.",

  application:
    "Vrtání slepých a průchozích otvorů v ocelích, litinách a nerezových materiálech.",

  // ================= KEY PARAMETERS =================
  keyParameters: [
    { label: "Průměr břitu", value: "10.5 mm", code: "A11" },
    { label: "Celková délka", value: "118 mm", code: "B5" },
    { label: "Délka břitu", value: "56 mm", code: "B4" },
    { label: "Počet zubů", value: "2", code: "D1" },
    { label: "Materiál nástroje", value: "Tvrdokov (HM)", code: "H4" },
    { label: "Povlak / třída", value: "M2BM", code: "H3" },
    { label: "Úhel špičky", value: "140°", code: "E1" },
    {
      label: "Chlazení",
      value: "Vnitřní – axiální (vstup i výstup)",
      code: "H21/H22"
    }
  ],

  // ================= EXTENDED PARAMETERS =================
  extendedParameters: [
    { label: "Délka šroubovice", value: "71 mm", code: "B6" },
    { label: "Úhel šroubovice", value: "30°", code: "D3" },
    { label: "Tolerance stopky", value: "h6", code: "C31" },
    { label: "Délka stopky", value: "45 mm", code: "C4" },
    { label: "Funkční délka", value: "116.089 mm", code: "B71" },
    { label: "Max. otáčky", value: "1971 1/min", code: "D6" },
    { label: "Hmotnost", value: "0.119 kg", code: "D7" },
    { label: "Norma", value: "DIN 4000-81 / BNN1", code: "J1" }
  ],

  // ================= MATERIAL & OPERATION =================
  compatibility: ["ISO P – oceli", "ISO M – nerez", "ISO K – litiny"],
  operationType: ["Vrtání"],

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
      type: "Identifying order number (TU)",
      value: "8419421"
    },
    {
      type: "Product name (TU)",
      value: "860.1-1050-056A1-MM M2BM"
    }
  ],

  // ================= SYSTEM METADATA =================
  metadata: {
    source: "ToolsUnited",
    validated: true,
    createdAt: "2024-12-01",
    updatedAt: "2025-01-10"
  }
};

export default toolSandvik860;
