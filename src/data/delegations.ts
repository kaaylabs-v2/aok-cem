// CEM-9 — Delegation Management mock store.
// Frontend-only seed data. No persistence.

import { USERS, userById, userFullName, User } from "@/data/users";

export type DelegationStatus = "active" | "suspended";

export interface DelegationPermissions {
  // Bookings
  browseEvents: boolean;
  createBookings: boolean;
  modifyBookings: boolean;
  // Guest Management
  addGuests: boolean;
  editGuests: boolean;
  removeGuests: boolean;
  sendInvites: boolean;
  resendInvites: boolean;
  // Enquiries
  createEnquiries: boolean;
  manageEnquiries: boolean;
  // Approval Visibility
  viewApprovalStatus: boolean;
  receiveApprovalUpdates: boolean;
}

export const DEFAULT_PERMISSIONS: DelegationPermissions = {
  browseEvents: true,
  createBookings: true,
  modifyBookings: true,
  addGuests: true,
  editGuests: true,
  removeGuests: false,
  sendInvites: true,
  resendInvites: true,
  createEnquiries: true,
  manageEnquiries: false,
  viewApprovalStatus: true,
  receiveApprovalUpdates: true,
};

export interface DelegationRelationship {
  id: string;
  paUserId: string;
  principalUserId: string;
  permissions: DelegationPermissions;
  status: DelegationStatus;
  createdById: string;
  createdAt: string;
  lastModifiedAt: string;
  lastActionAt: string;
  activeBookings: number;
}

const daysAgoIso = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

// Permission presets
const fullAccess: DelegationPermissions = { ...DEFAULT_PERMISSIONS, removeGuests: true, manageEnquiries: true };
const bookingsOnly: DelegationPermissions = {
  ...DEFAULT_PERMISSIONS,
  addGuests: false, editGuests: false, removeGuests: false, sendInvites: false, resendInvites: false,
  createEnquiries: false, manageEnquiries: false,
};
const guestsOnly: DelegationPermissions = {
  ...DEFAULT_PERMISSIONS,
  browseEvents: true, createBookings: false, modifyBookings: false,
  createEnquiries: false, manageEnquiries: false,
};

let _seq = 1;
const mk = (
  paId: string, principalId: string, permissions: DelegationPermissions,
  status: DelegationStatus, createdById: string, createdDaysAgo: number,
  modifiedDaysAgo: number, lastActionDaysAgo: number, activeBookings: number,
): DelegationRelationship => ({
  id: `del-${String(_seq++).padStart(3, "0")}`,
  paUserId: paId,
  principalUserId: principalId,
  permissions,
  status,
  createdById,
  createdAt: daysAgoIso(createdDaysAgo),
  lastModifiedAt: daysAgoIso(modifiedDaysAgo),
  lastActionAt: daysAgoIso(lastActionDaysAgo),
  activeBookings,
});

// Sarah Jones (u3) — PA for multiple principals (1 PA → many Principals)
// James Richardson (u8) — Principal with multiple PAs (1 Principal → many PAs)
export const DELEGATIONS: DelegationRelationship[] = [
  mk("u3", "u8", fullAccess,    "active",    "u4", 120, 4, 0, 6),
  mk("u3", "u9", fullAccess,    "active",    "u4",  90, 8, 1, 4),
  mk("u3", "u10", bookingsOnly, "active",    "u4",  60, 12, 2, 3),

  // James Richardson (u8) is also principal for Emma Carter and Charlotte Wells acting as PAs
  mk("u6", "u8", bookingsOnly,  "active",    "u4",  45, 5, 1, 2),
  mk("u12", "u8", guestsOnly,   "suspended", "u4",  30, 2, 14, 0),

  // Other mixed relationships
  mk("u3", "u1", bookingsOnly,  "active",    "u2",  20, 3, 2, 2),
  mk("u6", "u9", guestsOnly,    "active",    "u4",  18, 6, 3, 1),
  mk("u6", "u10", fullAccess,   "active",    "u2",  14, 1, 0, 5),
  mk("u11", "u9", bookingsOnly, "suspended", "u4",  60, 30, 30, 0),
  mk("u7", "u10", guestsOnly,   "active",    "u4",  10, 10, 4, 1),
  mk("u3", "u5", bookingsOnly,  "active",    "u2",   8, 2, 1, 1),
  mk("u6", "u1", fullAccess,    "active",    "u2",   5, 0, 0, 3),
  mk("u11", "u8", bookingsOnly, "active",    "u4",  35, 7, 5, 1),
  mk("u7", "u2", guestsOnly,    "active",    "u4",   3, 0, 0, 0),
];

// === Helpers ===
export const PERMISSION_GROUPS: { label: string; keys: (keyof DelegationPermissions)[] }[] = [
  { label: "Bookings",            keys: ["browseEvents", "createBookings", "modifyBookings"] },
  { label: "Guest Management",    keys: ["addGuests", "editGuests", "removeGuests", "sendInvites", "resendInvites"] },
  { label: "Enquiries",           keys: ["createEnquiries", "manageEnquiries"] },
  { label: "Approval Visibility", keys: ["viewApprovalStatus", "receiveApprovalUpdates"] },
];

export const PERMISSION_LABEL: Record<keyof DelegationPermissions, string> = {
  browseEvents: "Browse Events",
  createBookings: "Create Bookings",
  modifyBookings: "Modify Bookings",
  addGuests: "Add Guests",
  editGuests: "Edit Guests",
  removeGuests: "Remove Guests",
  sendInvites: "Send Invites",
  resendInvites: "Resend Invites",
  createEnquiries: "Create Enquiries",
  manageEnquiries: "Manage Enquiries",
  viewApprovalStatus: "View Approval Status",
  receiveApprovalUpdates: "Receive Approval Updates",
};

export const countPermissions = (p: DelegationPermissions) =>
  Object.values(p).filter(Boolean).length;

export const getPrincipalsForPA = (paId: string, list: DelegationRelationship[] = DELEGATIONS) =>
  list.filter((d) => d.paUserId === paId);

export const getPAsForPrincipal = (principalId: string, list: DelegationRelationship[] = DELEGATIONS) =>
  list.filter((d) => d.principalUserId === principalId);

export const relationshipType = (
  rel: DelegationRelationship,
  list: DelegationRelationship[] = DELEGATIONS,
): "1:1" | "1:N (PA)" | "N:1 (Principal)" | "N:N" => {
  const paCount = getPrincipalsForPA(rel.paUserId, list).length;
  const prCount = getPAsForPrincipal(rel.principalUserId, list).length;
  if (paCount > 1 && prCount > 1) return "N:N";
  if (paCount > 1) return "1:N (PA)";
  if (prCount > 1) return "N:1 (Principal)";
  return "1:1";
};

export const summariseDelegations = (list: DelegationRelationship[] = DELEGATIONS) => {
  const active = list.filter((d) => d.status === "active");
  const PAs = new Set(active.map((d) => d.paUserId));
  const principals = new Set(active.map((d) => d.principalUserId));
  const paCounts: Record<string, number> = {};
  const prCounts: Record<string, number> = {};
  active.forEach((d) => {
    paCounts[d.paUserId] = (paCounts[d.paUserId] || 0) + 1;
    prCounts[d.principalUserId] = (prCounts[d.principalUserId] || 0) + 1;
  });
  const multiPrincipal = Object.values(paCounts).filter((n) => n > 1).length;
  const multiPA = Object.values(prCounts).filter((n) => n > 1).length;
  const recentMs = Date.now() - 7 * 86400000;
  const recentlyModified = list.filter((d) => new Date(d.lastModifiedAt).getTime() >= recentMs).length;
  return {
    active: active.length,
    delegatedBookers: PAs.size,
    principalsCovered: principals.size,
    multiPrincipal,
    multiPA,
    recentlyModified,
  };
};

export const principalLabel = (id: string) => {
  const u = userById(id);
  return u ? userFullName(u) : id;
};

export const principalDept = (id: string) => userById(id)?.department ?? "";
export const principalPosition = (id: string) => userById(id)?.position ?? "";
export const principalApprovalTier = (id: string) => userById(id)?.approvalTier ?? "none";

export const allActiveUsers = (): User[] => USERS.filter((u) => u.status === "active");
