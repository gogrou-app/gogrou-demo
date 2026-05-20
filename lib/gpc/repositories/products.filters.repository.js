const db = require("../db");

const filterColumns = {
  manufacturer: "m.name",
  product_type: "pt.name",
  status: "p.status",
  validation_status: "p.validation_status",
};

// TODO: JSONB filtering
// TODO: pagination
// TODO: sorting
// TODO: fulltext
// TODO: AI semantic search
// TODO: tenant isolation

function addFilterCondition(whereConditions, params, column, value) {
  if (value === undefined || value === null || value === "") {
    return;
  }

  params.push(value);
  whereConditions.push(`${column} = $${params.length}`);
}

function buildWhereClause(filters, params) {
  const whereConditions = [];

  for (const [filterName, column] of Object.entries(filterColumns)) {
    addFilterCondition(whereConditions, params, column, filters[filterName]);
  }

  if (whereConditions.length === 0) {
    return "";
  }

  return `WHERE ${whereConditions.join(" AND ")}`;
}

async function filterProducts(filters = {}) {
  const params = [];
  const safeFilters = filters || {};
  const whereClause = buildWhereClause(safeFilters, params);

  const result = await db.query(
    `
      SELECT
        p.gpc_id,
        p.name,
        m.name AS manufacturer,
        pt.name AS product_type,
        gt.gtin,
        p.status,
        p.validation_status,
        p.updated_at
      FROM gpc_product_cards p
      JOIN gpc_manufacturers m ON m.id = p.manufacturer_id
      JOIN gpc_product_types pt ON pt.id = p.product_type_id
      LEFT JOIN gpc_gtins gt ON gt.product_card_id = p.id AND gt.is_primary = true
      ${whereClause}
      ORDER BY p.updated_at DESC, p.gpc_id ASC
    `,
    params
  );

  return result.rows;
}

module.exports = {
  filterProducts,
};
