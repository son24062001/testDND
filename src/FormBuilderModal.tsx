// ─── FormBuilderModal.tsx ─────────────────────────────────────────────────────
import React, { useState, useCallback, useRef, useEffect } from "react";
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
import { useDragHandlers } from "./hooks/useDragHandlers";
import { removeField } from "./utils";

interface FormBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FormBuilderModal({ isOpen, onClose }: FormBuilderModalProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  // const [isMinimized, setIsMinimized] = useState(false);
  const isMinimized = false; // Tạm thời bỏ tính năng minimize để tập trung vào DnD

  // ── Drag-to-move modal ────────────────────────────────────────────────────────
  const [pos, setPos] = useState({ x: 80, y: 60 });
  const draggingModal = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const onHeaderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    draggingModal.current = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingModal.current) return;
      const newX = Math.max(0, Math.min(window.innerWidth - 200, e.clientX - dragOffset.current.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffset.current.y));
      setPos({ x: newX, y: newY });
    };
    const onUp = () => { draggingModal.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // ── DnD kit ──────────────────────────────────────────────────────────────────
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

  const draggingField = activeItem?.kind === "row"
    ? rows.flatMap((r) => r.cells).find(
        (c) => c.field.id === (activeItem as { kind: "row"; rowId: string }).rowId
      )?.field
    : null;

  const fieldCount = rows.flatMap((r) => r.cells).length;

  if (!isOpen) return null;

  return (
    <>
      Backdrop
      {!isMinimized && (
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(15,23,42,0.45)",
            zIndex: 999,
            backdropFilter: "blur(2px)",
            animation: "fbFadeIn 0.18s ease",
          }}
        />
      )}

      {/* Modal window */}
      <div
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          width: "calc(100vw - 160px)",
          maxWidth: 1400,
          height: isMinimized ? 48 : "calc(100vh - 120px)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          borderRadius: isMinimized ? 10 : 12,
          boxShadow: "0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08)",
          overflow: "hidden",
          background: "#f0f2f5",
          fontFamily: "'IBM Plex Sans','Segoe UI',sans-serif",
          color: "#1e293b",
          transition: "height 0.22s cubic-bezier(0.4,0,0.2,1), border-radius 0.22s",
          animation: "fbSlideDown 0.2s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* ── Titlebar ── */}
        <div
          onMouseDown={onHeaderMouseDown}
          style={{
            height: 48,
            background: "#ffffff",
            borderBottom: isMinimized ? "none" : "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px 0 20px",
            flexShrink: 0,
            cursor: "grab",
            userSelect: "none",
          }}
        >
          {/* Trái: traffic lights + title + badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* <div style={{ display: "flex", gap: 6, marginRight: 2 }}>
              <button onClick={onClose} title="Đóng"
                style={{ width: 13, height: 13, borderRadius: "50%", background: "#ff5f57", border: "none", cursor: "pointer", padding: 0 }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              />
              <button onClick={() => setIsMinimized((v) => !v)} title={isMinimized ? "Mở rộng" : "Thu nhỏ"}
                style={{ width: 13, height: 13, borderRadius: "50%", background: "#febc2e", border: "none", cursor: "pointer", padding: 0 }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              />
              <div style={{ width: 13, height: 13, borderRadius: "50%", background: "#28c840" }} />
            </div> */}
            <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", letterSpacing: "0.02em" }}>
              Form Builder
            </span>
            {fieldCount > 0 && (
              <span style={{ fontSize: 11, color: "#64748b", background: "#f1f5f9", padding: "2px 8px", borderRadius: 99, border: "1px solid #e2e8f0" }}>
                {fieldCount} field{fieldCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Phải: export buttons */}
          {!isMinimized && <Header rows={rows} />}
        </div>

        {/* ── Body ── */}
        {!isMinimized && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
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

            <DragOverlay dropAnimation={{ duration: 160, easing: "ease" }}>
              {isDraggingFromSidebar && (
                <div style={{ background: "#eff6ff", border: "1.5px solid #3b82f6", borderRadius: 6, padding: "7px 12px", color: "#2563eb", fontSize: 13, boxShadow: "0 8px 24px rgba(0,0,0,0.4)", pointerEvents: "none" }}>
                  {(activeItem as { kind: "sidebar"; label: string }).label}
                </div>
              )}
              {draggingField && (
                <div style={{ background: "#fafafa", border: "1.5px solid #3b82f6", borderRadius: 6, padding: "10px 14px", boxShadow: "0 12px 32px rgba(0,0,0,0.5)", pointerEvents: "none", opacity: 0.9, minWidth: 180 }}>
                  <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>{draggingField.props.label}</div>
                  <div style={{ height: 28, background: "#f5f5f5", borderRadius: 4, border: "1px solid #d1d5db" }} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <style>{`
        @keyframes fbFadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes fbSlideDown { from { opacity:0; transform:translateY(-10px) scale(0.98) } to { opacity:1; transform:translateY(0) scale(1) } }
      `}</style>
    </>
  );
}