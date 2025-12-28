"use client";

import { useEffect } from "react";
import ContextHeader from "../components/ContextHeader";
import { useAppContext } from "../context/AppContext";

export const dynamic = "force-dynamic";

export default function AiPage() {
  const { setModule } = useAppContext();

  useEffect(() => {
    setModule("AI Assistant");
  }, [setModule]);

  return (
    <div style={{ padding: 30, color: "white" }}>
      <ContextHeader />
      <h1>AI Assistant</h1>
      <p style={{ opacity: 0.7 }}>
        Zatím placeholder – později GINA dotazy nad GPC/GSS daty…
      </p>
    </div>
  );
}
