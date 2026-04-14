// ─── hooks/useDragHandlers.ts ─────────────────────────────────────────────────
import { useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragStartEvent, DragOverEvent, DragEndEvent } from "@dnd-kit/core";
import type { Row, Field, FieldType, ActiveItemKind, DropTarget, GridSlot } from "./types";
import { defaultProps } from "./constants";
import { newFieldId, newRowId, parseDropId, findFieldInRows } from "./utils";

export function useDragHandlers(
  rows: Row[],
  setRows: React.Dispatch<React.SetStateAction<Row[]>>,
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>
) {
  const [activeItem, setActiveItem] = useState<ActiveItemKind | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  // ── Drag start ───────────────────────────────────────────────────────────────
  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as Record<string, unknown> | undefined;
    if (!data) return;
    if (data.kind === "sidebar") {
      setActiveItem({ kind: "sidebar", type: data.type as FieldType, label: data.label as string });
    } else if (data.kind === "field") {
      setActiveItem({ kind: "row", rowId: data.fieldId as string });
    }
  };

  // ── Drag over ────────────────────────────────────────────────────────────────
  const handleDragOver = (event: DragOverEvent) => {
    const data = event.active.data.current as Record<string, unknown> | undefined;
    const overId = event.over?.id as string | undefined;

    if (!overId) { setDropTarget(null); return; }

    if (data?.kind === "sidebar") {
      const parsed = parseDropId(overId);
      if (parsed) setDropTarget({ rowId: parsed.rowId, slot: parsed.slot });
      else setDropTarget(null);
      return;
    }

    if (data?.kind === "field") {
      const overFieldId = overId.replace("field:", "");
      const dstInfo = findFieldInRows(rows, overFieldId);
      if (dstInfo) setDropTarget({ rowId: dstInfo.rowId, slot: dstInfo.slot });
      else setDropTarget(null);
    }
  };

  // ── Drag end ─────────────────────────────────────────────────────────────────
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const data = active.data.current as Record<string, unknown> | undefined;

    setActiveItem(null);
    setDropTarget(null);
    if (!over) return;

    // ── Reorder field trong canvas ────────────────────────────────────────────
    if (data?.kind === "field") {
      const activeFieldSortId = active.id as string;
      const overSortId = over.id as string;
      if (activeFieldSortId === overSortId) return;

      const activeFieldId = activeFieldSortId.replace("field:", "");
      const overFieldId = overSortId.replace("field:", "");

      setRows((prev) => {
        const srcInfo = findFieldInRows(prev, activeFieldId);
        const dstInfo = findFieldInRows(prev, overFieldId);
        if (!srcInfo || !dstInfo) return prev;

        // Cùng row → arrayMove
        if (srcInfo.rowId === dstInfo.rowId) {
          return prev.map((row) => {
            if (row.id !== srcInfo.rowId) return row;
            const oldIdx = row.cells.findIndex((c) => c.field.id === activeFieldId);
            const newIdx = row.cells.findIndex((c) => c.field.id === overFieldId);
            if (oldIdx === -1 || newIdx === -1) return row;
            const newCells = arrayMove(row.cells, oldIdx, newIdx);
            const slots: GridSlot[] = ["col0", "col1", "col2"];
            return { ...row, cells: newCells.map((c, i) => ({ ...c, slot: slots[i] })) };
          });
        }

        // Khác row → hoán đổi field
        return prev.map((row) => {
          if (row.id === srcInfo.rowId) {
            return {
              ...row,
              cells: row.cells.map((c) => {
                if (c.field.id === activeFieldId) {
                  const dstRow = prev.find((r) => r.id === dstInfo.rowId);
                  const dstCell = dstRow?.cells.find((dc) => dc.field.id === overFieldId);
                  return dstCell ? { ...c, field: dstCell.field } : c;
                }
                return c;
              }),
            };
          }
          if (row.id === dstInfo.rowId) {
            return {
              ...row,
              cells: row.cells.map((c) => {
                if (c.field.id === overFieldId) {
                  const srcRow = prev.find((r) => r.id === srcInfo.rowId);
                  const srcCell = srcRow?.cells.find((sc) => sc.field.id === activeFieldId);
                  return srcCell ? { ...c, field: srcCell.field } : c;
                }
                return c;
              }),
            };
          }
          return row;
        });
      });
      return;
    }

    // ── Drop từ sidebar vào canvas ────────────────────────────────────────────
    if (data?.kind === "sidebar") {
      const overId = over.id as string;
      const parsed = parseDropId(overId);
      if (!parsed) return;
      const { rowId, slot } = parsed;
      const type = data.type as FieldType;
      const newField: Field = {
        id: newFieldId(),
        type,
        props: { ...defaultProps[type] },
        createdAt: new Date().toISOString(),
      };

      setRows((prev) => {
        if (rowId === "new") {
          return [...prev, { id: newRowId(), cells: [{ field: newField, slot: "full" }], colWidths: [1] }];
        }

        const targetRow = prev.find((r) => r.id === rowId);
        if (!targetRow) return prev;

        const isFull = targetRow.cells.length === 1 && targetRow.cells[0].slot === "full";
        const colCount = targetRow.cells.length;

        if (slot === "full") {
          return [...prev, { id: newRowId(), cells: [{ field: newField, slot: "full" }], colWidths: [1] }];
        }

        if (isFull) {
          const existingCell = targetRow.cells[0];
          if (slot === "col0") {
            return prev.map((r) => r.id === rowId
              ? { ...r, cells: [{ field: newField, slot: "col0" }, { field: existingCell.field, slot: "col1" }], colWidths: [0.5, 0.5] }
              : r);
          } else {
            return prev.map((r) => r.id === rowId
              ? { ...r, cells: [{ field: existingCell.field, slot: "col0" }, { field: newField, slot: "col1" }], colWidths: [0.5, 0.5] }
              : r);
          }
        }

        if (colCount >= 3) {
          return [...prev, { id: newRowId(), cells: [{ field: newField, slot: "full" }], colWidths: [1] }];
        }

        // 2 cột → thêm cột thứ 3 vào vị trí được drop
        const existingCells = [...targetRow.cells];
        const insertIdx = slot === "col0" ? 0 : slot === "col1" ? 1 : 2;
        const newCells: { field: Field; slot: GridSlot }[] = [];
        const allSlots: GridSlot[] = ["col0", "col1", "col2"];
        let srcIdx = 0;
        for (let i = 0; i < 3; i++) {
          if (i === insertIdx) {
            newCells.push({ field: newField, slot: allSlots[i] });
          } else {
            const ec = existingCells[srcIdx++];
            newCells.push({ ...ec, slot: allSlots[i] });
          }
        }
        return prev.map((r) => r.id === rowId ? { ...r, cells: newCells, colWidths: [1 / 3, 1 / 3, 1 / 3] } : r);
      });

      setSelectedId(newField.id);
    }
  };

  return { activeItem, dropTarget, handleDragStart, handleDragOver, handleDragEnd };
}