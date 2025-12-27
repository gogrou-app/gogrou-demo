/**
 * ================================
 * SERVICE / OSTŘENÍ – GSS STOCK
 * ================================
 * Rozšíření dat o servisní informace nástroje
 * (bez historie, bez DM, pouze metadata)
 */

/**
 * Nastaví servisní informace položky
 * @param {string} gssStockId
 * @param {object} serviceData
 */
export function updateServiceSettings(gssStockId, serviceData) {
  const state = getGssState();
  if (!state) return;

  const main = state.warehouses.find((w) => w.is_default);
  if (!main) return;

  const stockItem = main.stock.find(
    (s) => String(s.gss_stock_id) === String(gssStockId)
  );
  if (!stockItem) return;

  stockItem.service = {
    sharpenable: Boolean(serviceData.sharpenable),
    max_resharpens: Number(serviceData.max_resharpens || 0),
    service_provider: serviceData.service_provider || "MTTM",
    note: serviceData.note || "",
  };

  saveGssState(state);
}

/**
 * Vrátí servisní info položky
 * @param {string} gssStockId
 */
export function getServiceSettings(gssStockId) {
  const state = getGssState();
  if (!state) return null;

  const main = state.warehouses.find((w) => w.is_default);
  if (!main) return null;

  const stockItem = main.stock.find(
    (s) => String(s.gss_stock_id) === String(gssStockId)
  );

  return stockItem?.service || null;
}

/**
 * Vyhodnocení doporučení po návratu z výroby
 * (pouze doporučení – žádná automatická akce)
 *
 * @param {number} usedCount   // kolikrát byl nástroj použit
 * @param {object} service     // service nastavení
 */
export function evaluateServiceRecommendation(usedCount, service) {
  if (!service?.sharpenable) return null;

  const maxUses = 1 + Number(service.max_resharpens || 0);

  if (usedCount >= maxUses) {
    return {
      recommendation: "DISCARD",
      message:
        "Byl dosažen maximální počet použití. Doporučeno nástroj vyřadit.",
      actions: ["SEND_TO_SERVICE", "DISCARD"],
    };
  }

  return null;
}
