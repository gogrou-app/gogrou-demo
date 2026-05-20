const db = require("../db");

const diameterExpression =
  "COALESCE(p.technical_parameters #>> '{geometry,diameter_mm}', p.technical_parameters ->> 'diameter')";
const fluteCountExpression =
  "COALESCE(p.technical_parameters #>> '{geometry,flutes}', p.technical_parameters ->> 'flute_count')";

const jsonbSearchFields = {
  diameter: diameterExpression,
  material: "COALESCE(p.technical_parameters ->> 'material', p.technical_parameters #>> '{features,material}')",
  coating: "COALESCE(p.technical_parameters ->> 'coating', p.technical_parameters #>> '{features,coating}', p.technical_parameters #>> '{coating,name}')",
  flute_count: fluteCountExpression,
};

const numericRangeFields = {
  diameter_min: {
    expression: diameterExpression,
    operator: ">=",
  },
  diameter_max: {
    expression: diameterExpression,
    operator: "<=",
  },
  flute_count_min: {
    expression: fluteCountExpression,
    operator: ">=",
  },
  flute_count_max: {
    expression: fluteCountExpression,
    operator: "<=",
  },
};

// TODO: vector search
// TODO: AI semantic search
// TODO: AI similarity search
// TODO: tolerance search
// TODO: cutting condition matching
// TODO: worn tool compensation
// TODO: DM measured values
// TODO: unit conversion
// TODO: lifecycle scoring
// TODO: tenant isolation

function addSearchCondition(whereConditions, values, jsonbExpression, value) {
  if (value === undefined || value === null || value === "") {
    return;
  }

  values.push(value);
  whereConditions.push(`${jsonbExpression} = $${values.length}`);
}

function addNumericRangeCondition(whereConditions, values, jsonbExpression, operator, value) {
  if (value === undefined || value === null || value === "") {
    return;
  }

  values.push(value);
  whereConditions.push(
    `CAST(${jsonbExpression} AS NUMERIC) ${operator} CAST($${values.length} AS NUMERIC)`
  );
}

function buildWhereClause(searchParams, values) {
  const whereConditions = [];

  for (const [paramName, jsonbExpression] of Object.entries(jsonbSearchFields)) {
    addSearchCondition(whereConditions, values, jsonbExpression, searchParams[paramName]);
  }

  for (const [paramName, rangeConfig] of Object.entries(numericRangeFields)) {
    addNumericRangeCondition(
      whereConditions,
      values,
      rangeConfig.expression,
      rangeConfig.operator,
      searchParams[paramName]
    );
  }

  if (whereConditions.length === 0) {
    return "";
  }

  return `WHERE ${whereConditions.join(" AND ")}`;
}

async function searchProducts(params = {}) {
  const values = [];
  const safeParams = params || {};
  const whereClause = buildWhereClause(safeParams, values);

  const result = await db.query(
    `
      SELECT
        p.gpc_id,
        p.name,
        m.name AS manufacturer,
        pt.name AS product_type,
        gt.gtin,
        p.technical_parameters,
        p.status
      FROM gpc_product_cards p
      JOIN gpc_manufacturers m ON m.id = p.manufacturer_id
      JOIN gpc_product_types pt ON pt.id = p.product_type_id
      LEFT JOIN gpc_gtins gt ON gt.product_card_id = p.id AND gt.is_primary = true
      ${whereClause}
      ORDER BY p.updated_at DESC, p.gpc_id ASC
    `,
    values
  );

  return result.rows;
}

module.exports = {
  searchProducts,
};
