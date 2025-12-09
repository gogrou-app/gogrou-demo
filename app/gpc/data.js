// app/gpc/data.js

// Ukázková data pro GPC DEMO
// Zatím dva nástroje: Sandvik + Walter

export const tools = [
  {
    id: 8419421,
    gpc_id: "73-555-321-45381",
    name: "Sandvik Coromant 860.1-1050-056A1-MM M2BM",
    type: "TK vrták monolitní",
    manufacturer: "Sandvik Coromant",

    image:
      "https://productinformation.sandvik.coromant.com/s3/documents/pictures/pict-3d-view/ext-preview/44372813__400X40072Dpi.png",
    drawing: "https://toolsunited.com/Images/help/BNN01_StOB.png",

    // Zjednodušené parametry pro přehled
    diameter: "10.5 mm",
    overall_length: "118 mm",

    // Stručný popis pro kartu
    description:
      "Vysoce výkonný monolitní vrták Sandvik 860.1 pro přesné obrábění otvorů.",

    // Kompletní technické parametry podle ToolsUnited
    parameters: {
      J21: {
        label: "Identifying order number",
        cz: "Identifikační číslo",
        value: "8419421",
      },
      J22: {
        label: "Product name",
        cz: "Název produktu",
        value: "860.1-1050-056A1-MM M2BM",
      },
      J3: {
        label: "Company code",
        cz: "Kód výrobce",
        value: "SV - Sandvik Coromant",
      },
      NSM: {
        label: "Standard properties layout",
        cz: "Layout standardních vlastností",
        value: "DIN4000-81",
      },
      BLD: {
        label: "Tool style code",
        cz: "Kód stylu nástroje",
        value: "1",
      },

      A11: {
        label: "Cutting diameter minimum",
        cz: "Řezný průměr min.",
        value: "10.5 mm",
      },
      B3: { label: "Protruding length", cz: "Vystouplá délka", value: "73 mm" },
      B4: {
        label: "Usable length",
        cz: "Použitelná délka",
        value: "56 mm",
      },
      B5: {
        label: "Overall length",
        cz: "Celková délka",
        value: "118 mm",
      },
      B6: { label: "Length chip flute", cz: "Délka drážky", value: "71 mm" },
      B7: { label: "Point length", cz: "Délka špičky", value: "1.911 mm" },
      B71: {
        label: "Functional length",
        cz: "Funkční délka",
        value: "116.089 mm",
      },

      C31: {
        label: "Shank tolerance",
        cz: "Tolerance dříku",
        value: "h6",
      },
      C4: { label: "Shank length", cz: "Délka dříku", value: "45 mm" },

      D1: { label: "Flute count", cz: "Počet břitů", value: "2" },
      D2: { label: "Helix hand", cz: "Směr šroubovice", value: "R" },
      D3: { label: "Helix angle", cz: "Úhel šroubovice", value: "30°" },

      D6: {
        label: "Max rotational speed",
        cz: "Max. otáčky",
        value: "1971 1/min",
      },
      D7: { label: "Weight", cz: "Hmotnost", value: "0.119 kg" },

      E1: { label: "Point angle", cz: "Vrcholový úhel", value: "140°" },
      F1: { label: "Cutting direction", cz: "Směr řezu", value: "R" },

      H11: { label: "Material grade", cz: "Označení materiálu", value: "HW" },
      H21: {
        label: "Coolant entry style code",
        cz: "Vstup chlazení",
        value: "4 - With Coolant entry, axial on hole circle",
      },
      H22: {
        label: "Coolant exit style code",
        cz: "Výstup chlazení",
        value: "4 - With Coolant exit, axial on hole circle",
      },
      H3: {
        label: "Grade designation",
        cz: "Třída povlaku",
        value: "M2BM",
      },
      H4: {
        label: "Body material",
        cz: "Materiál těla",
        value: "H - solid carbide",
      },

      J7: {
        label: "Data chip provision",
        cz: "Datový čip",
        value: "0 - bez čipu",
      },
    },
  },

  // -------------------------------------------------------
  // Walter DC170 – druhý nástroj v DEMU
  // -------------------------------------------------------
  {
    id: 6745276,
    gpc_id: "73-555-321-50392",
    name: "Walter DC170-05-10.500A1-WJ30EJ",
    type: "TK vrták monolitní",
    manufacturer: "Walter",

    image:
      "https://cdn2.walter-tools.com/files/sitecollectionimages/wic/product/images/t_dr_dc170-05-085-a1_p_01.png",
    drawing: "https://toolsunited.com/Images/help/BNN01_StOB.png",

    // Zjednodušené parametry pro GPC kartu
    diameter: "10.5 mm",
    overall_length: "118 mm",

    description:
      "Vysokovýkonný monolitní vrták Walter DC170 s vnitřním chlazením pro náročné aplikace.",

    // Kompletní technické parametry dle ToolsUnited
    parameters: {
      J21: {
        label: "Identifying order number",
        cz: "Identifikační číslo",
        value: "6745276",
      },
      J22: {
        label: "Product name",
        cz: "Název produktu",
        value: "DC170-05-10.500A1-WJ30EJ",
      },
      J3: {
        label: "Company code",
        cz: "Kód výrobce",
        value: "W - Walter",
      },
      NSM: {
        label: "Standard properties layout",
        cz: "Layout standardních vlastností",
        value: "DIN4000-81",
      },
      BLD: {
        label: "Tool style code",
        cz: "Kód stylu nástroje",
        value: "1",
      },

      // Geometrie
      A11: {
        label: "Cutting diameter minimum",
        cz: "Řezný průměr min.",
        value: "10.5 mm",
      },
      B3: { label: "Protruding length", cz: "Vystouplá délka", value: "73 mm" },
      B4: {
        label: "Usable length",
        cz: "Použitelná délka",
        value: "56 mm",
      },
      B5: {
        label: "Overall length",
        cz: "Celková délka",
        value: "118 mm",
      },
      B6: { label: "Length chip flute", cz: "Délka drážky", value: "71 mm" },
      B7: { label: "Point length", cz: "Délka špičky", value: "1.911 mm" },
      B71: {
        label: "Functional length",
        cz: "Funkční délka",
        value: "116.089 mm",
      },

      // Dřík a tolerance
      C31: {
        label: "Shank tolerance",
        cz: "Tolerance dříku",
        value: "h6",
      },
      C4: { label: "Shank length", cz: "Délka dříku", value: "45 mm" },

      // Břity a geometrie
      D1: { label: "Flute count", cz: "Počet břitů", value: "2" },
      D2: {
        label: "Helix hand",
        cz: "Směr šroubovice",
        value: "R - Right",
      },
      D3: { label: "Helix angle", cz: "Úhel šroubovice", value: "30°" },

      // Technické limity
      D6: {
        label: "Rotational speed maximum",
        cz: "Max. otáčky",
        value: "100000 1/min",
      },
      D7: {
        label: "Weight of item",
        cz: "Hmotnost",
        value: "0.132 kg",
      },

      // Úhly
      E1: {
        label: "Point angle 1st step",
        cz: "Vrcholový úhel",
        value: "140°",
      },

      // Směr řezání
      F1: {
        label: "Cutting direction",
        cz: "Směr řezu",
        value: "R - Right",
      },

      // Chlazení
      H21: {
        label: "Coolant entry style code",
        cz: "Vstup chlazení",
        value: "1 - With Coolant entry, axial concentric",
      },
      H22: {
        label: "Coolant exit style code",
        cz: "Výstup chlazení",
        value: "3 - With Coolant exit, axial and radial",
      },

      // Materiál a povlak
      H3: {
        label: "Grade designation",
        cz: "Označení materiálu",
        value: "WJ30EJ",
      },
      H4: {
        label: "Body material",
        cz: "Materiál těla",
        value: "H - Solid carbide",
      },
      H5: {
        label: "Coating",
        cz: "Povlak",
        value: "TiAlN (AlCrN)",
      },

      // Standardy
      J1: { label: "Standard", cz: "Standard", value: "DIN 6537 L" },
      J11: {
        label: "Standard letter",
        cz: "Písmeno standardu",
        value: "HA",
      },

      // Data chip
      J7: {
        label: "Data chip provision",
        cz: "Datový čip",
        value: "0 - Without data chip",
      },

      // Krček
      NECK_LENGTH: {
        label: "Neck length",
        cz: "Délka krčku",
        value: "56 mm",
      },
    },
  },
];

{
  id: 3046226,
  gpc_id: "73-555-321-50393",
  name: "SECO SD205A-1050-056-12R1-P",
  type: "TK vrták monolitní",
  manufacturer: "SECO Tools",

  image: "https://common-secoresources.azureedge.net/pictures/core/Content/ProductImages/As_Delivered_Image/2017-04-10-140905_20175009.jpg?v=2017-04-10%2014:09:05Z",
  drawing: "https://common-secoresources.azureedge.net/pictures/core/Content/ProductImages/Callout_Illustration/2025-10-08-045456_20030630.jpg?v=2025-10-08%2004:54:56Z",

  diameter: "10.5 mm",
  overall_length: "118 mm",

  parameters: {
    J21: { label: "Identifying order number", cz: "Identifikační číslo", value: "03046226" },
    J22: { label: "Product name", cz: "Název produktu", value: "SD205A-1050-056-12R1-P" },
    J3:  { label: "Company code", cz: "Kód výrobce", value: "SO - SECO Tools" },
    NSM: { label: "Standard layout", cz: "Standard vlastností", value: "DIN4000-81" },
    BLD: { label: "Tool style code", cz: "Kód stylu nástroje", value: "1" },

    // Geometrie
    A11: { label: "Cutting diameter minimum", cz: "Řezný průměr min.", value: "10.5 mm" },
    B4:  { label: "Usable length", cz: "Použitelná délka", value: "56 mm" },
    B5:  { label: "Overall length", cz: "Celková délka", value: "118 mm" },
    B6:  { label: "Length chip flute", cz: "Délka drážky", value: "71 mm" },
    B7:  { label: "Point length", cz: "Délka špičky", value: "1.91 mm" },
    B71: { label: "Functional length", cz: "Funkční délka", value: "116.09 mm" },

    // Dřík
    C4:  { label: "Shank length", cz: "Délka dříku", value: "45 mm" },

    // Břity a geometrie
    D1: { label: "Flute count", cz: "Počet břitů", value: "2" },
    D2: { label: "Flute helix hand", cz: "Směr šroubovice", value: "R - Right" },
    D3: { label: "Flute helix angle", cz: "Úhel šroubovice", value: "30°" },
    D7: { label: "Weight of item", cz: "Hmotnost", value: "0.117 kg" },

    // Úhel
    E1: { label: "Point angle 1st step", cz: "Vrcholový úhel", value: "140°" },

    // Směr řezu
    F1: { label: "Cutting direction", cz: "Směr řezu", value: "R - Right" },

    // Chlazení
    H21: { label: "Coolant entry style", cz: "Vstup chlazení", value: "4 - axial on hole circle" },
    H22: { label: "Coolant exit style", cz: "Výstup chlazení", value: "4 - axial on hole circle" },

    // Data chip
    J7: { label: "Data chip provision", cz: "Datový čip", value: "0 - Without data chip" }
  }
}
