"use client";

import { useEffect } from "react";
import { useAppContext } from "../context/AppContext";

export default function SmartSplitPage() {
  const { setModule } = useAppContext();

  useEffect(() => {
    setModule("SmartSplit");
  }, [setModule]);

  return (
    <div style={{ padding: 30, color: "white" }}>
      <ContextHeader />

      <h1>SmartSplit</h1>
      <p style={{ opacity: 0.7 }}>
        Zatím placeholder – později akce, ceny, množství, rozpad objednávek…
      </p>
    </div>
  );
}
