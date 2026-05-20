import {
  getProductAssetsByGpcId,
  productExistsByGpcId,
} from "../../../../../../../lib/gpc/repositories/products.assets.repository.js";

// TODO: signed URLs
// TODO: access control
// TODO: tenant isolation
// TODO: CDN
// TODO: preview generation
// TODO: OCR
// TODO: AI extraction
// TODO: audit logging

export async function GET(request, context) {
  try {
    const { gpcId } = context.params;
    const assets = await getProductAssetsByGpcId(gpcId);

    if (assets.length === 0) {
      const productExists = await productExistsByGpcId(gpcId);

      return Response.json(
        {
          error: productExists
            ? `Produktová karta GPC '${gpcId}' nemá žádné assety.`
            : `Produktová karta GPC '${gpcId}' nebyla nalezena.`,
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(
      {
        data: assets,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return Response.json(
      {
        error: error.message || "Nepodařilo se načíst assety GPC produktu.",
      },
      {
        status: 500,
      }
    );
  }
}
