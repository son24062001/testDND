import { useState } from "react";
import { FormBuilderModal } from "./FormBuilderModal";

export default function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
        pointerEvents: "none",
      }} />

      {/* Glow blobs */}
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)", top: "10%", left: "10%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)", bottom: "15%", right: "15%", pointerEvents: "none" }} />

      {/* Content */}
      <div style={{ position: "relative", textAlign: "center", maxWidth: 560, padding: "0 24px" }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)",
          borderRadius: 99, padding: "5px 14px", marginBottom: 28,
          fontSize: 12, color: "#93c5fd", letterSpacing: "0.06em",
          textTransform: "uppercase", fontWeight: 600,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", display: "inline-block", boxShadow: "0 0 8px #3b82f6" }} />
          No-code tools
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: 52, fontWeight: 700, color: "#f8fafc", margin: "0 0 16px", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          Build forms<br />
          <span style={{ color: "#3b82f6" }}>visually.</span>
        </h1>

        {/* Subtext */}
        <p style={{ fontSize: 17, color: "#94a3b8", margin: "0 0 44px", lineHeight: 1.6 }}>
          Kéo và thả field vào canvas, chỉnh properties, export schema Formily trong vài giây.
        </p>

        {/* CTA */}
        <button
          onClick={() => setIsOpen(true)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "14px 32px", borderRadius: 10,
            background: "#3b82f6", border: "none",
            color: "#fff", fontSize: 15, fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 0 0 1px rgba(59,130,246,0.4), 0 8px 32px rgba(59,130,246,0.35)",
            transition: "transform 0.15s, box-shadow 0.15s, background 0.15s",
            fontFamily: "inherit", letterSpacing: "0.01em",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#2563eb";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 0 0 1px rgba(59,130,246,0.5), 0 12px 40px rgba(59,130,246,0.45)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#3b82f6";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 0 0 1px rgba(59,130,246,0.4), 0 8px 32px rgba(59,130,246,0.35)";
          }}
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <path d="M3 9h18M9 21V9" />
          </svg>
          Mở Form Builder
        </button>

        {/* Feature pills */}
        <div style={{ marginTop: 36, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {["Drag & Drop", "Multi-column", "Resize columns", "Export schema"].map((f) => (
            <span key={f} style={{
              fontSize: 12, color: "#64748b",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 6, padding: "4px 12px",
            }}>
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Modal */}
      <FormBuilderModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}