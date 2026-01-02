// /app/gpc/data.js
// GPC DEMO – NÁSTROJE (jedna struktura)
// POZOR: žádný DM/lifecycle (to patří do GSS)

const tools = [
  {
    gpc_id: "73-555-321-50391",
    gtin: "08419421",
    name: "Sandvik Coromant 860.1-1050-056A1-MM M2BM",
    type: "Vrták – monolitní TK",
    manufacturer: "Sandvik Coromant",
    status: "active",

    images: {
      main: "/images/gpc/73-555-321-50391_main.png",
      drawing: "/images/gpc/73-555-321-50391_drawing.png",
    },

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

    material: {
      base: "Solid carbide",
      coating: "TiAlN",
      grade: null,
      tolerance: null,
      hand: null,
    },

    notes: null,
  },

  {
    gpc_id: "73-555-321-50392",
    gtin: "06745276",
    name: "Walter DC170-05-10.500A1-WJ30EJ",
    type: "Vrták – monolitní TK",
    manufacturer: "Walter",
    status: "active",

    images: {
      main: "/images/gpc/73-555-321-50392_main.png",
      drawing: "/images/gpc/73-555-321-50392_drawing.png",
    },

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

    material: {
      base: "Solid carbide",
      coating: "AlCrN",
      grade: "WJ30EJ",
      tolerance: null,
      hand: null,
    },

    notes: null,
  },

  {
    gpc_id: "73-555-321-50393",
    gtin: "03046226",
    name: "Seco SD205A-1050-056-12R1-P",
    type: "Vrták – monolitní TK",
    manufacturer: "Seco Tools",
    status: "phasing_out",

    images: {
      main: "/images/gpc/73-555-321-50393_main.png",
      drawing: "/images/gpc/73-555-321-50393_drawing.png",
    },

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

    material: {
      base: "Solid carbide",
      coating: "TiAlN",
      grade: null,
      tolerance: null,
      hand: null,
    },

    notes: null,
  },

  {
    gpc_id: "73-777-100-00001",
    gtin: null,
    name: "Walter MC230-20.0A4L100C-WK40TF",
    type: "Fréza – monolitní TK",
    manufacturer: "Walter",
    status: "active",

    images: {
      main: "/images/gpc/73-777-100-00001_main.png",
      drawing: "/images/gpc/73-777-100-00001_drawing.png",
    },

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

    material: {
      base: "Solid carbide",
      coating: "WK40TF",
      grade: "WK40TF",
      tolerance: null,
      hand: null,
    },

    notes: null,
  },

  {
    gpc_id: "73-777-100-00002",
    gtin: null,
    name: "ISCAR EB-A2 03-03-06C06H60 IC903",
    type: "Fréza – monolitní TK",
    manufacturer: "ISCAR",
    status: "active",

    images: {
      main: "/images/gpc/73-777-100-00002_main.jpg",
      drawing: "/images/gpc/73-777-100-00002_drawing.png",
    },

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

    material: {
      base: "Solid carbide",
      coating: "IC903",
      grade: "IC903",
      tolerance: null,
      hand: null,
    },

    notes: null,
  },

  {
    gpc_id: "73-777-100-00003",
    gtin: null,
    name: "Seco 980100-MEGA",
    type: "Fréza – monolitní TK",
    manufacturer: "Seco Tools",
    status: "discontinued",

    images: {
      main: "/images/gpc/73-777-100-00003_main.png",
      drawing: "/images/gpc/73-777-100-00003_drawing.png",
    },

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

    material: {
      base: "Solid carbide",
      coating: "MEGA",
      grade: "MEGA",
      tolerance: null,
      hand: null,
    },

    notes: null,
  },

  {
    gpc_id: "73-777-100-00004",
    gtin: null,
    name: "MTTM MT37.6F-12x56x12x100-L",
    type: "Fréza – monolitní TK",
    manufacturer: "MTTM",
    status: "active",

    images: {
      main: "/images/gpc/73-777-100-00004_main.jpg",
      drawing: null,
    },

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

    material: {
      base: "Solid carbide",
      coating: null,
      grade: null,
      tolerance: null,
      hand: "L",
    },

    notes: null,
  },
];

export default tools;
