"use client";

import { useEffect } from "react";
import ContextHeader from "../components/ContextHeader";
import { useAppContext } from "../context/AppContext";

export const dynamic = "force-dynamic";

export default function GpcPage() {
  const { setModule } = useAppContext();

  useEffect(() => {
    setModule("GPC");
  }, [setModule]);

  return (
    <div style={{ padding: 30, color: "white" }}>
      <ContextHeader />

      <h1>Gogrou Product Center</h1>
      <p style={{ opacity: 0.7 }}>
        Tady bude katalog nástrojů, GTIN, datové modely, parametry…
      </p>
    </div>
  );
}
