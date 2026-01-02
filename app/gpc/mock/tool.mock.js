// app/gpc/mock/tool.mock.js

const toolMock = {
  // ================= CORE IDENTITY =================
  gpcId: "GPC-WALTER-DC170-105",
  gtin: "4024035123456",

  name: "Vrták DC170 – ⌀10.5 mm, vnitřní chlazení",
  manufacturer: {
    name: "Walter",
    code: "W"
  },

  toolType: {
    label: "Vrták – monolitní",
    tsCode: "DRILL_SOLID"
  },

  // ================= MARKET STATUS (MANUFACTURER) =================
  status: "phase_out", // active | phase_out | discontinued

  replacementGpcId: "GPC-WALTER-DC170-105-A2", // null pokud bez náhrady

  // ================= BASIC DESCRIPTION =================
  description:
    "Monolitní tvrdokovový vrták s vnitřním chlazením pro přesné vrtání ocelí a litin. Vhodný pro stabilní i náročné aplikace.",

  application:
    "Vrtání slepých a průchozích otvorů ve středně pevných materiálech.",

  // ================= KEY PARAMETERS =================
  keyParameters: [
    {
      label: "Průměr břitu",
      value: "10.5 mm",
      code: "A11" // TU
    },
    {
      label: "Celková délka",
      value: "118 mm",
      code: "B5"
    },
    {
      label: "Délka břitu",
      value: "56 mm",
      code: "B4"
    },
    {
      label: "Počet zubů",
      value: "2",
      code: "D1"
    },
    {
      label: "Materiál nástroje",
      value: "Tvrdokov (HM)",
      code: "H4"
    },
    {
      label: "Povlak",
      value: "TiAlN (AlCrN)",
      code: "H5"
    },
    {
      label: "Úhel špičky",
      value: "140°",
      code: "E1"
    },
    {
      label: "Chlazení",
      value: "Vnitřní – axiální + radiální",
      code: "H21/H22"
    }
  ],

  // ================= EXTENDED PARAMETERS =================
  extendedParameters: [
    {
      label: "Délka šroubovice",
      value: "71 mm",
      code: "B6"
    },
    {
      label: "Úhel šroubovice",
      value: "30°",
      code: "D3"
    },
    {
      label: "Tolerance stopky",
      value: "h6",
      code: "C31"
    },
    {
      label: "Délka stopky",
      value: "45 mm",
      code: "C4"
    },
    {
      label: "Funkční délka",
      value: "116.1 mm",
      code: "B71"
    },
    {
      label: "Max. otáčky",
      value: "100 000 1/min",
      code: "D6"
    },
    {
      label: "Hmotnost",
      value: "0.132 kg",
      code: "D7"
    },
    {
      label: "Norma",
      value: "DIN 6537 L",
      code: "J1"
    }
  ],

  // ================= MATERIAL & APPLICATION COMPATIBILITY =================
  compatibility: [
    "ISO P – oceli",
    "ISO M – nerez",
    "ISO K – litiny"
  ],

  operationType: [
    "Vrtání"
  ],

  // ================= DOCUMENTS & MEDIA =================
  documents: [
    {
      label: "Produktový obrázek",
      type: "image",
      url: "/images/tools/walter_dc170.jpg"
    },
    {
      label: "Technický výkres (PDF)",
      type: "pdf",
      url: "/docs/walter_dc170_drawing.pdf"
    },
    {
      label: "Datasheet – ToolsUnited",
      type: "external",
      url: "https://www.toolsunited.com"
    }
  ],

  // ================= COMMERCIAL IDENTITY (NO PRICE) =================
  identifiers: [
    {
      type: "Katalogové číslo výrobce",
      value: "DC170-05-10.500A1-WJ30EJ"
    },
    {
      type: "ToolsUnited ID",
      value: "6745276"
    }
  ],

  // ================= SYSTEM METADATA =================
  metadata: {
    source: "ToolsUnited",
    validated: true,
    createdAt: "2024-11-12",
    updatedAt: "2025-01-05"
  }
};

export default toolMock;
