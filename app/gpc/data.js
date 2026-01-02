// /app/gpc/data.js
// GPC DEMO – MASTER DATA (TECHNICKÝ KATALOG)

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
    },
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
      overall_length_mm: 118,
      flutes: 2,
    },
  },

  {
    gpc_id: "73-555-321-50393",
    gtin: "03046226",
    name: "Seco SD205A-1050-056-12R1-P",
    type: "Vrták – monolitní TK",
    manufacturer: "Seco Tools",
    status: "phaseout",

    images: {
      main: "/images/gpc/73-555-321-50393_main.png",
      drawing: "/images/gpc/73-555-321-50393_drawing.png",
    },

    geometry: {
      diameter_mm: 10.5,
      flute_length_mm: 56,
      overall_length_mm: 118,
      flutes: 2,
    },
  },

  {
    gpc_id: "73-777-100-00003",
    gtin: null,
    name: "Seco 980100-MEGA",
    type: "Fréza – monolitní TK",
    manufacturer: "Seco Tools",
    status: "ended",

    images: {
      main: "/images/gpc/73-777-100-00003_main.png",
      drawing: "/images/gpc/73-777-100-00003_drawing.png",
    },

    geometry: {
      diameter_mm: 5,
      flute_length_mm: 15,
      overall_length_mm: 80,
      flutes: 2,
    },
  },
];

export default tools;
