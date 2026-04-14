// ─── types.ts ─────────────────────────────────────────────────────────────────

export type FieldType =
  | "text" | "number" | "decimal" | "date" | "multiline" | "richtext"
  | "password" | "attachment" | "textlist" | "email" | "radio" | "switch"
  | "slider" | "checkbox" | "checkboxgroup" | "select";

export interface FieldProps {
  label: string;
  placeholder?: string;
  required: boolean;
  rows?: number;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

export interface Field {
  id: string;
  type: FieldType;
  props: FieldProps;
  createdAt: string; // ISO datetime string
}

export type IconName =
  | "text" | "number" | "decimal" | "date" | "multiline" | "richtext"
  | "password" | "attachment" | "textlist" | "email" | "radio" | "switch"
  | "slider" | "checkbox" | "checkboxgroup" | "select"
  | "grip" | "trash" | "eye" | "settings" | "plus" | "search" | "edit" | "chevronDown";

export interface SidebarItemData {
  type: FieldType;
  label: string;
  icon: IconName;
}

export interface SidebarGroup {
  label: string;
  items: SidebarItemData[];
}

export type ActiveItemKind =
  | { kind: "sidebar"; type: FieldType; label: string }
  | { kind: "row"; rowId: string };

export type GridSlot = "full" | "col0" | "col1" | "col2";

export interface RowField {
  field: Field;
  slot: GridSlot;
}

export interface Row {
  id: string;
  cells: RowField[];
  colWidths: number[]; // fractional widths, sum = 1
}

export interface DropTarget {
  rowId: string | "new";
  slot: GridSlot;
}