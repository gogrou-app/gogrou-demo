// /app/gpc/data.js
// GPC DEMO – VRTÁKY + FRÉZY (sjednocená struktura)

export const tools = [
  // ============================================================
  // 1) SANDVIK 860.1-1050-056A1-MM M2BM (VRTÁK)
  // ============================================================
  {
    id: "08419421",
    gpc_id: "73-555-321-50391",
    name: "Sandvik Coromant 860.1-1050-056A1-MM M2BM",
    type: "TK vrták monolitní",
    manufacturer: "Sandvik Coromant",

    // ✅ názvy dle repo (underscore)
    image_main: "/images/tools/sandvik_860_1-1050-056a1-mm_m2bm_main.png",
    image_drawing: "/images/tools/sandvik_860_1-1050-056a1-mm_m2bm_drawing.png",

    // pro horní box v detailu (jak máš v UI)
    diameter: "10.5 mm",
    overall_length: "118 mm",

    parameters: {
      J21: { cz: "Identifikační číslo", value: "08419421" },
      J22: { cz: "Název produktu", value: "860.1-1050-056A1-MM M2BM" },
      J3: { cz: "Výrobce", value: "Sandvik Coromant" },

      A11: { cz: "Řezný průměr", value: "10.5 mm" },
      B4: { cz: "Použitelná délka", value: "56 mm" },
      B5: { cz: "Celková délka", value: "118 mm" },

      D1: { cz: "Počet břitů", value: "2" },
      D3: { cz: "Úhel šroubovice", value: "30°" },

      E1: { cz: "Vrcholový úhel", value: "140°" },
      H4: { cz: "Materiál", value: "Solid carbide" },
      H5: { cz: "Povlak", value: "TiAlN" }
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
      J3: { cz: "Výrobce", value: "Walter" },

      A11: { cz: "Řezný průměr", value: "10.5 mm" },
      B5: { cz: "Celková délka", value: "118 mm" },

      D1: { cz: "Počet břitů", value: "2" },
      D3: { cz: "Úhel šroubovice", value: "30°" },

      H4: { cz: "Materiál", value: "Solid carbide" },
      H5: { cz: "Povlak", value: "TiAlN (AlCrN)" }
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
      J3: { cz: "Výrobce", value: "Seco Tools" },

      A11: { cz: "Řezný průměr", value: "10.5 mm" },
      B5: { cz: "Celková délka", value: "118 mm" },

      D1: { cz: "Počet břitů", value: "2" },
      D3: { cz: "Úhel šroubovice", value: "30°" },

      H4: { cz: "Materiál", value: "Solid carbide" },
      H5: { cz: "Povlak", value: "TiAlN" }
    }
  },

  // ============================================================
  // 4) SECO 980100-MEGA (FRÉZA)
  // ============================================================
  {
    id: "980100-MEGA",
    gpc_id: "73-777-100-00001",
    name: "Seco 980100-MEGA",
    type: "TK fréza monolitní",
    manufacturer: "Seco Tools",

    // ⚠️ v repo máš "seco_980100-mega_main.png.jpg"
    image_main: "/images/tools/seco_980100-mega_main.png.jpg",
    image_drawing: "/images/tools/seco_980100-mega_drawing.jpg",

    diameter: "5 mm",
    overall_length: "80 mm",

    parameters: {
      A11: { cz: "Řezný průměr", value: "5 mm" },
      B5: { cz: "Celková délka", value: "80 mm" },
      D1: { cz: "Počet břitů", value: "2" },
      H4: { cz: "Materiál", value: "Solid carbide" },
      H5: { cz: "Povlak", value: "MEGA" }
    }
  },

  // ============================================================
  // 5) WALTER MC230-20.0A4L100C-WK40TF (FRÉZA)
  // ============================================================
  {
    id: "MC230-20.0A4L100C-WK40TF",
    gpc_id: "73-777-100-00002",
    name: "Walter MC230-20.0A4L100C-WK40TF",
    type: "TK fréza monolitní",
    manufacturer: "Walter",

    // ✅ v repo je s pomlčkami a tečkou
    image_main: "/images/tools/walter_mc230-20.0a4l100c-wk40tf_main.png",
    image_drawing: "/images/tools/walter_mc230-20.0a4l100c-wk40tf_drawing.png",

    diameter: "20 mm",
    overall_length: "100 mm",

    parameters: {
      A11: { cz: "Řezný průměr", value: "20 mm" },
      B4: { cz: "Délka břitu", value: "40 mm" },
      B5: { cz: "Celková délka", value: "100 mm" },
      C2: { cz: "Průměr stopky", value: "20 mm" },
      D1: { cz: "Počet břitů", value: "4" },
      H4: { cz: "Materiál", value: "Solid carbide" },
      H5: { cz: "Povlak", value: "WK40TF" }
    }
  },

  // ============================================================
  // 6) ISCAR EB-A2 03-03-06C06H60 IC903 (FRÉZA)
  // ============================================================
  {
    id: "EB-A2-IC903",
    gpc_id: "73-777-100-00003",
    name: "ISCAR EB-A2 03-03-06C06H60 IC903",
    type: "TK fréza monolitní",
    manufacturer: "ISCAR",

    // ⚠️ v repo máš "iscar_eb-a2-03-03-06c06h60-ic903_main.jpg"
    image_main: "/images/tools/iscar_eb-a2-03-03-06c06h60-ic903_main.jpg",
    image_drawing: "/images/tools/iscar_eb-a2-03-03-06c06h60-ic903_drawing.png",

    diameter: "6 mm",
    overall_length: "60 mm",

    parameters: {
      A11: { cz: "Řezný průměr", value: "6 mm" },
      B4: { cz: "Délka břitu", value: "18 mm" },
      B5: { cz: "Celková délka", value: "60 mm" },
      C2: { cz: "Průměr stopky", value: "6 mm" },
      D1: { cz: "Počet břitů", value: "2" },
      H4: { cz: "Materiál", value: "Solid carbide" },
      H5: { cz: "Povlak", value: "IC903" }
    }
  },

  // ============================================================
  // 7) MTTM MT37.6F.12x56x12x100-L (FRÉZA)
  // ============================================================
  {
    id: "MT37.6F.12x56x12x100-L",
    gpc_id: "73-777-100-00004",
    name: "MTTM MT37.6F.12x56x12x100-L",
    type: "TK fréza monolitní",
    manufacturer: "MTTM",

    // ✅ v repo máš tečky i pomlčky v názvu
    image_main: "/images/tools/mttm_mt37.6f-12x56x12x100-l_main.jpg",

    // ✅ klíč musí existovat, i když výkres nemáš
    image_drawing: null,

    diameter: "12 mm",
    overall_length: "100 mm",

    parameters: {
      A11: { cz: "Řezný průměr", value: "12 mm" },
      B4: { cz: "Délka břitu", value: "56 mm" },
      B5: { cz: "Celková délka", value: "100 mm" },
      C2: { cz: "Průměr stopky", value: "12 mm" },
      D1: { cz: "Počet břitů", value: "6" },
      H4: { cz: "Materiál", value: "Solid carbide" },
      H5: { cz: "Povlak", value: "—" }
    }
  }
];

export default tools;
