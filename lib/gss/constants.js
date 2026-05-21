export const ORGANIZATIONS_STORAGE_KEY = "gogrou_organizations";
export const DEFAULT_GRINDER = "M-technologies";
export const DEFAULT_INTAKE_OPERATOR = "MVP uživatel";
export const MAIN_WAREHOUSE_ID = "MAIN";

export const MODULE_LABELS = {
  GSS: "GSS",
  Toolshop: "Toolshop",
  Services: "Services",
  "GPC supplier data channel": "GPC datový kanál",
  "Promitea/RFQ": "Promitea RFQ",
};

export const ORGANIZATION_STATUS_LABELS = {
  trial: "Zkušební režim",
  pending_payment: "Čeká na platbu",
  active: "Aktivní",
  paused: "Pozastavená",
  blocked: "Blokovaná",
  archived: "Archivovaná",
};

export const STOCK_CONDITION_LABELS = {
  new: "Nový",
  resharpened_new: "Nový přebroušený",
  used: "Použitý",
  sharpening: "Na broušení",
};

export const ISSUE_STATE_LABELS = {
  used: "Použitý",
  resharpened_new: "Nový přebroušený",
  new: "Nový",
};

export const DOCUMENT_TYPE_LABELS = {
  supplier_delivery_note: "Dodací list dodavatele",
  supplier_invoice: "Faktura dodavatele",
  internal_receipt: "Interní příjemka",
  service_delivery_note_after_sharpening: "Servisní dodací list po broušení",
  production_return: "Návrat z výroby",
  manual_correction_inventory: "Ruční korekce / inventura",
};

export const MOVEMENT_TYPE_LABELS = {
  intake: "Příjem",
  issue_to_production: "Výdej do výroby",
  return_from_production: "Návrat z výroby",
  send_to_sharpening: "Odesláno na broušení",
  stock_difference_report: "Ohlášen rozdíl skladu",
  block: "Blokace položky",
  unblock: "Odblokace položky",
};

export const RETURN_DECISION_LABELS = {
  return_used: "Zpět na sklad jako Použitý",
  send_sharpening: "Poslat na broušení",
  scrap_carbide: "Vyřadit / odkup tvrdokovu",
  redirect_instruction: "Přesměrovat podle instrukce / jiná řezná hrana",
  temporary_block: "Dočasně zablokovat",
};
