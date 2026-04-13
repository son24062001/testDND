import type { JSX } from "react";
import type { FieldType, FieldProps } from "../types";

// ─── Shared input style ───────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "90%",
  background: "#1a1f2e",
  border: "1px solid #2a3040",
  color: "#c9d1e0",
  borderRadius: 4,
  padding: "6px 10px",
  fontSize: 13,
  outline: "none",
};

// ─── FieldRenderer ────────────────────────────────────────────────────────────
export function renderField(type: FieldType, props: FieldProps): JSX.Element {
  switch (type) {
    case "text":
    case "email":
    case "password":
    case "number":
    case "decimal":
      return (
        <input
          type={type === "decimal" ? "number" : type}
          placeholder={props.placeholder}
          style={inputStyle}
        />
      );

    case "date":
      return <input type="date" style={inputStyle} />;

    case "multiline":
      return (
        <textarea
          rows={props.rows || 3}
          placeholder={props.placeholder}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      );

    case "richtext":
      return (
        <div
          style={{
            ...inputStyle,
            minHeight: 80,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        />
      );

    case "radio":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(props.options || []).map((o, i) => (
            <label
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#c9d1e0",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name={`radio_${Math.random()}`}
                style={{ accentColor: "#3b9eff" }}
              />{" "}
              {o}
            </label>
          ))}
        </div>
      );

    case "switch":
      return (
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div
            style={{
              width: 36,
              height: 20,
              background: "#3b9eff",
              borderRadius: 10,
              position: "relative",
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                background: "#fff",
                borderRadius: "50%",
                position: "absolute",
                top: 2,
                left: 18,
                transition: "left 0.2s",
              }}
            />
          </div>
          <span style={{ color: "#c9d1e0", fontSize: 13 }}>Enabled</span>
        </label>
      );

    case "slider":
      return (
        <input
          type="range"
          min={props.min ?? 0}
          max={props.max ?? 100}
          style={{ width: "100%", accentColor: "#3b9eff" }}
        />
      );

    case "checkbox":
      return (
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            style={{ accentColor: "#3b9eff", width: 15, height: 15 }}
          />
          <span style={{ color: "#c9d1e0", fontSize: 13 }}>{props.label}</span>
        </label>
      );

    case "checkboxgroup":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(props.options || []).map((o, i) => (
            <label
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#c9d1e0",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              <input type="checkbox" style={{ accentColor: "#3b9eff" }} /> {o}
            </label>
          ))}
        </div>
      );

    case "select":
      return (
        <select style={inputStyle}>
          {(props.options || []).map((o, i) => (
            <option key={i}>{o}</option>
          ))}
        </select>
      );

    case "attachment":
      return (
        <div
          style={{
            ...inputStyle,
            border: "1px dashed #2a3040",
            color: "#6b7a99",
            padding: "12px 10px",
            textAlign: "center",
          }}
        >
          📎 Click or drag to attach files
        </div>
      );

    case "textlist":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <input placeholder="Add item..." style={inputStyle} />
        </div>
      );

    default:
      return <input style={{ ...inputStyle, width: "100%" }} />;
  }
}