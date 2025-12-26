// GSS – State Engine pro DM kusy
// Řídí povolené přechody + zapisuje audit log

import auditLog from "./auditLog";

// ==================================================
// DEFINICE STAVŮ
// ==================================================

export const DM_STATUSES = {
  IN_STOCK: "in_stock",
  IN_PRODUCTION: "in_production",
  SERVICE: "service",
  DISCARDED: "discarded"
};

// ==================================================
// POVOLENÉ AKCE A CÍLOVÉ STAVY
// ==================================================

export const DM_ACTIONS = {
  SEND_TO_PRODUCTION: {
    from: [DM_STATUSES.IN_STOCK],
    to: DM_STATUSES.IN_PRODUCTION
  },
  RETURN_FROM_PRODUCTION: {
    from: [DM_STATUSES.IN_PRODUCTION],
    to: DM_STATUSES.IN_STOCK
  },
  SEND_TO_SERVICE: {
    from: [
      DM_STATUSES.IN_STOCK,
      DM_STATUSES.IN_PRODUCTION
    ],
    to: DM_STATUSES.SERVICE
  },
  RETURN_FROM_SERVICE: {
    from: [DM_STATUSES.SERVICE],
    to: DM_STATUSES.IN_STOCK
  },
  DISCARD: {
    from: [
      DM_STATUSES.IN_STOCK,
      DM_STATUSES.IN_PRODUCTION,
      DM_STATUSES.SERVICE
    ],
    to: DM_STATUSES.DISCARDED
  }
};

// ==================================================
// AUDIT LOG – APPEND ONLY
// ==================================================

export function logAudit({
  dm_code,
  action,
  from_status,
  to_status,
  location,
  user = "demo-user",
  note = ""
}) {
  auditLog.push({
    id: `AUD-${String(auditLog.length + 1).padStart(4, "0")}`,
    dm_code,
    timestamp: new Date().toISOString(),
    action,
    from_status,
    to_status,
    location,
    user,
    note
  });
}

// ==================================================
// HLAVNÍ FUNKCE – APLIKACE AKCE NA DM KUS
// ==================================================

export function applyActionToDmItem({
  item,
  action,
  locationId
}) {
  const rule = DM_ACTIONS[action];

  if (!rule) {
    return {
      ok: false,
      error: "Neznámá akce"
    };
  }

  if (!rule.from.includes(item.status)) {
    return {
      ok: false,
      error: `Akce '${action}' není povolena ze stavu '${item.status}'`
    };
  }

  const newStatus = rule.to;
  const newLocation = locationId || item.location;

  // ===== AUDIT LOG =====
  logAudit({
    dm_code: item.dm_code,
    action,
    from_status: item.status,
    to_status: newStatus,
    location: newLocation
  });

  // ===== VÝSLEDEK =====
  return {
    ok: true,
    item: {
      ...item,
      status: newStatus,
      location: newLocation
    }
  };
}
