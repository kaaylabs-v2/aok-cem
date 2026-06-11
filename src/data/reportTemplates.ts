// CEM-10 Report Templates + Custom + Scheduled enriched data.
// Frontend-only mock. Derives series from existing portfolio + compliance data.

import {
  BarChart3, ShieldAlert, DollarSign, Inbox, ShieldCheck, UserCog,
  Handshake, Star, Gift, Building2,
  type LucideIcon,
} from "lucide-react";
import { events as portfolioEvents, utilisation } from "@/data/portfolio";
import { complianceRows } from "@/data/reports";
import { DELEGATIONS } from "@/data/delegations";
import { userById, userFullName } from "@/data/users";
import { ENGAGEMENTS, FEEDBACK, summariseVenueSourcing, savingsValue, savingsPct, fmtGbp } from "@/data/venueSourcing";

export type ReportPillar =
  | "Inventory" | "Enquiries" | "Compliance" | "Approvals" | "Delegations" | "Spend" | "Venue Sourcing";

export type ReportVisualization =
  | "bar" | "line" | "pie" | "donut" | "funnel" | "kpi" | "table" | "heatmap";

export interface ChartSeries { label: string; value: number }
export interface TrendPoint { period: string; value: number }
export interface ReportKpi { label: string; value: string; trend?: number }

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  pillar: ReportPillar;
  icon: LucideIcon;
  lastGenerated: string; // ISO
  visualizations: ReportVisualization[];
  defaultFormat: "Dashboard" | "PDF" | "CSV";
  large?: boolean; // demonstrates background generation
  kpis: ReportKpi[];
  bar?: ChartSeries[];
  pie?: ChartSeries[];
  trend?: TrendPoint[];
  funnel?: ChartSeries[];
  columns: string[];
  rows: (string | number)[][];
}

const iso = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString();
};

const monthsBack = (n: number): TrendPoint[] => {
  const out: TrendPoint[] = [];
  const base = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    out.push({
      period: d.toLocaleString(undefined, { month: "short" }),
      value: 30 + ((i * 17 + 11) % 65),
    });
  }
  return out;
};

// --- Utilisation
const utilisationTemplate: ReportTemplate = (() => {
  const upcoming = portfolioEvents.filter((e) => !e.past);
  const byVenue = new Map<string, { booked: number; capacity: number }>();
  upcoming.forEach((e) => {
    const v = byVenue.get(e.venue) ?? { booked: 0, capacity: 0 };
    v.booked += e.booked; v.capacity += e.capacity;
    byVenue.set(e.venue, v);
  });
  const bar: ChartSeries[] = Array.from(byVenue.entries())
    .map(([label, v]) => ({ label, value: v.capacity ? Math.round((v.booked / v.capacity) * 100) : 0 }))
    .slice(0, 8);
  const rows = upcoming.slice(0, 14).map((e) => [
    e.name, e.venue, e.type, `${e.booked}/${e.capacity}`, `${utilisation(e)}%`,
  ]);
  return {
    id: "utilisation",
    name: "Utilisation Report",
    description: "Capacity, venue, and event utilisation with tenant usage trends.",
    pillar: "Inventory",
    icon: BarChart3,
    lastGenerated: iso(-2),
    visualizations: ["bar", "line", "table"],
    defaultFormat: "Dashboard",
    kpis: [
      { label: "Avg. Utilisation", value: "72%", trend: 4 },
      { label: "Events Tracked", value: String(upcoming.length), trend: 6 },
      { label: "Top Venue Fill", value: `${Math.max(...bar.map(b=>b.value), 0)}%`, trend: 3 },
      { label: "Underperforming", value: String(upcoming.filter((e) => utilisation(e) < 50).length), trend: -8 },
    ],
    bar,
    trend: monthsBack(12),
    columns: ["Event", "Venue", "Type", "Booked / Capacity", "Utilisation"],
    rows,
  };
})();

// --- Compliance
const complianceTemplate: ReportTemplate = (() => {
  const freq = new Map<string, number>();
  complianceRows.forEach((r) => freq.set(r.guestName, (freq.get(r.guestName) ?? 0) + 1));
  const topGuests = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([label, value]) => ({ label, value }));
  const byType = new Map<string, number>();
  complianceRows.forEach((r) => byType.set(r.eventType, (byType.get(r.eventType) ?? 0) + 1));
  const pie = Array.from(byType.entries()).map(([label, value]) => ({ label, value }));
  const rows = complianceRows.slice(0, 14).map((r) => [
    r.hostName, r.guestName, r.guestCompany, r.eventName,
    r.costPerPerson ? `£${r.costPerPerson.toLocaleString()}` : "—",
    freq.get(r.guestName) ?? 1,
  ]);
  const highSpend = complianceRows.filter((r) => (r.costPerPerson ?? 0) >= 1000).length;
  return {
    id: "compliance",
    name: "Compliance Report",
    description: "Host, guest, company, event, cost per head and entertainment frequency.",
    pillar: "Compliance",
    icon: ShieldAlert,
    lastGenerated: iso(-1),
    visualizations: ["kpi", "bar", "table"],
    defaultFormat: "PDF",
    large: true,
    kpis: [
      { label: "Records", value: String(complianceRows.length), trend: 2 },
      { label: "Unique Guests", value: String(freq.size), trend: 5 },
      { label: "High-Spend (≥£1k)", value: String(highSpend), trend: -3 },
      { label: "Repeat Guests", value: String(Array.from(freq.values()).filter((v) => v >= 3).length), trend: 1 },
    ],
    bar: topGuests,
    pie,
    columns: ["Host", "Guest", "Company", "Event", "Cost/Head", "Frequency"],
    rows,
  };
})();

// --- Spend Analysis
const spendTemplate: ReportTemplate = (() => {
  const byEvent = new Map<string, number>();
  const byHost = new Map<string, number>();
  const byTeam = new Map<string, number>();
  const byType = new Map<string, number>();
  complianceRows.forEach((r) => {
    const c = r.costPerPerson ?? 0;
    byEvent.set(r.eventName, (byEvent.get(r.eventName) ?? 0) + c);
    byHost.set(r.hostName, (byHost.get(r.hostName) ?? 0) + c);
    byTeam.set(r.hostTeam, (byTeam.get(r.hostTeam) ?? 0) + c);
    byType.set(r.eventType, (byType.get(r.eventType) ?? 0) + c);
  });
  const top = (m: Map<string, number>, n: number) =>
    Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, n)
      .map(([label, value]) => ({ label, value: Math.round(value) }));
  const total = Array.from(byEvent.values()).reduce((s, v) => s + v, 0);
  return {
    id: "spend",
    name: "Spend Analysis Report",
    description: "Spend by event, host, department, and event type.",
    pillar: "Spend",
    icon: DollarSign,
    lastGenerated: iso(-5),
    visualizations: ["pie", "bar", "table"],
    defaultFormat: "PDF",
    large: true,
    kpis: [
      { label: "Total Spend", value: `£${Math.round(total).toLocaleString()}`, trend: 9 },
      { label: "Avg / Event", value: `£${Math.round(total / Math.max(byEvent.size, 1)).toLocaleString()}`, trend: 4 },
      { label: "Departments", value: String(byTeam.size), trend: 0 },
      { label: "Top Host Spend", value: `£${Math.round(Math.max(...byHost.values(), 0)).toLocaleString()}`, trend: 11 },
    ],
    bar: top(byHost, 8),
    pie: top(byType, 6),
    trend: monthsBack(12),
    columns: ["Event", "Department", "Host", "Total Spend"],
    rows: top(byEvent, 14).map((e) => {
      const row = complianceRows.find((r) => r.eventName === e.label);
      return [e.label, row?.hostTeam ?? "—", row?.hostName ?? "—", `£${e.value.toLocaleString()}`];
    }),
  };
})();

// --- Enquiry Activity (synthetic but stable)
const enquiryTemplate: ReportTemplate = {
  id: "enquiries",
  name: "Enquiry Activity Report",
  description: "Submitted, in progress, proposal sent, accepted, declined.",
  pillar: "Enquiries",
  icon: Inbox,
  lastGenerated: iso(-3),
  visualizations: ["funnel", "pie", "line"],
  defaultFormat: "Dashboard",
  kpis: [
    { label: "Submitted (30d)", value: "48", trend: 12 },
    { label: "Conversion Rate", value: "34%", trend: 5 },
    { label: "Avg. Response", value: "1.8d", trend: -10 },
    { label: "Declined", value: "9", trend: -4 },
  ],
  funnel: [
    { label: "Submitted", value: 48 },
    { label: "In Progress", value: 34 },
    { label: "Proposal Sent", value: 24 },
    { label: "Accepted", value: 16 },
    { label: "Declined", value: 9 },
  ],
  pie: [
    { label: "Submitted", value: 48 },
    { label: "In Progress", value: 34 },
    { label: "Proposal Sent", value: 24 },
    { label: "Accepted", value: 16 },
    { label: "Declined", value: 9 },
  ],
  trend: monthsBack(12),
  columns: ["Stage", "Count", "Conversion"],
  rows: [
    ["Submitted", 48, "100%"], ["In Progress", 34, "71%"],
    ["Proposal Sent", 24, "50%"], ["Accepted", 16, "33%"], ["Declined", 9, "19%"],
  ],
};

// --- Approval Workflow
const approvalTemplate: ReportTemplate = {
  id: "approvals",
  name: "Approval Workflow Report",
  description: "Pending approvals, average approval time, bottlenecks and rejection rates.",
  pillar: "Approvals",
  icon: ShieldCheck,
  lastGenerated: iso(-4),
  visualizations: ["kpi", "bar", "table"],
  defaultFormat: "Dashboard",
  kpis: [
    { label: "Pending", value: "12", trend: 2 },
    { label: "Avg. Approval Time", value: "6.4h", trend: -8 },
    { label: "Bottleneck Steps", value: "3", trend: 1 },
    { label: "Rejection Rate", value: "11%", trend: -2 },
  ],
  bar: [
    { label: "Tier 1", value: 24 },
    { label: "Tier 2", value: 18 },
    { label: "Tier 3", value: 11 },
    { label: "Fallback", value: 4 },
    { label: "Escalation", value: 2 },
  ],
  trend: monthsBack(12),
  columns: ["Tier", "Approved", "Rejected", "Avg. Time"],
  rows: [
    ["Tier 1", 22, 2, "2.1h"],
    ["Tier 2", 16, 2, "5.8h"],
    ["Tier 3", 10, 1, "11.2h"],
    ["Fallback", 4, 0, "3.4h"],
    ["Escalation", 2, 0, "18.1h"],
  ],
};

// --- Delegation Activity
const delegationTemplate: ReportTemplate = (() => {
  const byPa = new Map<string, number>();
  DELEGATIONS.forEach((d) => byPa.set(d.paUserId, (byPa.get(d.paUserId) ?? 0) + 1));
  const byPrincipal = new Map<string, number>();
  DELEGATIONS.forEach((d) =>
    byPrincipal.set(d.principalUserId, (byPrincipal.get(d.principalUserId) ?? 0) + 1));
  const bar: ChartSeries[] = Array.from(byPa.entries())
    .map(([id, value]) => ({ label: userById(id) ? userFullName(userById(id)!) : id, value }))
    .slice(0, 8);
  const rows = DELEGATIONS.slice(0, 14).map((d) => {
    const pa = userById(d.paUserId);
    const pr = userById(d.principalUserId);
    return [
      pa ? userFullName(pa) : d.paUserId,
      pr ? userFullName(pr) : d.principalUserId,
      d.status,
      new Date(d.createdAt).toLocaleDateString(),
    ];
  });
  return {
    id: "delegations",
    name: "Delegation Activity Report",
    description: "Bookings created by delegated bookers, principal usage and trends.",
    pillar: "Delegations",
    icon: UserCog,
    lastGenerated: iso(-7),
    visualizations: ["bar", "table"],
    defaultFormat: "CSV",
    kpis: [
      { label: "Active Relationships", value: String(DELEGATIONS.filter(d=>d.status==="active").length), trend: 3 },
      { label: "Unique PAs", value: String(byPa.size), trend: 1 },
      { label: "Principals Covered", value: String(byPrincipal.size), trend: 2 },
      { label: "Bookings via PA (30d)", value: "27", trend: 14 },
    ],
    bar,
    trend: monthsBack(12),
    columns: ["PA", "Principal", "Status", "Created"],
    rows,
  };
})();

export const REPORT_TEMPLATES: ReportTemplate[] = [
  utilisationTemplate, complianceTemplate, spendTemplate,
  enquiryTemplate, approvalTemplate, delegationTemplate,
];

export const templateById = (id: string) =>
  REPORT_TEMPLATES.find((t) => t.id === id);

// --- Custom reports
export interface CustomReport {
  id: string;
  name: string;
  description: string;
  templateId: string;
  owner: string;
  createdDate: string;
  lastRun: string;
  schedule?: "Daily" | "Weekly" | "Monthly" | "Quarterly";
  sharedWith: "Private" | "Team" | "Tenant";
}

export const CUSTOM_REPORTS: CustomReport[] = [
  { id: "cr1", name: "Q4 Entertainment Summary", description: "Hospitality + Sports Q4 view", templateId: "spend", owner: "Elena Voss", createdDate: iso(-40), lastRun: iso(-3), schedule: "Quarterly", sharedWith: "Team" },
  { id: "cr2", name: "Board Spend Overview", description: "Director+ hosted spend", templateId: "spend", owner: "Alex Morgan", createdDate: iso(-90), lastRun: iso(-1), schedule: "Monthly", sharedWith: "Private" },
  { id: "cr3", name: "Executive Compliance Pack", description: "C-Level entertainment compliance bundle", templateId: "compliance", owner: "Priya Desai", createdDate: iso(-120), lastRun: iso(-7), schedule: "Monthly", sharedWith: "Tenant" },
  { id: "cr4", name: "Monthly Enquiry Review", description: "Funnel + accepted volume", templateId: "enquiries", owner: "Jordan Reeves", createdDate: iso(-60), lastRun: iso(-2), schedule: "Monthly", sharedWith: "Team" },
  { id: "cr5", name: "Utilisation Watchlist", description: "Underperforming events flagged weekly", templateId: "utilisation", owner: "Sofia Nakamura", createdDate: iso(-22), lastRun: iso(-1), schedule: "Weekly", sharedWith: "Team" },
];

// --- Enriched scheduled reports
export type ScheduleStatus = "Active" | "Paused" | "Failed";
export interface EnrichedScheduledReport {
  id: string;
  reportName: string;
  templateId: string;
  frequency: "Daily" | "Weekly" | "Monthly" | "Quarterly";
  recipients: { email: string; active: boolean }[];
  nextRun: string;
  lastRun?: string;
  status: ScheduleStatus;
  format: "PDF" | "CSV" | "Flat File" | "Dashboard";
}

export const SCHEDULED: EnrichedScheduledReport[] = [
  {
    id: "s1", reportName: "Weekly Compliance Digest", templateId: "compliance",
    frequency: "Weekly",
    recipients: [
      { email: "compliance@firm.com", active: true },
      { email: "alex.morgan@firm.com", active: true },
    ],
    nextRun: iso(2), lastRun: iso(-5), status: "Active", format: "PDF",
  },
  {
    id: "s2", reportName: "Monthly Hospitality Audit", templateId: "spend",
    frequency: "Monthly",
    recipients: [
      { email: "audit@firm.com", active: true },
      { email: "former.user@firm.com", active: false },
    ],
    nextRun: iso(14), lastRun: iso(-16), status: "Active", format: "PDF",
  },
  {
    id: "s3", reportName: "Quarterly Procurement Review", templateId: "spend",
    frequency: "Quarterly",
    recipients: [
      { email: "procurement@firm.com", active: true },
      { email: "cfo@firm.com", active: true },
    ],
    nextRun: iso(45), lastRun: iso(-46), status: "Active", format: "CSV",
  },
  {
    id: "s4", reportName: "Daily Utilisation Snapshot", templateId: "utilisation",
    frequency: "Daily",
    recipients: [{ email: "ops@firm.com", active: true }],
    nextRun: iso(1), lastRun: iso(-1), status: "Paused", format: "Dashboard",
  },
  {
    id: "s5", reportName: "Monthly Enquiry Funnel", templateId: "enquiries",
    frequency: "Monthly",
    recipients: [{ email: "sales-ops@firm.com", active: true }],
    nextRun: iso(11), lastRun: iso(-19), status: "Failed", format: "PDF",
  },
];

export const KPI_SUMMARY = () => ({
  generatedThisMonth: 142,
  activeScheduled: SCHEDULED.filter((s) => s.status === "Active").length,
  savedTemplates: CUSTOM_REPORTS.length,
  complianceRuns: 38,
  avgUtilisation: "72%",
  totalSpend: `£${Math.round(
    complianceRows.reduce((s, r) => s + (r.costPerPerson ?? 0), 0)
  ).toLocaleString()}`,
});
