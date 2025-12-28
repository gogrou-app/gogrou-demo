"use client";

import GssToolCard from "./components/GssToolCard";
import stockData from "./data/stock";

export default function GssPage() {
  return (
    <div style={{ padding: 24, maxWidth: 1200 }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>
        Sklad nástrojů (interní)
      </h1>

      <div style={{ opacity: 0.6, marginBottom: 20 }}>
        Zde spravujete skutečný sklad nástrojů firmy
      </div>

      {stockData.map((item) => (
        <GssToolCard key={item.id} item={item} />
      ))}
    </div>
  );
}
