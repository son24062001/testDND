import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter,
} from "@dnd-kit/core";
import type { DragOverEvent } from "@dnd-kit/core";

import { ComponentSidebar } from "./components/ComponentSidebar";
import { FormCanvas } from "./components/FormCanvas";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { defaultProps } from "./constants";
import type {
  Field,
  FieldType,
  FieldProps,
  ActiveItem,
  Row,
  RowField,
  GridSlot,
  DropTarget,
} from "./types";

// ─── ID counters ──────────────────────────────────────────────────────────────
let fieldCounter = 1;
let rowCounter = 1;

function newFieldId() { return `field_${fieldCounter++}`; }
function newRowId()   { return `row_${rowCounter++}`; }

// ─── Helpers ─────────────────────────────────────────────────────────────────
// Tìm field theo id trong tất cả rows
function findField(rows: Row[], fieldId: string): Field | null {
  for (const row of rows) {
    const cell = row.cells.find((c) => c.field.id === fieldId);
    if (cell) return cell.field;
  }
  return null;
}

// Xóa field khỏi rows, dọn dẹp row trống
function removeField(rows: Row[], fieldId: string): Row[] {
  return rows
    .map((row) => ({
      ...row,
      cells: row.cells.filter((c) => c.field.id !== fieldId),
    }))
    .filter((row) => row.cells.length > 0);
}

// Parse droppable id: "rowId:slot" hoặc "canvas:new:full"
function parseDropId(id: string): { rowId: string; slot: GridSlot } | null {
  if (id === "canvas:new:full") return { rowId: "new", slot: "full" };
  const parts = id.split(":");
  if (parts.length === 2) {
    const [rowId, slotStr] = parts;
    const slot = slotStr as GridSlot;
    if (slot === "left" || slot === "right" || slot === "full") {
      return { rowId, slot };
    }
  }
  return null;
}

// ─── FormBuilder ──────────────────────────────────────────────────────────────
export default function FormBuilder() {
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [search, setSearch] = useState<string>("");

  const isDraggingFromSidebar = !!activeItem?.fromSidebar;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const selectedField: Field | null =
    rows.flatMap((r) => r.cells.map((c) => c.field)).find((f) => f.id === selectedId) ?? null;

  // ── Drag start ───────────────────────────────────────────────────────────────
  const handleDragStart = (event: {
    active: { id: string | number; data: { current?: Record<string, unknown> } };
  }) => {
    const { active } = event;
    if (active.data.current?.fromSidebar) {
      setActiveItem({
        fromSidebar: true,
        type: active.data.current.type as FieldType,
        label: active.data.current.label as string,
      });
    } else {
      setActiveItem({ id: active.id as string });
    }
  };

  // ── Drag over — cập nhật dropTarget để highlight ─────────────────────────────
  const handleDragOver = (event: DragOverEvent) => {
    const overId = event.over?.id as string | undefined;
    if (!overId) { setDropTarget(null); return; }
    const parsed = parseDropId(overId);
    if (parsed) {
      setDropTarget({ rowId: parsed.rowId, slot: parsed.slot });
    } else {
      setDropTarget(null);
    }
  };

  // ── Drag end ─────────────────────────────────────────────────────────────────
  const handleDragEnd = (event: {
    active: { id: string | number; data: { current?: Record<string, unknown> } };
    over: { id: string | number } | null;
  }) => {
    const { active, over } = event;
    setActiveItem(null);
    setDropTarget(null);

    if (!over) return;

    const overId = over.id as string;
    const parsed = parseDropId(overId);
    if (!parsed) return;

    const { rowId, slot } = parsed;

    // ── Kéo từ sidebar vào canvas ────────────────────────────────────────────
    if (active.data.current?.fromSidebar) {
      const type = active.data.current.type as FieldType;
      const newField: Field = {
        id: newFieldId(),
        type,
        props: { ...defaultProps[type] },
      };

      setRows((prev) => {
        // Thả vào "new" → tạo row mới cuối
        if (rowId === "new") {
          const newRow: Row = {
            id: newRowId(),
            cells: [{ field: newField, slot: "full" }],
          };
          return [...prev, newRow];
        }

        const targetRow = prev.find((r) => r.id === rowId);
        if (!targetRow) return prev;

        const isFull =
          targetRow.cells.length === 1 && targetRow.cells[0].slot === "full";

        // Thả vào nửa (left/right) của row đang full → tách thành 2 cell
        if (isFull && (slot === "left" || slot === "right")) {
          const existingCell = targetRow.cells[0];
          const existingSlot: GridSlot = slot === "left" ? "right" : "left";
          const updatedCells: RowField[] =
            slot === "left"
              ? [
                  { field: newField, slot: "left" },
                  { field: existingCell.field, slot: "right" },
                ]
              : [
                  { field: existingCell.field, slot: "left" },
                  { field: newField, slot: "right" },
                ];
          return prev.map((r) =>
            r.id === rowId ? { ...r, cells: updatedCells } : r
          );
        }

        // Thả vào full của row đang full → tạo row mới cuối
        if (isFull && slot === "full") {
          const newRow: Row = {
            id: newRowId(),
            cells: [{ field: newField, slot: "full" }],
          };
          return [...prev, newRow];
        }

        // Thả vào slot trống của row 2-cell
        if (!isFull) {
          const occupied = targetRow.cells.map((c) => c.slot);
          if (!occupied.includes(slot as "left" | "right")) {
            return prev.map((r) =>
              r.id === rowId
                ? { ...r, cells: [...r.cells, { field: newField, slot: slot as "left" | "right" }] }
                : r
            );
          }
          // Slot đã có → tạo row mới
          const newRow: Row = {
            id: newRowId(),
            cells: [{ field: newField, slot: "full" }],
          };
          return [...prev, newRow];
        }

        return prev;
      });

      setSelectedId(newField.id);
      return;
    }
  };

  // ── Xóa field ────────────────────────────────────────────────────────────────
  const deleteField = useCallback((id: string) => {
    setRows((prev) => removeField(prev, id));
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  // ── Cập nhật props ───────────────────────────────────────────────────────────
  const updateFieldProps = useCallback(
    (props: FieldProps) => {
      setRows((prev) =>
        prev.map((row) => ({
          ...row,
          cells: row.cells.map((cell) =>
            cell.field.id === selectedId
              ? { ...cell, field: { ...cell.field, props } }
              : cell
          ),
        }))
      );
    },
    [selectedId]
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          background: "#0f1320",
          color: "#c9d1e0",
          fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* LEFT */}
          <ComponentSidebar search={search} onSearchChange={setSearch} />

          {/* CENTER */}
          <FormCanvas
            rows={rows}
            selectedId={selectedId}
            dropTarget={dropTarget}
            isDraggingFromSidebar={isDraggingFromSidebar}
            onSelectField={setSelectedId}
            onDeleteField={deleteField}
          />

          {/* RIGHT */}
          <div
            style={{
              width: 240,
              background: "#0e1525",
              borderLeft: "1px solid #1a2235",
              overflowY: "auto",
              flexShrink: 0,
            }}
          >
            <PropertiesPanel field={selectedField} onChange={updateFieldProps} />
          </div>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeItem?.fromSidebar && (
          <div
            style={{
              background: "#1a2e4a",
              border: "1.5px solid #3b9eff",
              borderRadius: 6,
              padding: "7px 12px",
              color: "#3b9eff",
              fontSize: 13,
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              pointerEvents: "none",
            }}
          >
            {activeItem.label}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}