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
      shank_diameter_mm: null,
      flutes: 2,
      helix_angle_deg: 30,
      point_angle_deg: 140,
      corner_radius_mm: null,
      neck_length_mm: null,
    },

    cutting: {
      recommended_vc_m_min: null,
      recommended_fz_mm: null,
      coolant_required: null,
      internal_coolant: null,
      chipbreaker: null,
    },

    tool_features: {
      material: "Solid carbide",
      coating: "TiAlN",
      tolerance: null,
      hand: null,
      finish_quality: null,
    },

    usage: {
      operations: ["Vrtání"],
      workpiece_materials: [],
      notes: null,
    },

    lifecycle: {
      resharpenable: false,
      max_resharpens: null,
      service_notes: null,
      expected_tool_life_min: null,
    },
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
      flute_length_mm: null,
      overall_length_mm: 118,
      shank_diameter_mm: null,
      flutes: 2,
      helix_angle_deg: 30,
      point_angle_deg: null,
      corner_radius_mm: null,
      neck_length_mm: null,
    },

    cutting: {
      recommended_vc_m_min: null,
      recommended_fz_mm: null,
      coolant_required: null,
      internal_coolant: null,
      chipbreaker: null,
    },

    tool_features: {
      material: "Solid carbide",
      coating: "AlCrN",
      tolerance: null,
      hand: null,
      finish_quality: null,
    },

    usage: {
      operations: ["Vrtání"],
      workpiece_materials: [],
      notes: null,
    },

    lifecycle: {
      resharpenable: false,
      max_resharpens: null,
      service_notes: null,
      expected_tool_life_min: null,
    },
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
      shank_diameter_mm: null,
      flutes: 2,
      helix_angle_deg: 30,
      point_angle_deg: null,
      corner_radius_mm: null,
      neck_length_mm: null,
    },

    cutting: {
      recommended_vc_m_min: null,
      recommended_fz_mm: null,
      coolant_required: null,
      internal_coolant: null,
      chipbreaker: null,
    },

    tool_features: {
      material: "Solid carbide",
      coating: "TiAlN",
      tolerance: null,
      hand: null,
      finish_quality: null,
    },

    usage: {
      operations: ["Vrtání"],
      workpiece_materials: [],
      notes: null,
    },

    lifecycle: {
      resharpenable: false,
      max_resharpens: null,
      service_notes: null,
      expected_tool_life_min: null,
    },
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

    image_main: "/images/tools/walter_mc230-20.0a4l100c-wk40tf_main.png",
    image_drawing: "/images/tools/walter_mc230-20.0a4l100c-wk40tf_drawing.png",

    geometry: {
      diameter_mm: 20,
      flute_length_mm: 40,
      overall_length_mm: 100,
      shank_diameter_mm: 20,
      flutes: 4,
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
      chipbreaker: null,
    },

    tool_features: {
      material: "Solid carbide",
      coating: "WK40TF",
      tolerance: null,
      hand: null,
      finish_quality: null,
    },

    usage: {
      operations: ["Frézování"],
      workpiece_materials: [],
      notes: null,
    },

    lifecycle: {
      resharpenable: true,
      max_resharpens: null,
      service_notes: null,
      expected_tool_life_min: null,
    },
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

    image_main: "/images/tools/iscar_eb-a2-03-03-06c06h60-ic903_main.jpg",
    image_drawing: "/images/tools/iscar_eb-a2-03-03-06c06h60-ic903_drawing.png",

    geometry: {
      diameter_mm: 6,
      flute_length_mm: 18,
      overall_length_mm: 60,
      shank_diameter_mm: 6,
      flutes: 2,
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
      chipbreaker: null,
    },

    tool_features: {
      material: "Solid carbide",
      coating: "IC903",
      tolerance: null,
      hand: null,
      finish_quality: null,
    },

    usage: {
      operations: ["Frézování"],
      workpiece_materials: [],
      notes: null,
    },

    lifecycle: {
      resharpenable: true,
      max_resharpens: null,
      service_notes: null,
      expected_tool_life_min: null,
    },
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
    image_drawing: "/images/tools/seco_980100_mega_drawing.png",

    geometry: {
      diameter_mm: 5,
      flute_length_mm: 15,
      overall_length_mm: 80,
      shank_diameter_mm: 6,
      flutes: 2,
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
      chipbreaker: null,
    },

    tool_features: {
      material: "Solid carbide",
      coating: "MEGA",
      tolerance: null,
      hand: null,
      finish_quality: null,
    },

    usage: {
      operations: ["Frézování"],
      workpiece_materials: [],
      notes: null,
    },

    lifecycle: {
      resharpenable: true,
      max_resharpens: null,
      service_notes: null,
      expected_tool_life_min: null,
    },
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

    image_main: "/images/tools/mttm_mt37.6f-12x56x12x100-l_main.jpg",
    image_drawing: null,

    geometry: {
      diameter_mm: 12,
      flute_length_mm: 56,
      overall_length_mm: 100,
      shank_diameter_mm: 12,
      flutes: 6,
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
      chipbreaker: null,
    },

    tool_features: {
      material: "Solid carbide",
      coating: null,
      tolerance: null,
      hand: "L",
      finish_quality: null,
    },

    usage: {
      operations: ["Frézování"],
      workpiece_materials: [],
      notes: null,
    },

    lifecycle: {
      resharpenable: true,
      max_resharpens: null,
      service_notes: null,
      expected_tool_life_min: null,
    },
  },
];

export default tools;
