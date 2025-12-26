// /app/gss/data/stateEngine.js

export const STATUS = {
  IN_STOCK: "in_stock",
  IN_PRODUCTION: "in_production",
  IN_SERVICE: "in_service",
  RETIRED: "retired",
};

export const ACTIONS = {
  ISSUE_TO_PRODUCTION: "issue_to_production",
  RETURN_TO_STOCK: "return_to_stock",
  SEND_TO_SERVICE: "send_to_service",
  RETURN_FROM_SERVICE: "return_from_service",
  RETIRE_ITEM: "retire_item",
};

// ✅ Povolené přechody (kouzlo GSS)
const TRANSITIONS = {
  [STATUS.IN_STOCK]: {
    [ACTIONS.ISSUE_TO_PRODUCTION]: STATUS.IN_PRODUCTION,
    [ACTIONS.SEND_TO_SERVICE]: STATUS.IN_SERVICE,
    [ACTIONS.RETIRE_ITEM]: STATUS.RETIRED,
  },

  [STATUS.IN_PRODUCTION]: {
    [ACTIONS.RETURN_TO_STOCK]: STATUS.IN_STOCK,
    [ACTIONS.SEND_TO_SERVICE]: STATUS.IN_SERVICE,
    [ACTIONS.RETIRE_ITEM]: STATUS.RETIRED,
  },

  [STATUS.IN_SERVICE]: {
    [ACTIONS.RETURN_FROM_SERVICE]: STATUS.IN_STOCK,
    [ACTIONS.RETIRE_ITEM]: STATUS.RETIRED,
  },

  [STATUS.RETIRED]: {
    // retired = konečný stav (žádné akce)
  },
};

export function getAllowedActions(status) {
  return Object.keys(TRANSITIONS[status] || {});
}

export function isActionAllowed(status, action) {
  return Boolean(TRANSITIONS?.[status]?.[action]);
}

export function getNextStatus(status, action) {
  return TRANSITIONS?.[status]?.[action] ?? null;
}

/**
 * applyActionToDmItem
 * - upraví pouze DM item (status, location)
 * - location je volitelná a je "data", ne stav
 *
 * @param {object} dmItem
 * @param {string} action - one of ACTIONS
 * @param {object} opts
 * @param {string} opts.locationId - např. "warehouse:MAIN", "CNC_01", "PEC_01"...
 * @param {string} opts.note - volitelné (zatím jen do logu v budoucnu)
 */
export function applyActionToDmItem(dmItem, action, opts = {}) {
  if (!dmItem) throw new Error("DM item is required");

  const currentStatus = dmItem.status;
  const nextStatus = getNextStatus(currentStatus, action);

  if (!nextStatus) {
    return {
      ok: false,
      error: `Akce '${action}' není povolená ze stavu '${currentStatus}'.`,
      item: dmItem,
    };
  }

  const updated = {
    ...dmItem,
    status: nextStatus,
  };

  // location = nezávislá na statusu (OSTROV verze si jen přidá více locationId)
  if (opts.locationId) {
    updated.current_location_id = opts.locationId;
  }

  // NOTE: zatím jen připravené pole pro budoucí audit log
  if (opts.note) {
    updated._last_note = opts.note;
  }

  return { ok: true, item: updated };
}
