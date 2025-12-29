'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  getStockItemById,
  updateStockMinMax,
  issueStock,
  receiveStock,
  returnFromProduction,
} from '../data/gssStore';

export default function GssDetailPage() {
  const { id } = useParams();
  const item = getStockItemById(id);

  if (!item) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold text-red-600">
          Položka nenalezena
        </h1>
        <Link href="/gss" className="text-blue-600 underline">
          Zpět na sklad
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* HLAVIČKA */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">{item.name}</h1>
        <div className="text-sm text-gray-500">
          {item.type} · GTIN: {item.gtin}
        </div>
      </div>

      {/* STAV */}
      <div className="grid grid-cols-3 gap-4">
        <Stat label="Celkem kusů" value={item.qtyTotal} />
        <Stat label="Nové" value={item.qtyNew} />
        <Stat label="Broušené" value={item.qtySharpened} />
        <Stat label="Vrácené z výroby" value={item.qtyReturned} />
        <Stat label="Min" value={item.min} />
        <Stat label="Max" value={item.max} />
      </div>

      {/* BROUSITELNOST */}
      <div className="border rounded p-4">
        <h2 className="font-semibold mb-2">Brousitelnost</h2>
        <div className="text-sm">
          {item.sharpenable
            ? `Ano – max ${item.maxSharpenings}×`
            : 'Nebrousitelný'}
        </div>
        <div className="text-sm text-gray-500">
          Aktuální použití: {item.currentUse} /{' '}
          {item.maxSharpenings + 1}
        </div>
      </div>

      {/* AKCE */}
      <div className="flex gap-3">
        <button
          onClick={() => issueStock(id, 1)}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Výdej 1 ks
        </button>

        <button
          onClick={() => receiveStock(id, 1)}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Příjem 1 ks
        </button>

        <button
          onClick={() => returnFromProduction(id)}
          className="px-4 py-2 bg-yellow-500 text-white rounded"
        >
          Návrat z výroby
        </button>
      </div>

      {/* NAVIGACE */}
      <div className="pt-4">
        <Link href="/gss" className="text-blue-600 underline">
          ← Zpět na hlavní sklad
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="border rounded p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
