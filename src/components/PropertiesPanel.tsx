import type { Field, FieldProps, FieldType } from "../types";

// ─── PropRow ──────────────────────────────────────────────────────────────────
interface PropRowProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

export function PropRow({ label, required, children }: PropRowProps) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          color: "#6b7a99",
          marginBottom: 4,
          display: "flex",
          gap: 4,
          alignItems: "center",
        }}
      >
        {label}
        {required && <span style={{ color: "#ef4444" }}>*</span>}
      </div>
      {children}
    </div>
  );
}

// ─── Shared prop input style ──────────────────────────────────────────────────
const propInputStyle: React.CSSProperties = {
  width: "90%",
  background: "#1a1f2e",
  border: "1px solid #2a3040",
  color: "#c9d1e0",
  borderRadius: 4,
  padding: "5px 8px",
  fontSize: 12,
  outline: "none",
};

// ─── PropertiesPanel ──────────────────────────────────────────────────────────
interface PropertiesPanelProps {
  field: Field | null;
  onChange: (props: FieldProps) => void;
}

export function PropertiesPanel({ field, onChange }: PropertiesPanelProps) {
  if (!field) {
    return (
      <div
        style={{
          padding: "20px 16px",
          color: "#4a5568",
          fontSize: 13,
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: 8 }}>Select a field to edit</div>
        <div style={{ fontSize: 11 }}>Properties will appear here</div>
      </div>
    );
  }

  const update = (key: keyof FieldProps, val: FieldProps[keyof FieldProps]) =>
    onChange({ ...field.props, [key]: val });

  const hasPlaceholder = (
    ["text", "number", "decimal", "email", "multiline", "textlist"] as FieldType[]
  ).includes(field.type);

  const hasOptions = (["radio", "checkboxgroup", "select"] as FieldType[]).includes(field.type);

  return (
    <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Header */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#3b9eff",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 4,
        }}
      >
        {field.type.charAt(0).toUpperCase() + field.type.slice(1)} — General
      </div>

      {/* ID (read-only) */}
      <PropRow label="ID" required>
        <span style={{ color: "#6b7a99", fontSize: 12 }}>{field.id}</span>
      </PropRow>

      {/* Label */}
      <PropRow label="Label">
        <input
          value={field.props.label || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            update("label", e.target.value)
          }
          style={propInputStyle}
        />
      </PropRow>

      {/* Required */}
      <PropRow label="Required">
        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={!!field.props.required}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              update("required", e.target.checked)
            }
            style={{ accentColor: "#3b9eff" }}
          />
          <span style={{ fontSize: 12, color: "#9ba8bf" }}>
            {field.props.required ? "Yes" : "No"}
          </span>
        </label>
      </PropRow>

      {/* Placeholder */}
      {hasPlaceholder && (
        <PropRow label="Placeholder">
          <input
            value={field.props.placeholder || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              update("placeholder", e.target.value)
            }
            style={propInputStyle}
          />
        </PropRow>
      )}

      {/* Options (radio, checkboxgroup, select) */}
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
                  onClick={() =>
                    update(
                      "options",
                      (field.props.options ?? []).filter((_, j) => j !== i)
                    )
                  }
                  style={{
                    background: "transparent",
                    border: "1px solid #2a3040",
                    color: "#ef4444",
                    borderRadius: 4,
                    cursor: "pointer",
                    padding: "0 6px",
                    fontSize: 12,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                update("options", [
                  ...(field.props.options || []),
                  `Option ${(field.props.options?.length || 0) + 1}`,
                ])
              }
              style={{
                background: "#1a2233",
                border: "1px dashed #2a3a50",
                color: "#3b9eff",
                borderRadius: 4,
                cursor: "pointer",
                padding: "4px",
                fontSize: 12,
                marginTop: 2,
              }}
            >
              + Add option
            </button>
          </div>
        </PropRow>
      )}

      {/* Slider min / max */}
      {field.type === "slider" && (
        <>
          <PropRow label="Min">
            <input
              type="number"
              value={field.props.min ?? 0}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                update("min", +e.target.value)
              }
              style={propInputStyle}
            />
          </PropRow>
          <PropRow label="Max">
            <input
              type="number"
              value={field.props.max ?? 100}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                update("max", +e.target.value)
              }
              style={propInputStyle}
            />
          </PropRow>
        </>
      )}
    </div>
  );
}