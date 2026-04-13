import { useDroppable } from "@dnd-kit/core";

// ─── DropZone ─────────────────────────────────────────────────────────────────
interface DropZoneProps {
  isEmpty: boolean;
}

export function DropZone({ isEmpty }: DropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({ id: "canvas-drop" });

  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: isEmpty ? 300 : 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isEmpty && (
        <div
          style={{
            textAlign: "center",
            color: isOver ? "#3b9eff" : "#3a4a5e",
            border: `2px dashed ${isOver ? "#3b9eff" : "#2a3a50"}`,
            borderRadius: 10,
            padding: "40px 60px",
            background: isOver ? "rgba(59,158,255,0.04)" : "transparent",
            transition: "all 0.2s",
            width: "100%",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
            Drop components here
          </div>
          <div style={{ fontSize: 12, color: "#4a5568" }}>
            Drag items from the left panel
          </div>
        </div>
      )}
    </div>
  );
}