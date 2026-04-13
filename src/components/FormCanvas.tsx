import { useDroppable } from "@dnd-kit/core";
import { GridRow } from "./Gridrow";
import type { Row, DropTarget } from "../types";

// ─── Bottom drop zone ─────────────────────────────────────────────────────────
function BottomDropZone({
  isEmpty,
  isDraggingFromSidebar,
}: {
  isEmpty: boolean;
  isDraggingFromSidebar: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: "canvas:new:full" });

  if (!isDraggingFromSidebar && !isEmpty) return null;

  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: isEmpty ? 280 : 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        border: `2px dashed ${isOver ? "#3b9eff" : "#1e2d42"}`,
        background: isOver ? "rgba(59,158,255,0.05)" : "transparent",
        transition: "all 0.2s",
        marginTop: isEmpty ? 0 : 4,
      }}
    >
      {isEmpty ? (
        <div
          style={{
            textAlign: "center",
            color: isOver ? "#3b9eff" : "#3a4a5e",
            transition: "color 0.2s",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
            Thả component vào đây
          </div>
          <div style={{ fontSize: 12, color: "#4a5568" }}>
            Thả vào giữa → cả dòng · Thả vào ô bên cạnh field → nửa dòng
          </div>
        </div>
      ) : (
        <div
          style={{
            fontSize: 12,
            color: isOver ? "#3b9eff" : "#2a3a50",
            transition: "color 0.2s",
          }}
        >
          {isOver ? "Thêm dòng mới" : "+ Thả để thêm dòng mới"}
        </div>
      )}
    </div>
  );
}

// ─── FormCanvas ───────────────────────────────────────────────────────────────
interface FormCanvasProps {
  rows: Row[];
  selectedId: string | null;
  dropTarget: DropTarget | null;
  isDraggingFromSidebar: boolean;
  onSelectField: (id: string) => void;
  onDeleteField: (id: string) => void;
}

export function FormCanvas({
  rows,
  selectedId,
  dropTarget,
  isDraggingFromSidebar,
  onSelectField,
  onDeleteField,
}: FormCanvasProps) {
  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        background: "#0f1320",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div
          style={{
            background: "#111827",
            borderRadius: 10,
            border: "1px solid #1a2235",
            padding: "24px 28px",
            minHeight: 500,
          }}
        >
          {rows.map((row) => (
            <GridRow
              key={row.id}
              row={row}
              selectedId={selectedId}
              dropTarget={dropTarget}
              isDraggingFromSidebar={isDraggingFromSidebar}
              onSelectField={onSelectField}
              onDeleteField={onDeleteField}
            />
          ))}

          <BottomDropZone
            isEmpty={rows.length === 0}
            isDraggingFromSidebar={isDraggingFromSidebar}
          />
        </div>
      </div>
    </div>
  );
}