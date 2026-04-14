// ─── primitives.tsx ───────────────────────────────────────────────────────────
import React from "react";
import type { JSX } from "react";
import type { FieldType, FieldProps } from "../types";

// ── Icon ──────────────────────────────────────────────────────────────────────
export function Icon({ d, size = 14 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

// ── GripDots — icon 6 chấm 2×3 dùng cho drag handle ─────────────────────────
export function GripDots({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  const r = size * 0.115;
  const x1 = size * 0.32, x2 = size * 0.68;
  const y1 = size * 0.18, y2 = size * 0.5, y3 = size * 0.82;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill={color}>
      <circle cx={x1} cy={y1} r={r} /><circle cx={x2} cy={y1} r={r} />
      <circle cx={x1} cy={y2} r={r} /><circle cx={x2} cy={y2} r={r} />
      <circle cx={x1} cy={y3} r={r} /><circle cx={x2} cy={y3} r={r} />
    </svg>
  );
}

// ── FieldRenderer — render input tương ứng với từng FieldType ─────────────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#f5f5f5",
  border: "1px solid #d1d5db",
  color: "#1e293b",
  borderRadius: 4,
  padding: "6px 10px",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};

// eslint-disable-next-line react-refresh/only-export-components
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
      return <div style={{ ...inputStyle, minHeight: 80 }} />;
    case "radio":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(props.options || []).map((o, i) => (
            <label
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 8, color: "#1e293b", fontSize: 13, cursor: "pointer" }}
            >
              <input type="radio" name={`radio_${Math.random()}`} style={{ accentColor: "#3b9eff" }} /> {o}
            </label>
          ))}
        </div>
      );
    case "switch":
      return (
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div style={{ width: 36, height: 20, background: "#3b9eff", borderRadius: 10, position: "relative" }}>
            <div style={{ width: 16, height: 16, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, left: 18 }} />
          </div>
          <span style={{ color: "#1e293b", fontSize: 13 }}>Enabled</span>
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
          <input type="checkbox" style={{ accentColor: "#3b9eff", width: 15, height: 15 }} />
          <span style={{ color: "#1e293b", fontSize: 13 }}>{props.label}</span>
        </label>
      );
    case "checkboxgroup":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(props.options || []).map((o, i) => (
            <label
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 8, color: "#1e293b", fontSize: 13, cursor: "pointer" }}
            >
              <input type="checkbox" style={{ accentColor: "#3b9eff" }} /> {o}
            </label>
          ))}
        </div>
      );
    case "select":
      return (
        <select style={inputStyle}>
          {(props.options || []).map((o, i) => <option key={i}>{o}</option>)}
        </select>
      );
    case "attachment":
      return (
        <div style={{ ...inputStyle, border: "1px dashed #d1d5db", color: "#6b7280", padding: "12px 10px", textAlign: "center" }}>
          📎 Click or drag to attach files
        </div>
      );
    case "textlist":
      return <input placeholder="Add item..." style={inputStyle} />;
    default:
      return <input style={inputStyle} />;
  }
}