"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getStockItemById } from "../data/gssStore";

export default function GssDetailPage() {
  const { id } = useParams();
  const item = getStockItemById(id);

  if (!item) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Položka nenalezena</h1>
        <Link href="/gss" className="text-blue-600 underline">
          Zpět na sklad
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{item.name}</h1>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-500">Typ</div>
          <div>{item.type}</div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Stav</div>
          <div>{item.status}</div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Ks celkem</div>
          <div>{item.qtyTotal}</div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Min / Max</div>
          <div>
            {item.min} / {item.max}
          </div>
        </div>
      </div>

      <Link href="/gss" className="inline-block text-blue-600 underline">
        ← Zpět na sklad
      </Link>
    </div>
  );
}
