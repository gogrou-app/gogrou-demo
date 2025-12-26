// GSS – dostupné lokace pro DM pohyby
// zákazník si je později bude upravovat

const locations = [
  {
    id: "warehouse:MAIN",
    label: "Hlavní sklad",
    type: "warehouse"
  },
  {
    id: "warehouse:STM01",
    label: "STM01 – výdejna",
    type: "warehouse"
  },
  {
    id: "machine:CNC_MAZAK_01",
    label: "CNC Mazak 1",
    type: "machine"
  },
  {
    id: "machine:CNC_MAZAK_02",
    label: "CNC Mazak 2",
    type: "machine"
  },
  {
    id: "service:BRUSIRNA",
    label: "Brusírna / servis",
    type: "service"
  }
];

export default locations;
