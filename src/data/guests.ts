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

const seed: Record<string, Guest[]> = {
  e1: [
    { id: uid(), eventId: "e1", firstName: "Priya", lastName: "Shah", email: "priya.shah@northwind.io", company: "Northwind", dietary: "Vegetarian", access: "—", rsvp: "accepted", invite: "sent" },
    { id: uid(), eventId: "e1", firstName: "Marco", lastName: "Bianchi", email: "marco@helio.co", company: "Helio", dietary: "—", access: "Step-free access", rsvp: "pending", invite: "sent" },
    { id: uid(), eventId: "e1", firstName: "Yuki", lastName: "Tanaka", email: "yuki.t@orbital.jp", company: "Orbital", dietary: "Gluten-free", access: "—", rsvp: "declined", invite: "sent" },
    { id: uid(), eventId: "e1", firstName: "Sara", lastName: "Klein", email: "sara@bounced.example", company: "Lumen", rsvp: "pending", invite: "failed", bounced: true },
  ],
};

let store: Record<string, Guest[]> = { ...seed };
let audits: AuditEntry[] = [
  { id: uid(), eventId: "e1", actor: ACTOR, action: "Guest added", target: "Priya Shah", timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: uid(), eventId: "e1", actor: ACTOR, action: "Invites sent", target: "4 guests", timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
];

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
  sent: "Invitation sent",
  failed: "Email failed",
};
