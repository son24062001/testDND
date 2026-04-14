// ─── constants.ts ─────────────────────────────────────────────────────────────
import type { FieldType, FieldProps, IconName, SidebarGroup } from "./types";

export const icons: Record<IconName, string> = {
  text: "M4 6h16M12 6v14",
  number: "M4 9h16M4 15h16M10 3L8 21M16 3l-2 18",
  decimal: "M12 2v20M2 12h20",
  date: "M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm-3-2v4M8 2v4M3 10h18",
  multiline: "M4 6h16M4 10h16M4 14h10M4 18h14",
  richtext: "M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z",
  password: "M6 10h12v10H6zM9 10V7a3 3 0 016 0v3",
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

export const SIDEBAR_GROUPS: SidebarGroup[] = [
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

export const defaultProps: Record<FieldType, FieldProps> = {
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