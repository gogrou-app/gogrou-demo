export const tools = [
  {
    id: "mttm-drill-6mm",
    name: "Vrták monolitní karbidový",
    manufacturer: "MTTM",
    gtin: "1234567890123",
    image: "/placeholder.png",
    description:
      "Vysoce výkonný monolitní karbidový vrták vhodný pro oceli 42–55 HRC.",
    parameters: {
      diameter: "6.0 mm",
      length: "57 mm",
      coating: "TiAIN",
      shank: "6 mm",
    },
  },

  // -------------------------------------------------------------------
  // SANDVIK – CoroDrill 860-MM (DODANÁ DATA)
  // -------------------------------------------------------------------
  {
    id: "sandvik-860-1050-056A1",
    name: "CoroDrill 860-MM – monolitní karbidový vrták",
    manufacturer: "Sandvik Coromant",
    gtin: "8419421",
    image:
      "https://productinformation.sandvik.coromant.com/s3/documents/pictures/pict-3d-view/ext-preview/44372813__400X40072Dpi.png",
    description:
      "Vysoce výkonný monolitní karbidový vrták Sandvik CoroDrill® 860-MM určený pro přesné vrtání ocelí 42–55 HRC. Varianta M2BM s vnitřním chlazením.",
    parameters: {
      cuttingDiameter: "10.5 mm",
      protrudingLength: "73 mm",
      usableLength: "56 mm",
      overallLength: "118 mm",
      chipFluteLength: "71 mm",
      pointLength: "1.911 mm",
      pointAngle: "140°",
      fluteCount: 2,
      helixAngle: "30°",
      shankDiameter: "12 mm h6",
      shankLength: "45 mm",
      material: "HW – tvrdokov (karbid)",
      grade: "M2BM",
      coolant: "Vnitřní chlazení – axiální vstup / výstup",
      maxRPM: "1971 ot/min",
      weight: "0.119 kg",
    },
  },

  // -------------------------------------------------------------------
  // DALŠÍ NÁSTROJE MŮŽEME PŘIDAT SEM
  // -------------------------------------------------------------------
];
