// CEM-12 + CEM-13 — Venue Sourcing data layer.
// All financial fields are READ-ONLY; treated as if synced from 3D CRM.
// Frontend mock — deterministic and tenant-scoped.

export type EngagementStatus =
  | "Active"
  | "In Negotiation"
  | "Awaiting Contract"
  | "Completed"
  | "Cancelled";

export type ConcessionType =
  | "Meeting Room"
  | "AV Package"
  | "Parking"
  | "Catering"
  | "Accommodation"
  | "Cancellation Terms"
  | "WiFi"
  | "Branding";

export interface Concession {
  type: ConcessionType;
  label: string;          // descriptive — not monetary
  description?: string;
}

export interface FeedbackEntry {
  id: string;
  engagementId: string;
  venueRating: number;      // 1–10
  serviceRating: number;    // 1–10
  venueNotes?: string;
  comments?: string;
  submittedAt: string;
  submittedBy: string;
  syncStatus: "Synced" | "Pending" | "Failed";
}

export interface VenueEngagement {
  id: string;
  eventName: string;
  venue: string;
  location: string;
  status: EngagementStatus;
  initialQuote: number | null;
  negotiatedPrice: number | null;
  finalContractPrice: number | null;
  concessionsValue: number | null;
  concessions: Concession[];
  commissionPct?: number;       // tenant-permitted only
  commissionValue?: number;
  lastSynced: string;
  createdAt: string;
  completedAt?: string;
  history: { at: string; label: string; actor: string }[];
}

// Mock current tenant config — controls commission visibility platform-wide.
export const TENANT_CONFIG = {
  showCommission: true, // toggle false to hide commission entirely
  source: "3D CRM",
  apiAvailable: true,
};

const iso = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString();
};

const CONCESSION_CATALOG: Record<ConcessionType, string> = {
  "Meeting Room": "Complimentary Meeting Room",
  "AV Package": "Free AV Package",
  "Parking": "Free Parking",
  "Catering": "Upgraded Catering",
  "Accommodation": "Complimentary Accommodation",
  "Cancellation Terms": "Reduced Cancellation Terms",
  "WiFi": "Premium WiFi Included",
  "Branding": "Venue Branding Package",
};

const mkConcessions = (types: ConcessionType[]): Concession[] =>
  types.map((t) => ({ type: t, label: CONCESSION_CATALOG[t] }));

export const ENGAGEMENTS: VenueEngagement[] = [
  {
    id: "VS-1042",
    eventName: "Q4 Partner Summit",
    venue: "The Langham, London",
    location: "London, UK",
    status: "Completed",
    initialQuote: 48000,
    negotiatedPrice: 41200,
    finalContractPrice: 39500,
    concessionsValue: 4200,
    concessions: mkConcessions(["Meeting Room", "AV Package", "Parking", "WiFi"]),
    commissionPct: 8, commissionValue: 3160,
    lastSynced: iso(-1),
    createdAt: iso(-72), completedAt: iso(-9),
    history: [
      { at: iso(-72), label: "Engagement created in 3D CRM", actor: "Venue Sourcer" },
      { at: iso(-55), label: "Initial quote received (£48,000)", actor: "Venue" },
      { at: iso(-40), label: "Negotiation round 2 — price reduced to £41,200", actor: "Venue Sourcer" },
      { at: iso(-25), label: "Final contract signed (£39,500)", actor: "Procurement" },
      { at: iso(-9),  label: "Event completed", actor: "System" },
    ],
  },
  {
    id: "VS-1051",
    eventName: "Executive Strategy Offsite",
    venue: "Coworth Park",
    location: "Ascot, UK",
    status: "Completed",
    initialQuote: 62500,
    negotiatedPrice: 55000,
    finalContractPrice: 52800,
    concessionsValue: 6800,
    concessions: mkConcessions(["Accommodation", "Catering", "Meeting Room", "Cancellation Terms"]),
    commissionPct: 7, commissionValue: 3696,
    lastSynced: iso(-1),
    createdAt: iso(-110), completedAt: iso(-14),
    history: [
      { at: iso(-110), label: "Engagement created", actor: "Venue Sourcer" },
      { at: iso(-90),  label: "Quote received", actor: "Venue" },
      { at: iso(-60),  label: "Negotiated price agreed", actor: "Venue Sourcer" },
      { at: iso(-40),  label: "Final contract signed", actor: "Procurement" },
      { at: iso(-14),  label: "Event completed", actor: "System" },
    ],
  },
  {
    id: "VS-1067",
    eventName: "Client Hospitality — Wimbledon",
    venue: "All England Club",
    location: "London, UK",
    status: "Completed",
    initialQuote: 24000,
    negotiatedPrice: 22500,
    finalContractPrice: 21800,
    concessionsValue: 1500,
    concessions: mkConcessions(["Catering", "Branding"]),
    commissionPct: 6, commissionValue: 1308,
    lastSynced: iso(-1),
    createdAt: iso(-60), completedAt: iso(-3),
    history: [
      { at: iso(-60), label: "Engagement created", actor: "Venue Sourcer" },
      { at: iso(-45), label: "Quote received", actor: "Venue" },
      { at: iso(-30), label: "Negotiated price agreed", actor: "Venue Sourcer" },
      { at: iso(-10), label: "Final contract signed", actor: "Procurement" },
      { at: iso(-3),  label: "Event completed", actor: "System" },
    ],
  },
  {
    id: "VS-1078",
    eventName: "Annual Leadership Conference",
    venue: "The Grove, Hertfordshire",
    location: "Watford, UK",
    status: "Awaiting Contract",
    initialQuote: 86000,
    negotiatedPrice: 74500,
    finalContractPrice: null,
    concessionsValue: 8200,
    concessions: mkConcessions(["Accommodation", "AV Package", "Meeting Room", "Parking", "WiFi"]),
    commissionPct: 8,
    lastSynced: iso(0),
    createdAt: iso(-35),
    history: [
      { at: iso(-35), label: "Engagement created", actor: "Venue Sourcer" },
      { at: iso(-22), label: "Initial quote received", actor: "Venue" },
      { at: iso(-7),  label: "Negotiated price agreed — awaiting contract", actor: "Venue Sourcer" },
    ],
  },
  {
    id: "VS-1083",
    eventName: "Partner Awards Dinner",
    venue: "The Savoy",
    location: "London, UK",
    status: "In Negotiation",
    initialQuote: 38000,
    negotiatedPrice: null,
    finalContractPrice: null,
    concessionsValue: null,
    concessions: [],
    commissionPct: 7,
    lastSynced: iso(0),
    createdAt: iso(-18),
    history: [
      { at: iso(-18), label: "Engagement created", actor: "Venue Sourcer" },
      { at: iso(-5),  label: "Initial quote received", actor: "Venue" },
    ],
  },
  {
    id: "VS-1090",
    eventName: "Investor Roadshow — Edinburgh",
    venue: "The Balmoral",
    location: "Edinburgh, UK",
    status: "Active",
    initialQuote: null,
    negotiatedPrice: null,
    finalContractPrice: null,
    concessionsValue: null,
    concessions: [],
    lastSynced: iso(0),
    createdAt: iso(-6),
    history: [{ at: iso(-6), label: "Engagement created", actor: "Venue Sourcer" }],
  },
  {
    id: "VS-1031",
    eventName: "Charity Gala",
    venue: "Old Billingsgate",
    location: "London, UK",
    status: "Completed",
    initialQuote: 54000,
    negotiatedPrice: 47800,
    finalContractPrice: 46500,
    concessionsValue: 5100,
    concessions: mkConcessions(["AV Package", "Catering", "Branding", "WiFi"]),
    commissionPct: 9, commissionValue: 4185,
    lastSynced: iso(-2),
    createdAt: iso(-160), completedAt: iso(-30),
    history: [
      { at: iso(-160), label: "Engagement created", actor: "Venue Sourcer" },
      { at: iso(-130), label: "Quote received", actor: "Venue" },
      { at: iso(-100), label: "Negotiated price agreed", actor: "Venue Sourcer" },
      { at: iso(-80),  label: "Final contract signed", actor: "Procurement" },
      { at: iso(-30),  label: "Event completed", actor: "System" },
    ],
  },
];

export const FEEDBACK: FeedbackEntry[] = [
  {
    id: "FB-001", engagementId: "VS-1042",
    venueRating: 9, serviceRating: 10,
    venueNotes: "Outstanding service, exceptional dining experience.",
    comments: "Will definitely use this venue again for executive events.",
    submittedAt: iso(-8), submittedBy: "Elena Voss", syncStatus: "Synced",
  },
  {
    id: "FB-002", engagementId: "VS-1051",
    venueRating: 8, serviceRating: 9,
    venueNotes: "Excellent grounds, slightly slow check-in.",
    comments: "AOK negotiation saved meaningful budget — great work.",
    submittedAt: iso(-12), submittedBy: "Alex Morgan", syncStatus: "Synced",
  },
  {
    id: "FB-003", engagementId: "VS-1031",
    venueRating: 7, serviceRating: 9,
    venueNotes: "Acoustics in main hall needed work.",
    comments: "Concessions package was excellent value.",
    submittedAt: iso(-28), submittedBy: "Priya Desai", syncStatus: "Synced",
  },
];

// --- Selectors / helpers
export const completedEngagements = () =>
  ENGAGEMENTS.filter((e) => e.status === "Completed");

export const pendingFeedbackEngagements = () =>
  completedEngagements().filter((e) => !FEEDBACK.some((f) => f.engagementId === e.id));

export const engagementById = (id: string) =>
  ENGAGEMENTS.find((e) => e.id === id);

export const feedbackByEngagement = (id: string) =>
  FEEDBACK.find((f) => f.engagementId === id);

export const savingsValue = (e: VenueEngagement) => {
  if (e.initialQuote == null) return null;
  const final = e.finalContractPrice ?? e.negotiatedPrice;
  if (final == null) return null;
  return e.initialQuote - final;
};

export const savingsPct = (e: VenueEngagement) => {
  const sv = savingsValue(e);
  if (sv == null || !e.initialQuote) return null;
  return (sv / e.initialQuote) * 100;
};

export const fmtGbp = (n: number | null | undefined) =>
  n == null ? "Pending" : `£${Math.round(n).toLocaleString()}`;

export const fmtPct = (n: number | null | undefined) =>
  n == null ? "Pending" : `${n.toFixed(1)}%`;

export const summariseVenueSourcing = () => {
  const all = ENGAGEMENTS;
  const completed = completedEngagements();
  const totalInitial = all.reduce((s, e) => s + (e.initialQuote ?? 0), 0);
  const totalNegotiated = all.reduce(
    (s, e) => s + (e.negotiatedPrice ?? e.initialQuote ?? 0), 0);
  const totalFinal = all.reduce(
    (s, e) => s + (e.finalContractPrice ?? e.negotiatedPrice ?? 0), 0);
  const totalConcessions = all.reduce((s, e) => s + (e.concessionsValue ?? 0), 0);
  const totalSavings = totalInitial - totalFinal;
  const avgSavingPct = totalInitial ? (totalSavings / totalInitial) * 100 : 0;
  const pendingFeedback = pendingFeedbackEngagements().length;
  const avgVenue = FEEDBACK.length
    ? FEEDBACK.reduce((s, f) => s + f.venueRating, 0) / FEEDBACK.length : 0;
  const avgService = FEEDBACK.length
    ? FEEDBACK.reduce((s, f) => s + f.serviceRating, 0) / FEEDBACK.length : 0;
  return {
    totalEngagements: all.length,
    totalSavings, avgSavingPct,
    completed: completed.length,
    pendingFeedback,
    active: all.filter((e) => e.status !== "Completed" && e.status !== "Cancelled").length,
    totalInitial, totalNegotiated, totalFinal, totalConcessions,
    feedbackSubmitted: FEEDBACK.length,
    avgVenueRating: avgVenue, avgServiceRating: avgService,
  };
};
