import { useState, useCallback } from "react";
import type { JSX } from "react";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import type { DragOverEvent } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

// ─── Types ────────────────────────────────────────────────────────────────────
type FieldType =
  | "text" | "number" | "decimal" | "date" | "multiline" | "richtext"
  | "password" | "attachment" | "textlist" | "email" | "radio" | "switch"
  | "slider" | "checkbox" | "checkboxgroup" | "select";

interface FieldProps {
  label: string;
  placeholder?: string;
  required: boolean;
  rows?: number;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

interface Field {
  id: string;
  type: FieldType;
  props: FieldProps;
}

interface SidebarItemData {
  type: FieldType;
  label: string;
  icon: IconName;
}

interface SidebarGroup {
  label: string;
  items: SidebarItemData[];
}

interface ActiveItem {
  fromSidebar?: boolean;
  type?: FieldType;
  label?: string;
  id?: string;
}

type GridSlot = "full" | "left" | "right";

interface RowField {
  field: Field;
  slot: GridSlot;
}

interface Row {
  id: string;
  cells: RowField[];
}

interface DropTarget {
  rowId: string | "new";
  slot: GridSlot;
}

type IconName =
  | "text" | "number" | "decimal" | "date" | "multiline" | "richtext"
  | "password" | "attachment" | "textlist" | "email" | "radio" | "switch"
  | "slider" | "checkbox" | "checkboxgroup" | "select"
  | "grip" | "trash" | "eye" | "settings" | "plus" | "search" | "edit" | "chevronDown";

// ─── Constants ────────────────────────────────────────────────────────────────
const icons: Record<IconName, string> = {
  text: "M4 7V4h16v3M9 20h6M12 4v16",
  number: "M4 9h16M4 15h16M10 3L8 21M16 3l-2 18",
  decimal: "M12 2v20M2 12h20",
  date: "M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm-3-2v4M8 2v4M3 10h18",
  multiline: "M4 6h16M4 10h16M4 14h10M4 18h14",
  richtext: "M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z",
  password: "M12 2a5 5 0 0 0-5 5v3H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-2V7a5 5 0 0 0-5-5z",
  attachment: "M6 7.91V16a6 6 0 006 6 6 6 0 006-6V6a4 4 0 00-4-4 4 4 0 00-4 4v9.18a2 2 0 002 2 2 2 0 002-2V8",
  textlist: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  email: "M3 8l9 6 9-6v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm0-2a2 2 0 012-2h14a2 2 0 012 2L12 12 3 6z",
  radio: "M12 21a9 9 0 100-18 9 9 0 000 18zm0-5a4 4 0 110-8 4 4 0 010 8z",
  switch: "M5 15a3 3 0 110-6h14a3 3 0 110 6H5zm14-3a1 1 0 100-2 1 1 0 000 2z",
  slider: "M4 12h16M9 12a3 3 0 116 0 3 3 0 01-6 0z",
  checkbox: "M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
  checkboxgroup: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 3h6v4H9z",
  select: "M19 9l-7 7-7-7",
  grip: "M9 5h2M9 12h2M9 19h2M13 5h2M13 12h2M13 19h2",
  trash: "M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  plus: "M12 5v14M5 12h14",
  search: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  chevronDown: "M6 9l6 6 6-6",
};

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    label: "Data entry",
    items: [
      { type: "text", label: "Text", icon: "text" },
      { type: "number", label: "Number", icon: "number" },
      { type: "decimal", label: "Decimal", icon: "decimal" },
      { type: "date", label: "Date", icon: "date" },
      { type: "multiline", label: "Multiline Text", icon: "multiline" },
      { type: "richtext", label: "Rich Text", icon: "richtext" },
      { type: "password", label: "Password", icon: "password" },
      { type: "attachment", label: "Attachment", icon: "attachment" },
      { type: "textlist", label: "Text List", icon: "textlist" },
      { type: "email", label: "Email", icon: "email" },
    ],
  },
  {
    label: "Selection",
    items: [
      { type: "radio", label: "Radio Buttons", icon: "radio" },
      { type: "switch", label: "Switch", icon: "switch" },
      { type: "slider", label: "Slider", icon: "slider" },
      { type: "checkbox", label: "Checkbox", icon: "checkbox" },
      { type: "checkboxgroup", label: "Checkbox Group", icon: "checkboxgroup" },
      { type: "select", label: "Select (Single)", icon: "select" },
    ],
  },
];

const defaultProps: Record<FieldType, FieldProps> = {
  text: { label: "Text Field", placeholder: "Enter text...", required: false },
  number: { label: "Number Field", placeholder: "0", required: false },
  decimal: { label: "Decimal Field", placeholder: "0.00", required: false },
  date: { label: "Date Field", required: false },
  multiline: { label: "Multiline Text", placeholder: "Enter text...", required: false, rows: 3 },
  richtext: { label: "Rich Text", required: false },
  password: { label: "Password", required: false },
  attachment: { label: "Attachment", required: false },
  textlist: { label: "Text List", required: false },
  email: { label: "Email", placeholder: "email@example.com", required: false },
  radio: { label: "Radio Buttons", options: ["Option 1", "Option 2", "Option 3"], required: false },
  switch: { label: "Switch", required: false },
  slider: { label: "Slider", min: 0, max: 100, step: 1, required: false },
  checkbox: { label: "Checkbox", required: false },
  checkboxgroup: { label: "Checkbox Group", options: ["Option 1", "Option 2"], required: false },
  select: { label: "Select", options: ["Option 1", "Option 2", "Option 3"], required: false },
};

// ─── Icon ─────────────────────────────────────────────────────────────────────
function Icon({ d, size = 14 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

// ─── FieldRenderer ────────────────────────────────────────────────────────────
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

function renderField(type: FieldType, props: FieldProps): JSX.Element {
  switch (type) {
    case "text":
    case "email":
    case "password":
    case "number":
    case "decimal":
      return <input type={type === "decimal" ? "number" : type} placeholder={props.placeholder} style={inputStyle} />;

    case "date":
      return <input type="date" style={inputStyle} />;

    case "multiline":
      return <textarea rows={props.rows || 3} placeholder={props.placeholder} style={{ ...inputStyle, resize: "vertical" }} />;

    case "richtext":
      return <div style={{ ...inputStyle, minHeight: 80, display: "flex", alignItems: "center", gap: 8 }} />;

    case "radio":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(props.options || []).map((o, i) => (
            <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, color: "#c9d1e0", fontSize: 13, cursor: "pointer" }}>
              <input type="radio" name={`radio_${Math.random()}`} style={{ accentColor: "#3b9eff" }} /> {o}
            </label>
          ))}
        </div>
      );

    case "switch":
      return (
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div style={{ width: 36, height: 20, background: "#3b9eff", borderRadius: 10, position: "relative" }}>
            <div style={{ width: 16, height: 16, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, left: 18, transition: "left 0.2s" }} />
          </div>
          <span style={{ color: "#c9d1e0", fontSize: 13 }}>Enabled</span>
        </label>
      );

    case "slider":
      return <input type="range" min={props.min ?? 0} max={props.max ?? 100} style={{ width: "100%", accentColor: "#3b9eff" }} />;

    case "checkbox":
      return (
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input type="checkbox" style={{ accentColor: "#3b9eff", width: 15, height: 15 }} />
          <span style={{ color: "#c9d1e0", fontSize: 13 }}>{props.label}</span>
        </label>
      );

    case "checkboxgroup":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(props.options || []).map((o, i) => (
            <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, color: "#c9d1e0", fontSize: 13, cursor: "pointer" }}>
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
        <div style={{ ...inputStyle, border: "1px dashed #2a3040", color: "#6b7a99", padding: "12px 10px", textAlign: "center" }}>
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

// ─── SidebarItem ──────────────────────────────────────────────────────────────
function SidebarItem({ item }: { item: SidebarItemData }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${item.type}`,
    data: { fromSidebar: true, type: item.type, label: item.label },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        display: "flex", alignItems: "center", gap: 8, padding: "7px 10px",
        borderRadius: 5, cursor: "grab",
        color: isDragging ? "#3b9eff" : "#9ba8bf",
        background: isDragging ? "#1e2535" : "transparent",
        fontSize: 13, userSelect: "none", transition: "all 0.15s",
        opacity: isDragging ? 0.5 : 1,
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.background = "#1a2233";
        e.currentTarget.style.color = "#c9d1e0";
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.background = isDragging ? "#1e2535" : "transparent";
        e.currentTarget.style.color = isDragging ? "#3b9eff" : "#9ba8bf";
      }}
    >
      <Icon d={icons[item.icon]} size={14} />
      {item.label}
    </div>
  );
}

// ─── ComponentSidebar ─────────────────────────────────────────────────────────
function ComponentSidebar({ search, onSearchChange }: { search: string; onSearchChange: (v: string) => void }) {
  const filteredGroups: SidebarGroup[] = SIDEBAR_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => i.label.toLowerCase().includes(search.toLowerCase())),
  })).filter((g) => g.items.length > 0);

  return (
    <div style={{ width: 200, background: "#0e1525", borderRight: "1px solid #1a2235", display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto" }}>
      <div style={{ padding: "10px 10px 6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#1a2235", border: "1px solid #1e2d42", borderRadius: 6, padding: "6px 10px" }}>
          <Icon d={icons.search} size={13} />
          <input
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            placeholder="Search"
            style={{ background: "transparent", border: "none", color: "#c9d1e0", fontSize: 13, outline: "none", width: "100%" }}
          />
        </div>
      </div>
      {filteredGroups.map((group) => (
        <div key={group.label}>
          <div style={{ padding: "10px 10px 4px", fontSize: 11, color: "#4a5568", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            {group.label}
          </div>
          {group.items.map((item) => <SidebarItem key={item.type} item={item} />)}
        </div>
      ))}
    </div>
  );
}

// ─── FormField ────────────────────────────────────────────────────────────────
function FormField({ field, isSelected, onClick, onDelete }: {
  field: Field; isSelected: boolean; onClick: () => void; onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });

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
          padding: "10px 14px", position: "relative", transition: "all 0.15s", marginBottom: 4,
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { if (!isSelected) e.currentTarget.style.borderColor = "#2a3a55"; }}
        onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { if (!isSelected) e.currentTarget.style.borderColor = "transparent"; }}
      >
        <div {...listeners} {...attributes} style={{ position: "absolute", left: -20, top: "50%", transform: "translateY(-50%)", color: "#4a5568", cursor: "grab", padding: "4px 2px", opacity: isSelected ? 1 : 0, transition: "opacity 0.15s" }}>
          <Icon d={icons.grip} size={13} />
        </div>
        <button
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); onDelete(field.id); }}
          style={{ position: "absolute", right: 8, top: 8, background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 4, color: "#ef4444", cursor: "pointer", padding: "3px 5px", display: "flex", alignItems: "center", opacity: isSelected ? 1 : 0, transition: "opacity 0.15s" }}
        >
          <Icon d={icons.trash} size={12} />
        </button>
        {field.type !== "checkbox" && (
          <div style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#c9d1e0" }}>{field.props.label}</span>
            {field.props.required && <span style={{ color: "#ef4444", fontSize: 12 }}>*</span>}
          </div>
        )}
        {renderField(field.type, field.props)}
      </div>
    </div>
  );
}

// ─── PropertiesPanel ──────────────────────────────────────────────────────────
const propInputStyle: React.CSSProperties = {
  width: "90%", background: "#1a1f2e", border: "1px solid #2a3040",
  color: "#c9d1e0", borderRadius: 4, padding: "5px 8px", fontSize: 12, outline: "none",
};

function PropRow({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "#6b7a99", marginBottom: 4, display: "flex", gap: 4, alignItems: "center" }}>
        {label}{required && <span style={{ color: "#ef4444" }}>*</span>}
      </div>
      {children}
    </div>
  );
}

function PropertiesPanel({ field, onChange }: { field: Field | null; onChange: (props: FieldProps) => void }) {
  if (!field) {
    return (
      <div style={{ padding: "20px 16px", color: "#4a5568", fontSize: 13, textAlign: "center" }}>
        <div style={{ marginBottom: 8 }}>Select a field to edit</div>
        <div style={{ fontSize: 11 }}>Properties will appear here</div>
      </div>
    );
  }

  const update = (key: keyof FieldProps, val: FieldProps[keyof FieldProps]) => onChange({ ...field.props, [key]: val });
  const hasPlaceholder = (["text", "number", "decimal", "email", "multiline", "textlist"] as FieldType[]).includes(field.type);
  const hasOptions = (["radio", "checkboxgroup", "select"] as FieldType[]).includes(field.type);

  return (
    <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#3b9eff", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
        {field.type.charAt(0).toUpperCase() + field.type.slice(1)} — General
      </div>
      <PropRow label="ID" required><span style={{ color: "#6b7a99", fontSize: 12 }}>{field.id}</span></PropRow>
      <PropRow label="Label">
        <input value={field.props.label || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("label", e.target.value)} style={propInputStyle} />
      </PropRow>
      <PropRow label="Required">
        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <input type="checkbox" checked={!!field.props.required} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("required", e.target.checked)} style={{ accentColor: "#3b9eff" }} />
          <span style={{ fontSize: 12, color: "#9ba8bf" }}>{field.props.required ? "Yes" : "No"}</span>
        </label>
      </PropRow>
      {hasPlaceholder && (
        <PropRow label="Placeholder">
          <input value={field.props.placeholder || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("placeholder", e.target.value)} style={propInputStyle} />
        </PropRow>
      )}
      {hasOptions && (
        <PropRow label="Options">
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {(field.props.options || []).map((opt, i) => (
              <div key={i} style={{ display: "flex", gap: 4 }}>
                <input value={opt} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const opts = [...(field.props.options ?? [])]; opts[i] = e.target.value; update("options", opts); }} style={{ flex: 1, ...propInputStyle, width: "auto" }} />
                <button onClick={() => update("options", (field.props.options ?? []).filter((_, j) => j !== i))} style={{ background: "transparent", border: "1px solid #2a3040", color: "#ef4444", borderRadius: 4, cursor: "pointer", padding: "0 6px", fontSize: 12 }}>×</button>
              </div>
            ))}
            <button onClick={() => update("options", [...(field.props.options || []), `Option ${(field.props.options?.length || 0) + 1}`])} style={{ background: "#1a2233", border: "1px dashed #2a3a50", color: "#3b9eff", borderRadius: 4, cursor: "pointer", padding: "4px", fontSize: 12, marginTop: 2 }}>+ Add option</button>
          </div>
        </PropRow>
      )}
      {field.type === "slider" && (
        <>
          <PropRow label="Min">
            <input type="number" value={field.props.min ?? 0} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("min", +e.target.value)} style={propInputStyle} />
          </PropRow>
          <PropRow label="Max">
            <input type="number" value={field.props.max ?? 100} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("max", +e.target.value)} style={propInputStyle} />
          </PropRow>
        </>
      )}
    </div>
  );
}

// ─── DroppableCell ────────────────────────────────────────────────────────────
function DroppableCell({ droppableId, isHighlighted, isEmpty, children, width }: {
  droppableId: string; isHighlighted: boolean; isEmpty: boolean; children?: React.ReactNode; width: "full" | "half";
}) {
  const { isOver, setNodeRef } = useDroppable({ id: droppableId });
  const active = isOver || isHighlighted;

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: width === "full" ? "1 1 100%" : "1 1 50%",
        minHeight: isEmpty ? 72 : undefined,
        borderRadius: 6,
        border: active ? "2px dashed #3b9eff" : isEmpty ? "2px dashed #1e2d42" : "2px solid transparent",
        background: active ? "rgba(59,158,255,0.07)" : "transparent",
        transition: "all 0.15s", display: "flex", alignItems: "stretch",
        position: "relative", overflow: "hidden",
      }}
    >
      {isEmpty && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: active ? "#3b9eff" : "#2a3a50", fontSize: 11, pointerEvents: "none", transition: "color 0.15s" }}>
          {active ? "Thả vào đây" : width === "half" ? "½ dòng trống" : ""}
        </div>
      )}
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

// ─── GridRow ──────────────────────────────────────────────────────────────────
function GridRow({ row, selectedId, dropTarget, isDraggingFromSidebar, onSelectField, onDeleteField }: {
  row: Row; selectedId: string | null; dropTarget: DropTarget | null;
  isDraggingFromSidebar: boolean; onSelectField: (id: string) => void; onDeleteField: (id: string) => void;
}) {
  const isFull = row.cells.length === 1 && row.cells[0].slot === "full";
  const leftCell = row.cells.find((c) => c.slot === "left" || c.slot === "full");
  const rightCell = row.cells.find((c) => c.slot === "right");

  const leftDropId = `${row.id}:left`;
  const rightDropId = `${row.id}:right`;
  const fullDropId = `${row.id}:full`;

  const isTargetLeft = dropTarget?.rowId === row.id && dropTarget?.slot === "left";
  const isTargetRight = dropTarget?.rowId === row.id && dropTarget?.slot === "right";
  const isTargetFull = dropTarget?.rowId === row.id && dropTarget?.slot === "full";

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "stretch" }}>
      {isFull ? (
        <>
          {isDraggingFromSidebar && (
            <DroppableCell droppableId={leftDropId} isHighlighted={isTargetLeft} isEmpty width="half" />
          )}
          <DroppableCell droppableId={fullDropId} isHighlighted={isTargetFull} isEmpty={false} width={isDraggingFromSidebar ? "half" : "full"}>
            {leftCell && (
              <FormField field={leftCell.field} isSelected={selectedId === leftCell.field.id} onClick={() => onSelectField(leftCell.field.id)} onDelete={onDeleteField} />
            )}
          </DroppableCell>
          {isDraggingFromSidebar && (
            <DroppableCell droppableId={rightDropId} isHighlighted={isTargetRight} isEmpty width="half" />
          )}
        </>
      ) : (
        <>
          <DroppableCell droppableId={leftDropId} isHighlighted={isTargetLeft} isEmpty={!leftCell} width="half">
            {leftCell && <FormField field={leftCell.field} isSelected={selectedId === leftCell.field.id} onClick={() => onSelectField(leftCell.field.id)} onDelete={onDeleteField} />}
          </DroppableCell>
          <DroppableCell droppableId={rightDropId} isHighlighted={isTargetRight} isEmpty={!rightCell} width="half">
            {rightCell && <FormField field={rightCell.field} isSelected={selectedId === rightCell.field.id} onClick={() => onSelectField(rightCell.field.id)} onDelete={onDeleteField} />}
          </DroppableCell>
        </>
      )}
    </div>
  );
}

// ─── FormCanvas ───────────────────────────────────────────────────────────────
function BottomDropZone({ isEmpty, isDraggingFromSidebar }: { isEmpty: boolean; isDraggingFromSidebar: boolean }) {
  const { isOver, setNodeRef } = useDroppable({ id: "canvas:new:full" });
  if (!isDraggingFromSidebar && !isEmpty) return null;

  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: isEmpty ? 280 : 56, display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 10, border: `2px dashed ${isOver ? "#3b9eff" : "#1e2d42"}`,
        background: isOver ? "rgba(59,158,255,0.05)" : "transparent", transition: "all 0.2s", marginTop: isEmpty ? 0 : 4,
      }}
    >
      {isEmpty ? (
        <div style={{ textAlign: "center", color: isOver ? "#3b9eff" : "#3a4a5e", transition: "color 0.2s" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Thả component vào đây</div>
          <div style={{ fontSize: 12, color: "#4a5568" }}>Thả vào giữa → cả dòng · Thả vào ô bên cạnh field → nửa dòng</div>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: isOver ? "#3b9eff" : "#2a3a50", transition: "color 0.2s" }}>
          {isOver ? "Thêm dòng mới" : "+ Thả để thêm dòng mới"}
        </div>
      )}
    </div>
  );
}

function FormCanvas({ rows, selectedId, dropTarget, isDraggingFromSidebar, onSelectField, onDeleteField }: {
  rows: Row[]; selectedId: string | null; dropTarget: DropTarget | null;
  isDraggingFromSidebar: boolean; onSelectField: (id: string) => void; onDeleteField: (id: string) => void;
}) {
  return (
    <div style={{ flex: 1, overflowY: "auto", background: "#0f1320", padding: "24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ background: "#111827", borderRadius: 10, border: "1px solid #1a2235", padding: "24px 28px", minHeight: 500 }}>
          {rows.map((row) => (
            <GridRow key={row.id} row={row} selectedId={selectedId} dropTarget={dropTarget} isDraggingFromSidebar={isDraggingFromSidebar} onSelectField={onSelectField} onDeleteField={onDeleteField} />
          ))}
          <BottomDropZone isEmpty={rows.length === 0} isDraggingFromSidebar={isDraggingFromSidebar} />
        </div>
      </div>
    </div>
  );
}

// ─── ID counters ──────────────────────────────────────────────────────────────
let fieldCounter = 1;
let rowCounter = 1;
function newFieldId() { return `field_${fieldCounter++}`; }
function newRowId() { return `row_${rowCounter++}`; }

function removeField(rows: Row[], fieldId: string): Row[] {
  return rows.map((row) => ({ ...row, cells: row.cells.filter((c) => c.field.id !== fieldId) })).filter((row) => row.cells.length > 0);
}

function parseDropId(id: string): { rowId: string; slot: GridSlot } | null {
  if (id === "canvas:new:full") return { rowId: "new", slot: "full" };
  const parts = id.split(":");
  if (parts.length === 2) {
    const [rowId, slotStr] = parts;
    const slot = slotStr as GridSlot;
    if (slot === "left" || slot === "right" || slot === "full") return { rowId, slot };
  }
  return null;
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [search, setSearch] = useState<string>("");

  const isDraggingFromSidebar = !!activeItem?.fromSidebar;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const selectedField: Field | null = rows.flatMap((r) => r.cells.map((c) => c.field)).find((f) => f.id === selectedId) ?? null;

  const handleDragStart = (event: { active: { id: string | number; data: { current?: Record<string, unknown> } } }) => {
    const { active } = event;
    if (active.data.current?.fromSidebar) {
      setActiveItem({ fromSidebar: true, type: active.data.current.type as FieldType, label: active.data.current.label as string });
    } else {
      setActiveItem({ id: active.id as string });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const overId = event.over?.id as string | undefined;
    if (!overId) { setDropTarget(null); return; }
    const parsed = parseDropId(overId);
    if (parsed) setDropTarget({ rowId: parsed.rowId, slot: parsed.slot });
    else setDropTarget(null);
  };

  const handleDragEnd = (event: { active: { id: string | number; data: { current?: Record<string, unknown> } }; over: { id: string | number } | null }) => {
    const { active, over } = event;
    setActiveItem(null);
    setDropTarget(null);
    if (!over) return;

    const overId = over.id as string;
    const parsed = parseDropId(overId);
    if (!parsed) return;

    const { rowId, slot } = parsed;

    if (active.data.current?.fromSidebar) {
      const type = active.data.current.type as FieldType;
      const newField: Field = { id: newFieldId(), type, props: { ...defaultProps[type] } };

      setRows((prev) => {
        if (rowId === "new") {
          return [...prev, { id: newRowId(), cells: [{ field: newField, slot: "full" }] }];
        }
        const targetRow = prev.find((r) => r.id === rowId);
        if (!targetRow) return prev;

        const isFull = targetRow.cells.length === 1 && targetRow.cells[0].slot === "full";

        if (isFull && (slot === "left" || slot === "right")) {
          const existingCell = targetRow.cells[0];
          const updatedCells: RowField[] = slot === "left"
            ? [{ field: newField, slot: "left" }, { field: existingCell.field, slot: "right" }]
            : [{ field: existingCell.field, slot: "left" }, { field: newField, slot: "right" }];
          return prev.map((r) => r.id === rowId ? { ...r, cells: updatedCells } : r);
        }

        if (isFull && slot === "full") {
          return [...prev, { id: newRowId(), cells: [{ field: newField, slot: "full" }] }];
        }

        if (!isFull) {
          const occupied = targetRow.cells.map((c) => c.slot);
          if (!occupied.includes(slot as "left" | "right")) {
            return prev.map((r) => r.id === rowId ? { ...r, cells: [...r.cells, { field: newField, slot: slot as "left" | "right" }] } : r);
          }
          return [...prev, { id: newRowId(), cells: [{ field: newField, slot: "full" }] }];
        }

        return prev;
      });

      setSelectedId(newField.id);
    }
  };

  const deleteField = useCallback((id: string) => {
    setRows((prev) => removeField(prev, id));
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  const updateFieldProps = useCallback((props: FieldProps) => {
    setRows((prev) => prev.map((row) => ({
      ...row,
      cells: row.cells.map((cell) => cell.field.id === selectedId ? { ...cell, field: { ...cell.field, props } } : cell),
    })));
  }, [selectedId]);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0f1320", color: "#c9d1e0", fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif", overflow: "hidden" }}>
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <ComponentSidebar search={search} onSearchChange={setSearch} />
          <FormCanvas rows={rows} selectedId={selectedId} dropTarget={dropTarget} isDraggingFromSidebar={isDraggingFromSidebar} onSelectField={setSelectedId} onDeleteField={deleteField} />
          <div style={{ width: 240, background: "#0e1525", borderLeft: "1px solid #1a2235", overflowY: "auto", flexShrink: 0 }}>
            <PropertiesPanel field={selectedField} onChange={updateFieldProps} />
          </div>
        </div>
      </div>
      <DragOverlay>
        {activeItem?.fromSidebar && (
          <div style={{ background: "#1a2e4a", border: "1.5px solid #3b9eff", borderRadius: 6, padding: "7px 12px", color: "#3b9eff", fontSize: 13, boxShadow: "0 8px 24px rgba(0,0,0,0.4)", pointerEvents: "none" }}>
            {activeItem.label}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}