// ─── FormField.tsx ────────────────────────────────────────────────────────────
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Field } from "../types";
import { icons } from "../constants";
import { Icon, GripDots, renderField } from "./primitives";

interface FormFieldProps {
  field: Field;
  isSelected: boolean;
  isDraggingFromSidebar: boolean;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export function FormField({ field, isSelected, isDraggingFromSidebar, onClick, onDelete }: FormFieldProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `field:${field.id}`,
    data: { kind: "field", fieldId: field.id },
    disabled: isDraggingFromSidebar,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
    opacity: isDragging ? 0.3 : 1,
    position: "relative",
  };

  return (
    <div ref={setNodeRef} style={style} onClick={onClick}>
      <div
        style={{
          border: isSelected ? "1.5px solid #3b9eff" : "1.5px solid transparent",
          borderRadius: 6,
          background: isSelected ? "rgba(59,130,246,0.04)" : "transparent",
          padding: "10px 36px 10px 30px",
          position: "relative",
          transition: "border-color 0.15s, background 0.15s",
          marginBottom: 2,
          cursor: "default",
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
          if (!isSelected) e.currentTarget.style.borderColor = "#93afc7";
          const grip = e.currentTarget.querySelector<HTMLElement>(".field-grip");
          const trash = e.currentTarget.querySelector<HTMLElement>(".field-trash");
          if (grip) grip.style.opacity = "1";
          if (trash) trash.style.opacity = "1";
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
          if (!isSelected) e.currentTarget.style.borderColor = "transparent";
          if (!isSelected) {
            const grip = e.currentTarget.querySelector<HTMLElement>(".field-grip");
            const trash = e.currentTarget.querySelector<HTMLElement>(".field-trash");
            if (grip) grip.style.opacity = "0";
            if (trash) trash.style.opacity = "0";
          }
        }}
      >
        {/* ── Grip handle bên trái ── */}
        {!isDraggingFromSidebar && (
          <div
            className="field-grip"
            {...listeners}
            {...attributes}
            title="Kéo để di chuyển"
            style={{
              position: "absolute",
              left: 6,
              top: "50%",
              transform: "translateY(-50%)",
              width: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isDragging ? "#3b9eff" : "#94a3b8",
              cursor: isDragging ? "grabbing" : "grab",
              opacity: isSelected ? 1 : 0,
              transition: "opacity 0.15s, color 0.15s",
              zIndex: 2,
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.color = "#3b9eff"; }}
            onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { if (!isDragging) e.currentTarget.style.color = "#94a3b8"; }}
            onClick={(e) => e.stopPropagation()}
          >
            <GripDots size={14} color="currentColor" />
          </div>
        )}

        {/* ── Trash button bên phải ── */}
        <button
          className="field-trash"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); onDelete(field.id); }}
          style={{ position: "absolute", right: 8, top: 8, background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 4, color: "#ef4444", cursor: "pointer", padding: "3px 5px", display: "flex", alignItems: "center", opacity: isSelected ? 1 : 0, transition: "opacity 0.15s" }}
        >
          <Icon d={icons.trash} size={12} />
        </button>

        {/* ── Label ── */}
        {field.type !== "checkbox" && (
          <div style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#1e293b" }}>{field.props.label}</span>
            {field.props.required && <span style={{ color: "#ef4444", fontSize: 12 }}>*</span>}
          </div>
        )}

        {/* ── Field input preview ── */}
        {renderField(field.type, field.props)}
      </div>
    </div>
  );
}