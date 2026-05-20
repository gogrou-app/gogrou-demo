import { searchProducts } from "../../../../../lib/gpc/repositories/products.search.repository.js";

const supportedParams = [
  "diameter",
  "material",
  "coating",
  "flute_count",
];

function getSearchParams(searchParams) {
  const params = {};

  for (const paramName of supportedParams) {
    const value = searchParams.get(paramName);

    if (value !== null && value.trim() !== "") {
      params[paramName] = value.trim();
    }
  }

  return params;
}

export async function GET(request) {
  try {
    const params = getSearchParams(new URL(request.url).searchParams);
    const products = await searchProducts(params);

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
        error: error.message || "Nepodařilo se vyhledat GPC produkty.",
      },
      {
        status: 500,
      }
    );
  }
}
