// /app/gpc/data.js

const tools = [
  // ============================================================
  // 1) SANDVIK 860.1-1050-056A1-MM M2BM
  // ============================================================
  {
    id: "08419421", // GTIN s nulami
    gpc_id: "73-555-321-50391",
    name: "Sandvik Coromant 860.1-1050-056A1-MM M2BM",
    type: "TK vrták monolitní",
    manufacturer: "Sandvik Coromant",

    // SPRÁVNÉ názvy souborů – ověřeno s GitHubem
    image_main: "/images/tools/sandvik_860-1-1050-056a1-mm_m2bm_main.png",
    image_drawing: "/images/tools/sandvik_860-1-1050-056a1-mm_m2bm_drawing.png",

    diameter: "10.5 mm",
    overall_length: "118 mm",

    parameters: {
      J21: { cz: "Identifikační číslo", value: "08419421" },
      J22: { cz: "Název produktu", value: "860.1-1050-056A1-MM M2BM" },
      J3: { cz: "Kód výrobce", value: "SV - Sandvik Coromant" },
      NSM: { cz: "Standard layout", value: "DIN4000-81" },
      BLD: { cz: "Styl nástroje", value: "1" },

      A11: { cz: "Řezný průměr", value: "10.5 mm" },
      B4: { cz: "Použitelná délka", value: "56 mm" },
      B5: { cz: "Celková délka", value: "118 mm" },
      B6: { cz: "Délka drážky", value: "71 mm" },
      B7: { cz: "Délka špičky", value: "1.91 mm" },
      B71: { cz: "Funkční délka", value: "116.09 mm" },

      C4: { cz: "Délka dříku", value: "45 mm" },

      D1: { cz: "Počet břitů", value: "2" },
      D2: { cz: "Směr šroubovice", value: "R - Right" },
      D3: { cz: "Úhel šroubovice", value: "30°" },

      E1: { cz: "Vrcholový úhel", value: "140°" },

      F1: { cz: "Směr řezu", value: "R - Right" },

      H21: { cz: "Vstup chlazení", value: "1 - Axial" },
      H22: { cz: "Výstup chlazení", value: "3 - Axial & radial" },

      H4: { cz: "Materiál", value: "Solid carbide" },
      H5: { cz: "Povlak", value: "TiAlN" },

      J7: { cz: "Datový čip", value: "0 - Without chip" }
    }
  },

  // ============================================================
  // 2) WALTER DC170-05-10.500A1-WJ30EJ
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
      J21: { cz: "Identifikační číslo", value: "06745276" },
      J22: { cz: "Název produktu", value: "DC170-05-10.500A1-WJ30EJ" },
      J3: { cz: "Kód výrobce", value: "W - Walter" },
      NSM: { cz: "Standard layout", value: "DIN4000-81" },
      BLD: { cz: "Styl nástroje", value: "1" },

      A11: { cz: "Řezný průměr", value: "10.5 mm" },
      B3: { cz: "Vystouplá délka", value: "73 mm" },
      B4: { cz: "Použitelná délka", value: "56 mm" },
      B5: { cz: "Celková délka", value: "118 mm" },
      B6: { cz: "Délka drážky", value: "71 mm" },
      B7: { cz: "Délka špičky", value: "1.911 mm" },
      B71: { cz: "Funkční délka", value: "116.089 mm" },

      C31: { cz: "Tolerance dříku", value: "h6" },
      C4: { cz: "Délka dříku", value: "45 mm" },

      D1: { cz: "Počet břitů", value: "2" },
      D2: { cz: "Směr šroubovice", value: "R - Right" },
      D3: { cz: "Úhel šroubovice", value: "30°" },

      D6: { cz: "Max otáčky", value: "100000 1/min" },
      D7: { cz: "Hmotnost", value: "0.132 kg" },

      E1: { cz: "Vrcholový úhel", value: "140°" },

      F1: { cz: "Směr řezu", value: "R - Right" },

      H21: { cz: "Vstup chlazení", value: "1 - Axial concentric" },
      H22: { cz: "Výstup chlazení", value: "3 - Axial + radial" },

      H3: { cz: "Materiál těla", value: "WJ30EJ" },
      H4: { cz: "Materiál", value: "Solid carbide" },
      H5: { cz: "Povlak", value: "TiAlN (AlCrN)" },

      J1: { cz: "Standard", value: "DIN 6537 L" },
      J11: { cz: "Písmeno standardu", value: "HA" },

      J7: { cz: "Datový čip", value: "0 - Without chip" }
    }
  },

  // ============================================================
  // 3) SECO SD205A-1050-056-12R1-P
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
      J21: { cz: "Identifikační číslo", value: "03046226" },
      J22: { cz: "Název produktu", value: "SD205A-1050-056-12R1-P" },
      J3: { cz: "Kód výrobce", value: "SO - Seco Tools" },
      NSM: { cz: "Standard layout", value: "DIN4000-81" },
      BLD: { cz: "Styl nástroje", value: "1" },

      A11: { cz: "Řezný průměr", value: "10.5 mm" },
      B4: { cz: "Použitelná délka", value: "56 mm" },
      B5: { cz: "Celková délka", value: "118 mm" },
      B6: { cz: "Délka drážky", value: "71 mm" },
      B7: { cz: "Délka špičky", value: "1.91 mm" },
      B71: { cz: "Funkční délka", value: "116.09 mm" },

      C4: { cz: "Délka dříku", value: "45 mm" },

      D1: { cz: "Počet břitů", value: "2" },
      D2: { cz: "Směr šroubovice", value: "R - Right" },
      D3: { cz: "Úhel šroubovice", value: "30°" },

      E1: { cz: "Vrcholový úhel", value: "140°" },

      F1: { cz: "Směr řezu", value: "R - Right" },

      H21: { cz: "Vstup chlazení", value: "4 - Axial on hole circle" },
      H22: { cz: "Výstup chlazení", value: "4 - Axial on hole circle" },

      H4: { cz: "Materiál", value: "Solid carbide" },
      H5: { cz: "Povlak", value: "TiAlN" },

      J7: { cz: "Datový čip", value: "0 - Without chip" }
    }
  }
];

export default tools;

// /app/gpc/data.js
// GPC DEMO – FRÉZY (SECO / WALTER / MTTM)

const tools = [

  // ============================================================
  // 1) SECO – 980100-MEGA
  // ============================================================
  {
    id: "00662885122996", // GTIN
    gpc_id: "73-777-100-00001",
    name: "Seco 980100-MEGA",
    type: "TK fréza monolitní",
    category: "milling",
    manufacturer: "Seco Tools",
    data_source: "ToolsUnited",

    image_main: "/images/tools/milling/seco_980100-mega_main.png",
    image_drawing: "/images/tools/milling/seco_980100-mega_drawing.png",

    diameter: "5 mm",
    overall_length: "80 mm",

    parameters: {
      J21: { cz: "Identifikační číslo", value: "02511341" },
      J22: { cz: "Název produktu", value: "980100-MEGA" },
      J3: { cz: "Výrobce", value: "SO – Seco Tools" },

      A11: { cz: "Řezný průměr", value: "5.0 mm" },
      DCX: { cz: "Max. průměr obrábění", value: "10.0 mm" },
      B2: { cz: "Max. hloubka řezu (ap)", value: "1.17 mm" },
      APMXS: { cz: "Max. boční hloubka řezu", value: "0.45 mm" },

      LN: { cz: "Délka krčku", value: "30 mm" },
      OAL: { cz: "Celková délka", value: "80 mm" },

      DMM: { cz: "Průměr stopky", value: "10 mm" },
      DN: { cz: "Průměr krčku", value: "8.8 mm" },

      FCEDC: { cz: "Počet čelních břitů", value: "2" },
      PCEDC: { cz: "Počet obvodových břitů", value: "2" },

      FHA: { cz: "Úhel šroubovice", value: "0°" },
      PSIR: { cz: "Záběrový úhel", value: "-5°" },

      RE: { cz: "Rohový radius", value: "0.8 mm" },
      RP: { cz: "Programovací radius", value: "1.2 mm" },

      H5: { cz: "Povlak", value: "MEGA" },
      CSP: { cz: "Chlazení", value: "Bez vnitřního chlazení" },

      Weight: { cz: "Hmotnost", value: "0.079 kg" }
    }
  },

  // ============================================================
  // 2) WALTER – MC230-20.0A4L100C-WK40TF
  // ============================================================
  {
    id: null,
    gpc_id: "73-777-100-00002",
    name: "Walter MC230-20.0A4L100C-WK40TF",
    type: "TK fréza monolitní",
    category: "milling",
    manufacturer: "Walter",
    data_source: "Manufacturer",

    image_main: "/images/tools/milling/walter_mc230-20.0a4l100c-wk40tf_main.png",
    image_drawing: "/images/tools/milling/walter_mc230-20.0a4l100c-wk40tf_drawing.png",

    diameter: "20 mm",
    overall_length: "100 mm",

    parameters: {
      J22: { cz: "Název produktu", value: "MC230-20.0A4L100C-WK40TF" },
      J3: { cz: "Výrobce", value: "Walter" },

      A11: { cz: "Řezný průměr", value: "20.0 mm" },
      B5: { cz: "Celková délka", value: "100 mm" },

      D1: { cz: "Počet břitů", value: "4" },
      D3: { cz: "Úhel šroubovice", value: "variable" },

      H4: { cz: "Materiál", value: "Solid carbide" },
      H5: { cz: "Povlak", value: "WK40TF" },

      CSP: { cz: "Chlazení", value: "Vnitřní" }
    }
  },

  // ============================================================
  // 3) MTTM – MT37.6F.12x56x12x100-L
  // ============================================================
  {
    id: null,
    gpc_id: "73-777-100-00003",
    name: "MTTM MT37.6F.12x56x12x100-L",
    type: "TK fréza monolitní",
    category: "milling",
    manufacturer: "M-technologies (MTTM)",
    data_source: "Manufacturer",

    image_main: "/images/tools/milling/mttm_mt37.6f.12x56x12x100-l_main.png",
    image_drawing: null,

    diameter: "12 mm",
    overall_length: "100 mm",

    parameters: {
      J22: { cz: "Označení", value: "MT37.6F.12x56x12x100-L" },
      J3: { cz: "Výrobce", value: "M-technologies s.r.o." },

      A11: { cz: "Řezný průměr", value: "12 mm" },
      B4: { cz: "Délka břitu", value: "56 mm" },
      B5: { cz: "Celková délka", value: "100 mm" },

      DMM: { cz: "Průměr stopky", value: "12 mm" },
      D1: { cz: "Počet zubů", value: "6" },
      D3: { cz: "Úhel šroubovice", value: "45°" },

      H5: { cz: "Povlak", value: "AlCrN" },
      F1: { cz: "Provedení čela", value: "Dokončovací" }
    }
  }

];

export default tools;
