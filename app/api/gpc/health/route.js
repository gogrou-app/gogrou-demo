import gpcDb from "../../../../lib/gpc/db.js";

export async function GET() {
  try {
    const result = await gpcDb.healthCheck();

    return Response.json(
      {
        ok: true,
        database: "connected",
        result,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return Response.json(
      {
        ok: false,
        database: "disconnected",
        error: error.message || "Nepodařilo se ověřit připojení k GPC databázi.",
      },
      {
        status: 500,
      }
    );
  }
}
