export const createEmptyStockSummary = () => ({
  total: 0,
  available: 0,
  reserved: 0,
  production: 0,
  sharpening: 0,
  states: {
    new: 0,
    resharpened_new: 0,
    used: 0,
    sharpening: 0,
  },
  sharpeningBreakdown: {
    in_company: 0,
    at_grinder: 0,
  },
});

export const normalizeStockSummary = (stockSummary) => ({
  ...createEmptyStockSummary(),
  ...(stockSummary || {}),
  states: {
    ...createEmptyStockSummary().states,
    ...(stockSummary?.states || {}),
  },
  sharpeningBreakdown: {
    ...createEmptyStockSummary().sharpeningBreakdown,
    ...(stockSummary?.sharpeningBreakdown || {}),
  },
});

export const getPrimaryStockState = (item) => {
  const states = normalizeStockSummary(item.stockSummary).states;
  return ["used", "resharpened_new", "new", "sharpening"].find((state) => states[state] > 0) || "new";
};

export const parsePositiveQuantity = (value) => {
  const quantity = Number(value);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : null;
};
