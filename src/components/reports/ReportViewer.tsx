import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Download, FileText, FileSpreadsheet, Database, LayoutGrid, Table as TableIcon,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { templateById } from "@/data/reportTemplates";
import { useActing } from "@/context/ActingContext";
import { ActingOnBehalfBadge } from "@/components/delegations/ActingOnBehalfBadge";
import { userFullName } from "@/data/users";
import { format } from "date-fns";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--info, var(--primary)))",
  "hsl(var(--success))",
  "hsl(var(--warning, var(--primary)))",
  "hsl(var(--destructive))",
  "hsl(var(--accent))",
];

function KpiTile({ label, value, trend }: { label: string; value: string; trend?: number }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {typeof trend === "number" && (
        <div className={`mt-1 text-[11px] font-medium ${trend >= 0 ? "text-success" : "text-destructive"}`}>
          {trend >= 0 ? "+" : ""}{trend}% vs prior period
        </div>
      )}
    </div>
  );
}

export function ReportViewer() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const template = templateId ? templateById(templateId) : undefined;
  const [view, setView] = useState<"visual" | "table">("visual");
  const { currentUser, actingAs } = useActing();
  const generatedBy = actingAs ?? currentUser;

  const now = useMemo(() => new Date(), []);
  if (!template) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Report template not found.</p>
        <Button variant="link" onClick={() => navigate("/reports")}>Back to Library</Button>
      </div>
    );
  }

  const exportAs = (kind: string) => toast.success(`Exporting ${template.name} as ${kind}`);

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate("/reports")}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Library
        </Button>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-full border border-border/60 bg-card p-0.5">
            <button onClick={() => setView("visual")} className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs ${view === "visual" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
              <LayoutGrid className="h-3 w-3" /> Visual
            </button>
            <button onClick={() => setView("table")} className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs ${view === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
              <TableIcon className="h-3 w-3" /> Table
            </button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="rounded-full"><Download className="mr-1.5 h-4 w-4" /> Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportAs("PDF")}><FileText className="mr-2 h-4 w-4" /> PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportAs("CSV")}><FileSpreadsheet className="mr-2 h-4 w-4" /> CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportAs("Flat File")}><Database className="mr-2 h-4 w-4" /> Flat File</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportAs("BI Package")}><Database className="mr-2 h-4 w-4" /> BI Package</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">{template.pillar}</Badge>
              <h1 className="font-display text-xl font-bold tracking-tight">{template.name}</h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
          </div>
          <div className="text-right text-[11px] text-muted-foreground">
            <div className="flex items-center justify-end gap-2">
              <span>Generated by {generatedBy ? userFullName(generatedBy) : "—"}</span>
              {actingAs && <ActingOnBehalfBadge />}
            </div>
            <div>Generated on {format(now, "PPp")}</div>
            <div>Data as of {format(now, "PP")}</div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["Last 30 Days", template.pillar, "Tenant Scoped"].map((c) => (
            <span key={c} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{c}</span>
          ))}
        </div>
      </div>

      {view === "visual" ? (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {template.kpis.map((k) => <KpiTile key={k.label} {...k} />)}
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {template.bar && (
              <div className="rounded-2xl border border-border/60 bg-card p-4">
                <h3 className="mb-3 text-sm font-semibold">Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer>
                    <BarChart data={template.bar}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={0} angle={-25} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {template.trend && (
              <div className="rounded-2xl border border-border/60 bg-card p-4">
                <h3 className="mb-3 text-sm font-semibold">Trend</h3>
                <div className="h-64">
                  <ResponsiveContainer>
                    <LineChart data={template.trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="period" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {template.pie && (
              <div className="rounded-2xl border border-border/60 bg-card p-4">
                <h3 className="mb-3 text-sm font-semibold">Composition</h3>
                <div className="h-64">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={template.pie} dataKey="value" nameKey="label" innerRadius={45} outerRadius={80} paddingAngle={2}>
                        {template.pie.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {template.funnel && (
              <div className="rounded-2xl border border-border/60 bg-card p-4">
                <h3 className="mb-3 text-sm font-semibold">Funnel</h3>
                <div className="space-y-2">
                  {(() => {
                    const max = Math.max(...template.funnel.map(f => f.value));
                    return template.funnel.map((f, i) => (
                      <div key={f.label}>
                        <div className="mb-0.5 flex justify-between text-xs">
                          <span>{f.label}</span>
                          <span className="tabular-nums text-muted-foreground">{f.value}</span>
                        </div>
                        <div className="h-3 rounded-full bg-muted">
                          <div
                            className="h-3 rounded-full"
                            style={{ width: `${(f.value / max) * 100}%`, background: CHART_COLORS[i % CHART_COLORS.length] }}
                          />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
          <div className="max-h-[600px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  {template.columns.map((c) => <TableHead key={c} className="text-xs">{c}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {template.rows.map((r, i) => (
                  <TableRow key={i}>
                    {r.map((cell, j) => <TableCell key={j} className="text-xs">{cell}</TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </>
  );
}
