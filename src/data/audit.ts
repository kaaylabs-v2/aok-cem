// Mock audit-trail store for the Guest List Audit Trail module (CEM-7).
// Frontend-only seed data — kept in line with how other data/* stores work.

export type AuditActionType =
  | "Guest Added"
  | "Guest Removed"
  | "Dietary Updated"
  | "Invite Resent"
  | "RSVP Changed"
  | "Bulk Upload"
  | "System Purge"
  | "Approval Change";

export interface AuditRecord {
  id: string;
  timestamp: string;
  bookingId: string;
  eventId: string;
  eventName: string;
  guestName: string;
  actionType: AuditActionType;
  fieldChanged: string;
  previousValue: string;
  newValue: string;
  userId: string;
  userName: string;
  role: string;
  actingForId?: string;
  actingForName?: string;
  source: "ETX2" | "API" | "Bulk Import" | "System" | "SSO";
  tenant: string;
  retentionDate: string;
  immutable: true;
}

const iso = (daysAgo: number, h = 12, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

const retention = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo + 2555); // ~7 yr retention
  return d.toISOString();
};

const r = (n: number) => ({ retentionDate: retention(n), immutable: true as const, tenant: "AOK Events" });

export const auditRecords: AuditRecord[] = [
  {
    id: "a1", timestamp: iso(0, 13, 47), bookingId: "BK-2041", eventId: "e3",
    eventName: "Leeds United vs Manchester United", guestName: "John Smith",
    actionType: "Guest Removed", fieldChanged: "status", previousValue: "Confirmed Guest", newValue: "Removed",
    userId: "u3", userName: "Sarah Jones", role: "Delegated Booker",
    actingForId: "u8", actingForName: "James Richardson",
    source: "ETX2", ...r(0),
  },
  {
    id: "a2", timestamp: iso(0, 13, 20), bookingId: "BK-2041", eventId: "e3",
    eventName: "Leeds United vs Manchester United", guestName: "John Smith",
    actionType: "Invite Resent", fieldChanged: "invite", previousValue: "sent", newValue: "sent",
    userId: "system", userName: "System", role: "System",
    source: "System", ...r(0),
  },
  {
    id: "a3", timestamp: iso(0, 12, 40), bookingId: "BK-2041", eventId: "e3",
    eventName: "Leeds United vs Manchester United", guestName: "John Smith",
    actionType: "Guest Added", fieldChanged: "guest", previousValue: "—", newValue: "John Smith",
    userId: "u2", userName: "Emma Carter", role: "Event Manager",
    source: "ETX2", ...r(0),
  },
  {
    id: "a4", timestamp: iso(1, 10, 15), bookingId: "BK-2018", eventId: "e1",
    eventName: "Chelsea vs Arsenal", guestName: "Priya Shah",
    actionType: "Dietary Updated", fieldChanged: "dietary", previousValue: "—", newValue: "Vegetarian",
    userId: "u4", userName: "Alex Morgan", role: "Event Manager",
    source: "ETX2", ...r(1),
  },
  {
    id: "a5", timestamp: iso(1, 9, 30), bookingId: "BK-2018", eventId: "e1",
    eventName: "Chelsea vs Arsenal", guestName: "Marco Bianchi",
    actionType: "RSVP Changed", fieldChanged: "rsvp", previousValue: "pending", newValue: "accepted",
    userId: "u5", userName: "Marco Bianchi", role: "Guest",
    source: "API", ...r(1),
  },
  {
    id: "a6", timestamp: iso(2, 16, 5), bookingId: "BK-2027", eventId: "e2",
    eventName: "Arsenal vs Tottenham Hotspur", guestName: "—",
    actionType: "Bulk Upload", fieldChanged: "guests", previousValue: "0", newValue: "48 added",
    userId: "u3", userName: "Sarah Jones", role: "Delegated Booker",
    actingForId: "u9", actingForName: "Olivia Bennett",
    source: "Bulk Import", ...r(2),
  },
  {
    id: "a7", timestamp: iso(3, 11, 22), bookingId: "BK-2027", eventId: "e2",
    eventName: "Arsenal vs Tottenham Hotspur", guestName: "Yuki Tanaka",
    actionType: "Guest Removed", fieldChanged: "status", previousValue: "Pending", newValue: "Removed",
    userId: "u2", userName: "Emma Carter", role: "Event Manager",
    source: "ETX2", ...r(3),
  },
  {
    id: "a8", timestamp: iso(3, 8, 0), bookingId: "BK-2010", eventId: "e6",
    eventName: "Last Night of the Proms", guestName: "—",
    actionType: "System Purge", fieldChanged: "bounced invites", previousValue: "3", newValue: "0",
    userId: "system", userName: "System", role: "System",
    source: "System", ...r(3),
  },
  {
    id: "a9", timestamp: iso(4, 14, 50), bookingId: "BK-2055", eventId: "e5",
    eventName: "Manchester United vs Arsenal", guestName: "Hannah Müller",
    actionType: "Approval Change", fieldChanged: "approval", previousValue: "pending", newValue: "approved",
    userId: "u1", userName: "Daniel Reeves", role: "Tier 2 Approver",
    source: "ETX2", ...r(4),
  },
  {
    id: "a10", timestamp: iso(4, 14, 10), bookingId: "BK-2055", eventId: "e5",
    eventName: "Manchester United vs Arsenal", guestName: "Liam Carter",
    actionType: "Guest Added", fieldChanged: "guest", previousValue: "—", newValue: "Liam Carter",
    userId: "u6", userName: "Thomas Hayes", role: "Associate",
    source: "ETX2", ...r(4),
  },
  {
    id: "a11", timestamp: iso(5, 9, 0), bookingId: "BK-2061", eventId: "e8",
    eventName: "Chelsea vs Manchester United", guestName: "Aisha Rahman",
    actionType: "Dietary Updated", fieldChanged: "dietary", previousValue: "—", newValue: "Halal",
    userId: "u3", userName: "Sarah Jones", role: "Delegated Booker",
    actingForId: "u8", actingForName: "James Richardson",
    source: "ETX2", ...r(5),
  },
  {
    id: "a12", timestamp: iso(5, 16, 30), bookingId: "BK-2014", eventId: "e4",
    eventName: "Tottenham Hotspur vs Chelsea", guestName: "Eva Novak",
    actionType: "RSVP Changed", fieldChanged: "rsvp", previousValue: "pending", newValue: "declined",
    userId: "u5", userName: "Eva Novak", role: "Guest",
    source: "API", ...r(5),
  },
  {
    id: "a13", timestamp: iso(6, 11, 0), bookingId: "BK-2090", eventId: "e10",
    eventName: "An Evening with the London Symphony Orchestra", guestName: "Felix Brandt",
    actionType: "Invite Resent", fieldChanged: "invite", previousValue: "failed", newValue: "sent",
    userId: "u2", userName: "Emma Carter", role: "Event Manager",
    source: "ETX2", ...r(6),
  },
  {
    id: "a14", timestamp: iso(7, 13, 30), bookingId: "BK-2090", eventId: "e10",
    eventName: "An Evening with the London Symphony Orchestra", guestName: "—",
    actionType: "Bulk Upload", fieldChanged: "guests", previousValue: "0", newValue: "120 added",
    userId: "u4", userName: "Alex Morgan", role: "Event Manager",
    source: "Bulk Import", ...r(7),
  },
  {
    id: "a15", timestamp: iso(8, 9, 45), bookingId: "BK-2102", eventId: "e7",
    eventName: "Arsenal vs Leeds United", guestName: "Ravi Iyer",
    actionType: "Guest Added", fieldChanged: "guest", previousValue: "—", newValue: "Ravi Iyer",
    userId: "u3", userName: "Sarah Jones", role: "Delegated Booker",
    actingForId: "u10", actingForName: "Charlotte Wells",
    source: "ETX2", ...r(8),
  },
  {
    id: "a16", timestamp: iso(9, 17, 20), bookingId: "BK-2110", eventId: "e12",
    eventName: "Arsenal vs Tottenham Hotspur", guestName: "Noor El-Sayed",
    actionType: "Approval Change", fieldChanged: "approval", previousValue: "pending", newValue: "rejected",
    userId: "u1", userName: "Daniel Reeves", role: "Tier 2 Approver",
    source: "ETX2", ...r(9),
  },
  {
    id: "a17", timestamp: iso(10, 8, 30), bookingId: "BK-2118", eventId: "e13",
    eventName: "Manchester United vs Arsenal", guestName: "—",
    actionType: "System Purge", fieldChanged: "expired RSVPs", previousValue: "11", newValue: "0",
    userId: "system", userName: "System", role: "System",
    source: "System", ...r(10),
  },
  {
    id: "a18", timestamp: iso(12, 10, 0), bookingId: "BK-2125", eventId: "e6",
    eventName: "Last Night of the Proms", guestName: "Thabo Mokoena",
    actionType: "Guest Removed", fieldChanged: "status", previousValue: "Confirmed", newValue: "Removed",
    userId: "u2", userName: "Emma Carter", role: "Event Manager",
    source: "ETX2", ...r(12),
  },
  {
    id: "a19", timestamp: iso(14, 15, 0), bookingId: "BK-2132", eventId: "e20",
    eventName: "Leeds United vs Tottenham Hotspur", guestName: "Ingrid Sørensen",
    actionType: "Dietary Updated", fieldChanged: "dietary", previousValue: "Vegetarian", newValue: "Gluten-free",
    userId: "u3", userName: "Sarah Jones", role: "Delegated Booker",
    actingForId: "u8", actingForName: "James Richardson",
    source: "ETX2", ...r(14),
  },
  {
    id: "a20", timestamp: iso(16, 9, 0), bookingId: "BK-2140", eventId: "e18",
    eventName: "Chelsea vs Manchester United", guestName: "Diego Alvarez",
    actionType: "RSVP Changed", fieldChanged: "rsvp", previousValue: "pending", newValue: "accepted",
    userId: "u5", userName: "Diego Alvarez", role: "Guest",
    source: "API", ...r(16),
  },
];

export const auditActionTypes: AuditActionType[] = [
  "Guest Added", "Guest Removed", "Dietary Updated", "Invite Resent",
  "RSVP Changed", "Bulk Upload", "System Purge", "Approval Change",
];

export const auditRoles = Array.from(new Set(auditRecords.map((a) => a.role)));
export const auditUsers = Array.from(new Set(auditRecords.map((a) => a.userName)));
export const auditBookings = Array.from(new Set(auditRecords.map((a) => a.bookingId)));
export const auditEvents = Array.from(new Set(auditRecords.map((a) => a.eventName)));
