// /app/gpc/data.js
// GPC DEMO – VRTÁKY + FRÉZY

const tools = [

  // ============================================================
  // 1) SANDVIK 860.1-1050-056A1-MM M2BM (VRTÁK)
  // ============================================================
  {
    id: "08419421",
    gpc_id: "73-555-321-50391",
    name: "Sandvik Coromant 860.1-1050-056A1-MM M2BM",
    type: "TK vrták monolitní",
    manufacturer: "Sandvik Coromant",

    image_main: "/images/tools/sandvik_860-1-1050-056a1-mm_m2bm_main.png",
    image_drawing: "/images/tools/sandvik_860-1-1050-056a1-mm_m2bm_drawing.png",

    diameter: "10.5 mm",
    overall_length: "118 mm",

    parameters: {
      J21: { cz: "Identifikační číslo", value: "08419421" },
      J22: { cz: "Název produktu", value: "860.1-1050-056A1-MM M2BM" },
      J3:  { cz: "Výrobce", value: "Sandvik Coromant" },

      A11: { cz: "Řezný průměr", value: "10.5 mm" },
      B4:  { cz: "Použitelná délka", value: "56 mm" },
      B5:  { cz: "Celková délka", value: "118 mm" },

      D1:  { cz: "Počet břitů", value: "2" },
      D3:  { cz: "Úhel šroubovice", value: "30°" },

      E1:  { cz: "Vrcholový úhel", value: "140°" },
      H4:  { cz: "Materiál", value: "Solid carbide" },
      H5:  { cz: "Povlak", value: "TiAlN" }
    }
  },

  // ============================================================
  // 2) WALTER DC170-05-10.500A1-WJ30EJ (VRTÁK)
  // ============================================================
  {
    id: "06745276",
    gpc_id: "73-555-321-50392",
    name: "Walter DC170-05-10.500A1-WJ30EJ",
    type: "TK vrták monolitní",
    manufacturer: "Walter",

    image_main: "/images/tools/walter_dc170-05-10.500a1-wj30ej_main.png",
    image_drawing: "/images/tools/walter_dc170-05-10.500a1-wj30ej_drawing.png",

    diameter: "10.5 mm",
    overall_length: "118 mm",

    parameters: {
      J22: { cz: "Název produktu", value: "DC170-05-10.500A1-WJ30EJ" },
      J3:  { cz: "Výrobce", value: "Walter" },

      A11: { cz: "Řezný průměr", value: "10.5 mm" },
      B5:  { cz: "Celková délka", value: "118 mm" },

      D1:  { cz: "Počet břitů", value: "2" },
      D3:  { cz: "Úhel šroubovice", value: "30°" },

      H4:  { cz: "Materiál", value: "Solid carbide" },
      H5:  { cz: "Povlak", value: "TiAlN (AlCrN)" }
    }
  },

  // ============================================================
  // 3) SECO SD205A-1050-056-12R1-P (VRTÁK)
  // ============================================================
  {
    id: "03046226",
    gpc_id: "73-555-321-50393",
    name: "Seco SD205A-1050-056-12R1-P",
    type: "TK vrták monolitní",
    manufacturer: "Seco Tools",

    image_main: "/images/tools/seco_sd205a-1050-056-12r1-p_main.png",
    image_drawing: "/images/tools/seco_sd205a-1050-056-12r1-p_drawing.png",

    diameter: "10.5 mm",
    overall_length: "118 mm",

    parameters: {
      J22: { cz: "Název produktu", value: "SD205A-1050-056-12R1-P" },
      J3:  { cz: "Výrobce", value: "Seco Tools" },

      A11: { cz: "Řezný průměr", value: "10.5 mm" },
      B5:  { cz: "Celková délka", value: "118 mm" },

      D1:  { cz: "Počet břitů", value: "2" },
      D3:  { cz: "Úhel šroubovice", value: "30°" },

      H4:  { cz: "Materiál", value: "Solid carbide" },
      H5:  { cz: "Povlak", value: "TiAlN" }
    }
  },

  // ===============================
// GPC – MILLING TOOLS (FRÉZY)
// ===============================

export const millingTools = [

  // ---------------------------------
  // WALTER – MC230
  // ---------------------------------
  {
    gpc_id: "73-777-100-00002",
    type: "milling",
    subtype: "end_mill",

    manufacturer: "Walter",
    product_name: "MC230-20.0A4L100C-WK40TF",
    gtin: null,

    geometry: {
      cutting_diameter_mm: 20,
      flute_length_mm: 40,
      overall_length_mm: 100,
      shank_diameter_mm: 20,
      flutes: 4,
      helix_angle_deg: null
    },

    material: "Solid carbide",
    coating: "WK40TF",

    images: {
      main: "/images/tools/walter_mc230_20_0a4l100c_wk40tf_main.png",
      drawing: "/images/tools/walter_mc230_20_0a4l100c_wk40tf_drawing.png"
    }
  },

  // ---------------------------------
  // ISCAR – EB-A2 IC903
  // ---------------------------------
  {
    gpc_id: "73-777-100-00003",
    type: "milling",
    subtype: "end_mill",

    manufacturer: "ISCAR",
    product_name: "EB-A2 03-03-06C06H60 IC903",
    gtin: null,

    geometry: {
      cutting_diameter_mm: 6,
      flute_length_mm: 18,
      overall_length_mm: 60,
      shank_diameter_mm: 6,
      flutes: 2,
      helix_angle_deg: null
    },

    material: "Solid carbide",
    coating: "IC903",

    images: {
      main: "/images/tools/iscar_eb_a2_03_03_06c06h60_ic903_main.jpg",
      drawing: "/images/tools/iscar_eb_a2_03_03_06c06h60_ic903_drawing.png"
    }
  },

  // ---------------------------------
  // SECO – 980100 MEGA
  // ---------------------------------
  {
    gpc_id: "73-777-100-00004",
    type: "milling",
    subtype: "end_mill",

    manufacturer: "Seco Tools",
    product_name: "980100-MEGA",
    gtin: null,

    geometry: {
      cutting_diameter_mm: 5,
      flute_length_mm: 15,
      overall_length_mm: 80,
      shank_diameter_mm: 6,
      flutes: 2,
      helix_angle_deg: null
    },

    material: "Solid carbide",
    coating: "MEGA",

    images: {
      main: "/images/tools/seco_980100_mega_main.png",
      drawing: "/images/tools/seco_980100_mega_drawing.jpg"
    }
  },

  // ---------------------------------
  // MTTM – vlastní fréza
  // ---------------------------------
  {
    gpc_id: "73-777-100-00005",
    type: "milling",
    subtype: "end_mill",

    manufacturer: "MTTM",
    product_name: "MT37.6F-12x56x12x100-L",
    gtin: null,

    geometry: {
      cutting_diameter_mm: 12,
      flute_length_mm: 56,
      overall_length_mm: 100,
      shank_diameter_mm: 12,
      flutes: 6,
      helix_angle_deg: null
    },

    material: "Solid carbide",
    coating: null,

    images: {
      main: "/images/tools/mttm_mt37_6f_12x56x12x100_main.jpg",
      drawing: null
    }
  }

];
