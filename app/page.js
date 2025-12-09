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
      icon: "⚡️",
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
    <div style={{ padding: "40px", color: "white" }}>
      <h1 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "20px" }}>
        Dashboard
      </h1>

      <p style={{ fontSize: "20px", opacity: 0.8, marginBottom: "30px" }}>
        Vítej v <strong>Gogrou DEMO</strong> 🚀 Vyber si modul, který chceš zobrazit:
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {cards.map((card) => (
          <a
            key={card.title}
            href={card.link}
            style={{
              padding: "20px",
              background: "#151515",
              border: "1px solid #222",
              borderRadius: "10px",
              textDecoration: "none",
              color: "white",
              transition: "0.25s",
              display: "block",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.background = "#1f1f1f";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0px)";
              e.currentTarget.style.background = "#151515";
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>
              {card.icon}
            </div>

            <h2 style={{ fontSize: "22px", marginBottom: "10px" }}>
              {card.title}
            </h2>

            <p style={{ opacity: 0.7, lineHeight: "1.4" }}>{card.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
