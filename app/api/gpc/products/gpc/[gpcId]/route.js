import productsService from "../../../../../../lib/gpc/services/products.service.js";
import lifecycleService from "../../../../../../lib/gpc/services/lifecycle.service.js";

// TODO: RBAC
// TODO: audit log
// TODO: caching
// TODO: AI enrichment
// TODO: tenant isolation

export async function GET(request, context) {
  try {
    const product = await productsService.getProductDetailByGpcId(context.params.gpcId);

    return Response.json(
      {
        data: product,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    const status = error.code === "GPC_PRODUCT_NOT_FOUND" ? 404 : 500;

    return Response.json(
      {
        error: error.message || "Nepodařilo se načíst GPC produkt podle GPC ID.",
      },
      {
        status,
      }
    );
  }
}

export async function PATCH(request, context) {
  try {
    const body = await request.json();
    const product = await lifecycleService.setCatalogStatus(context.params.gpcId, body.status, {
      actor: body.actor,
      reason: body.reason,
    });

    return Response.json(
      {
        data: product,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    const status =
      error.code === "GPC_PRODUCT_NOT_FOUND" ? 404 :
      error.code === "GPC_INVALID_STATUS" || error.code === "GPC_INVALID_INPUT" ? 400 :
      500;

    return Response.json(
      {
        error: error.message || "Nepodařilo se změnit GPC katalogový status.",
      },
      {
        status,
      }
    );
  }
}
