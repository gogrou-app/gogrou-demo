const db = require("../db");

const supportedAssetTypes = [
  "image",
  "datasheet",
  "drawing",
  "step_model",
  "tool_instructions",
  "toolsunited_link",
  "maxlife_document",
];

const assetTypeExpression = `
  CASE
    WHEN a.attachment_type::text = 'toolsunited_url' THEN 'toolsunited_link'
    WHEN a.attachment_type::text = 'manual' THEN 'tool_instructions'
    ELSE a.attachment_type::text
  END
`;

// TODO: local file storage
// TODO: cloud storage
// TODO: signed URLs
// TODO: thumbnail generation
// TODO: OCR
// TODO: AI extraction
// TODO: versioning
// TODO: tenant isolation

async function getProductAssetsByGpcId(gpcId) {
  const result = await db.query(
    `
      SELECT
        ${assetTypeExpression} AS asset_type,
        a.title,
        a.metadata ->> 'description' AS description,
        a.url AS external_url,
        a.metadata ->> 'file_name' AS file_name,
        a.mime_type,
        a.created_at
      FROM gpc_attachments a
      JOIN gpc_product_cards p ON p.id = a.product_card_id
      WHERE p.gpc_id = $1
        AND ${assetTypeExpression} = ANY($2::text[])
      ORDER BY a.created_at DESC
    `,
    [gpcId, supportedAssetTypes]
  );

  return result.rows;
}

async function productExistsByGpcId(gpcId) {
  const result = await db.query(
    `
      SELECT 1
      FROM gpc_product_cards
      WHERE gpc_id = $1
      LIMIT 1
    `,
    [gpcId]
  );

  return result.rowCount > 0;
}

module.exports = {
  getProductAssetsByGpcId,
  productExistsByGpcId,
};
