import { useDroppable } from "@dnd-kit/core";
import { FormField } from "./FormField";
import type { Row, DropTarget } from "../types";

// ─── Droppable cell ───────────────────────────────────────────────────────────
// Mỗi cell là một vùng droppable riêng biệt
interface DroppableCellProps {
  droppableId: string;
  isHighlighted: boolean;
  isEmpty: boolean;
  children?: React.ReactNode;
  width: "full" | "half";
}

function DroppableCell({
  droppableId,
  isHighlighted,
  isEmpty,
  children,
  width,
}: DroppableCellProps) {
  const { isOver, setNodeRef } = useDroppable({ id: droppableId });
  const active = isOver || isHighlighted;

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: width === "full" ? "1 1 100%" : "1 1 50%",
        minHeight: isEmpty ? 72 : undefined,
        borderRadius: 6,
        border: active
          ? "2px dashed #3b9eff"
          : isEmpty
          ? "2px dashed #1e2d42"
          : "2px solid transparent",
        background: active ? "rgba(59,158,255,0.07)" : "transparent",
        transition: "all 0.15s",
        display: "flex",
        alignItems: "stretch",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {isEmpty && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: active ? "#3b9eff" : "#2a3a50",
            fontSize: 11,
            pointerEvents: "none",
            transition: "color 0.15s",
          }}
        >
          {active ? "Thả vào đây" : width === "half" ? "½ dòng trống" : ""}
        </div>
      )}
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

// ─── GridRow ──────────────────────────────────────────────────────────────────
interface GridRowProps {
  row: Row;
  selectedId: string | null;
  dropTarget: DropTarget | null;
  isDraggingFromSidebar: boolean;
  onSelectField: (id: string) => void;
  onDeleteField: (id: string) => void;
}

export function GridRow({
  row,
  selectedId,
  dropTarget,
  isDraggingFromSidebar,
  onSelectField,
  onDeleteField,
}: GridRowProps) {
  const isFull = row.cells.length === 1 && row.cells[0].slot === "full";
  const leftCell = row.cells.find((c) => c.slot === "left" || c.slot === "full");
  const rightCell = row.cells.find((c) => c.slot === "right");

  // IDs cho droppable zones
  const leftDropId = `${row.id}:left`;
  const rightDropId = `${row.id}:right`;
  const fullDropId = `${row.id}:full`;

  const isTargetLeft =
    dropTarget?.rowId === row.id && dropTarget?.slot === "left";
  const isTargetRight =
    dropTarget?.rowId === row.id && dropTarget?.slot === "right";
  const isTargetFull =
    dropTarget?.rowId === row.id && dropTarget?.slot === "full";

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        marginBottom: 8,
        alignItems: "stretch",
      }}
    >
      {isFull ? (
        // ── Dòng full: hiện field + 2 drop zone ở 2 bên ──────────────────────
        <>
          {/* Drop zone trái — kéo vào đây → field co lại thành half, field mới vào left */}
          {isDraggingFromSidebar && (
            <DroppableCell
              droppableId={leftDropId}
              isHighlighted={isTargetLeft}
              isEmpty
              width="half"
            />
          )}

          {/* Full drop zone (giữa) — dùng khi không kéo từ sidebar */}
          <DroppableCell
            droppableId={fullDropId}
            isHighlighted={isTargetFull}
            isEmpty={false}
            width={isDraggingFromSidebar ? "half" : "full"}
          >
            {leftCell && (
              <FormField
                field={leftCell.field}
                isSelected={selectedId === leftCell.field.id}
                onClick={() => onSelectField(leftCell.field.id)}
                onDelete={onDeleteField}
              />
            )}
          </DroppableCell>

          {/* Drop zone phải */}
          {isDraggingFromSidebar && (
            <DroppableCell
              droppableId={rightDropId}
              isHighlighted={isTargetRight}
              isEmpty
              width="half"
            />
          )}
        </>
      ) : (
        // ── Dòng 2 cell ───────────────────────────────────────────────────────
        <>
          <DroppableCell
            droppableId={leftDropId}
            isHighlighted={isTargetLeft}
            isEmpty={!leftCell}
            width="half"
          >
            {leftCell && (
              <FormField
                field={leftCell.field}
                isSelected={selectedId === leftCell.field.id}
                onClick={() => onSelectField(leftCell.field.id)}
                onDelete={onDeleteField}
              />
            )}
          </DroppableCell>

          <DroppableCell
            droppableId={rightDropId}
            isHighlighted={isTargetRight}
            isEmpty={!rightCell}
            width="half"
          >
            {rightCell && (
              <FormField
                field={rightCell.field}
                isSelected={selectedId === rightCell.field.id}
                onClick={() => onSelectField(rightCell.field.id)}
                onDelete={onDeleteField}
              />
            )}
          </DroppableCell>
        </>
      )}
    </div>
  );
}