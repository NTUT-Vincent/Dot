export const DASHBOARD_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  required: ["version", "widgets"],
  properties: {
    version: { type: "string", enum: ["0.1"] },
    title: { type: "string" },
    layout: {
      type: "object",
      properties: {
        columns: { type: "integer", enum: [1, 2] },
        gap: { type: "string", enum: ["sm", "md", "lg"] },
      },
      required: ["columns"],
    },
    widgets: {
      type: "array",
      items: {
        oneOf: [
          {
            type: "object",
            required: ["type", "title", "items"],
            properties: {
              type: { const: "kpi" },
              title: { type: "string" },
              items: {
                type: "array",
                items: {
                  type: "object",
                  required: ["label", "value"],
                  properties: {
                    label: { type: "string" },
                    value: { oneOf: [{ type: "string" }, { type: "number" }] },
                    unit: { type: "string" },
                  },
                },
              },
            },
          },
          {
            type: "object",
            required: ["type", "title", "columns", "rows"],
            properties: {
              type: { const: "table" },
              title: { type: "string" },
              columns: {
                type: "array",
                items: {
                  type: "object",
                  required: ["key", "label"],
                  properties: {
                    key: { type: "string" },
                    label: { type: "string" },
                  },
                },
              },
              rows: { type: "array", items: { type: "object" } },
              maxRows: { type: "integer" },
            },
          },
          {
            type: "object",
            required: ["type", "title", "xKey", "yKey", "data"],
            properties: {
              type: { const: "bar" },
              title: { type: "string" },
              xKey: { type: "string" },
              yKey: { type: "string" },
              data: { type: "array", items: { type: "object" } },
            },
          },
          {
            type: "object",
            required: ["type", "title", "xKey", "yKey", "data"],
            properties: {
              type: { const: "line" },
              title: { type: "string" },
              xKey: { type: "string" },
              yKey: { type: "string" },
              data: { type: "array", items: { type: "object" } },
            },
          },
          {
            type: "object",
            required: ["type", "content"],
            properties: {
              type: { const: "markdown" },
              title: { type: "string" },
              content: { type: "string" },
            },
          },
        ],
      },
    },
  },
};
