// Frontend mock dataset for Compliance Reporting module.
// Tenant-scoped, in-memory only. Cross-pillar: combines inventory, enquiry,
// and venue-sourced events into a single guest-per-booking row model.

export type ReportBookingStatus =
  | "Booked"
  | "Confirmed"
  | "In Negotiation"
  | "Cancelled"
  | "Waitlisted"
  | "Proposal Received"
  | "Declined";

export type ReportSource = "Inventory" | "Enquiry" | "Venue";
export type ReportEventType = "Conference" | "Workshop" | "Networking" | "Webinar" | "Gala" | "Hospitality" | "Sports";
export type ReportBookingType = "Corporate" | "Client Entertainment" | "Internal" | "Partner" | "Charity";

export interface ComplianceRow {
  id: string;
  hostName: string;
  hostTeam: string;
  guestName: string;
  guestCompany: string;
  guestEmail: string;
  eventId: string;
  eventName: string;
  eventDate: string; // ISO
  eventType: ReportEventType;
  bookingType: ReportBookingType;
  bookingStatus: ReportBookingStatus;
  costPerPerson?: number; // optional — may be blank
  source: ReportSource;
  notes?: string;
}

export interface ScheduledReport {
  id: string;
  name: string;
  recipients: string[];
  frequency: "Daily" | "Weekly" | "Monthly" | "Quarterly";
  nextRun: string; // ISO
}

export interface SavedTemplate {
  id: string;
  name: string;
  description: string;
  filters: Partial<ReportFilters>;
}

export interface ReportFilters {
  query: string;
  hostName: string;
  guestName: string;
  guestCompany: string;
  eventType: string;
  bookingType: string;
  bookingStatus: string;
  source: string;
  costMin: string;
  costMax: string;
  from: string; // ISO date
  to: string; // ISO date
}

export const STATUS_CHIP: Record<ReportBookingStatus, string> = {
  "Booked": "bg-[hsl(220_85%_94%)] text-[hsl(220_85%_40%)]",
  "Confirmed": "bg-[hsl(140_55%_92%)] text-[hsl(140_55%_30%)]",
  "In Negotiation": "bg-[hsl(45_95%_92%)] text-[hsl(35_85%_40%)]",
  "Cancelled": "bg-[hsl(220_10%_92%)] text-[hsl(220_10%_40%)]",
  "Waitlisted": "bg-[hsl(280_70%_94%)] text-[hsl(280_60%_45%)]",
  "Proposal Received": "bg-[hsl(195_75%_92%)] text-[hsl(195_75%_35%)]",
  "Declined": "bg-[hsl(0_75%_94%)] text-[hsl(0_75%_45%)]",
};

export const SOURCE_CHIP: Record<ReportSource, string> = {
  Inventory: "bg-[hsl(220_15%_94%)] text-[hsl(220_15%_30%)]",
  Enquiry: "bg-[hsl(260_50%_94%)] text-[hsl(260_50%_40%)]",
  Venue: "bg-[hsl(170_50%_92%)] text-[hsl(170_55%_30%)]",
};

const today = new Date();
const day = (offset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  d.setHours(18, 0, 0, 0);
  return d.toISOString();
};

const HOSTS = [
  { name: "Alex Morgan", team: "Capital Markets" },
  { name: "Priya Desai", team: "Investment Banking" },
  { name: "Jordan Reeves", team: "Wealth Management" },
  { name: "Sofia Nakamura", team: "Equity Research" },
  { name: "Marcus Bell", team: "Corporate Banking" },
  { name: "Helena Vasquez", team: "Sales & Trading" },
];

const GUESTS = [
  { name: "Priya Shah", company: "Northwind Capital", email: "priya.shah@northwind.io" },
  { name: "Marco Bianchi", company: "Helio Partners", email: "marco@helio.co" },
  { name: "Yuki Tanaka", company: "Orbital Asset Mgmt", email: "yuki.t@orbital.jp" },
  { name: "Liam Carter", company: "Vellum Industries", email: "liam.carter@vellum.com" },
  { name: "Aisha Rahman", company: "Brightstack", email: "aisha@brightstack.io" },
  { name: "Diego Alvarez", company: "Cobalt Group", email: "diego@cobaltgroup.es" },
  { name: "Hannah Müller", company: "Nordwerk AG", email: "hannah.m@nordwerk.de" },
  { name: "Noor El-Sayed", company: "Mosaic Holdings", email: "noor@mosaic.co" },
  { name: "Felix Brandt", company: "Axiom Partners", email: "felix.b@axiompartners.com" },
  { name: "Mia Laurent", company: "Parallax Ventures", email: "mia.laurent@parallax.fr" },
  { name: "Owen Walsh", company: "Redline Capital", email: "owen.walsh@redline.ie" },
  { name: "Sara Klein", company: "Lumen Advisors", email: "sara@lumen.co" },
];

const EVENTS: { name: string; type: ReportEventType; date: string; cost?: number; source: ReportSource; bookingType: ReportBookingType; status: ReportBookingStatus }[] = [
  { name: "Wimbledon Centre Court Hospitality", type: "Sports", date: day(12), cost: 2400, source: "Inventory", bookingType: "Client Entertainment", status: "Confirmed" },
  { name: "Royal Opera House — Box 14", type: "Hospitality", date: day(8), cost: 850, source: "Inventory", bookingType: "Client Entertainment", status: "Booked" },
  { name: "Quarterly Leadership Forum", type: "Conference", date: day(4), cost: 320, source: "Inventory", bookingType: "Corporate", status: "Confirmed" },
  { name: "AI in Finance Summit", type: "Conference", date: day(9), cost: 1100, source: "Enquiry", bookingType: "Corporate", status: "Confirmed" },
  { name: "Founders Networking Night", type: "Networking", date: day(11), cost: 180, source: "Inventory", bookingType: "Partner", status: "Booked" },
  { name: "Annual Investor Gala", type: "Gala", date: day(20), cost: 1850, source: "Venue", bookingType: "Client Entertainment", status: "In Negotiation" },
  { name: "Six Nations Twickenham Suite", type: "Sports", date: day(-15), cost: 1950, source: "Inventory", bookingType: "Client Entertainment", status: "Confirmed" },
  { name: "Glyndebourne Summer Festival", type: "Hospitality", date: day(35), cost: 1200, source: "Venue", bookingType: "Client Entertainment", status: "Proposal Received" },
  { name: "Henley Royal Regatta — Stewards", type: "Hospitality", date: day(40), cost: 980, source: "Venue", bookingType: "Client Entertainment", status: "In Negotiation" },
  { name: "Sustainability Roundtable", type: "Networking", date: day(5), cost: 0, source: "Enquiry", bookingType: "Internal", status: "Confirmed" },
  { name: "Cybersecurity Webinar", type: "Webinar", date: day(7), source: "Inventory", bookingType: "Internal", status: "Confirmed" },
  { name: "Charity Auction Dinner", type: "Gala", date: day(25), cost: 600, source: "Venue", bookingType: "Charity", status: "Booked" },
  { name: "Retail Innovation Day", type: "Conference", date: day(-12), cost: 420, source: "Enquiry", bookingType: "Corporate", status: "Confirmed" },
  { name: "Goodwood Festival of Speed", type: "Sports", date: day(45), cost: 1450, source: "Inventory", bookingType: "Client Entertainment", status: "Waitlisted" },
  { name: "F1 Silverstone Paddock Club", type: "Sports", date: day(-25), cost: 3200, source: "Inventory", bookingType: "Client Entertainment", status: "Confirmed" },
  { name: "Private Wine Tasting — Mayfair", type: "Hospitality", date: day(15), cost: 450, source: "Venue", bookingType: "Client Entertainment", status: "Declined" },
];

let seq = 0;
const rid = () => `r${(++seq).toString().padStart(4, "0")}`;

export const complianceRows: ComplianceRow[] = (() => {
  const rows: ComplianceRow[] = [];
  EVENTS.forEach((ev, ei) => {
    // Each event gets between 3 and 8 guests; one row per guest per booking.
    const count = 3 + ((ei * 7) % 6);
    for (let i = 0; i < count; i++) {
      const guest = GUESTS[(ei * 3 + i) % GUESTS.length];
      const host = HOSTS[(ei + i) % HOSTS.length];
      rows.push({
        id: rid(),
        hostName: host.name,
        hostTeam: host.team,
        guestName: guest.name,
        guestCompany: guest.company,
        guestEmail: guest.email,
        eventId: `ev-${ei}`,
        eventName: ev.name,
        eventDate: ev.date,
        eventType: ev.type,
        bookingType: ev.bookingType,
        bookingStatus: ev.status,
        costPerPerson: ev.cost,
        source: ev.source,
      });
    }
  });
  return rows;
})();

export const scheduledReports: ScheduledReport[] = [
  { id: "s1", name: "Weekly Compliance Digest", recipients: ["compliance@firm.com", "alex.morgan@firm.com"], frequency: "Weekly", nextRun: day(2) },
  { id: "s2", name: "Monthly Hospitality Audit", recipients: ["audit@firm.com"], frequency: "Monthly", nextRun: day(14) },
  { id: "s3", name: "Quarterly Procurement Review", recipients: ["procurement@firm.com", "cfo@firm.com"], frequency: "Quarterly", nextRun: day(45) },
];

export const savedTemplates: SavedTemplate[] = [
  { id: "t1", name: "Q1 Compliance Review", description: "All client entertainment events in Q1", filters: { bookingType: "Client Entertainment" } },
  { id: "t2", name: "High Spend Guests", description: "Cost per person ≥ £1,000", filters: { costMin: "1000" } },
  { id: "t3", name: "Entertainment Frequency Audit", description: "Hospitality & Sports events only", filters: { eventType: "Sports" } },
];

// Optional retention filter — drop very old records (mock: > 365 days)
export const isRetained = (iso: string) => Date.now() - new Date(iso).getTime() < 365 * 86400000 * 2;
