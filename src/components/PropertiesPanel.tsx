// ─── PropertiesPanel.tsx ──────────────────────────────────────────────────────
import React from "react";
import type { Field, FieldProps, FieldType } from "../types";

const propInputStyle: React.CSSProperties = {
  width: "90%",
  background: "#f5f5f5",
  border: "1px solid #d1d5db",
  color: "#1e293b",
  borderRadius: 4,
  padding: "5px 8px",
  fontSize: 12,
  outline: "none",
};

// ── PropRow — layout một dòng label + control ─────────────────────────────────
function PropRow({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4, display: "flex", gap: 4, alignItems: "center" }}>
        {label}
        {required && <span style={{ color: "#ef4444" }}>*</span>}
      </div>
      {children}
    </div>
  );
}

// ── PropertiesPanel — panel phải hiển thị và chỉnh sửa props của field đang chọn
export function PropertiesPanel({ field, onChange }: { field: Field | null; onChange: (props: FieldProps) => void }) {
  if (!field) {
    return (
      <div style={{ padding: "20px 16px", color: "#64748b", fontSize: 13, textAlign: "center" }}>
        <div style={{ marginBottom: 8 }}>Select a field to edit</div>
        <div style={{ fontSize: 11 }}>Properties will appear here</div>
      </div>
    );
  }

  const update = (key: keyof FieldProps, val: FieldProps[keyof FieldProps]) =>
    onChange({ ...field.props, [key]: val });

  const hasPlaceholder = (["text", "number", "decimal", "email", "multiline", "textlist"] as FieldType[]).includes(field.type);
  const hasOptions = (["radio", "checkboxgroup", "select"] as FieldType[]).includes(field.type);

  return (
    <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
        {field.type.charAt(0).toUpperCase() + field.type.slice(1)} — General
      </div>

      <PropRow label="ID">
        <span style={{ color: "#6b7280", fontSize: 12 }}>{field.id}</span>
      </PropRow>

      <PropRow label="Label">
        <input
          value={field.props.label || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("label", e.target.value)}
          style={propInputStyle}
        />
      </PropRow>

      <PropRow label="Required">
        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={!!field.props.required}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("required", e.target.checked)}
            style={{ accentColor: "#3b9eff" }}
          />
          <span style={{ fontSize: 12, color: "#475569" }}>{field.props.required ? "Yes" : "No"}</span>
        </label>
      </PropRow>

      {hasPlaceholder && (
        <PropRow label="Placeholder">
          <input
            value={field.props.placeholder || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("placeholder", e.target.value)}
            style={propInputStyle}
          />
        </PropRow>
      )}

      {hasOptions && (
        <PropRow label="Options">
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {(field.props.options || []).map((opt, i) => (
              <div key={i} style={{ display: "flex", gap: 4 }}>
                <input
                  value={opt}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const opts = [...(field.props.options ?? [])];
                    opts[i] = e.target.value;
                    update("options", opts);
                  }}
                  style={{ flex: 1, ...propInputStyle, width: "auto" }}
                />
                <button
                  onClick={() => update("options", (field.props.options ?? []).filter((_, j) => j !== i))}
                  style={{ background: "transparent", border: "1px solid #d1d5db", color: "#ef4444", borderRadius: 4, cursor: "pointer", padding: "0 6px", fontSize: 12 }}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => update("options", [...(field.props.options || []), `Option ${(field.props.options?.length || 0) + 1}`])}
              style={{ background: "#f0f4f8", border: "1px dashed #93c5fd", color: "#2563eb", borderRadius: 4, cursor: "pointer", padding: "4px", fontSize: 12, marginTop: 2 }}
            >
              + Add option
            </button>
          </div>
        </PropRow>
      )}

      {field.type === "slider" && (
        <>
          <PropRow label="Min">
            <input
              type="number"
              value={field.props.min ?? 0}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("min", +e.target.value)}
              style={propInputStyle}
            />
          </PropRow>
          <PropRow label="Max">
            <input
              type="number"
              value={field.props.max ?? 100}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("max", +e.target.value)}
              style={propInputStyle}
            />
          </PropRow>
        </>
      )}
    </div>
  );
}