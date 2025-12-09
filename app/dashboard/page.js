import Link from "next/link";

export default function Page() {
  const cards = [
    {
      title: "GPC – Product Center",
      desc: "Centrální databáze produktů, GTIN, parametry a katalogy.",
      icon: "🛠️",
      link: "/gpc",
    },
    {
      title: "GSS – Storage System",
      desc: "Správa skladů, zásob, DM kódy a životní cyklus nástrojů.",
      icon: "📦",
      link: "/gss",
    },
    {
      title: "SmartSplit – Akce",
      desc: "Dynamické hromadné nákupy a výrobní promo akce.",
      icon: "⚡",
      link: "/ss",
    },
    {
      title: "AI Asistent",
      desc: "Inteligentní pomoc napříč moduly, analýzy, doporučení.",
      icon: "🤖",
      link: "/ai",
    },
  ];

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "10px" }}>
        Dashboard
      </h1>

      <p style={{ fontSize: "18px", opacity: 0.85, marginBottom: "30px" }}>
        Vítej v Gogrou DEMO 🚀 Toto je hlavní přehled, odkud se dostaneš do všech
        modulů:
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px",
          maxWidth: "900px",
        }}
      >
        {cards.map((card) => (
          <Link
            key={card.link}
            href={card.link}
            style={{
              display: "block",
              padding: "20px",
              borderRadius: "10px",
              border: "1px solid #333",
              textDecoration: "none",
              background: "#111",
            }}
          >
            <div style={{ fontSize: "26px", marginBottom: "10px" }}>
              {card.icon}
            </div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "6px",
                color: "#fff",
              }}
            >
              {card.title}
            </div>
            <div style={{ fontSize: "15px", color: "#bbb" }}>{card.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
