// ─── utils.ts ─────────────────────────────────────────────────────────────────
// Gộp: helpers · schemaGenerator
import type { Row, GridSlot, FieldType } from "./types";

// ── ID generators ─────────────────────────────────────────────────────────────
let fieldCounter = 1;
let rowCounter = 1;

export function newFieldId() { return `field_${fieldCounter++}`; }
export function newRowId() { return `row_${rowCounter++}`; }

// ── removeField — xoá một field, dọn row nếu rỗng, chuẩn hoá lại slot & width
export function removeField(rows: Row[], fieldId: string): Row[] {
  return rows
    .map((row) => {
      const removedIdx = row.cells.findIndex((c) => c.field.id === fieldId);
      if (removedIdx === -1) return row;

      const newCells = row.cells.filter((c) => c.field.id !== fieldId);

      if (newCells.length === 0) return null; // xoá cả row

      if (newCells.length === 1) {
        return { ...row, cells: [{ ...newCells[0], slot: "full" as GridSlot }], colWidths: [1] };
      }

      // Normalise lại widths sau khi bỏ 1 cột
      const newWidths = row.colWidths.filter((_, i) => i !== removedIdx);
      const total = newWidths.reduce((s, w) => s + w, 0);
      const normWidths = newWidths.map((w) => w / total);
      const slots: GridSlot[] = ["col0", "col1", "col2"];
      const reslottedCells = newCells.map((c, i) => ({ ...c, slot: slots[i] }));

      return { ...row, cells: reslottedCells, colWidths: normWidths };
    })
    .filter((row): row is Row => row !== null);
}

// ── parseDropId — parse droppable ID thành { rowId, slot } ───────────────────
export function parseDropId(id: string): { rowId: string; slot: GridSlot } | null {
  if (id === "canvas:new:full") return { rowId: "new", slot: "full" };
  const parts = id.split(":");
  if (parts.length === 2) {
    const [rowId, slotStr] = parts;
    const slot = slotStr as GridSlot;
    if (slot === "full" || slot === "col0" || slot === "col1" || slot === "col2") {
      return { rowId, slot };
    }
  }
  return null;
}

// ── findFieldInRows — tìm rowId và slot của một field theo id ─────────────────
export function findFieldInRows(rows: Row[], fieldId: string): { rowId: string; slot: GridSlot } | null {
  for (const row of rows) {
    const cell = row.cells.find((c) => c.field.id === fieldId);
    if (cell) return { rowId: row.id, slot: cell.slot };
  }
  return null;
}

// ── generateSchemaContent — tạo nội dung file schema.ts để export ─────────────
export function generateSchemaContent(rows: Row[]): string {
  const allFields = rows.flatMap((row) => row.cells.map((cell) => cell.field));

  const fieldType2Component: Record<FieldType, string> = {
    text: "Input", number: "NumberPicker", decimal: "NumberPicker",
    date: "DatePicker", multiline: "Input.TextArea", richtext: "RichText",
    password: "Password", attachment: "Attachment", textlist: "TextList",
    email: "Input", radio: "Radio.Group", switch: "Switch",
    slider: "Slider", checkbox: "Checkbox", checkboxgroup: "Checkbox.Group",
    select: "Select",
  };

  const fieldType2DataType: Record<FieldType, string> = {
    text: "string", number: "number", decimal: "number", date: "string",
    multiline: "string", richtext: "string", password: "string",
    attachment: "string", textlist: "array", email: "string",
    radio: "string", switch: "boolean", slider: "number",
    checkbox: "boolean", checkboxgroup: "array", select: "string",
  };

  const schemaFields = allFields
    .map((f) => {
      const component = fieldType2Component[f.type];
      const dataType = fieldType2DataType[f.type];
      const placeholder = f.props.placeholder
        ? `\n        "placeholder": ${JSON.stringify(f.props.placeholder)},`
        : "";
      return `    // id: ${f.id} | type: ${f.type} | created: ${f.createdAt}
    "${f.id}": {
      "type": "${dataType}",
      "title": ${JSON.stringify(f.props.label)},
      "x-decorator": "FormItem",
      "x-component": "${component}",
      "x-component-props": {${placeholder}
      },
      "x-decorator-props": {
        "layout": "vertical",
        "labelAlign": "left"
      },
      "required": ${f.props.required},
      "name": "${f.id}",
      "x-designable-id": "${f.id}",
      "x-index": ${allFields.indexOf(f)}
    }`;
    })
    .join(",\n");

  const exportedAt = new Date().toLocaleString("vi-VN");
  return `import { ISchema } from "@formily/react";

// Schema exported at: ${exportedAt}
// Total fields: ${allFields.length}
//
// Field summary:
${allFields.map((f) => `// - ${f.id} | ${f.type} | label: "${f.props.label}" | created: ${f.createdAt}`).join("\n")}

export const schema: ISchema = {
  "type": "object",
  "x-designable-id": "root_schema",
  "properties": {
    "root": {
      "type": "void",
      "x-component": "FormLayout",
      "x-component-props": {},
      "x-designable-id": "layout_root",
      "x-index": 0,
      "properties": {
${schemaFields}
      }
    }
  }
};
`;
}