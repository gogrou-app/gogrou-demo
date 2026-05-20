const productsRepository = require("../repositories/products.repository");

const CATALOG_STATUSES = Object.freeze([
  "draft",
  "active",
  "phase_out",
  "discontinued",
  "archived",
]);

const STATUS_DETAILS = Object.freeze({
  draft: {
    label: "Draft",
    description: "Interni rozpracovana master polozka GPC katalogu.",
  },
  active: {
    label: "Active",
    description: "Interni aktivni master polozka dostupna pro natazeni do GSS.",
  },
  phase_out: {
    label: "Phase out",
    description: "Interni vybehova master polozka, typicky s doporucenou nahradou.",
  },
  discontinued: {
    label: "Discontinued",
    description: "Interni ukoncena master polozka ponechana kvuli historicke identite.",
  },
  archived: {
    label: "Archived",
    description: "Interni archivovana master polozka skryta z bezne katalogove prace.",
  },
});

function createLifecycleError(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function normalizeGpcId(gpcId) {
  if (typeof gpcId !== "string") {
    throw createLifecycleError("gpcId musi byt textovy retezec.", "GPC_INVALID_INPUT");
  }

  const normalized = gpcId.trim();

  if (!normalized) {
    throw createLifecycleError("gpcId nesmi byt prazdne.", "GPC_INVALID_INPUT");
  }

  return normalized;
}

function normalizeStatus(status) {
  if (typeof status !== "string") {
    throw createLifecycleError("status musi byt textovy retezec.", "GPC_INVALID_STATUS");
  }

  const normalized = status.trim();

  if (!CATALOG_STATUSES.includes(normalized)) {
    throw createLifecycleError(
      `Nepodporovany GPC katalogovy status '${normalized}'.`,
      "GPC_INVALID_STATUS"
    );
  }

  return normalized;
}

function normalizeOptionalText(value) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw createLifecycleError("Volitelna metadata musi byt textovy retezec.", "GPC_INVALID_INPUT");
  }

  const normalized = value.trim();
  return normalized || null;
}

function listCatalogStatuses() {
  return CATALOG_STATUSES.map((status) => ({
    status,
    ...STATUS_DETAILS[status],
  }));
}

async function getCatalogStatus(gpcId) {
  const normalizedGpcId = normalizeGpcId(gpcId);
  const product = await productsRepository.getProductLifecycleByGpcId(normalizedGpcId);

  if (!product) {
    throw createLifecycleError(
      `Produktova karta GPC '${normalizedGpcId}' nebyla nalezena.`,
      "GPC_PRODUCT_NOT_FOUND"
    );
  }

  return product;
}

async function setCatalogStatus(gpcId, nextStatus, options = {}) {
  const normalizedGpcId = normalizeGpcId(gpcId);
  const normalizedStatus = normalizeStatus(nextStatus);
  const actor = normalizeOptionalText(options.actor) || "gpc-internal";
  const reason = normalizeOptionalText(options.reason);

  const product = await productsRepository.updateProductCatalogStatusByGpcId(normalizedGpcId, {
    status: normalizedStatus,
    actor,
    reason,
  });

  if (!product) {
    throw createLifecycleError(
      `Produktova karta GPC '${normalizedGpcId}' nebyla nalezena.`,
      "GPC_PRODUCT_NOT_FOUND"
    );
  }

  return product;
}

module.exports = {
  CATALOG_STATUSES,
  listCatalogStatuses,
  getCatalogStatus,
  setCatalogStatus,
};
