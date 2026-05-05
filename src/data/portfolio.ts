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
