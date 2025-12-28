"use client";

import { useEffect } from "react";
import ContextBar from "../components/ContextBar";
import { useAppContext } from "../context/AppContext";

export default function DashboardPage() {
  const { setModule } = useAppContext();

  useEffect(() => {
    setModule("Dashboard");
  }, [setModule]);

  return (
    <div style={{ padding: 24 }}>
      <ContextBar />

      <h1>Dashboard</h1>
      <p style={{ opacity: 0.7 }}>
        Tady bude přehled: upozornění, min/max, servis, objednávky…
      </p>
    </div>
  );
}
