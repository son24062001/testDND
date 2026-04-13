// ─── Types ────────────────────────────────────────────────────────────────────
export type FieldType =
  | "text"
  | "number"
  | "decimal"
  | "date"
  | "multiline"
  | "richtext"
  | "password"
  | "attachment"
  | "textlist"
  | "email"
  | "radio"
  | "switch"
  | "slider"
  | "checkbox"
  | "checkboxgroup"
  | "select";

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
}

export interface SidebarItemData {
  type: FieldType;
  label: string;
  icon: IconName;
}

export interface SidebarGroup {
  label: string;
  items: SidebarItemData[];
}

export interface ActiveItem {
  fromSidebar?: boolean;
  type?: FieldType;
  label?: string;
  id?: string;
}

// ─── Grid Layout ──────────────────────────────────────────────────────────────
// Mỗi Row chứa 1 hoặc 2 field.
// slot = "full" | "left" | "right"
export type GridSlot = "full" | "left" | "right";

export interface RowField {
  field: Field;
  slot: GridSlot; // "full" = chiếm cả dòng, "left"/"right" = nửa dòng
}

export interface Row {
  id: string;       // row id để SortableContext track
  cells: RowField[]; // 1 cell (full) hoặc 2 cells (left + right)
}

// Khi đang hover kéo vào canvas, highlight vùng nào
export interface DropTarget {
  rowId: string | "new"; // "new" = tạo row mới cuối
  slot: GridSlot;
}

export type IconName =
  | "text" | "number" | "decimal" | "date" | "multiline" | "richtext"
  | "password" | "attachment" | "textlist" | "email" | "radio" | "switch"
  | "slider" | "checkbox" | "checkboxgroup" | "select"
  | "grip" | "trash" | "eye" | "settings" | "plus" | "search" | "edit" | "chevronDown";