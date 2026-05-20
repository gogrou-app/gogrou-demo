const db = require("../db");

const productSelect = `
  SELECT
    p.gpc_id,
    p.name,
    m.name AS manufacturer,
    pt.name AS product_type,
    gt.gtin,
    p.technical_parameters,
    p.status,
    p.validation_status,
    p.updated_at
  FROM gpc_product_cards p
  JOIN gpc_manufacturers m ON m.id = p.manufacturer_id
  JOIN gpc_product_types pt ON pt.id = p.product_type_id
  LEFT JOIN gpc_gtins gt ON gt.product_card_id = p.id AND gt.is_primary = true
`;

// TODO: pagination
// TODO: tenant isolation
// TODO: audit logging
// TODO: filtering přes JSONB

async function getAllProducts() {
  const result = await db.query(
    `
      ${productSelect}
      ORDER BY p.updated_at DESC, p.gpc_id ASC
    `,
    []
  );

  return result.rows;
}

async function getProductByGpcId(gpcId) {
  const result = await db.query(
    `
      ${productSelect}
      WHERE p.gpc_id = $1
      LIMIT 1
    `,
    [gpcId]
  );

  return result.rows[0] || null;
}

async function getProductByGtin(gtin) {
  const result = await db.query(
    `
      ${productSelect}
      WHERE gt.gtin = $1
      LIMIT 1
    `,
    [gtin]
  );

  return result.rows[0] || null;
}

module.exports = {
  getAllProducts,
  getProductByGpcId,
  getProductByGtin,
};
