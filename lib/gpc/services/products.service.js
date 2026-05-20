const productsRepository = require("../repositories/products.repository");

// TODO: caching
// TODO: AI enrichment
// TODO: ToolsUnited sync
// TODO: permissions/RBAC

function createServiceError(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function normalizeRequiredText(value, fieldName) {
  if (typeof value !== "string") {
    throw createServiceError(`${fieldName} musí být textový řetězec.`, "GPC_INVALID_INPUT");
  }

  const normalized = value.trim();

  if (!normalized) {
    throw createServiceError(`${fieldName} nesmí být prázdné.`, "GPC_INVALID_INPUT");
  }

  return normalized;
}

async function listProducts() {
  return productsRepository.getAllProducts();
}

async function getProductDetailByGpcId(gpcId) {
  const normalizedGpcId = normalizeRequiredText(gpcId, "gpcId");
  const product = await productsRepository.getProductByGpcId(normalizedGpcId);

  if (!product) {
    throw createServiceError(
      `Produktová karta GPC '${normalizedGpcId}' nebyla nalezena.`,
      "GPC_PRODUCT_NOT_FOUND"
    );
  }

  return product;
}

async function getProductDetailByGtin(gtin) {
  const normalizedGtin = normalizeRequiredText(gtin, "gtin");

  if (!/^[0-9]{8,14}$/.test(normalizedGtin)) {
    throw createServiceError("gtin musí obsahovat 8 až 14 číslic.", "GPC_INVALID_GTIN");
  }

  const product = await productsRepository.getProductByGtin(normalizedGtin);

  if (!product) {
    throw createServiceError(
      `Produktová karta s GTIN '${normalizedGtin}' nebyla nalezena.`,
      "GPC_PRODUCT_NOT_FOUND"
    );
  }

  return product;
}

module.exports = {
  listProducts,
  getProductDetailByGpcId,
  getProductDetailByGtin,
};
