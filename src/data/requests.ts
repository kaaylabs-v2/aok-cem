// Frontend mock store for booking requests (pre-approval).
// Tenant-scoped, per-event, in-memory only.

import { useEffect, useState } from "react";

export type Seniority = "Partner" | "Director" | "VP" | "Manager" | "Associate";
export type Priority = "High" | "Medium" | "Low";
export type RequestStatus = "pending" | "approved" | "declined";
export type RiskFlag =
  | "low_acceptance"
  | "frequent_requester"
  | "requires_review"
  | "premium_low_seniority";

export interface BookingRequest {
  id: string;
  eventId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  company: string;
  requestedFor: string; // guest name being booked for (may equal requester)
  requestedAt: string; // ISO
  seniority: Seniority;
  position: string;
  usageScore: number; // 0-100
  acceptanceRate: number; // 0-100
  priority: Priority;
  status: RequestStatus;
  flags: RiskFlag[];
  declineReason?: string;
  // History
  previousBookings: number;
  previousRequests: number;
  noShows: number;
  attendanceSummary: string;
  usageHistory: { month: string; score: number }[];
}

const uid = () => Math.random().toString(36).slice(2, 10);

const POOL: Omit<BookingRequest, "id" | "eventId" | "requestedAt" | "status" | "declineReason">[] = [
  { firstName: "Sarah", lastName: "Johnson", email: "sarah.j@meridian.com", department: "Corporate Banking", company: "Meridian Capital", requestedFor: "Sarah Johnson", seniority: "Director", position: "Managing Director", usageScore: 92, acceptanceRate: 95, priority: "High", flags: [], previousBookings: 18, previousRequests: 22, noShows: 0, attendanceSummary: "100% attendance over past 12 months", usageHistory: [{ month: "Jan", score: 88 }, { month: "Feb", score: 90 }, { month: "Mar", score: 92 }] },
  { firstName: "Daniel", lastName: "Reeves", email: "d.reeves@blackoak.io", department: "Investment Banking", company: "BlackOak Partners", requestedFor: "Daniel Reeves", seniority: "VP", position: "Vice President", usageScore: 78, acceptanceRate: 82, priority: "Medium", flags: [], previousBookings: 12, previousRequests: 15, noShows: 1, attendanceSummary: "93% attendance", usageHistory: [{ month: "Jan", score: 72 }, { month: "Feb", score: 75 }, { month: "Mar", score: 78 }] },
  { firstName: "Priya", lastName: "Shah", email: "priya.shah@northwind.io", department: "Wealth Management", company: "Northwind", requestedFor: "Priya Shah", seniority: "Partner", position: "Senior Partner", usageScore: 95, acceptanceRate: 98, priority: "High", flags: [], previousBookings: 27, previousRequests: 28, noShows: 0, attendanceSummary: "100% attendance, 5 referrals", usageHistory: [{ month: "Jan", score: 94 }, { month: "Feb", score: 95 }, { month: "Mar", score: 95 }] },
  { firstName: "Tom", lastName: "Hayes", email: "tom.h@everline.com", department: "Markets", company: "Everline", requestedFor: "Tom Hayes", seniority: "Associate", position: "Associate Analyst", usageScore: 43, acceptanceRate: 41, priority: "Low", flags: ["low_acceptance", "premium_low_seniority"], previousBookings: 2, previousRequests: 11, noShows: 3, attendanceSummary: "55% attendance — 3 no-shows", usageHistory: [{ month: "Jan", score: 50 }, { month: "Feb", score: 46 }, { month: "Mar", score: 43 }] },
  { firstName: "Hannah", lastName: "Müller", email: "hannah.m@nordwerk.de", department: "Private Banking", company: "Nordwerk", requestedFor: "Hannah Müller", seniority: "Manager", position: "Relationship Manager", usageScore: 71, acceptanceRate: 80, priority: "Medium", flags: [], previousBookings: 9, previousRequests: 11, noShows: 0, attendanceSummary: "98% attendance", usageHistory: [{ month: "Jan", score: 68 }, { month: "Feb", score: 70 }, { month: "Mar", score: 71 }] },
  { firstName: "Marco", lastName: "Bianchi", email: "marco@helio.co", department: "M&A Advisory", company: "Helio", requestedFor: "Marco Bianchi", seniority: "Director", position: "Director, M&A", usageScore: 86, acceptanceRate: 89, priority: "High", flags: ["frequent_requester"], previousBookings: 16, previousRequests: 24, noShows: 1, attendanceSummary: "94% attendance — high request volume", usageHistory: [{ month: "Jan", score: 82 }, { month: "Feb", score: 84 }, { month: "Mar", score: 86 }] },
  { firstName: "Eva", lastName: "Novak", email: "eva.novak@kestrel.cz", department: "Equity Research", company: "Kestrel", requestedFor: "Eva Novak", seniority: "VP", position: "VP, Research", usageScore: 81, acceptanceRate: 90, priority: "Medium", flags: [], previousBookings: 13, previousRequests: 14, noShows: 0, attendanceSummary: "100% attendance", usageHistory: [{ month: "Jan", score: 78 }, { month: "Feb", score: 80 }, { month: "Mar", score: 81 }] },
  { firstName: "James", lastName: "O'Connor", email: "james.oc@blueharbor.com", department: "Sales & Trading", company: "Blue Harbor", requestedFor: "James O'Connor", seniority: "Manager", position: "Sales Manager", usageScore: 58, acceptanceRate: 62, priority: "Low", flags: ["requires_review"], previousBookings: 6, previousRequests: 10, noShows: 1, attendanceSummary: "85% attendance", usageHistory: [{ month: "Jan", score: 55 }, { month: "Feb", score: 57 }, { month: "Mar", score: 58 }] },
  { firstName: "Aisha", lastName: "Rahman", email: "aisha@brightstack.io", department: "Asset Management", company: "Brightstack", requestedFor: "Aisha Rahman", seniority: "Director", position: "Portfolio Director", usageScore: 88, acceptanceRate: 93, priority: "High", flags: [], previousBookings: 19, previousRequests: 21, noShows: 0, attendanceSummary: "100% attendance", usageHistory: [{ month: "Jan", score: 85 }, { month: "Feb", score: 86 }, { month: "Mar", score: 88 }] },
  { firstName: "Liam", lastName: "Carter", email: "liam.carter@vellum.com", department: "Structured Finance", company: "Vellum", requestedFor: "Liam Carter", seniority: "Associate", position: "Junior Associate", usageScore: 37, acceptanceRate: 48, priority: "Low", flags: ["low_acceptance", "premium_low_seniority", "frequent_requester"], previousBookings: 1, previousRequests: 9, noShows: 2, attendanceSummary: "50% attendance — flagged", usageHistory: [{ month: "Jan", score: 40 }, { month: "Feb", score: 38 }, { month: "Mar", score: 37 }] },
];

const EVENT_IDS = ["e1","e2","e3","e4","e5","e6","e7","e8","e9","e10","e11"];
const SIZE_BY_EVENT: Record<string, number> = {
  e1: 7, e2: 9, e3: 4, e4: 5, e5: 8, e6: 6, e7: 3, e8: 6, e9: 4, e10: 7, e11: 5,
};

function buildSeed(): Record<string, BookingRequest[]> {
  const out: Record<string, BookingRequest[]> = {};
  const now = Date.now();
  for (const eid of EVENT_IDS) {
    const size = SIZE_BY_EVENT[eid] ?? 5;
    const offset = (parseInt(eid.slice(1), 10) * 2) % POOL.length;
    const list: BookingRequest[] = [];
    for (let i = 0; i < size; i++) {
      const base = POOL[(offset + i) % POOL.length];
      list.push({
        ...base,
        id: uid(),
        eventId: eid,
        // spread request times for FCFS ordering
        requestedAt: new Date(now - (size - i) * 3600000 - i * 1800000).toISOString(),
        status: "pending",
      });
    }
    out[eid] = list;
  }
  return out;
}

let store: Record<string, BookingRequest[]> = buildSeed();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function useRequests(eventId: string) {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return store[eventId] ?? [];
}

export const requestApi = {
  approve(eventId: string, id: string) {
    const list = store[eventId] ?? [];
    const r = list.find((x) => x.id === id);
    if (!r) return null;
    store[eventId] = list.map((x) => (x.id === id ? { ...x, status: "approved" } : x));
    emit();
    return r;
  },
  decline(eventId: string, id: string, reason: string) {
    const list = store[eventId] ?? [];
    const r = list.find((x) => x.id === id);
    if (!r) return null;
    store[eventId] = list.map((x) => (x.id === id ? { ...x, status: "declined", declineReason: reason } : x));
    emit();
    return r;
  },
  bulkApprove(eventId: string, ids: string[]) {
    const list = store[eventId] ?? [];
    const approved: BookingRequest[] = [];
    store[eventId] = list.map((x) => {
      if (ids.includes(x.id) && x.status === "pending") {
        approved.push(x);
        return { ...x, status: "approved" };
      }
      return x;
    });
    emit();
    return approved;
  },
  bulkDecline(eventId: string, ids: string[], reason: string) {
    const list = store[eventId] ?? [];
    const declined: BookingRequest[] = [];
    store[eventId] = list.map((x) => {
      if (ids.includes(x.id) && x.status === "pending") {
        declined.push(x);
        return { ...x, status: "declined", declineReason: reason };
      }
      return x;
    });
    emit();
    return declined;
  },
};

export const FLAG_LABEL: Record<RiskFlag, string> = {
  low_acceptance: "Low Acceptance History",
  frequent_requester: "Frequent Requester",
  requires_review: "Requires Review",
  premium_low_seniority: "Low Seniority · Premium",
};

export const SENIORITY_TONE: Record<Seniority, string> = {
  Partner: "bg-[hsl(280_70%_94%)] text-[hsl(280_60%_40%)] border-[hsl(280_60%_85%)]",
  Director: "bg-[hsl(220_85%_94%)] text-[hsl(220_85%_40%)] border-[hsl(220_70%_85%)]",
  VP: "bg-[hsl(195_75%_92%)] text-[hsl(195_70%_35%)] border-[hsl(195_60%_82%)]",
  Manager: "bg-[hsl(140_55%_92%)] text-[hsl(140_55%_30%)] border-[hsl(140_45%_80%)]",
  Associate: "bg-[hsl(220_10%_94%)] text-[hsl(220_10%_40%)] border-[hsl(220_10%_85%)]",
};

export const PRIORITY_TONE: Record<Priority, string> = {
  High: "bg-[hsl(0_75%_94%)] text-[hsl(0_75%_42%)] border-[hsl(0_60%_85%)]",
  Medium: "bg-[hsl(45_95%_92%)] text-[hsl(35_85%_38%)] border-[hsl(40_80%_82%)]",
  Low: "bg-[hsl(220_10%_94%)] text-[hsl(220_10%_45%)] border-[hsl(220_10%_85%)]",
};
