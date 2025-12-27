"use client";
import { useAppContext } from "../context/AppContext";
import { gssData } from "./data/gssStore";

export default function GSSPage() {
  const { company, setModule, warehouse } = useAppContext();
  setModule("GSS");

  const items = gssData?.[company]?.[warehouse] || [];

  return (
    <div>
      <h1>GSS – Hlavní sklad</h1>
      <p>
        Firma: <b>{company}</b> • Sklad: <b>{warehouse}</b>
      </p>

      {items.length === 0 && <p>Tento sklad je zatím prázdný</p>}

      {items.map((item) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #333",
            padding: "12px",
            marginBottom: "8px",
            borderRadius: "8px",
          }}
        >
          <b>{item.name}</b>
          <div>Stav: {item.qty} ks</div>
          <div>
            MIN: {item.min} / MAX: {item.max}
          </div>
        </div>
      ))}
    </div>
  );
}
