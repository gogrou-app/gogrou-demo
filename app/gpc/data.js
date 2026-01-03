
const tools = [

/* =========================
   SANDVIK COROMANT
   ========================= */

{
  gpc_id: "SV-8419421",
  name: "860.1-1050-056A1-MM M2BM",
  manufacturer: "Sandvik Coromant",
  type: "Vrták – monolitní TK",
  gtin: "8419421",

  image_main: "/images/tools/sandvik/860_1_main.png",
  image_drawing: "/images/tools/sandvik/860_1_drawing.png",

  geometry: {
    diameter_mm: 10.5,
    flute_length_mm: 56,
    overall_length_mm: 118,
    shank_length_mm: 45,
    flutes: 2,
    helix_angle_deg: 30,
    point_angle_deg: 140,
  },

  cutting: {
    max_rpm: 1971,
    coolant_required: true,
    internal_coolant: true,
  },

  tool_features: {
    material: "Solid carbide",
    coating: "M2BM",
    tolerance: "h6",
    hand: "Right",
    main_application_class: "HW",
  },

  usage: {
    operations: ["Vrtání"],
    machine_connections: 2,
  },

  tu: {
    geometry: {
      A11: { label: "Minimální průměr řezu", value: 10.5, unit: "mm" },
      B4: { label: "Využitelná délka", value: 56, unit: "mm" },
      B5: { label: "Celková délka", value: 118, unit: "mm" },
      D1: { label: "Počet drážek", value: 2 },
      D3: { label: "Úhel šroubovice", value: 30, unit: "°" },
      E1: { label: "Úhel špice", value: 140, unit: "°" },
    },
    features: {
      H3: { label: "Jakost výrobce", value: "M2BM" },
      H4: { label: "Materiál těla", value: "Slinutý karbid" },
      C31: { label: "Tolerance stopky", value: "h6" },
    },
  },
},

/* =========================
   WALTER – VRTÁK DC170
   ========================= */

{
  gpc_id: "73-555-321-50392",
  name: "DC170-05-10.500A1-WJ30EJ",
  manufacturer: "Walter",
  type: "Vrták – monolitní TK",
  gtin: "06745276",

  image_main: "/images/tools/walter/dc170_main.png",
  image_drawing: "/images/tools/walter/dc170_drawing.png",

  geometry: {
    diameter_mm: 10.5,
    flute_length_mm: 56,
    overall_length_mm: 118,
    shank_diameter_mm: null,
    flutes: 2,
    helix_angle_deg: 30,
    point_angle_deg: 140,
    corner_radius_mm: null,
    neck_length_mm: 56,
  },

  cutting: {
    recommended_vc_m_min: null,
    recommended_fz_mm: null,
    coolant_required: true,
    internal_coolant: true,
    max_rpm: 100000,
  },

  tool_features: {
    material: "Solid carbide",
    coating: "TiAlN (AlCrN)",
    tolerance: "h6",
    hand: "R",
  },

  usage: {
    operations: ["Vrtání"],
    workpiece_materials: [],
    notes: null,
  },

  tu: {
    geometry: {
      A11: { label: "Min. průměr řezu", value: 10.5, unit: "mm" },
      B3: { label: "Vyložení nástroje", value: 73, unit: "mm" },
      B4: { label: "Využitelná délka", value: 56, unit: "mm" },
      B5: { label: "Celková délka", value: 118, unit: "mm" },
      B6: { label: "Délka drážky pro třísku", value: 71, unit: "mm" },
      B7: { label: "Délka špice", value: 1.911, unit: "mm" },
      B71:{ label: "Funkční délka", value: 116.089, unit: "mm" },
      D1: { label: "Počet drážek", value: 2 },
      D3: { label: "Úhel šroubovice", value: 30, unit: "°" },
      E1: { label: "Úhel špice", value: 140, unit: "°" },
      NECK_LENGTH: { label: "Délka krčku", value: 56, unit: "mm" },
    },
    cutting: {
      D6: { label: "Max. otáčky", value: 100000, unit: "1/min" },
      H21:{ label: "Vstup chladiva", value: "Axiálně souose" },
      H22:{ label: "Výstup chladiva", value: "Axiálně + radiálně" },
    },
    features: {
      H3: { label: "Jakost výrobce", value: "WJ30EJ" },
      H4: { label: "Materiál těla", value: "Slinutý karbid" },
      H5: { label: "Povlak", value: "TiAlN (AlCrN)" },
      C31:{ label: "Tolerance stopky", value: "h6" },
      J1: { label: "Norma", value: "DIN 6537 L" },
      J11:{ label: "Označení normy", value: "HA" },
      J7: { label: "Datový čip", value: "Bez datového čipu" },
    },
  },
},

/* =========================
   WALTER – FRÉZA MC230
   ========================= */

{
  gpc_id: "73-777-100-00001",
  name: "MC230-20.0A4L100C-WK40TF",
  manufacturer: "Walter",
  type: "Fréza – monolitní TK",

  image_main: "/images/tools/walter/mc230_main.png",
  image_drawing: "/images/tools/walter/mc230_drawing.png",

  geometry: {
    diameter_mm: 20,
    flute_length_mm: 38,
    overall_length_mm: 125,
    shank_diameter_mm: 19,
    flutes: 4,
    helix_angle_deg: 38,
    corner_radius_mm: 1,
    neck_length_mm: 72.134,
  },

  cutting: {
    coolant_required: false,
    internal_coolant: false,
    max_rpm: 71991,
  },

  tool_features: {
    material: "Solid carbide",
    coating: "TiAlN",
    tolerance: "h5",
    hand: "R",
  },

  usage: {
    operations: ["Drážkování", "Boční frézování", "Konturování"],
    workpiece_materials: [
      "ISO P (ocel)",
      "ISO M (nerez)",
      "ISO K (litina)",
    ],
  },

  tu: {
    geometry: {
      A1: { label: "Průměr řezu", value: 20, unit: "mm" },
      A5: { label: "Průměr krčku", value: 19, unit: "mm" },
      B2: { label: "Max. hloubka řezu", value: 38, unit: "mm" },
      B3: { label: "Vyložení nástroje", value: 75, unit: "mm" },
      B5: { label: "Celková délka", value: 125, unit: "mm" },
      B9: { label: "Délka krčku", value: 72.134, unit: "mm" },
      F21: { label: "Počet břitů (obvod)", value: 4 },
      F22: { label: "Počet břitů (čelo)", value: 4 },
      F4: { label: "Úhel šroubovice", value: 38, unit: "°" },
      G1: { label: "Poloměr rohu", value: 1, unit: "mm" },
    },
    cutting: {
      D6: { label: "Max. otáčky", value: 71991, unit: "1/min" },
      E2: { label: "Úhel čela axiální", value: 4, unit: "°" },
      E3: { label: "Úhel čela radiální", value: 8.5, unit: "°" },
      E4: { label: "Max. úhel náběhu", value: 6, unit: "°" },
    },
    features: {
      H3: { label: "Jakost", value: "WK40TF" },
      H4: { label: "Materiál těla", value: "Slinutý karbid" },
      H5: { label: "Povlak", value: "TiAlN" },
      C31: { label: "Tolerance stopky", value: "h5" },
    },
    usage: {
      ISO_P: true,
      ISO_M: true,
      ISO_K: true,
    },
  },
},

/* =========================
   SECO TOOLS
   ========================= */

{
  gpc_id: "SO-03046226",
  name: "SD205A-1050-056-12R1-P",
  manufacturer: "SECO Tools",
  type: "Vrták – monolitní TK",

  geometry: {
    diameter_mm: 10.5,
    flute_length_mm: 56,
    overall_length_mm: 118,
    flutes: 2,
    helix_angle_deg: 30,
    point_angle_deg: 140,
  },

  cutting: {
    coolant_required: true,
    internal_coolant: true,
  },

  tool_features: {
    material: "Solid carbide",
    hand: "Right",
  },

  usage: {
    operations: ["Vrtání"],
  },

  tu: {
    geometry: {
      A11: { label: "Minimální průměr řezu", value: 10.5, unit: "mm" },
      B4: { label: "Využitelná délka", value: 56, unit: "mm" },
      D1: { label: "Počet drážek", value: 2 },
    },
  },
},

/* =========================
   SECO TOOLS – 9801
   ========================= */

{
  gpc_id: "SO-980100",
  name: "980100",
  manufacturer: "SECO Tools",
  type: "Závitník / speciální nástroj",
  gtin: null,

  image_main: "/images/tools/seco/980100_main.png",
  image_drawing: "/images/tools/seco/980100_drawing.png",

  geometry: {
    diameter_mm: null,
    flute_length_mm: null,
    overall_length_mm: null,
    shank_diameter_mm: null,
    flutes: null,
    helix_angle_deg: null,
    point_angle_deg: null,
    corner_radius_mm: null,
    neck_length_mm: null,
  },

  cutting: {
    recommended_vc_m_min: null,
    recommended_fz_mm: null,
    coolant_required: null,
    internal_coolant: null,
    max_rpm: null,
  },

  tool_features: {
    material: "Solid carbide",
    coating: null,
    tolerance: null,
    hand: null,
    finish_quality: null,
  },

  usage: {
    operations: [],
    workpiece_materials: [],
    notes: null,
  },

  tu: {
    geometry: {
      NSM: { label: "Standard vlastností", value: "DIN4000-82" },
    },

    features: {
      H4: { label: "Materiál těla", value: "Slinutý karbid" },
    },

    usage: {},
  },
},

/* =========================
   ISCAR
   ========================= */

{
  gpc_id: "IS-5650090",
  name: "EB-A2 03-03/06C06H60 IC903",
  manufacturer: "Iscar",
  type: "Fréza – monolitní TK",

  geometry: {
    diameter_mm: 3,
    flute_length_mm: 3,
    overall_length_mm: 60,
    shank_diameter_mm: 6,
    flutes: 2,
    helix_angle_deg: 30,
    corner_radius_mm: 1.5,
  },

  cutting: {
    coolant_required: false,
  },

  tool_features: {
    material: "Solid carbide",
    coating: "TiAlN",
    tolerance: "h6",
    hand: "Right",
  },

  usage: {
    operations: ["Mikrofrézování"],
  },

  tu: {
    geometry: {
      A1: { label: "Průměr řezu", value: 3, unit: "mm" },
      G4: { label: "Profilový poloměr", value: 1.5, unit: "mm" },
    },
    features: {
      H3: { label: "Jakost výrobce", value: "IC903" },
    },
  },
},

];

export default tools;
