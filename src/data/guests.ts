// Frontend mock store for guest list & invite management.
// Tenant-scoped, per-event, in-memory only — guest data is purged when the
// page reloads (no persistent guest profiles across events).

import { useEffect, useState } from "react";

export type RsvpStatus = "accepted" | "declined" | "pending";
export type InviteStatus = "not_sent" | "sent" | "failed";

export interface Guest {
  id: string;
  eventId: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  dietary?: string;
  access?: string;
  rsvp: RsvpStatus;
  invite: InviteStatus;
  bounced?: boolean;
}

export interface AuditEntry {
  id: string;
  eventId: string;
  actor: string;
  action: string;
  target?: string;
  timestamp: string;
  previous?: string;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const ACTOR = "Alex Morgan"; // current CEM user

// Pool of realistic guest profiles to seed every event with a meaningful list.
const POOL: Omit<Guest, "id" | "eventId">[] = [
  { firstName: "Priya", lastName: "Shah", email: "priya.shah@northwind.io", company: "Northwind", dietary: "Vegetarian", access: "—", rsvp: "accepted", invite: "sent" },
  { firstName: "Marco", lastName: "Bianchi", email: "marco@helio.co", company: "Helio", dietary: "—", access: "Step-free access", rsvp: "pending", invite: "sent" },
  { firstName: "Yuki", lastName: "Tanaka", email: "yuki.t@orbital.jp", company: "Orbital", dietary: "Gluten-free", access: "—", rsvp: "declined", invite: "sent" },
  { firstName: "Sara", lastName: "Klein", email: "sara@bounced.example", company: "Lumen", dietary: "—", access: "—", rsvp: "pending", invite: "failed", bounced: true },
  { firstName: "Liam", lastName: "Carter", email: "liam.carter@vellum.com", company: "Vellum", dietary: "—", access: "—", rsvp: "accepted", invite: "sent" },
  { firstName: "Aisha", lastName: "Rahman", email: "aisha@brightstack.io", company: "Brightstack", dietary: "Halal", access: "—", rsvp: "accepted", invite: "sent" },
  { firstName: "Diego", lastName: "Alvarez", email: "diego@cobaltgroup.es", company: "Cobalt Group", dietary: "—", access: "—", rsvp: "pending", invite: "sent" },
  { firstName: "Hannah", lastName: "Müller", email: "hannah.m@nordwerk.de", company: "Nordwerk", dietary: "Vegan", access: "—", rsvp: "accepted", invite: "sent" },
  { firstName: "Owen", lastName: "Walsh", email: "owen.walsh@redline.ie", company: "Redline", dietary: "—", access: "—", rsvp: "pending", invite: "not_sent" },
  { firstName: "Noor", lastName: "El-Sayed", email: "noor@mosaic.co", company: "Mosaic", dietary: "Nut allergy", access: "—", rsvp: "accepted", invite: "sent" },
  { firstName: "Felix", lastName: "Brandt", email: "felix.b@axiompartners.com", company: "Axiom Partners", dietary: "—", access: "—", rsvp: "declined", invite: "sent" },
  { firstName: "Mia", lastName: "Laurent", email: "mia.laurent@parallax.fr", company: "Parallax", dietary: "Pescatarian", access: "—", rsvp: "accepted", invite: "sent" },
  { firstName: "Ravi", lastName: "Iyer", email: "ravi.iyer@trinetra.in", company: "Trinetra", dietary: "Vegetarian", access: "—", rsvp: "pending", invite: "sent" },
  { firstName: "Eva", lastName: "Novak", email: "eva.novak@kestrel.cz", company: "Kestrel", dietary: "—", access: "Wheelchair access", rsvp: "accepted", invite: "sent" },
  { firstName: "James", lastName: "O'Connor", email: "james.oc@blueharbor.com", company: "Blue Harbor", dietary: "—", access: "—", rsvp: "pending", invite: "sent" },
  { firstName: "Lena", lastName: "Petrova", email: "lena.p@quanta.io", company: "Quanta", dietary: "—", access: "—", rsvp: "accepted", invite: "sent" },
  { firstName: "Thabo", lastName: "Mokoena", email: "thabo@savanna.za", company: "Savanna", dietary: "—", access: "—", rsvp: "pending", invite: "not_sent" },
  { firstName: "Ingrid", lastName: "Sørensen", email: "ingrid@fjordlabs.no", company: "Fjord Labs", dietary: "Gluten-free", access: "—", rsvp: "accepted", invite: "sent" },
];

const EVENT_IDS = ["e1","e2","e3","e4","e5","e6","e7","e8","e9","e10","e11"];

// Per-event sizing so utilisation feels realistic without dominating the table.
const SIZE_BY_EVENT: Record<string, number> = {
  e1: 8, e2: 14, e3: 6, e4: 7, e5: 12, e6: 10, e7: 5, e8: 9, e9: 3, e10: 11, e11: 8,
};

function buildSeed(): Record<string, Guest[]> {
  const out: Record<string, Guest[]> = {};
  for (const eid of EVENT_IDS) {
    const size = SIZE_BY_EVENT[eid] ?? 6;
    // Rotate the pool so each event gets a different slice of guests.
    const offset = (parseInt(eid.slice(1), 10) * 3) % POOL.length;
    const list: Guest[] = [];
    for (let i = 0; i < size; i++) {
      const base = POOL[(offset + i) % POOL.length];
      list.push({
        ...base,
        id: uid(),
        eventId: eid,
        // Make emails unique per event to avoid duplicate-email collisions.
        email: base.email.replace("@", `+${eid}@`),
      });
    }
    out[eid] = list;
  }
  return out;
}

let store: Record<string, Guest[]> = buildSeed();

function buildAudits(): AuditEntry[] {
  const out: AuditEntry[] = [];
  const now = Date.now();
  for (const eid of EVENT_IDS) {
    const guests = store[eid] ?? [];
    if (guests.length === 0) continue;
    out.push({ id: uid(), eventId: eid, actor: ACTOR, action: "Guest list created", target: `${guests.length} guests imported`, timestamp: new Date(now - 86400000 * 5).toISOString() });
    out.push({ id: uid(), eventId: eid, actor: ACTOR, action: "Invites sent", target: `${guests.filter(g => g.invite === "sent").length} guests`, timestamp: new Date(now - 86400000 * 4).toISOString() });
    const accepted = guests.find((g) => g.rsvp === "accepted");
    if (accepted) out.push({ id: uid(), eventId: eid, actor: accepted.email, action: "RSVP accepted", target: `${accepted.firstName} ${accepted.lastName}`, timestamp: new Date(now - 86400000 * 2).toISOString(), previous: "pending" });
    const declined = guests.find((g) => g.rsvp === "declined");
    if (declined) out.push({ id: uid(), eventId: eid, actor: declined.email, action: "RSVP declined", target: `${declined.firstName} ${declined.lastName}`, timestamp: new Date(now - 86400000 * 1).toISOString(), previous: "pending" });
    const failed = guests.find((g) => g.invite === "failed");
    if (failed) out.push({ id: uid(), eventId: eid, actor: "system", action: "Invite bounced", target: failed.email, timestamp: new Date(now - 3600000 * 6).toISOString() });
  }
  return out;
}

let audits: AuditEntry[] = buildAudits();

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function useGuests(eventId: string) {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return store[eventId] ?? [];
}

export function useAudit(eventId: string) {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return audits.filter((a) => a.eventId === eventId).slice().reverse();
}

const log = (eventId: string, action: string, target?: string, previous?: string) => {
  audits.push({ id: uid(), eventId, actor: ACTOR, action, target, previous, timestamp: new Date().toISOString() });
};

export const guestApi = {
  add(eventId: string, g: Omit<Guest, "id" | "eventId" | "rsvp" | "invite">, sendInvite = false) {
    const list = store[eventId] ?? [];
    const dup = list.find((x) => x.email.toLowerCase() === g.email.toLowerCase());
    if (dup) return { ok: false as const, reason: "duplicate" as const };
    const guest: Guest = { ...g, id: uid(), eventId, rsvp: "pending", invite: sendInvite ? "sent" : "not_sent" };
    store[eventId] = [...list, guest];
    log(eventId, "Guest added", `${guest.firstName} ${guest.lastName}`);
    if (sendInvite) log(eventId, "Invite sent", guest.email);
    emit();
    return { ok: true as const, guest };
  },
  update(eventId: string, id: string, patch: Partial<Guest>) {
    const list = store[eventId] ?? [];
    const prev = list.find((g) => g.id === id);
    if (!prev) return;
    store[eventId] = list.map((g) => (g.id === id ? { ...g, ...patch } : g));
    log(eventId, "Guest edited", `${prev.firstName} ${prev.lastName}`, JSON.stringify({ email: prev.email, dietary: prev.dietary, access: prev.access }));
    emit();
  },
  remove(eventId: string, id: string) {
    const list = store[eventId] ?? [];
    const g = list.find((x) => x.id === id);
    if (!g) return;
    store[eventId] = list.filter((x) => x.id !== id);
    log(eventId, "Guest removed", `${g.firstName} ${g.lastName}`, g.email);
    emit();
  },
  resend(eventId: string, id: string) {
    const list = store[eventId] ?? [];
    const g = list.find((x) => x.id === id);
    if (!g) return;
    store[eventId] = list.map((x) => (x.id === id ? { ...x, invite: "sent", bounced: false } : x));
    log(eventId, "Invite resent", g.email);
    emit();
  },
  sendAll(eventId: string) {
    const list = store[eventId] ?? [];
    let count = 0;
    store[eventId] = list.map((g) => {
      if (g.invite === "not_sent") { count++; return { ...g, invite: "sent" }; }
      return g;
    });
    log(eventId, "Invites sent", `${count} guest${count === 1 ? "" : "s"}`);
    emit();
    return count;
  },
  sendUpdate(eventId: string) {
    const list = store[eventId] ?? [];
    const count = list.filter((g) => g.invite === "sent").length;
    log(eventId, "Event update sent", `${count} guest${count === 1 ? "" : "s"}`);
    emit();
    return count;
  },
  // Simulated inbound RSVP — used by the demo "simulate" button
  simulateRsvp(eventId: string, id: string, rsvp: RsvpStatus) {
    const list = store[eventId] ?? [];
    const g = list.find((x) => x.id === id);
    if (!g) return;
    store[eventId] = list.map((x) => (x.id === id ? { ...x, rsvp } : x));
    log(eventId, `RSVP ${rsvp}`, `${g.firstName} ${g.lastName}`, g.rsvp);
    emit();
  },
};

export const rsvpLabel: Record<RsvpStatus, string> = {
  accepted: "Accepted",
  declined: "Declined",
  pending: "Pending",
};

export const inviteLabel: Record<InviteStatus, string> = {
  not_sent: "Not sent",
  sent: "Sent",
  failed: "Failed",
};
