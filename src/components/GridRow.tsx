// ─── GridRow.tsx ──────────────────────────────────────────────────────────────
// Gộp: DroppableCell · ResizeHandle · GridRow · BottomDropZone
import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import type { Row, RowField, GridSlot, DropTarget } from "../types";
import { FormField } from "./FormField";

// ── DroppableCell — một slot trong grid, nhận drop từ sidebar hoặc field ──────
function DroppableCell({ droppableId, isHighlighted, isEmpty, children, flexValue }: {
  droppableId: string;
  isHighlighted: boolean;
  isEmpty: boolean;
  children?: React.ReactNode;
  flexValue: string;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: droppableId });
  const active = isOver || isHighlighted;

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: flexValue,
        minHeight: isEmpty ? 72 : undefined,
        borderRadius: 6,
        border: active ? "2px dashed #3b9eff" : isEmpty ? "2px dashed #1e2d42" : "2px solid transparent",
        background: active ? "rgba(59,130,246,0.07)" : "transparent",
        transition: "border-color 0.15s, background 0.15s",
        display: "flex",
        alignItems: "stretch",
        position: "relative",
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      {isEmpty && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: active ? "#3b9eff" : "#94a3b8", fontSize: 11, pointerEvents: "none" }}>
          {active ? "Thả vào đây" : "ô trống"}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

// ── ResizeHandle — thanh kéo thay đổi tỉ lệ cột ──────────────────────────────
function ResizeHandle({ handleIndex, colWidths, onResize }: {
  handleIndex: number;
  colWidths: number[];
  onResize: (newWidths: number[]) => void;
}) {
  const [dragging, setDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    const row = (e.currentTarget as HTMLElement).closest("[data-resize-row]") as HTMLElement | null;
    if (!row) return;

    const startWidths = [...colWidths];
    const MIN_FRAC = 0.1;

    const onMove = (mv: MouseEvent) => {
      const rect = row.getBoundingClientRect();
      const rowW = rect.width;
      if (rowW === 0) return;

      const mouseX = (mv.clientX - rect.left) / rowW;

      let leftEdge = 0;
      for (let i = 0; i < handleIndex; i++) leftEdge += startWidths[i];

      let newLeft = mouseX - leftEdge;
      const combined = startWidths[handleIndex] + startWidths[handleIndex + 1];
      let newRight = combined - newLeft;

      if (newLeft < MIN_FRAC) { newLeft = MIN_FRAC; newRight = combined - MIN_FRAC; }
      if (newRight < MIN_FRAC) { newRight = MIN_FRAC; newLeft = combined - MIN_FRAC; }

      const newWidths = [...startWidths];
      newWidths[handleIndex] = newLeft;
      newWidths[handleIndex + 1] = newRight;
      onResize(newWidths);
    };

    const onUp = () => {
      setDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      title="Kéo để thay đổi kích thước cột"
      style={{ width: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "col-resize", position: "relative", zIndex: 10, userSelect: "none" }}
    >
      <div style={{ width: dragging ? 3 : 2, height: "60%", minHeight: 24, borderRadius: 99, background: dragging ? "#3b9eff" : "#93afc7", transition: "background 0.15s, width 0.1s" }} />
      <div style={{ position: "absolute", inset: "0 -4px", cursor: "col-resize" }} onMouseDown={handleMouseDown} />
    </div>
  );
}

// ── BottomDropZone — vùng drop cuối canvas để tạo row mới ─────────────────────
export function BottomDropZone({ isEmpty, isDraggingFromSidebar }: { isEmpty: boolean; isDraggingFromSidebar: boolean }) {
  const { isOver, setNodeRef } = useDroppable({ id: "canvas:new:full" });
  if (!isDraggingFromSidebar && !isEmpty) return null;

  return (
    <div
      ref={setNodeRef}
      style={{ minHeight: isEmpty ? 280 : 56, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, border: `2px dashed ${isOver ? "#3b9eff" : "#cbd5e1"}`, background: isOver ? "rgba(59,130,246,0.05)" : "transparent", transition: "all 0.2s", marginTop: isEmpty ? 0 : 4 }}
    >
      {isEmpty ? (
        <div style={{ textAlign: "center", color: isOver ? "#3b9eff" : "#94a3b8" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Thả component vào đây</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Thả vào giữa → cả dòng · Thả vào ô bên cạnh → nửa dòng</div>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: isOver ? "#3b9eff" : "#94a3b8" }}>
          {isOver ? "Thêm dòng mới" : "+ Thả để thêm dòng mới"}
        </div>
      )}
    </div>
  );
}

// ── GridRow — render một row với các cell, handle resize và drop targets ───────
const SLOTS: GridSlot[] = ["col0", "col1", "col2"];

export function GridRow({ row, selectedId, dropTarget, isDraggingFromSidebar, onSelectField, onDeleteField, onResizeRow }: {
  row: Row;
  selectedId: string | null;
  dropTarget: DropTarget | null;
  isDraggingFromSidebar: boolean;
  onSelectField: (id: string) => void;
  onDeleteField: (id: string) => void;
  onResizeRow: (rowId: string, newWidths: number[]) => void;
}) {
  const isFull = row.cells.length === 1 && row.cells[0].slot === "full";
  const colCount = isFull ? 1 : row.cells.length;

  const cellBySlot: Partial<Record<GridSlot, RowField>> = {};
  for (const c of row.cells) cellBySlot[c.slot] = c;

  const dropId = (slot: GridSlot) => `${row.id}:${slot}`;
  const isTarget = (slot: GridSlot) => dropTarget?.rowId === row.id && dropTarget?.slot === slot;
  const widths = row.colWidths;

  // Khi đang kéo từ sidebar và row là full → hiện 3 empty slot xung quanh
  if (isDraggingFromSidebar && isFull) {
    const fullCell = cellBySlot["full"];
    return (
      <div data-resize-row style={{ display: "flex", gap: 0, marginBottom: 8, alignItems: "stretch" }}>
        <DroppableCell droppableId={dropId("col0")} isHighlighted={isTarget("col0")} isEmpty flexValue="1 1 0%" />
        <DroppableCell droppableId={dropId("full")} isHighlighted={isTarget("full")} isEmpty={false} flexValue="2 1 0%">
          {fullCell && <FormField field={fullCell.field} isSelected={selectedId === fullCell.field.id} isDraggingFromSidebar={isDraggingFromSidebar} onClick={() => onSelectField(fullCell.field.id)} onDelete={onDeleteField} />}
        </DroppableCell>
        <DroppableCell droppableId={dropId("col1")} isHighlighted={isTarget("col1")} isEmpty flexValue="1 1 0%" />
        <DroppableCell droppableId={dropId("col2")} isHighlighted={isTarget("col2")} isEmpty flexValue="1 1 0%" />
      </div>
    );
  }

  // Row full, không đang kéo
  if (isFull) {
    const fullCell = cellBySlot["full"];
    return (
      <div data-resize-row style={{ display: "flex", gap: 0, marginBottom: 8, alignItems: "stretch" }}>
        <DroppableCell droppableId={dropId("full")} isHighlighted={isTarget("full")} isEmpty={false} flexValue="1 1 100%">
          {fullCell && <FormField field={fullCell.field} isSelected={selectedId === fullCell.field.id} isDraggingFromSidebar={isDraggingFromSidebar} onClick={() => onSelectField(fullCell.field.id)} onDelete={onDeleteField} />}
        </DroppableCell>
      </div>
    );
  }

  // Multi-col row
  const occupiedSlots = row.cells.map((c) => c.slot) as GridSlot[];
  const maxSlots = isDraggingFromSidebar && colCount < 3 ? colCount + 1 : colCount;
  const displaySlots = SLOTS.slice(0, maxSlots);

  return (
    <div data-resize-row style={{ display: "flex", gap: 0, marginBottom: 8, alignItems: "stretch" }}>
      {displaySlots.map((slot, i) => {
        const cell = cellBySlot[slot];
        const isEmpty = !cell;
        const fw = widths[i] !== undefined ? `${widths[i]} 1 0%` : `1 1 0%`;
        return (
          <React.Fragment key={slot}>
            {i > 0 && occupiedSlots.includes(SLOTS[i - 1]) && (occupiedSlots.includes(slot) || isEmpty) && (
              <ResizeHandle
                handleIndex={i - 1}
                colWidths={widths}
                onResize={(nw) => onResizeRow(row.id, nw)}
              />
            )}
            <DroppableCell droppableId={dropId(slot)} isHighlighted={isTarget(slot)} isEmpty={isEmpty} flexValue={fw}>
              {cell && (
                <FormField
                  field={cell.field}
                  isSelected={selectedId === cell.field.id}
                  isDraggingFromSidebar={isDraggingFromSidebar}
                  onClick={() => onSelectField(cell.field.id)}
                  onDelete={onDeleteField}
                />
              )}
            </DroppableCell>
          </React.Fragment>
        );
      })}
    </div>
  );
}