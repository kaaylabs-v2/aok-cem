export type EventStatus = "available" | "partial" | "full" | "waitlisted" | "cancelled";

export interface PortfolioEvent {
  id: string;
  name: string;
  venue: string;
  date: string; // ISO
  asset: string;
  capacity: number;
  booked: number;
  waitlist: number;
  wishlist: number;
  type: "Conference" | "Workshop" | "Networking" | "Webinar" | "Gala";
  status: EventStatus;
  past?: boolean;
}

const today = new Date();
const d = (offsetDays: number, hour = 18) => {
  const date = new Date(today);
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

export const events: PortfolioEvent[] = [
  { id: "e1", name: "Quarterly Leadership Forum", venue: "Aurora Hall, London", date: d(4, 9), asset: "Main Auditorium", capacity: 320, booked: 286, waitlist: 24, wishlist: 41, type: "Conference", status: "partial" },
  { id: "e2", name: "AI in Finance Summit", venue: "Skyline Center, NYC", date: d(9, 10), asset: "Grand Ballroom", capacity: 500, booked: 500, waitlist: 87, wishlist: 130, type: "Conference", status: "full" },
  { id: "e3", name: "Product Design Workshop", venue: "Loft Studio, Berlin", date: d(2, 14), asset: "Studio A", capacity: 60, booked: 22, waitlist: 0, wishlist: 6, type: "Workshop", status: "partial" },
  { id: "e4", name: "Founders Networking Night", venue: "Rooftop 22, Lisbon", date: d(11, 19), asset: "Terrace Deck", capacity: 120, booked: 38, waitlist: 0, wishlist: 12, type: "Networking", status: "available" },
  { id: "e5", name: "Cybersecurity Webinar", venue: "Online", date: d(7, 16), asset: "Virtual Stage", capacity: 1000, booked: 720, waitlist: 0, wishlist: 88, type: "Webinar", status: "partial" },
  { id: "e6", name: "Annual Investor Gala", venue: "The Pierre, NYC", date: d(20, 19), asset: "Cotillion Room", capacity: 220, booked: 198, waitlist: 12, wishlist: 30, type: "Gala", status: "partial" },
  { id: "e7", name: "DevOps Bootcamp", venue: "TechHub, Dublin", date: d(13, 9), asset: "Lab 1", capacity: 40, booked: 14, waitlist: 0, wishlist: 3, type: "Workshop", status: "available" },
  { id: "e8", name: "Sustainability Roundtable", venue: "Greenhouse, Amsterdam", date: d(5, 13), asset: "Atrium", capacity: 80, booked: 80, waitlist: 16, wishlist: 22, type: "Networking", status: "waitlisted" },
  { id: "e9", name: "Brand Strategy Masterclass", venue: "Atelier 9, Paris", date: d(28, 10), asset: "Salon Rouge", capacity: 90, booked: 0, waitlist: 0, wishlist: 4, type: "Workshop", status: "cancelled" },
  { id: "e10", name: "Retail Innovation Day", venue: "Westfield, London", date: d(-12, 11), asset: "Conference Wing", capacity: 250, booked: 211, waitlist: 0, wishlist: 0, type: "Conference", status: "partial", past: true },
  { id: "e11", name: "Healthcare AI Panel", venue: "Online", date: d(-30, 15), asset: "Virtual Stage", capacity: 600, booked: 540, waitlist: 0, wishlist: 0, type: "Webinar", status: "partial", past: true },
];

export const venues = Array.from(new Set(events.map((e) => e.venue)));
export const eventTypes = Array.from(new Set(events.map((e) => e.type)));

export const utilisation = (e: PortfolioEvent) => (e.capacity ? Math.round((e.booked / e.capacity) * 100) : 0);

export const utilisationTone = (pct: number): "success" | "warning" | "destructive" => {
  if (pct >= 70) return "success";
  if (pct >= 40) return "warning";
  return "destructive";
};

export const isUnderperforming = (e: PortfolioEvent) => {
  if (e.past || e.status === "cancelled") return false;
  const days = Math.ceil((new Date(e.date).getTime() - Date.now()) / 86400000);
  return utilisation(e) < 50 && days <= 14 && days >= 0;
};

export interface NotificationItem {
  id: string;
  type: "inventory" | "underperform" | "waitlist";
  title: string;
  body: string;
  time: string;
  unread: boolean;
  eventId?: string;
}

export const notifications: NotificationItem[] = [
  { id: "n1", type: "inventory", title: "New inventory uploaded", body: "Skyline Center released 3 new ballrooms.", time: "5m ago", unread: true },
  { id: "n2", type: "underperform", title: "Underperforming: Founders Networking Night", body: "32% utilisation, 11 days remaining.", time: "1h ago", unread: true, eventId: "e4" },
  { id: "n3", type: "waitlist", title: "Waitlist update", body: "12 new requests for AI in Finance Summit.", time: "3h ago", unread: true, eventId: "e2" },
  { id: "n4", type: "inventory", title: "Inventory pending review", body: "Loft Studio Berlin awaits approval.", time: "Yesterday", unread: false },
];

export interface WaitlistRequest {
  id: string;
  eventId: string;
  name: string;
  requested: string;
  justification: string;
  status: "pending" | "approved" | "rejected";
}

export const waitlist: WaitlistRequest[] = [
  { id: "w1", eventId: "e2", name: "Amelia Hart", requested: "2 days ago", justification: "Leading client delegation; key strategic relationship.", status: "pending" },
  { id: "w2", eventId: "e2", name: "Marcus Chen", requested: "2 days ago", justification: "Speaking on adjacent panel; networking critical.", status: "pending" },
  { id: "w3", eventId: "e2", name: "Priya Raman", requested: "1 day ago", justification: "Regional VP — mandatory leadership presence.", status: "pending" },
  { id: "w4", eventId: "e8", name: "Tom Beckett", requested: "3 days ago", justification: "ESG team representative.", status: "pending" },
];

/* ---------- Enquiries ---------- */
export type EnquiryStatus =
  | "submitted"
  | "in_progress"
  | "proposal_received"
  | "accepted"
  | "declined"
  | "cancelled"
  | "pending_approval";

export interface EnquiryTimelineEvent {
  status: EnquiryStatus;
  at: string;
  note?: string;
}

export interface Enquiry {
  id: string;
  ref: string; // ENQ-1023
  eventType: PortfolioEvent["type"];
  preferredDates: string[]; // ISO
  guests: number;
  budget: number; // USD
  location: string;
  notes: string;
  audience: "business" | "personal";
  status: EnquiryStatus;
  submittedBy: string;
  submittedAt: string; // ISO
  updatedAt: string; // ISO
  lastSyncedAt?: string; // ISO
  timeline: EnquiryTimelineEvent[];
  aokNotes: string;
  activity: { at: string; text: string }[];
  documents?: EnquiryDocument[];
}

export interface EnquiryDocument {
  id: string;
  name: string;
  type: "pdf" | "docx" | "xlsx" | "image";
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

export const ENQUIRY_STATUS_LABEL: Record<EnquiryStatus, string> = {
  submitted: "Submitted",
  in_progress: "In Progress",
  proposal_received: "Proposal Received",
  accepted: "Accepted",
  declined: "Declined",
  cancelled: "Cancelled",
  pending_approval: "Pending Approval",
};

export const enquiries: Enquiry[] = [
  {
    id: "q1",
    ref: "ENQ-1023",
    eventType: "Conference",
    preferredDates: [d(35, 9), d(42, 9)],
    guests: 180,
    budget: 45000,
    location: "London",
    notes: "Annual partner summit; hybrid streaming required.",
    audience: "business",
    status: "proposal_received",
    submittedBy: "Elena Rossi",
    submittedAt: d(-9, 11),
    updatedAt: d(-1, 14),
    lastSyncedAt: d(0, 8),
    timeline: [
      { status: "submitted", at: d(-9, 11) },
      { status: "in_progress", at: d(-7, 10), note: "Assigned to AOK London team." },
      { status: "proposal_received", at: d(-1, 14), note: "Two venue options proposed." },
    ],
    aokNotes: "Aurora Hall available on both dates. Awaiting catering quote.",
    activity: [
      { at: d(-9, 11), text: "Enquiry submitted by Elena Rossi" },
      { at: d(-7, 10), text: "Status changed to In Progress" },
      { at: d(-1, 14), text: "Proposal received from AOK" },
    ],
  },
  {
    id: "q2",
    ref: "ENQ-1024",
    eventType: "Workshop",
    preferredDates: [d(20, 14)],
    guests: 35,
    budget: 8000,
    location: "Berlin",
    notes: "Design thinking workshop, full-day.",
    audience: "business",
    status: "in_progress",
    submittedBy: "Marcus Chen",
    submittedAt: d(-4, 9),
    updatedAt: d(-2, 16),
    lastSyncedAt: d(0, 8),
    timeline: [
      { status: "submitted", at: d(-4, 9) },
      { status: "in_progress", at: d(-2, 16) },
    ],
    aokNotes: "",
    activity: [
      { at: d(-4, 9), text: "Enquiry submitted by Marcus Chen" },
      { at: d(-2, 16), text: "Status changed to In Progress" },
    ],
  },
  {
    id: "q3",
    ref: "ENQ-1025",
    eventType: "Gala",
    preferredDates: [d(60, 19)],
    guests: 220,
    budget: 120000,
    location: "New York",
    notes: "Investor gala, black-tie.",
    audience: "business",
    status: "submitted",
    submittedBy: "Priya Raman",
    submittedAt: d(0, 10),
    updatedAt: d(0, 10),
    timeline: [{ status: "submitted", at: d(0, 10) }],
    aokNotes: "",
    activity: [{ at: d(0, 10), text: "Enquiry submitted by Priya Raman" }],
  },
  {
    id: "q4",
    ref: "ENQ-1026",
    eventType: "Networking",
    preferredDates: [d(15, 19)],
    guests: 80,
    budget: 12000,
    location: "Lisbon",
    notes: "Founders mixer, rooftop preferred.",
    audience: "business",
    status: "accepted",
    submittedBy: "Tom Beckett",
    submittedAt: d(-20, 12),
    updatedAt: d(-3, 11),
    timeline: [
      { status: "submitted", at: d(-20, 12) },
      { status: "in_progress", at: d(-18, 9) },
      { status: "proposal_received", at: d(-10, 15) },
      { status: "accepted", at: d(-3, 11) },
    ],
    aokNotes: "Rooftop 22 confirmed.",
    activity: [
      { at: d(-20, 12), text: "Enquiry submitted by Tom Beckett" },
      { at: d(-3, 11), text: "Proposal accepted" },
    ],
  },
  {
    id: "q5",
    ref: "ENQ-1027",
    eventType: "Webinar",
    preferredDates: [d(8, 16)],
    guests: 500,
    budget: 4000,
    location: "Online",
    notes: "Product launch webinar.",
    audience: "business",
    status: "declined",
    submittedBy: "Amelia Hart",
    submittedAt: d(-30, 9),
    updatedAt: d(-25, 10),
    timeline: [
      { status: "submitted", at: d(-30, 9) },
      { status: "in_progress", at: d(-28, 10) },
      { status: "proposal_received", at: d(-26, 9) },
      { status: "declined", at: d(-25, 10), note: "Pricing out of budget." },
    ],
    aokNotes: "Client declined on cost grounds.",
    activity: [{ at: d(-25, 10), text: "Proposal declined" }],
  },
];
