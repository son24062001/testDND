import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Icon } from "./Icon";
import { renderField } from "./FieldRenderer";
import { icons } from "../constants";
import type { Field } from "../types";

// ─── FormField ────────────────────────────────────────────────────────────────
interface FormFieldProps {
  field: Field;
  isSelected: boolean;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export function FormField({ field, isSelected, onClick, onDelete }: FormFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} onClick={onClick}>
      <div
        style={{
          border: isSelected ? "1.5px solid #3b9eff" : "1.5px solid transparent",
          borderRadius: 6,
          background: isSelected ? "rgba(59,158,255,0.04)" : "transparent",
          padding: "10px 14px",
          position: "relative",
          transition: "all 0.15s",
          marginBottom: 4,
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
          if (!isSelected) e.currentTarget.style.borderColor = "#2a3a55";
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
          if (!isSelected) e.currentTarget.style.borderColor = "transparent";
        }}
      >
        {/* Drag handle */}
        <div
          {...listeners}
          {...attributes}
          style={{
            position: "absolute",
            left: -20,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#4a5568",
            cursor: "grab",
            padding: "4px 2px",
            opacity: isSelected ? 1 : 0,
            transition: "opacity 0.15s",
          }}
        >
          <Icon d={icons.grip} size={13} />
        </div>

        {/* Delete button */}
        <button
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onDelete(field.id);
          }}
          style={{
            position: "absolute",
            right: 8,
            top: 8,
            background: "rgba(239,68,68,0.1)",
            border: "none",
            borderRadius: 4,
            color: "#ef4444",
            cursor: "pointer",
            padding: "3px 5px",
            display: "flex",
            alignItems: "center",
            opacity: isSelected ? 1 : 0,
            transition: "opacity 0.15s",
          }}
        >
          <Icon d={icons.trash} size={12} />
        </button>

        {/* Label */}
        {field.type !== "checkbox" && (
          <div style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#c9d1e0" }}>
              {field.props.label}
            </span>
            {field.props.required && (
              <span style={{ color: "#ef4444", fontSize: 12 }}>*</span>
            )}
          </div>
        )}

        {/* Field input */}
        {renderField(field.type, field.props)}
      </div>
    </div>
  );
}