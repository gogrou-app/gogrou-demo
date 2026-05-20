import productsService from "../../../../lib/gpc/services/products.service.js";

// TODO: pagination
// TODO: filtering
// TODO: tenant isolation
// TODO: auth/RBAC
// TODO: audit logging

export async function GET() {
  try {
    const products = await productsService.listProducts();

    return Response.json(
      {
        data: products,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return Response.json(
      {
        error: error.message || "Nepodařilo se načíst GPC produkty.",
      },
      {
        status: 500,
      }
    );
  }
}
