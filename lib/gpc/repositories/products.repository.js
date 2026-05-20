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

async function getProductLifecycleByGpcId(gpcId) {
  const result = await db.query(
    `
      SELECT
        p.id,
        p.gpc_id,
        p.status,
        p.replacement_product_card_id,
        p.updated_at
      FROM gpc_product_cards p
      WHERE p.gpc_id = $1
      LIMIT 1
    `,
    [gpcId]
  );

  return result.rows[0] || null;
}

async function updateProductCatalogStatusByGpcId(gpcId, lifecycleChange) {
  const result = await db.query(
    `
      WITH selected_product AS (
        SELECT id, gpc_id, status, updated_at
        FROM gpc_product_cards
        WHERE gpc_id = $1
        FOR UPDATE
      ),
      updated_product AS (
        UPDATE gpc_product_cards p
        SET status = $2
        FROM selected_product sp
        WHERE p.id = sp.id
          AND p.status <> $2
        RETURNING
          p.id,
          p.gpc_id,
          sp.status AS previous_status,
          p.status,
          p.updated_at,
          true AS changed
      ),
      audit AS (
        INSERT INTO gpc_audit_logs (
          product_card_id,
          actor,
          action,
          before_data,
          after_data,
          metadata
        )
        SELECT
          id,
          $3::text,
          'gpc.catalog_status_changed',
          jsonb_build_object('status', previous_status),
          jsonb_build_object('status', status),
          jsonb_build_object('reason', $4::text)
        FROM updated_product
        RETURNING id
      )
      SELECT
        id,
        gpc_id,
        previous_status,
        status,
        updated_at,
        changed
      FROM updated_product
      UNION ALL
      SELECT
        id,
        gpc_id,
        status AS previous_status,
        status,
        updated_at,
        false AS changed
      FROM selected_product
      WHERE status = $2
    `,
    [gpcId, lifecycleChange.status, lifecycleChange.actor, lifecycleChange.reason]
  );

  return result.rows[0] || null;
}

module.exports = {
  getAllProducts,
  getProductByGpcId,
  getProductByGtin,
  getProductLifecycleByGpcId,
  updateProductCatalogStatusByGpcId,
};
