// Mock users / groups / permissions / entitlements store for CEM-8.
// Frontend-only seed data — no persistence.

export type Seniority =
  | "Executive" | "Managing Director" | "Director" | "VP" | "Associate" | "Analyst" | "Custom";

export type ApprovalTier =
  | "none" | "tier1" | "tier2" | "tier3" | "fallback" | "escalation";

export const APPROVAL_TIER_LABEL: Record<ApprovalTier, string> = {
  none: "No Approval Rights",
  tier1: "Tier 1 Approver",
  tier2: "Tier 2 Approver",
  tier3: "Tier 3 Approver",
  fallback: "Fallback Approver",
  escalation: "Escalation Approver",
};

export type UserStatus = "active" | "pending" | "inactive";

export interface Capability {
  key: string;
  label: string;
  section: "Inventory" | "Enquiries" | "Approvals" | "Reporting" | "Administration";
}

export const CAPABILITIES: Capability[] = [
  { key: "inv.view_events",       label: "View Events",        section: "Inventory" },
  { key: "inv.create_bookings",   label: "Create Bookings",    section: "Inventory" },
  { key: "inv.manage_guests",     label: "Manage Guests",      section: "Inventory" },
  { key: "enq.create",            label: "Create Enquiries",   section: "Enquiries" },
  { key: "enq.view",              label: "View Enquiries",     section: "Enquiries" },
  { key: "enq.manage",            label: "Manage Enquiries",   section: "Enquiries" },
  { key: "apr.approve",           label: "Approve Requests",   section: "Approvals" },
  { key: "apr.reject",            label: "Reject Requests",    section: "Approvals" },
  { key: "rep.compliance",        label: "Compliance Reports", section: "Reporting" },
  { key: "rep.export",            label: "Export Reports",     section: "Reporting" },
  { key: "adm.users",             label: "Manage Users",       section: "Administration" },
  { key: "adm.groups",            label: "Manage Groups",      section: "Administration" },
];

export const CAPABILITY_SECTIONS = ["Inventory", "Enquiries", "Approvals", "Reporting", "Administration"] as const;

export interface Entitlements {
  maxBookings: number;     // per period
  maxSpend: number;        // per period
  annualAllowance: number;
  monthlyAllowance: number;
  usedBookings: number;
  usedSpend: number;
  usedMonthly: number;
}

export interface UserGroup {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  userIds: string[];
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  seniority: Seniority;
  groupId: string;
  capabilities: string[];
  approvalTier: ApprovalTier;
  delegationFor?: string; // user id this user can act for
  entitlements: Entitlements;
  ssoEnabled: boolean;
  status: UserStatus;
  lastLogin: string;
}

export const USER_GROUPS: UserGroup[] = [
  { id: "g1", name: "VIP Users",            description: "Premium booking & entitlement uplift",  capabilities: ["inv.view_events","inv.create_bookings","inv.manage_guests","enq.create","enq.view"], userIds: ["u8","u10"] },
  { id: "g2", name: "Investment Banking",   description: "IBD front office",                       capabilities: ["inv.view_events","inv.create_bookings","inv.manage_guests","enq.create","enq.view","enq.manage"], userIds: ["u1","u6"] },
  { id: "g3", name: "Sales",                description: "Markets sales coverage",                 capabilities: ["inv.view_events","inv.create_bookings","enq.create","enq.view"], userIds: ["u5"] },
  { id: "g4", name: "Research",             description: "Equity & macro research",                capabilities: ["inv.view_events","enq.create","enq.view"], userIds: ["u7"] },
  { id: "g5", name: "Executive Leadership", description: "C-suite & MDs",                          capabilities: ["inv.view_events","inv.create_bookings","inv.manage_guests","enq.create","enq.view","enq.manage","apr.approve","apr.reject","rep.compliance","rep.export"], userIds: ["u9"] },
  { id: "g6", name: "Compliance Team",      description: "Compliance, audit & reporting",          capabilities: ["inv.view_events","enq.view","apr.approve","apr.reject","rep.compliance","rep.export","adm.users","adm.groups"], userIds: ["u2","u4","u11"] },
];

const ent = (mb: number, ms: number, ann: number, mon: number, ub: number, us: number, um: number): Entitlements => ({
  maxBookings: mb, maxSpend: ms, annualAllowance: ann, monthlyAllowance: mon,
  usedBookings: ub, usedSpend: us, usedMonthly: um,
});

const daysAgoIso = (n: number) => {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString();
};

export const USERS: User[] = [
  { id: "u1",  firstName: "Daniel",   lastName: "Reeves",     email: "d.reeves@firm.com",      department: "Investment Banking", position: "VP",            seniority: "VP",                groupId: "g2", capabilities: ["inv.view_events","inv.create_bookings","inv.manage_guests","enq.create","enq.view","enq.manage","apr.approve","apr.reject"], approvalTier: "tier2", entitlements: ent(20, 100000, 200000, 18000, 14, 72400, 9200), ssoEnabled: true,  status: "active",   lastLogin: daysAgoIso(0) },
  { id: "u2",  firstName: "Emma",     lastName: "Carter",     email: "e.carter@firm.com",      department: "Compliance",         position: "Compliance Lead",seniority: "Director",          groupId: "g6", capabilities: ["inv.view_events","enq.view","apr.approve","apr.reject","rep.compliance","rep.export","adm.users","adm.groups"], approvalTier: "tier3", entitlements: ent(10, 50000, 120000, 10000, 4, 18200, 2100), ssoEnabled: true,  status: "active",   lastLogin: daysAgoIso(0) },
  { id: "u3",  firstName: "Sarah",    lastName: "Jones",      email: "s.jones@firm.com",       department: "Executive Office",   position: "PA",            seniority: "Associate",         groupId: "g6", capabilities: ["inv.view_events","inv.create_bookings","inv.manage_guests","enq.create","enq.view","enq.manage"], approvalTier: "none",  delegationFor: "u8", entitlements: ent(0, 0, 0, 0, 0, 0, 0), ssoEnabled: true, status: "active", lastLogin: daysAgoIso(0) },
  { id: "u4",  firstName: "Alex",     lastName: "Morgan",     email: "a.morgan@firm.com",      department: "Compliance",         position: "CEM Admin",     seniority: "Director",          groupId: "g6", capabilities: ["inv.view_events","enq.view","apr.approve","apr.reject","rep.compliance","rep.export","adm.users","adm.groups"], approvalTier: "fallback", entitlements: ent(8, 40000, 100000, 8000, 3, 14100, 1800), ssoEnabled: true,  status: "active",   lastLogin: daysAgoIso(1) },
  { id: "u5",  firstName: "Marco",    lastName: "Bianchi",    email: "m.bianchi@firm.com",     department: "Markets",            position: "Sales",         seniority: "VP",                groupId: "g3", capabilities: ["inv.view_events","inv.create_bookings","enq.create","enq.view"], approvalTier: "none",  entitlements: ent(15, 80000, 150000, 14000, 9, 51200, 6800), ssoEnabled: true,  status: "active",   lastLogin: daysAgoIso(2) },
  { id: "u6",  firstName: "Thomas",   lastName: "Hayes",      email: "t.hayes@firm.com",       department: "Investment Banking", position: "Associate",     seniority: "Associate",         groupId: "g2", capabilities: ["inv.view_events","inv.create_bookings","enq.create","enq.view"], approvalTier: "none",  entitlements: ent(8, 30000, 80000, 7000, 2, 8400, 1200), ssoEnabled: true,  status: "active",   lastLogin: daysAgoIso(3) },
  { id: "u7",  firstName: "Priya",    lastName: "Shah",       email: "p.shah@firm.com",        department: "Equity Research",    position: "Analyst",       seniority: "Analyst",           groupId: "g4", capabilities: ["inv.view_events","enq.create","enq.view"], approvalTier: "none", entitlements: ent(6, 20000, 60000, 5000, 1, 4100, 800), ssoEnabled: true, status: "active", lastLogin: daysAgoIso(4) },
  { id: "u8",  firstName: "James",    lastName: "Richardson", email: "j.richardson@firm.com",  department: "Executive Office",   position: "CEO",           seniority: "Executive",         groupId: "g1", capabilities: ["inv.view_events","inv.create_bookings","inv.manage_guests","enq.create","enq.view"], approvalTier: "escalation", entitlements: ent(50, 500000, 1000000, 90000, 22, 312000, 28000), ssoEnabled: true, status: "active", lastLogin: daysAgoIso(0) },
  { id: "u9",  firstName: "Olivia",   lastName: "Bennett",    email: "o.bennett@firm.com",     department: "Executive Office",   position: "COO",           seniority: "Executive",         groupId: "g5", capabilities: ["inv.view_events","inv.create_bookings","inv.manage_guests","enq.create","enq.view","enq.manage","apr.approve","apr.reject","rep.compliance","rep.export"], approvalTier: "tier3", entitlements: ent(40, 400000, 800000, 70000, 18, 264000, 22000), ssoEnabled: true, status: "active", lastLogin: daysAgoIso(1) },
  { id: "u10", firstName: "Charlotte",lastName: "Wells",      email: "c.wells@firm.com",       department: "Wealth Management",  position: "MD",            seniority: "Managing Director", groupId: "g1", capabilities: ["inv.view_events","inv.create_bookings","inv.manage_guests","enq.create","enq.view"], approvalTier: "tier2", entitlements: ent(30, 250000, 500000, 45000, 16, 184000, 14000), ssoEnabled: true,  status: "active",   lastLogin: daysAgoIso(2) },
  { id: "u11", firstName: "Noah",     lastName: "Patel",      email: "n.patel@firm.com",       department: "Compliance",         position: "Auditor",       seniority: "VP",                groupId: "g6", capabilities: ["inv.view_events","enq.view","apr.approve","rep.compliance","rep.export"], approvalTier: "tier1", entitlements: ent(4, 10000, 40000, 3500, 1, 2100, 400), ssoEnabled: false, status: "pending",  lastLogin: daysAgoIso(20) },
  { id: "u12", firstName: "Lena",     lastName: "Petrova",    email: "l.petrova@firm.com",     department: "Operations",         position: "Coordinator",   seniority: "Associate",         groupId: "g3", capabilities: ["inv.view_events"], approvalTier: "none", entitlements: ent(2, 5000, 12000, 1000, 0, 0, 0), ssoEnabled: false, status: "inactive", lastLogin: daysAgoIso(95) },
];

export const userById = (id: string) => USERS.find((u) => u.id === id);
export const groupById = (id: string) => USER_GROUPS.find((g) => g.id === id);
export const userFullName = (u: User) => `${u.firstName} ${u.lastName}`;
export const userInitials = (u: User) => (u.firstName[0] + u.lastName[0]).toUpperCase();

export const DEPARTMENTS = Array.from(new Set(USERS.map((u) => u.department)));
export const SENIORITIES: Seniority[] = ["Executive","Managing Director","Director","VP","Associate","Analyst","Custom"];
