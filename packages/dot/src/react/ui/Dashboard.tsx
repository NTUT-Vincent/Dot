import React from "react";
import type { DashboardSpec, WidgetSpec, KPIWidgetSpec, TableWidgetSpec, BarChartWidgetSpec, LineChartWidgetSpec, MarkdownWidgetSpec } from "../../core/types";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

function KPIWidget({ widget }: { widget: KPIWidgetSpec }) {
  return (
    <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
      <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#374151" }}>{widget.title}</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {widget.items.map((item, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>
              {item.value}{item.unit ? <span style={{ fontSize: 14, color: "#6b7280" }}>{item.unit}</span> : null}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableWidget({ widget }: { widget: TableWidgetSpec }) {
  const rows = widget.maxRows ? widget.rows.slice(0, widget.maxRows) : widget.rows;
  const colDefs = widget.columns.map(col => ({ field: col.key, headerName: col.label }));
  return (
    <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
      <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#374151" }}>{widget.title}</h3>
      <div className="ag-theme-alpine" style={{ width: "100%" }}>
        <AgGridReact
          rowData={rows}
          columnDefs={colDefs}
          domLayout="autoHeight"
        />
      </div>
    </div>
  );
}

function BarChartWidget({ widget }: { widget: BarChartWidgetSpec }) {
  const options: Highcharts.Options = {
    chart: { type: "bar" },
    title: { text: undefined },
    xAxis: { categories: widget.data.map(d => String(d[widget.xKey])) },
    yAxis: { title: { text: undefined } },
    series: [{ type: "bar", name: widget.yKey, data: widget.data.map(d => Number(d[widget.yKey])) }],
    credits: { enabled: false },
  };
  return (
    <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
      <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#374151" }}>{widget.title}</h3>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}

function LineChartWidget({ widget }: { widget: LineChartWidgetSpec }) {
  const options: Highcharts.Options = {
    chart: { type: "line" },
    title: { text: undefined },
    xAxis: { categories: widget.data.map(d => String(d[widget.xKey])) },
    yAxis: { title: { text: undefined } },
    series: [{ type: "line", name: widget.yKey, data: widget.data.map(d => Number(d[widget.yKey])) }],
    credits: { enabled: false },
  };
  return (
    <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
      <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#374151" }}>{widget.title}</h3>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}

function MarkdownWidget({ widget }: { widget: MarkdownWidgetSpec }) {
  return (
    <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
      {widget.title && <h3 style={{ margin: "0 0 8px", fontSize: 14, color: "#374151" }}>{widget.title}</h3>}
      <pre style={{ margin: 0, fontSize: 13, whiteSpace: "pre-wrap", color: "#374151", fontFamily: "inherit" }}>
        {widget.content}
      </pre>
    </div>
  );
}

function Widget({ widget }: { widget: WidgetSpec }) {
  switch (widget.type) {
    case "kpi": return <KPIWidget widget={widget} />;
    case "table": return <TableWidget widget={widget} />;
    case "bar": return <BarChartWidget widget={widget} />;
    case "line": return <LineChartWidget widget={widget} />;
    case "markdown": return <MarkdownWidget widget={widget} />;
  }
}

interface DashboardProps {
  spec: DashboardSpec | null;
  isLoading: boolean;
  error?: string;
}

export function Dashboard({ spec, isLoading, error }: DashboardProps) {
  if (error) {
    return (
      <div style={{ padding: 24, color: "#dc2626", fontSize: 14 }}>
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (isLoading && !spec) {
    return (
      <div style={{ padding: 24, color: "#6b7280", fontSize: 14, textAlign: "center" }}>
        Generating dashboard…
      </div>
    );
  }

  if (!spec) {
    return (
      <div style={{ padding: 24, color: "#6b7280", fontSize: 14, textAlign: "center" }}>
        Send a message to generate a dashboard.
      </div>
    );
  }

  const columns = spec.layout?.columns ?? 1;
  const gap = spec.layout?.gap === "sm" ? 8 : spec.layout?.gap === "lg" ? 24 : 16;

  return (
    <div style={{ padding: 16, overflowY: "auto", height: "100%" }}>
      {spec.title && <h2 style={{ margin: "0 0 16px", fontSize: 18, color: "#111827" }}>{spec.title}</h2>}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
      }}>
        {spec.widgets.map((widget, i) => (
          <Widget key={i} widget={widget} />
        ))}
      </div>
    </div>
  );
}
