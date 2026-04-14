import { ISchema } from "@formily/react";
export const schema: ISchema = {
  "type": "object",
  "properties": {
    "root": {
      "type": "void",
      "x-component": "FormLayout",
      "x-component-props": {},
      "x-designable-id": "layout_root",
      "x-index": 0,
      "properties": {
        "grid_row_2": {
          "type": "void",
          "x-component": "FormGrid",
          "x-validator": [],
          "x-component-props": {},
          "x-designable-id": "grid_row_2",
          "x-index": 0,
          "name": "grid_row_2",
          "properties": {
            "col1": {
              "type": "void",
              "x-component": "FormGrid.GridColumn",
              "x-validator": [],
              "x-component-props": {},
              "x-designable-id": "col1_field_2",
              "x-index": 0,
              "name": "col1",
              "properties": {
                "field_2": {
                  "type": "number",
                  "title": "Decimal Field",
                  "x-decorator": "FormItem",
                  "x-component": "NumberPicker",
                  "x-validator": [],
                  "x-component-props": {
                    "placeholder": "0.00"
                  },
                  "x-decorator-props": {
                    "layout": "vertical",
                    "labelAlign": "left"
                  },
                  "required": false,
                  "name": "field_2",
                  "x-designable-id": "field_2",
                  "x-index": 0
                }
              }
            },
            "col2": {
              "type": "void",
              "x-component": "FormGrid.GridColumn",
              "x-validator": [],
              "x-component-props": {},
              "x-designable-id": "col2_field_1",
              "x-index": 1,
              "name": "col2",
              "properties": {
                "field_1": {
                  "type": "string",
                  "title": "Text Field",
                  "x-decorator": "FormItem",
                  "x-component": "Input",
                  "x-validator": [],
                  "x-component-props": {
                    "placeholder": "Enter text..."
                  },
                  "x-decorator-props": {
                    "layout": "vertical",
                    "labelAlign": "left"
                  },
                  "required": false,
                  "name": "field_1",
                  "x-designable-id": "field_1",
                  "x-index": 0
                }
              }
            }
          }
        },
        "row_1_field_3": {
          "type": "number",
          "title": "Decimal Field",
          "x-decorator": "FormItem",
          "x-component": "NumberPicker",
          "x-validator": [],
          "x-component-props": {
            "placeholder": "0.00"
          },
          "x-decorator-props": {
            "layout": "vertical",
            "labelAlign": "left"
          },
          "required": false,
          "name": "field_3",
          "x-designable-id": "field_3",
          "x-index": 1
        }
      }
    }
  },
  "x-designable-id": "root_schema"
};
