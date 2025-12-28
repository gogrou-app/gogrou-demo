import stockData from "./data/stock";
import GssToolCard from "./components/GssToolCard";

export default function GssPage() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1100,
        margin: "0 auto",
        padding: "24px 24px 80px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <h1 style={{ fontSize: 26, marginBottom: 4 }}>
        Sklad nástrojů
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
