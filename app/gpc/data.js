// app/gpc/data.js

export const tools = [

  // ---------------------------------------------------------
  // 1) SANDVIK COROMANT – 860.1-1050-056A1-MM M2BM
  // ---------------------------------------------------------
  {
    id: 8419421,
    gpc_id: "73-555-321-50391",
    name: "Sandvik Coromant 860.1-1050-056A1-MM M2BM",
    type: "TK vrták monolitní",
    manufacturer: "Sandvik Coromant",

    image: "https://productionformation.sandvik.coromant.com/s3/document-images/pict/310-3d-view/ext-preview/44372813_0400x0270dpi.png",
    drawing: "https://cdn2.walter-tools.com/files/sitecollectionimages/wic/product/images/t_dr_d_860-05-1_a1_p01.png",

    diameter: "10.5 mm",
    overall_length: "118 mm",

    parameters: {
      J21: { label: "Identifying order number", cz: "Identifikační číslo", value: "8419421" },
      J22: { label: "Product name", cz: "Název produktu", value: "860.1-1050-056A1-MM M2BM" },
      J3: { label: "Company code", cz: "Kód výrobce", value: "SV - Sandvik Coromant" },
      NSM: { label: "Standard layout", cz: "Standard layout", value: "DIN4000-81" },
      BLD: { label: "Tool style code", cz: "Styl nástroje", value: "1" },

      A11: { label: "Cutting diameter", cz: "Řezný průměr", value: "10.5 mm" },
      B4: { label: "Usable length", cz: "Použitelná délka", value: "56 mm" },
      B5: { label: "Overall length", cz: "Celková délka", value: "118 mm" },
      B6: { label: "Flute length", cz: "Délka drážky", value: "71 mm" },
      B7: { label: "Point length", cz: "Délka špičky", value: "1.91 mm" },
      B71: { label: "Functional length", cz: "Funkční délka", value: "116.09 mm" },

      C4: { label: "Shank length", cz: "Délka dříku", value: "45 mm" },

      D1: { label: "Flute count", cz: "Počet břitů", value: "2" },
      D2: { label: "Helix hand", cz: "Směr šroubovice", value: "R - Right" },
      D3: { label: "Helix angle", cz: "Úhel šroubovice", value: "30°" },

      E1: { label: "Point angle", cz: "Vrcholový úhel", value: "140°" },

      F1: { label: "Cutting direction", cz: "Směr řezu", value: "R - Right" },

      H21: { label: "Coolant entry", cz: "Vstup chlazení", value: "1 - Axial" },
      H22: { label: "Coolant exit", cz: "Výstup chlazení", value: "3 - Axial & radial" },

      H4: { label: "Body material", cz: "Materiál", value: "Solid carbide" },
      H5: { label: "Coating", cz: "Povlak", value: "TiAlN" },

      J7: { label: "Data chip", cz: "Datový čip", value: "0 - Without chip" }
    }
  },

  // ---------------------------------------------------------
  // 2) WALTER – DC170-05-10.500A1-WJ30EJ
  // ---------------------------------------------------------
  {
    id: 6745276,
    gpc_id: "73-555-321-50392",
    name: "Walter DC170-05-10.500A1-WJ30EJ",
    type: "TK vrták monolitní",
    manufacturer: "Walter",

    image: "https://cdn2.walter-tools.com/files/sitecollectionimages/wic/product/images/t_dr_dc170-05-085-a1_p_01.png",
    drawing: "https://toolsunited.com/Images/help/BNN01_StOB.png",

    diameter: "10.5 mm",
    overall_length: "118 mm",

    parameters: {
      J21: { label: "Identifying order number", cz: "Identifikační číslo", value: "6745276" },
      J22: { label: "Product name", cz: "Název produktu", value: "DC170-05-10.500A1-WJ30EJ" },
      J3: { label: "Company code", cz: "Kód výrobce", value: "W - Walter" },
      NSM: { label: "Standard layout", cz: "Standard layout", value: "DIN4000-81" },
      BLD: { label: "Tool style code", cz: "Styl nástroje", value: "1" },

      A11: { label: "Cutting diameter", cz: "Řezný průměr", value: "10.5 mm" },
      B3: { label: "Protruding length", cz: "Vystouplá délka", value: "73 mm" },
      B4: { label: "Usable length", cz: "Použitelná délka", value: "56 mm" },
      B5: { label: "Overall length", cz: "Celková délka", value: "118 mm" },
      B6: { label: "Flute length", cz: "Délka drážky", value: "71 mm" },
      B7: { label: "Point length", cz: "Délka špičky", value: "1.911 mm" },
      B71: { label: "Functional length", cz: "Funkční délka", value: "116.089 mm" },

      C31: { label: "Shank tolerance", cz: "Tolerance dříku", value: "h6" },
      C4: { label: "Shank length", cz: "Délka dříku", value: "45 mm" },

      D1: { label: "Flute count", cz: "Počet břitů", value: "2" },
      D2: { label: "Helix hand", cz: "Směr šroubovice", value: "R - Right" },
      D3: { label: "Helix angle", cz: "Úhel šroubovice", value: "30°" },

      D6: { label: "Max RPM", cz: "Max. otáčky", value: "100000 1/min" },
      D7: { label: "Weight", cz: "Hmotnost", value: "0.132 kg" },

      E1: { label: "Point angle", cz: "Vrcholový úhel", value: "140°" },

      F1: { label: "Cutting direction", cz: "Směr řezu", value: "R - Right" },

      H21: { label: "Coolant entry", cz: "Vstup chlazení", value: "1 - Axial concentric" },
      H22: { label: "Coolant exit", cz: "Výstup chlazení", value: "3 - Axial + radial" },

      H3: { label: "Grade", cz: "Materiál těla", value: "WJ30EJ" },
      H4: { label: "Body material", cz: "Materiál", value: "Solid carbide" },
      H5: { label: "Coating", cz: "Povlak", value: "TiAlN (AlCrN)" },

      J1: { label: "Standard", cz: "Standard", value: "DIN 6537 L" },
      J11: { label: "Standard letter", cz: "Písmeno standardu", value: "HA" },

      J7: { label: "Data chip", cz: "Datový čip", value: "0 - Without chip" },

      NECK_LENGTH: { label: "Neck length", cz: "Délka krčku", value: "56 mm" }
    }
  },

  // ---------------------------------------------------------
  // 3) SECO – SD205A-1050-056-12R1-P
  // ---------------------------------------------------------
  {
    id: 3046226,
    gpc_id: "73-555-321-50393",
    name: "Seco SD205A-1050-056-12R1-P",
    type: "TK vrták monolitní",
    manufacturer: "Seco Tools",

    image: "https://common-secoresources.azureedge.net/pictures/core/Content/ProductImages/As_Delivered_Image/2017-04-10-140905_20175009.jpg",
    drawing: "https://common-secoresources.azureedge.net/pictures/core/Content/ProductImages/Callout_Illustration/2025-10-08-045456_20030630.jpg",

    diameter: "10.5 mm",
    overall_length: "118 mm",

    parameters: {
      J21: { label: "Identifying order number", cz: "Identifikační číslo", value: "3046226" },
      J22: { label: "Product name", cz: "Název produktu", value: "SD205A-1050-056-12R1-P" },
      J3: { label: "Company code", cz: "Kód výrobce", value: "SO - Seco Tools" },
      NSM: { label: "Standard layout", cz: "Standard layout", value: "DIN4000-81" },
      BLD: { label: "Tool style code", cz: "Styl nástroje", value: "1" },

      A11: { label: "Cutting diameter", cz: "Řezný průměr", value: "10.5 mm" },
      B4: { label: "Usable length", cz: "Použitelná délka", value: "56 mm" },
      B5: { label: "Overall length", cz: "Celková délka", value: "118 mm" },
      B6: { label: "Flute length", cz: "Délka drážky", value: "71 mm" },
      B7: { label: "Point length", cz: "Délka špičky", value: "1.91 mm" },
      B71: { label: "Functional length", cz: "Funkční délka", value: "116.09 mm" },

      C4: { label: "Shank length", cz: "Délka dříku", value: "45 mm" },

      D1: { label: "Flute count", cz: "Počet břitů", value: "2" },
      D2: { label: "Helix hand", cz: "Směr šroubovice", value: "R - Right" },
      D3: { label: "Helix angle", cz: "Úhel šroubovice", value: "30°" },

      E1: { label: "Point angle", cz: "Vrcholový úhel", value: "140°" },

      F1: { label: "Cutting direction", cz: "Směr řezu", value: "R - Right" },

      H21: { label: "Coolant entry", cz: "Vstup chlazení", value: "4 - Axial on hole circle" },
      H22: { label: "Coolant exit", cz: "Výstup chlazení", value: "4 - Axial on hole circle" },

      H4: { label: "Body material", cz: "Materiál", value: "Solid carbide" },
      H5: { label: "Coating", cz: "Povlak", value: "TiAlN" },

      J7: { label: "Data chip", cz: "Datový čip", value: "0 - Without chip" }
    }
  }
];
