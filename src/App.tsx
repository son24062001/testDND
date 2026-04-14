// ─── App.tsx ──────────────────────────────────────────────────────────────────
import React, { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter,
} from "@dnd-kit/core";
import type { Row, Field, FieldProps } from "./types";
import { Header } from "./components/Header";
import { ComponentSidebar } from "./components/Sidebar";
import { FormCanvas } from "./components/FormCanvas";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { useDragHandlers } from "./useDragHandlers";
import { removeField } from "./utils";

export default function App() {
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const { activeItem, dropTarget, handleDragStart, handleDragOver, handleDragEnd } =
    useDragHandlers(rows, setRows, setSelectedId);

  const isDraggingFromSidebar = activeItem?.kind === "sidebar";

  const selectedField: Field | null =
    rows.flatMap((r) => r.cells.map((c) => c.field)).find((f) => f.id === selectedId) ?? null;

  const deleteField = useCallback((id: string) => {
    setRows((prev) => removeField(prev, id));
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  const updateFieldProps = useCallback((props: FieldProps) => {
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        cells: row.cells.map((cell) =>
          cell.field.id === selectedId ? { ...cell, field: { ...cell.field, props } } : cell
        ),
      }))
    );
  }, [selectedId]);

  const handleResizeRow = useCallback((rowId: string, newWidths: number[]) => {
    setRows((prev) => prev.map((r) => r.id === rowId ? { ...r, colWidths: newWidths } : r));
  }, []);

  // Ghost overlay khi kéo field
  const draggingField = activeItem?.kind === "row"
    ? rows.flatMap((r) => r.cells).find((c) => c.field.id === (activeItem as { kind: "row"; rowId: string }).rowId)?.field
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#f0f2f5", color: "#1e293b", fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif", overflow: "hidden" }}>
        <Header rows={rows} />
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <ComponentSidebar search={search} onSearchChange={setSearch} />
          <FormCanvas
            rows={rows}
            selectedId={selectedId}
            dropTarget={dropTarget}
            isDraggingFromSidebar={isDraggingFromSidebar}
            onSelectField={setSelectedId}
            onDeleteField={deleteField}
            onResizeRow={handleResizeRow}
            onDeselect={() => setSelectedId(null)}
          />
          <div style={{ width: 200, background: "#ffffff", borderLeft: "1px solid #e2e8f0", overflowY: "auto", flexShrink: 0 }}>
            <PropertiesPanel field={selectedField} onChange={updateFieldProps} />
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 160, easing: "ease" }}>
        {/* Overlay khi kéo từ sidebar */}
        {isDraggingFromSidebar && (
          <div style={{ background: "#eff6ff", border: "1.5px solid #3b82f6", borderRadius: 6, padding: "7px 12px", color: "#2563eb", fontSize: 13, boxShadow: "0 8px 24px rgba(0,0,0,0.4)", pointerEvents: "none" }}>
            {(activeItem as { kind: "sidebar"; label: string }).label}
          </div>
        )}
        {/* Overlay khi kéo field */}
        {draggingField && (
          <div style={{ background: "#fafafa", border: "1.5px solid #3b82f6", borderRadius: 6, padding: "10px 14px", boxShadow: "0 12px 32px rgba(0,0,0,0.5)", pointerEvents: "none", opacity: 0.9, minWidth: 180 }}>
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>{draggingField.props.label}</div>
            <div style={{ height: 28, background: "#f5f5f5", borderRadius: 4, border: "1px solid #d1d5db" }} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}