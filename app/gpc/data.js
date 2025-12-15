// /app/gpc/data.js
// GPC DEMO – VRTÁKY + FRÉZY
// JEDEN EXPORT – JEDNA STRUKTURA
// Připraveno pro GSS / GINA / DM tracking

const tools = [

  // ============================================================
  // SANDVIK – VRTÁK
  // ============================================================
  {
    gpc_id: "73-555-321-50391",
    gtin: "08419421",
    name: "Sandvik Coromant 860.1-1050-056A1-MM M2BM",
    type: "Drill",
    manufacturer: "Sandvik Coromant",

    geometry: {
      diameter_mm: 10.5,
      flute_length_mm: 56,
      overall_length_mm: 118,
      shank_diameter_mm: 12,
      flutes: 2,
      helix_angle_deg: 30,
      point_angle_deg: 140
    },

    cutting: {
      tool_family: "drill",
      cutting_direction: "right",
      coolant_through: true,
      roughing: true,
      finishing: false
    },

    tool_features: {
      necked: false,
      variable_helix: false,
      reinforced_core: true
    },

    material: {
      base: "Solid carbide"
    },

    coating: {
      name: "M2BM",
      type: "PVD"
    },

    usage: {
      workpiece_materials: ["steel", "stainless"],
      hardness_range_hrc: { min: 30, max: 50 },
      application: ["drilling"]
    },

    lifecycle: {
      regrindable: true,
      max_regrinds: 3,
      current_regrinds: 0,
      dm_trackable: true
    }
  },

  // ============================================================
  // WALTER – VRTÁK
  // ============================================================
  {
    gpc_id: "73-555-321-50392",
    gtin: "06745276",
    name: "Walter DC170-05-10.500A1-WJ30EJ",
    type: "Drill",
    manufacturer: "Walter",

    geometry: {
      diameter_mm: 10.5,
      flute_length_mm: 56,
      overall_length_mm: 118,
      shank_diameter_mm: 12,
      flutes: 2,
      helix_angle_deg: 30,
      point_angle_deg: 140
    },

    cutting: {
      tool_family: "drill",
      cutting_direction: "right",
      coolant_through: true,
      roughing: true,
      finishing: false
    },

    tool_features: {
      necked: false,
      variable_helix: true,
      reinforced_core: true
    },

    material: {
      base: "Solid carbide"
    },

    coating: {
      name: "WJ30EJ",
      type: "PVD"
    },

    usage: {
      workpiece_materials: ["steel", "cast_iron"],
      hardness_range_hrc: { min: 28, max: 45 },
      application: ["drilling"]
    },

    lifecycle: {
      regrindable: true,
      max_regrinds: 3,
      current_regrinds: 0,
      dm_trackable: true
    }
  },

  // ============================================================
  // SECO – VRTÁK
  // ============================================================
  {
    gpc_id: "73-555-321-50393",
    gtin: "03046226",
    name: "Seco SD205A-1050-056-12R1-P",
    type: "Drill",
    manufacturer: "Seco Tools",

    geometry: {
      diameter_mm: 10.5,
      flute_length_mm: 56,
      overall_length_mm: 118,
      shank_diameter_mm: 12,
      flutes: 2,
      helix_angle_deg: 30,
      point_angle_deg: 140
    },

    cutting: {
      tool_family: "drill",
      cutting_direction: "right",
      coolant_through: true,
      roughing: true,
      finishing: false
    },

    tool_features: {
      necked: false,
      variable_helix: false,
      reinforced_core: true
    },

    material: {
      base: "Solid carbide"
    },

    coating: {
      name: "P",
      type: "PVD"
    },

    usage: {
      workpiece_materials: ["steel"],
      hardness_range_hrc: { min: 25, max: 45 },
      application: ["drilling"]
    },

    lifecycle: {
      regrindable: true,
      max_regrinds: 3,
      current_regrinds: 0,
      dm_trackable: true
    }
  },

  // ============================================================
  // WALTER – FRÉZA MC230
  // ============================================================
  {
    gpc_id: "73-777-100-00001",
    gtin: null,
    name: "Walter MC230-20.0A4L100C-WK40TF",
    type: "Endmill",
    manufacturer: "Walter",

    geometry: {
      diameter_mm: 20,
      flute_length_mm: 40,
      overall_length_mm: 100,
      shank_diameter_mm: 20,
      flutes: 4,
      helix_angle_deg: 35,
      corner_radius_mm: 0
    },

    cutting: {
      tool_family: "endmill",
      cutting_direction: "right",
      coolant_through: false,
      roughing: true,
      finishing: true
    },

    tool_features: {
      necked: false,
      variable_helix: true,
      reinforced_core: true
    },

    material: {
      base: "Solid carbide"
    },

    coating: {
      name: "WK40TF",
      type: "PVD"
    },

    usage: {
      workpiece_materials: ["steel", "stainless"],
      hardness_range_hrc: { min: 30, max: 55 },
      application: ["side_milling", "slotting"]
    },

    lifecycle: {
      regrindable: true,
      max_regrinds: 2,
      current_regrinds: 0,
      dm_trackable: true
    }
  },

  // ============================================================
  // ISCAR – FRÉZA EB-A2
  // ============================================================
  {
    gpc_id: "73-777-100-00002",
    gtin: null,
    name: "ISCAR EB-A2 03-03-06C06H60 IC903",
    type: "Endmill",
    manufacturer: "ISCAR",

    geometry: {
      diameter_mm: 6,
      flute_length_mm: 18,
      overall_length_mm: 60,
      shank_diameter_mm: 6,
      flutes: 2,
      helix_angle_deg: 30,
      corner_radius_mm: 0
    },

    cutting: {
      tool_family: "endmill",
      cutting_direction: "right",
      coolant_through: false,
      roughing: false,
      finishing: true
    },

    tool_features: {
      necked: false,
      variable_helix: false,
      reinforced_core: false
    },

    material: {
      base: "Solid carbide"
    },

    coating: {
      name: "IC903",
      type: "PVD"
    },

    usage: {
      workpiece_materials: ["steel", "aluminium"],
      hardness_range_hrc: { min: 20, max: 45 },
      application: ["finishing", "contouring"]
    },

    lifecycle: {
      regrindable: true,
      max_regrinds: 2,
      current_regrinds: 0,
      dm_trackable: true
    }
  },

  // ============================================================
  // SECO – FRÉZA MEGA
  // ============================================================
  {
    gpc_id: "73-777-100-00003",
    gtin: null,
    name: "Seco 980100-MEGA",
    type: "Endmill",
    manufacturer: "Seco Tools",

    geometry: {
      diameter_mm: 5,
      flute_length_mm: 15,
      overall_length_mm: 80,
      shank_diameter_mm: 6,
      flutes: 2,
      helix_angle_deg: 30,
      corner_radius_mm: 0
    },

    cutting: {
      tool_family: "endmill",
      cutting_direction: "right",
      coolant_through: false,
      roughing: false,
      finishing: true
    },

    tool_features: {
      necked: false,
      variable_helix: false,
      reinforced_core: true
    },

    material: {
      base: "Solid carbide"
    },

    coating: {
      name: "MEGA",
      type: "PVD"
    },

    usage: {
      workpiece_materials: ["steel", "stainless"],
      hardness_range_hrc: { min: 30, max: 55 },
      application: ["slotting", "side_milling"]
    },

    lifecycle: {
      regrindable: true,
      max_regrinds: 3,
      current_regrinds: 0,
      dm_trackable: true
    }
  },

  // ============================================================
  // MTTM – VLASTNÍ FRÉZA
  // ============================================================
  {
    gpc_id: "73-777-100-00004",
    gtin: null,
    name: "MTTM MT37.6F-12x56x12x100-L",
    type: "Endmill",
    manufacturer: "MTTM",

    geometry: {
      diameter_mm: 12,
      flute_length_mm: 56,
      overall_length_mm: 100,
      shank_diameter_mm: 12,
      flutes: 6,
      helix_angle_deg: 35,
      corner_radius_mm: 0
    },

    cutting: {
      tool_family: "endmill",
      cutting_direction: "right",
      coolant_through: false,
      roughing: true,
      finishing: true
    },

    tool_features: {
      necked: false,
      variable_helix: true,
      reinforced_core: true
    },

    material: {
      base: "Solid carbide"
    },

    coating: {
      name: null,
      type: null
    },

    usage: {
      workpiece_materials: ["steel"],
      hardness_range_hrc: { min: 28, max: 50 },
      application: ["roughing", "side_milling"]
    },

    lifecycle: {
      regrindable: true,
      max_regrinds: 4,
      current_regrinds: 0,
      dm_trackable: true
    }
  }
];

export default tools;
