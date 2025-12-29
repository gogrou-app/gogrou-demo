// GSS STORE – DEMO
// centrální in-memory store pro sklad + historii akcí

const gssStore = {
  items: [
    {
      id: "STK-001",
      name: "Vrták Ø10 HM",
      count: 12,
      min: 5,
      max: 20,
      grinding: false,
      history: [],
    },
    {
      id: "STK-002",
      name: "Fréza Ø6 Z4",
      count: 4,
      min: 3,
      max: 15,
      grinding: false,
      history: [],
    },
  ],
};

// ======================================================
// HELPERS
// ======================================================

export function getAllStockItems() {
  return gssStore.items;
}

export function getStockItemById(id) {
  return gssStore.items.find((i) => String(i.id) === String(id));
}

function addHistory(stockId, entry) {
  const item = getStockItemById(stockId);
  if (!item) return;

  if (!Array.isArray(item.history)) {
    item.history = [];
  }

  item.history.unshift({
    ts: Date.now(),
    ...entry,
  });
}

// ======================================================
// STOCK ACTIONS
// ======================================================

export function receiveStock(stockId, qty, docNo = "") {
  const ctx = getStockItemById(stockId);
  if (!ctx) return;

  ctx.count += qty;

  addHistory(stockId, {
    type: "RECEIVE",
    qty,
    note: docNo,
  });
}

export function issueStock(stockId, qty, docNo = "") {
  const ctx = getStockItemById(stockId);
  if (!ctx) return;

  ctx.count -= qty;

  addHistory(stockId, {
    type: "ISSUE",
    qty,
    note: docNo,
  });
}

export function updateStockMinMax(stockId, min, max) {
  const ctx = getStockItemById(stockId);
  if (!ctx) return;

  ctx.min = min;
  ctx.max = max;

  addHistory(stockId, {
    type: "MIN_MAX_CHANGE",
    qty: 0,
    note: `min=${min}, max=${max}`,
  });
}

// ======================================================
// GRINDING
// ======================================================

export function sendToGrinding(stockId) {
  const ctx = getStockItemById(stockId);
  if (!ctx) return;

  ctx.grinding = true;

  addHistory(stockId, {
    type: "GRINDING_START",
    qty: 0,
  });
}

export function returnFromGrinding(stockId) {
  const ctx = getStockItemById(stockId);
  if (!ctx) return;

  ctx.grinding = false;

  addHistory(stockId, {
    type: "GRINDING_END",
    qty: 0,
  });
}

// ======================================================
// SERVICE / FUTURE EXT
// ======================================================

export function updateServiceSettings(stockId, data) {
  const ctx = getStockItemById(stockId);
  if (!ctx) return;

  ctx.service = {
    ...(ctx.service || {}),
    ...data,
  };

  addHistory(stockId, {
    type: "SERVICE_UPDATE",
    qty: 0,
  });
}

export function returnFromProduction(stockId) {
  const ctx = getStockItemById(stockId);
  if (!ctx) return;

  addHistory(stockId, {
    type: "RETURN_FROM_PRODUCTION",
    qty: 0,
  });
}
