// /app/gpc/data.js
// GPC DEMO – VRTÁKY + FRÉZY
// JEDEN EXPORT / JEDNA STRUKTURA

export const tools = [

  // ============================================================
  // SANDVIK – MONOLITNÍ VRTÁK
  // ============================================================
  {
    gpc_id: "73-555-321-50391",
    tool_category: "drill",

    name: "Sandvik Coromant 860.1-1050-056A1-MM M2BM",
    manufacturer: "Sandvik Coromant",

    image_main: "/images/tools/sandvik_860-1-1050-056a1-mm_m2bm_main.png",
    image_drawing: "/images/tools/sandvik_860-1-1050-056a1-mm_m2bm_drawing.png",

    dimensions: {
      cutting_diameter_mm: 10.5,
      flute_length_mm: 56,
      overall_length_mm: 118,
      shank_diameter_mm: 10.5,
      flutes: 2
    },

    parameters: {
      J21: { cz: "Identifikační číslo", value: "08419421" },
      J22: { cz: "Označení výrobce", value: "860.1-1050-056A1-MM M2BM" },
      J3:  { cz: "Výrobce", value: "Sandvik Coromant" },

      E1:  { cz: "Vrcholový úhel", value: "140°" },
      D3:  { cz: "Úhel šroubovice", value: "30°" },

      H4:  { cz: "Materiál", value: "Solid carbide" },
      H5:  { cz: "Povlak", value: "TiAlN" }
    }
  },

  // ============================================================
  // WALTER – MONOLITNÍ VRTÁK
  // ============================================================
  {
    gpc_id: "73-555-321-50392",
    tool_category: "drill",

    name: "Walter DC170-05-10.500A1-WJ30EJ",
    manufacturer: "Walter",

    image_main: "/images/tools/walter_dc170-05-10.500a1-wj30ej_main.png",
    image_drawing: "/images/tools/walter_dc170-05-10.500a1-wj30ej_drawing.png",

    dimensions: {
      cutting_diameter_mm: 10.5,
      flute_length_mm: null,
      overall_length_mm: 118,
      shank_diameter_mm: 10.5,
      flutes: 2
    },

    parameters: {
      J22: { cz: "Označení výrobce", value: "DC170-05-10.500A1-WJ30EJ" },
      J3:  { cz: "Výrobce", value: "Walter" },

      D3:  { cz: "Úhel šroubovice", value: "30°" },
      H5:  { cz: "Povlak", value: "TiAlN / AlCrN" }
    }
  },

  // ============================================================
  // SECO – MONOLITNÍ FRÉZA 980100-MEGA
  // ============================================================
  {
    gpc_id: "73-777-100-00001",
    tool_category: "mill",

    name: "Seco 980100-MEGA",
    manufacturer: "Seco Tools",

    image_main: "/images/tools/seco_980100_mega_main.png",
    image_drawing: "/images/tools/seco_980100_mega_drawing.png",

    dimensions: {
      cutting_diameter_mm: 5,
      flute_length_mm: 30,
      overall_length_mm: 80,
      shank_diameter_mm: 10,
      flutes: 2
    },

    parameters: {
      J21: { cz: "Objednací číslo", value: "02511341" },
      J22: { cz: "Název produktu", value: "980100-MEGA" },
      J3:  { cz: "Výrobce", value: "Seco Tools" },

      APX: { cz: "Max. hloubka řezu", value: "1.17 mm" },
      RE:  { cz: "Rohový rádius", value: "0.8 mm" },

      F1:  { cz: "Směr řezu", value: "Pravý" },
      F4:  { cz: "Úhel šroubovice", value: "0°" },

      H4:  { cz: "Materiál", value: "Solid carbide" },
      H5:  { cz: "Povlak", value: "MEGA" }
    }
  },

  // ============================================================
  // ISCAR – MONOLITNÍ FRÉZA
  // ============================================================
  {
    gpc_id: "73-777-100-00002",
    tool_category: "mill",

    name: "ISCAR EB-A2 03-03-06C06H60 IC903",
    manufacturer: "ISCAR",

    image_main: "/images/tools/iscar_eb_a2_03_03_06c06h60_ic903_main.jpg",
    image_drawing: "/images/tools/iscar_eb_a2_03_03_06c06h60_ic903_drawing.png",

    dimensions: {
      cutting_diameter_mm: 6,
      flute_length_mm: 18,
      overall_length_mm: 60,
      shank_diameter_mm: 6,
      flutes: 2
    },

    parameters: {
      H4: { cz: "Materiál", value: "Solid carbide" },
      H5: { cz: "Povlak", value: "IC903" }
    }
  },

  // ============================================================
  // MTTM – VLASTNÍ FRÉZA (STABILNÍ)
  // ============================================================
  {
    gpc_id: "73-777-100-00003",
    tool_category: "mill",

    name: "MTTM MT37.6F-12x56x12x100-L",
    manufacturer: "MTTM",

    image_main: "/images/tools/mttm_mt37_6f_12x56x12x100_main.jpg",
    image_drawing: null,

    dimensions: {
      cutting_diameter_mm: 12,
      flute_length_mm: 56,
      overall_length_mm: 100,
      shank_diameter_mm: 12,
      flutes: 6
    },

    parameters: {
      H4: { cz: "Materiál", value: "Solid carbide" },
      H5: { cz: "Povlak", value: "Bez povlaku" }
    }
  }

];
