"use client";

import { useEffect } from "react";
import ContextHeader from "../components/ContextHeader";
import { useAppContext } from "../context/AppContext";

export default function DashboardPage() {
  const { setModule } = useAppContext();

  useEffect(() => {
    setModule("Dashboard");
  }, [setModule]);

  return (
    <div style={{ padding: 30, color: "white" }}>
      <ContextHeader />

      <h1>Dashboard</h1>
      <p style={{ opacity: 0.7 }}>
        Tady bude později přehled: upozornění, min/max, servis, objednávky…
      </p>
    </div>
  );
}
