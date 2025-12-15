// /app/gpc/data.js
// GPC DEMO – VRTÁKY + FRÉZY
// !!! JEDEN EXPORT, JEDNA STRUKTURA !!!

const tools = [

  // ============================================================
  // SANDVIK – VRTÁK
  // ============================================================
  {
    gpc_id: "73-555-321-50391",
    gtin: "08419421",
    name: "Sandvik Coromant 860.1-1050-056A1-MM M2BM",
    type: "Vrták – monolitní TK",
    manufacturer: "Sandvik Coromant",

    image_main: "/images/tools/sandvik_860-1-1050-056a1-mm_m2bm_main.png",
    image_drawing: "/images/tools/sandvik_860-1-1050-056a1-mm_m2bm_drawing.png",

    geometry: {
      diameter_mm: 10.5,
      flute_length_mm: 56,
      overall_length_mm: 118,
      flutes: 2,
      helix_angle_deg: 30,
      point_angle_deg: 140
    },

    material: "Solid carbide",
    coating: "TiAlN"
  },

  // ============================================================
  // WALTER – VRTÁK
  // ============================================================
  {
    gpc_id: "73-555-321-50392",
    gtin: "06745276",
    name: "Walter DC170-05-10.500A1-WJ30EJ",
    type: "Vrták – monolitní TK",
    manufacturer: "Walter",

    image_main: "/images/tools/walter_dc170-05-10.500a1-wj30ej_main.png",
    image_drawing: "/images/tools/walter_dc170-05-10.500a1-wj30ej_drawing.png",

    geometry: {
      diameter_mm: 10.5,
      overall_length_mm: 118,
      flutes: 2,
      helix_angle_deg: 30
    },

    material: "Solid carbide",
    coating: "AlCrN"
  },

  // ============================================================
  // SECO – VRTÁK
  // ============================================================
  {
    gpc_id: "73-555-321-50393",
    gtin: "03046226",
    name: "Seco SD205A-1050-056-12R1-P",
    type: "Vrták – monolitní TK",
    manufacturer: "Seco Tools",

    image_main: "/images/tools/seco_sd205a-1050-056-12r1-p_main.png",
    image_drawing: "/images/tools/seco_sd205a-1050-056-12r1-p_drawing.png",

    geometry: {
      diameter_mm: 10.5,
      flute_length_mm: 56,
      overall_length_mm: 118,
      flutes: 2,
      helix_angle_deg: 30
    },

    material: "Solid carbide",
    coating: "TiAlN"
  },

  // ============================================================
  // WALTER – FRÉZA MC230
  // ============================================================
  {
    gpc_id: "73-777-100-00001",
    gtin: null,
    name: "Walter MC230-20.0A4L100C-WK40TF",
    type: "Fréza – monolitní TK",
    manufacturer: "Walter",

    image_main: "/images/tools/walter_mc230_20_0a4l100c_wk40tf_main.png",
    image_drawing: "/images/tools/walter_mc230_20_0a4l100c_wk40tf_drawing.png",

    geometry: {
      diameter_mm: 20,
      flute_length_mm: 40,
      overall_length_mm: 100,
      shank_diameter_mm: 20,
      flutes: 4
    },

    material: "Solid carbide",
    coating: "WK40TF"
  },

  // ============================================================
  // ISCAR – FRÉZA EB-A2
  // ============================================================
  {
    gpc_id: "73-777-100-00002",
    gtin: null,
    name: "ISCAR EB-A2 03-03-06C06H60 IC903",
    type: "Fréza – monolitní TK",
    manufacturer: "ISCAR",

    image_main: "/images/tools/iscar_eb_a2_03_03_06c06h60_ic903_main.jpg",
    image_drawing: "/images/tools/iscar_eb_a2_03_03_06c06h60_ic903_drawing.png",

    geometry: {
      diameter_mm: 6,
      flute_length_mm: 18,
      overall_length_mm: 60,
      shank_diameter_mm: 6,
      flutes: 2
    },

    material: "Solid carbide",
    coating: "IC903"
  },

  // ============================================================
  // SECO – FRÉZA MEGA
  // ============================================================
  {
    gpc_id: "73-777-100-00003",
    gtin: null,
    name: "Seco 980100-MEGA",
    type: "Fréza – monolitní TK",
    manufacturer: "Seco Tools",

    image_main: "/images/tools/seco_980100_mega_main.png",
    image_drawing: "/images/tools/seco_980100_mega_drawing.jpg",

    geometry: {
      diameter_mm: 5,
      flute_length_mm: 15,
      overall_length_mm: 80,
      shank_diameter_mm: 6,
      flutes: 2
    },

    material: "Solid carbide",
    coating: "MEGA"
  },

  // ============================================================
  // MTTM – VLASTNÍ FRÉZA
  // ============================================================
  {
    gpc_id: "73-777-100-00004",
    gtin: null,
    name: "MTTM MT37.6F-12x56x12x100-L",
    type: "Fréza – monolitní TK",
    manufacturer: "MTTM",

    image_main: "/images/tools/mttm_mt37_6f_12x56x12x100_main.jpg",
    image_drawing: null,

    geometry: {
      diameter_mm: 12,
      flute_length_mm: 56,
      overall_length_mm: 100,
      shank_diameter_mm: 12,
      flutes: 6
    },

    material: "Solid carbide",
    coating: null
  }

];

export default tools;
