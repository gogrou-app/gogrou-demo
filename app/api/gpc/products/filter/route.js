import { filterProducts } from "../../../../../lib/gpc/repositories/products.filters.repository.js";

const supportedFilters = [
  "manufacturer",
  "product_type",
  "status",
  "validation_status",
];

// TODO: pagination
// TODO: JSONB filtering
// TODO: sorting
// TODO: auth/RBAC
// TODO: tenant isolation
// TODO: AI semantic filtering

function getFilters(searchParams) {
  const filters = {};

  for (const filterName of supportedFilters) {
    const value = searchParams.get(filterName);

    if (value !== null && value.trim() !== "") {
      filters[filterName] = value.trim();
    }
  }

  return filters;
}

export async function GET(request) {
  try {
    const filters = getFilters(new URL(request.url).searchParams);
    const products = await filterProducts(filters);

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
        error: error.message || "Nepodařilo se filtrovat GPC produkty.",
      },
      {
        status: 500,
      }
    );
  }
}
