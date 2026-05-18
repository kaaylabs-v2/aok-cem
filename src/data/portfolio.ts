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
  type: "Premier League" | "BBC Proms" | "Classical Concert" | "Conference" | "Workshop" | "Networking" | "Webinar" | "Gala";
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
  { id: "e1", name: "Chelsea vs Arsenal", venue: "Stamford Bridge, London", date: d(4, 15), asset: "Hospitality Suite", capacity: 320, booked: 286, waitlist: 24, wishlist: 41, type: "Premier League", status: "partial" },
  { id: "e2", name: "Arsenal vs Tottenham Hotspur", venue: "Emirates Stadium, London", date: d(9, 17), asset: "Diamond Club", capacity: 500, booked: 500, waitlist: 87, wishlist: 130, type: "Premier League", status: "full" },
  { id: "e3", name: "Leeds United vs Manchester United", venue: "Elland Road, Leeds", date: d(2, 15), asset: "Norman Hunter Suite", capacity: 60, booked: 22, waitlist: 0, wishlist: 6, type: "Premier League", status: "partial" },
  { id: "e4", name: "Tottenham Hotspur vs Chelsea", venue: "Tottenham Hotspur Stadium, London", date: d(11, 17), asset: "The H Club", capacity: 120, booked: 38, waitlist: 0, wishlist: 12, type: "Premier League", status: "available" },
  { id: "e5", name: "Manchester United vs Arsenal", venue: "Old Trafford, Manchester", date: d(7, 15), asset: "Evolution Suite", capacity: 1000, booked: 720, waitlist: 0, wishlist: 88, type: "Premier League", status: "partial" },
  { id: "e6", name: "Last Night of the Proms", venue: "Royal Albert Hall, London", date: d(20, 19), asset: "Grand Tier Box", capacity: 220, booked: 198, waitlist: 12, wishlist: 30, type: "BBC Proms", status: "partial" },
  { id: "e7", name: "Arsenal vs Leeds United", venue: "Emirates Stadium, London", date: d(13, 15), asset: "Woolwich Suite", capacity: 40, booked: 14, waitlist: 0, wishlist: 3, type: "Premier League", status: "available" },
  { id: "e8", name: "Chelsea vs Manchester United", venue: "Stamford Bridge, London", date: d(5, 17), asset: "Tambling Suite", capacity: 80, booked: 80, waitlist: 16, wishlist: 22, type: "Premier League", status: "waitlisted" },
  { id: "e9", name: "Leeds United vs Tottenham Hotspur", venue: "Elland Road, Leeds", date: d(28, 15), asset: "Howard Wilkinson Suite", capacity: 90, booked: 0, waitlist: 0, wishlist: 4, type: "Premier League", status: "cancelled" },
  { id: "e10", name: "An Evening with the London Symphony Orchestra", venue: "Royal Albert Hall, London", date: d(-12, 19), asset: "Loggia Box", capacity: 250, booked: 211, waitlist: 0, wishlist: 0, type: "Classical Concert", status: "partial", past: true },
  { id: "e11", name: "Chelsea vs Arsenal", venue: "Stamford Bridge, London", date: d(-30, 15), asset: "Westview Suite", capacity: 600, booked: 540, waitlist: 0, wishlist: 0, type: "Premier League", status: "partial", past: true },
  { id: "e12", name: "Arsenal vs Tottenham Hotspur", venue: "Emirates Stadium, London", date: d(6, 17), asset: "Foundry Box", capacity: 60, booked: 47, waitlist: 4, wishlist: 18, type: "Premier League", status: "partial" },
  { id: "e13", name: "Manchester United vs Arsenal", venue: "Old Trafford, Manchester", date: d(18, 15), asset: "Premier Suite", capacity: 800, booked: 612, waitlist: 0, wishlist: 95, type: "Premier League", status: "partial" },
  { id: "e14", name: "Last Night of the Proms", venue: "Royal Albert Hall, London", date: d(25, 19), asset: "Second Tier Box", capacity: 180, booked: 180, waitlist: 22, wishlist: 64, type: "BBC Proms", status: "full" },
  { id: "e15", name: "Leeds United vs Manchester United", venue: "Elland Road, Leeds", date: d(10, 15), asset: "Captains Lounge", capacity: 50, booked: 31, waitlist: 0, wishlist: 11, type: "Premier League", status: "partial" },
  { id: "e16", name: "Tottenham Hotspur vs Chelsea", venue: "Tottenham Hotspur Stadium, London", date: d(33, 17), asset: "The On Three", capacity: 400, booked: 124, waitlist: 0, wishlist: 28, type: "Premier League", status: "available" },
  { id: "e17", name: "Arsenal vs Leeds United", venue: "Emirates Stadium, London", date: d(3, 15), asset: "Heritage Box", capacity: 30, booked: 28, waitlist: 6, wishlist: 9, type: "Premier League", status: "waitlisted" },
  { id: "e18", name: "Chelsea vs Manchester United", venue: "Stamford Bridge, London", date: d(14, 17), asset: "Drake Suite", capacity: 1500, booked: 980, waitlist: 0, wishlist: 142, type: "Premier League", status: "partial" },
  { id: "e19", name: "An Evening with the London Symphony Orchestra", venue: "Royal Albert Hall, London", date: d(22, 19), asset: "Grand Tier Box", capacity: 350, booked: 289, waitlist: 11, wishlist: 47, type: "Classical Concert", status: "partial" },
  { id: "e20", name: "Leeds United vs Tottenham Hotspur", venue: "Elland Road, Leeds", date: d(8, 15), asset: "1919 Club", capacity: 220, booked: 198, waitlist: 8, wishlist: 33, type: "Premier League", status: "partial" },
  { id: "e21", name: "Manchester United vs Arsenal", venue: "Old Trafford, Manchester", date: d(15, 17), asset: "Treble Lounge", capacity: 140, booked: 52, waitlist: 0, wishlist: 19, type: "Premier League", status: "available" },
  { id: "e22", name: "Arsenal vs Tottenham Hotspur", venue: "Emirates Stadium, London", date: d(27, 15), asset: "Club Level", capacity: 45, booked: 12, waitlist: 0, wishlist: 5, type: "Premier League", status: "available" },
  { id: "e23", name: "Last Night of the Proms", venue: "Royal Albert Hall, London", date: d(40, 19), asset: "Arena Box", capacity: 260, booked: 220, waitlist: 14, wishlist: 38, type: "BBC Proms", status: "partial" },
  { id: "e24", name: "Chelsea vs Arsenal", venue: "Stamford Bridge, London", date: d(2, 15), asset: "Millennium Suite", capacity: 800, booked: 612, waitlist: 0, wishlist: 71, type: "Premier League", status: "partial" },
  { id: "e25", name: "Tottenham Hotspur vs Chelsea", venue: "Tottenham Hotspur Stadium, London", date: d(45, 17), asset: "The Sky Lounge", capacity: 500, booked: 88, waitlist: 0, wishlist: 22, type: "Premier League", status: "available" },
  { id: "e26", name: "Arsenal vs Leeds United", venue: "Emirates Stadium, London", date: d(12, 17), asset: "Directors Box", capacity: 35, booked: 35, waitlist: 7, wishlist: 12, type: "Premier League", status: "full" },
  { id: "e27", name: "Leeds United vs Manchester United", venue: "Elland Road, Leeds", date: d(19, 15), asset: "Centenary Pavilion", capacity: 70, booked: 41, waitlist: 0, wishlist: 14, type: "Premier League", status: "partial" },
  { id: "e28", name: "Chelsea vs Manchester United", venue: "Stamford Bridge, London", date: d(50, 17), asset: "Galleria Suite", capacity: 600, booked: 420, waitlist: 0, wishlist: 56, type: "Premier League", status: "partial" },
  { id: "e29", name: "An Evening with the London Symphony Orchestra", venue: "Royal Albert Hall, London", date: d(35, 19), asset: "Second Tier Box", capacity: 2000, booked: 1340, waitlist: 0, wishlist: 188, type: "Classical Concert", status: "partial" },
  { id: "e30", name: "Manchester United vs Arsenal", venue: "Old Trafford, Manchester", date: d(17, 15), asset: "Sir Bobby Charlton Suite", capacity: 90, booked: 76, waitlist: 5, wishlist: 24, type: "Premier League", status: "partial" },
  { id: "e31", name: "Arsenal vs Tottenham Hotspur", venue: "Emirates Stadium, London", date: d(-5, 17), asset: "Diamond Club", capacity: 450, booked: 398, waitlist: 0, wishlist: 0, type: "Premier League", status: "partial", past: true },
  { id: "e32", name: "Last Night of the Proms", venue: "Royal Albert Hall, London", date: d(-18, 19), asset: "Grand Tier Box", capacity: 200, booked: 192, waitlist: 0, wishlist: 0, type: "BBC Proms", status: "partial", past: true },
  { id: "e33", name: "Leeds United vs Tottenham Hotspur", venue: "Elland Road, Leeds", date: d(-8, 15), asset: "Howard Wilkinson Suite", capacity: 300, booked: 248, waitlist: 0, wishlist: 0, type: "Premier League", status: "partial", past: true },
  { id: "e34", name: "Tottenham Hotspur vs Chelsea", venue: "Tottenham Hotspur Stadium, London", date: d(60, 17), asset: "The H Club", capacity: 700, booked: 156, waitlist: 0, wishlist: 41, type: "Premier League", status: "available" },
  { id: "e35", name: "Cancelled — Chelsea vs Arsenal", venue: "Stamford Bridge, London", date: d(38, 15), asset: "Hospitality Suite", capacity: 500, booked: 0, waitlist: 0, wishlist: 8, type: "Premier League", status: "cancelled" },
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

export type EnquiryType =
  | "Corporate Hospitality"
  | "Tickets"
  | "Private Dining"
  | "Bespoke Events"
  | "Venue Find"
  | "Entertainment"
  | "Anything Else";

export const enquiryTypes: EnquiryType[] = [
  "Corporate Hospitality",
  "Tickets",
  "Private Dining",
  "Bespoke Events",
  "Venue Find",
  "Entertainment",
  "Anything Else",
];

export interface Enquiry {
  id: string;
  ref: string; // ENQ-1023
  eventType: EnquiryType;
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
    eventType: "Corporate Hospitality",
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
    documents: [
      { id: "doc1", name: "Proposal_Aurora_Hall.pdf", type: "pdf", size: "1.8 MB", uploadedBy: "AOK London", uploadedAt: d(-1, 14) },
      { id: "doc2", name: "Venue_Floorplan.pdf", type: "pdf", size: "640 KB", uploadedBy: "AOK London", uploadedAt: d(-1, 14) },
      { id: "doc3", name: "Catering_Menu.pdf", type: "pdf", size: "420 KB", uploadedBy: "AOK London", uploadedAt: d(-1, 14) },
      { id: "doc4", name: "Cost_Breakdown.xlsx", type: "xlsx", size: "85 KB", uploadedBy: "AOK London", uploadedAt: d(-1, 14) },
    ],
  },
  {
    id: "q2",
    ref: "ENQ-1024",
    eventType: "Bespoke Events",
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
    eventType: "Private Dining",
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
    eventType: "Entertainment",
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
    eventType: "Anything Else",
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
