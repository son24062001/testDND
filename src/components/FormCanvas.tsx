// ─── FormCanvas.tsx ───────────────────────────────────────────────────────────
import React from "react";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import type { Row, DropTarget } from "../types";
import { GridRow, BottomDropZone } from "./GridRow";

export function FormCanvas({ rows, selectedId, dropTarget, isDraggingFromSidebar, onSelectField, onDeleteField, onResizeRow, onDeselect }: {
  rows: Row[];
  selectedId: string | null;
  dropTarget: DropTarget | null;
  isDraggingFromSidebar: boolean;
  onSelectField: (id: string) => void;
  onDeleteField: (id: string) => void;
  onResizeRow: (rowId: string, newWidths: number[]) => void;
  onDeselect: () => void;
}) {
  const allFieldSortableIds = rows.flatMap((row) => row.cells.map((c) => `field:${c.field.id}`));

  return (
    <div
      style={{ flex: 1, overflowY: "auto", background: "#f0f2f5", padding: "15px" }}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onDeselect();
      }}
    >
      <div style={{ margin: "0 auto" }}>
        <div
          style={{ background: "#fafafa", borderRadius: 10, border: "1px solid #e2e8f0", padding: "15px", minHeight: 500 }}
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget) onDeselect();
          }}
        >
          <SortableContext items={allFieldSortableIds} strategy={rectSortingStrategy}>
            {rows.map((row) => (
              <GridRow
                key={row.id}
                row={row}
                selectedId={selectedId}
                dropTarget={dropTarget}
                isDraggingFromSidebar={isDraggingFromSidebar}
                onSelectField={onSelectField}
                onDeleteField={onDeleteField}
                onResizeRow={onResizeRow}
              />
            ))}
          </SortableContext>
          <BottomDropZone isEmpty={rows.length === 0} isDraggingFromSidebar={isDraggingFromSidebar} />
        </div>
      </div>
    </div>
  );
}