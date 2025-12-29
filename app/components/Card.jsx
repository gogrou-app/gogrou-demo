export default function Card({ children, right }) {
  return (
    <div
      style={{
        background: "#111",
        borderRadius: "14px",
        padding: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.05)",
      }}
    >
      <div>{children}</div>

      {right && <div>{right}</div>}
    </div>
  );
}
