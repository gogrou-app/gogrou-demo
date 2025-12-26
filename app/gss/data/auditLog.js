// GSS – Audit log DM pohybů
// APPEND ONLY – nikdy se zpětně neupravuje
// DEMO: in-memory (v reálu DB / event store)

const auditLog = [
  {
    id: "AUD-0001",
    dm_code: "DM-SANDVIK-0001",
    timestamp: "2025-12-26T10:12:00Z",
    action: "RECEIVED_TO_STOCK",
    from_status: null,
    to_status: "in_stock",
    location: "warehouse:MAIN",
    user: "system",
    note: "První naskladnění"
  },
  {
    id: "AUD-0002",
    dm_code: "DM-SANDVIK-0001",
    timestamp: "2025-12-26T11:05:00Z",
    action: "SEND_TO_PRODUCTION",
    from_status: "in_stock",
    to_status: "in_production",
    location: "machine:CNC_MAZAK_01",
    user: "operator:novak",
    note: ""
  }
];

export default auditLog;
