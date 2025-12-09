<h2 style={{ marginBottom: "10px" }}>{tool.name_display}</h2>

<p><strong>Výrobce:</strong> {tool.manufacturer}</p>
<p><strong>Objednací číslo:</strong> {tool.order_id}</p>
<p><strong>Typ:</strong> {tool.type}</p>
<p><strong>Průměr:</strong> {tool.diameter}</p>

<p style={{ marginTop: "10px", opacity: 0.8 }}>
  {tool.description}
</p>

<img 
  src={tool.image} 
  alt={tool.name_display} 
  style={{
    width: "140px",
    marginTop: "15px",
    borderRadius: "6px",
    border: "1px solid #333"
  }}
/>

<Link
  href={`/gpc/${tool.id}`}
  style={{
    marginTop: "15px",
    display: "inline-block",
    padding: "10px 15px",
    background: "#444",
    color: "white",
    borderRadius: "6px",
    textDecoration: "none",
  }}
>
  Detail →
</Link>
