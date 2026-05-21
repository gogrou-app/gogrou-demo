import { DEFAULT_INTAKE_OPERATOR, ISSUE_STATE_LABELS, MAIN_WAREHOUSE_ID, STOCK_CONDITION_LABELS } from "./constants.js";

const getItemKey = (item) => item.id || item.gpc_id || item.name;

export const formatMovementDate = (value) => {
  if (!value) {
    return "datum neuvedeno";
  }

  try {
    return new Date(value).toLocaleString("cs-CZ");
  } catch (error) {
    return value;
  }
};

export const getMovementStateLabel = (state) => STOCK_CONDITION_LABELS[state] || ISSUE_STATE_LABELS[state] || state || "neuvedeno";

export const createMovementRecord = ({ organizationId, item, type, quantity, state, performedBy, note, metadata = {} }) => ({
  id: crypto.randomUUID(),
  createdAt: new Date().toISOString(),
  type,
  organizationId,
  warehouseId: MAIN_WAREHOUSE_ID,
  itemId: getItemKey(item),
  itemName: item.name || item.gpc_id || "Položka",
  gpc_id: item.gpc_id || "",
  origin: item.origin || "LOCAL",
  quantity,
  state,
  performedBy: performedBy || DEFAULT_INTAKE_OPERATOR,
  note: note || "",
  metadata,
});

export const appendMovement = (item, movement) => ({
  ...item,
  movementHistory: [movement, ...(item.movementHistory || [])].slice(0, 100),
});

export const collectMovementHistory = (items) =>
  items
    .flatMap((item) => (item.movementHistory || []).map((movement) => ({
      ...movement,
      itemName: movement.itemName || item.name || item.gpc_id || "Položka",
    })))
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
