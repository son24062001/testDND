// ─── Header.tsx ───────────────────────────────────────────────────────────────
import { useState } from "react";
import type { Row } from "../types";
import { generateSchemaContent } from "../utils";

function downloadSchemaFile(rows: Row[]) {
  const content = generateSchemaContent(rows);
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "schema.ts";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function Header({ rows }: { rows: Row[] }) {
  const hasFields = rows.some((r) => r.cells.length > 0);
  const [clicked, setClicked] = useState(false);

  const handleExport = () => {
    if (!hasFields) return;
    downloadSchemaFile(rows);
    setClicked(true);
    setTimeout(() => setClicked(false), 1500);
  };

  return (
    <div style={{ height: 48, background: "#ffffff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
      <div style={{ display: "flex", gap: 10 }}>
        {/* Copy schema — placeholder, chưa implement */}
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 6, fontSize: 13, fontWeight: 500, background: "transparent", border: "1px solid #2a3a55", color: "#475569", cursor: "default" }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy schema
        </button>

        {/* Export schema */}
        <button
          onClick={handleExport}
          disabled={!hasFields}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 6, fontSize: 13, fontWeight: 500,
            background: hasFields ? (clicked ? "#2563eb" : "#3b82f6") : "#e8edf3",
            border: hasFields ? "1px solid #2563eb" : "1px solid #1e2d42",
            color: hasFields ? "#fff" : "#94a3b8",
            cursor: hasFields ? "pointer" : "not-allowed",
            transition: "all 0.2s",
            boxShadow: hasFields ? "0 1px 6px rgba(59,130,246,0.25)" : "none",
          }}
          title={hasFields ? "Download schema.ts" : "Add fields to canvas first"}
          onMouseEnter={(e) => { if (hasFields && !clicked) (e.currentTarget as HTMLButtonElement).style.background = "#2563eb"; }}
          onMouseLeave={(e) => { if (hasFields && !clicked) (e.currentTarget as HTMLButtonElement).style.background = "#3b82f6"; }}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {clicked ? "Exported!" : "Export schema"}
        </button>
      </div>
    </div>
  );
}