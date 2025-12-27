"use client";

import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  getMainWarehouseStock,
} from "./data/gssStore";

export default function GssPage() {
  const { company, warehouse } = useAppContext();
  const [stock, setStock] = useState([]);

  useEffect(() => {
    if (!company || !warehouse) return;

    // 🔥 TADY JE VAZBA NA KONTEXT
    const data = getMainWarehouseStock(
      company.id,
      warehouse.id
    );
    setStock(data);
  }, [company, warehouse]);

  return (
    <div>
      <h1>GSS – Hlavní sklad</h1>
      <p style={{ opacity: 0.6 }}>
        Firma: <strong>{company.name}</strong> ·
        Sklad: <strong>{warehouse.name}</strong>
      </p>

      <div style={{ marginTop: 24 }}>
        {stock.length === 0 && (
          <div style={{ opacity: 0.5 }}>
            Tento sklad je zatím prázdný
          </div>
        )}

        {stock.map((item) => (
          <div
            key={item.gss_stock_id}
            style={{
              border: "1px solid #222",
              borderRadius: 10,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <strong>{item.name}</strong>
            <div style={{ opacity: 0.6 }}>
              Stav: {item.quantity} ks
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
