// /app/gpc/data.js
// GPC DEMO – VRTÁKY + FRÉZY
// JEDEN EXPORT – STABILNÍ STRUKTURA

const tools = [

  // ============================================================
  // VRTÁKY
  // ============================================================

  {
    gpc_id: "73-555-321-50391",
    category: "drilling",
    type: "solid_drill",

    manufacturer: "Sandvik Coromant",
    product_name: "860.1-1050-056A1-MM M2BM",
    gtin: "08419421",

    images: {
      main: "/images/tools/sandvik_860-1-1050-056a1-mm_m2bm_main.png",
      drawing: "/images/tools/sandvik_860-1-1050-056a1-mm_m2bm_drawing.png"
    },

    geometry: {
      cutting_diameter_mm: 10.5,
      flute_length_mm: 56,
      overall_length_mm: 118,
      shank_diameter_mm: 10.5,
      flutes: 2,
      helix_angle_deg: 30
    },

    material: "Solid carbide",
    coating: "TiAlN",

    parameters: {
      cutting_edge_angle_deg: 140
    }
  },

  {
    gpc_id: "73-555-321-50392",
    category: "drilling",
    type: "solid_drill",

    manufacturer: "Walter",
    product_name: "DC170-05-10.500A1-WJ30EJ",
    gtin: "06745276",

    images: {
      main: "/images/tools/walter_dc170-05-10.500a1-wj30ej_main.png",
      drawing: "/images/tools/walter_dc170-05-10.500a1-wj30ej_drawing.png"
    },

    geometry: {
      cutting_diameter_mm: 10.5,
      flute_length_mm: null,
      overall_length_mm: 118,
      shank_diameter_mm: 10.5,
      flutes: 2,
      helix_angle_deg: 30
    },

    material: "Solid carbide",
    coating: "TiAlN"
  },

  // ============================================================
  // FRÉZY
  // ============================================================

  {
    gpc_id: "73-777-100-00001",
    category: "milling",
    type: "end_mill",

    manufacturer: "Seco Tools",
    product_name: "980100-MEGA",
    gtin: "00662885122996",

    images: {
      main: "/images/tools/seco_980100_mega_main.png",
      drawing: "/images/tools/seco_980100_mega_drawing.png"
    },

    geometry: {
      cutting_diameter_mm: 5,
      flute_length_mm: 15,
      overall_length_mm: 80,
      shank_diameter_mm: 10,
      flutes: 2,
      helix_angle_deg: 0,
      corner_radius_mm: 0.8
    },

    material: "Solid carbide",
    coating: "MEGA"
  },

  {
    gpc_id: "73-777-100-00002",
    category: "milling",
    type: "end_mill",

    manufacturer: "Walter",
    product_name: "MC230-20.0A4L100C-WK40TF",
    gtin: "",

    images: {
      main: "/images/tools/walter_mc230_20_0a4l100c_wk40tf_main.png",
      drawing: "/images/tools/walter_mc230_20_0a4l100c_wk40tf_drawing.png"
    },

    geometry: {
      cutting_diameter_mm: 20,
      flute_length_mm: 40,
      overall_length_mm: 100,
      shank_diameter_mm: 20,
      flutes: 4,
      helix_angle_deg: null
    },

    material: "Solid carbide",
    coating: "WK40TF"
  },

  {
    gpc_id: "73-777-100-00003",
    category: "milling",
    type: "end_mill",

    manufacturer: "ISCAR",
    product_name: "EB-A2 03-03-06C06H60 IC903",
    gtin: "",

    images: {
      main: "/images/tools/iscar_eb_a2_03_03_06c06h60_ic903_main.jpg",
      drawing: "/images/tools/iscar_eb_a2_03_03_06c06h60_ic903_drawing.png"
    },

    geometry: {
      cutting_diameter_mm: 6,
      flute_length_mm: 18,
      overall_length_mm: 60,
      shank_diameter_mm: 6,
      flutes: 2,
      helix_angle_deg: null
    },

    material: "Solid carbide",
    coating: "IC903"
  },

  {
    gpc_id: "73-777-100-00004",
    category: "milling",
    type: "end_mill",

    manufacturer: "MTTM",
    product_name: "MT37.6F-12x56x12x100-L",
    gtin: "",

    images: {
      main: "/images/tools/mttm_mt37_6f_12x56x12x100_main.jpg",
      drawing: ""
    },

    geometry: {
      cutting_diameter_mm: 12,
      flute_length_mm: 56,
      overall_length_mm: 100,
      shank_diameter_mm: 12,
      flutes: 6,
      helix_angle_deg: null
    },

    material: "Solid carbide",
    coating: ""
  }

];

export default tools;
