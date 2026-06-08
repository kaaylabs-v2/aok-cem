// Internal host/requester pool. A "host" is the internal user who invited
// one or more external guests. Hosts are tenant-scoped and shared across
// guest list & request data so we can display host → guest hierarchy.

import type { Seniority, RiskFlag } from "./requests";

export interface Host {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  businessUnit: string;
  seniority: Seniority;
  usageScore: number;
  acceptanceRate: number;
  flags: RiskFlag[];
  totalBookings: number;
  totalRequests: number;
  noShows: number;
}

export const HOSTS: Host[] = [
  { id: "h1", firstName: "Sarah",   lastName: "Johnson",  email: "sarah.j@firm.com",   department: "Investment Banking", businessUnit: "EMEA Advisory",   seniority: "Director",  usageScore: 92, acceptanceRate: 95, flags: [],                                              totalBookings: 18, totalRequests: 22, noShows: 0 },
  { id: "h2", firstName: "Daniel",  lastName: "Reeves",   email: "d.reeves@firm.com",  department: "M&A Advisory",       businessUnit: "Global Markets",  seniority: "VP",        usageScore: 78, acceptanceRate: 82, flags: ["frequent_requester"],                          totalBookings: 12, totalRequests: 24, noShows: 1 },
  { id: "h3", firstName: "Priya",   lastName: "Shah",     email: "priya.shah@firm.com",department: "Wealth Management",  businessUnit: "Private Bank",    seniority: "Partner",   usageScore: 95, acceptanceRate: 98, flags: [],                                              totalBookings: 27, totalRequests: 28, noShows: 0 },
  { id: "h4", firstName: "Tom",     lastName: "Hayes",    email: "tom.h@firm.com",     department: "Markets",            businessUnit: "Sales & Trading", seniority: "Associate", usageScore: 43, acceptanceRate: 41, flags: ["low_acceptance", "premium_low_seniority"],     totalBookings: 2,  totalRequests: 11, noShows: 3 },
  { id: "h5", firstName: "Hannah",  lastName: "Müller",   email: "hannah.m@firm.com",  department: "Private Banking",    businessUnit: "DACH",            seniority: "Manager",   usageScore: 71, acceptanceRate: 80, flags: [],                                              totalBookings: 9,  totalRequests: 11, noShows: 0 },
  { id: "h6", firstName: "Marco",   lastName: "Bianchi",  email: "marco.b@firm.com",   department: "Corporate Banking",  businessUnit: "Southern Europe", seniority: "Director",  usageScore: 86, acceptanceRate: 89, flags: ["frequent_requester"],                          totalBookings: 16, totalRequests: 24, noShows: 1 },
  { id: "h7", firstName: "Eva",     lastName: "Novak",    email: "eva.n@firm.com",     department: "Equity Research",    businessUnit: "CEE",             seniority: "VP",        usageScore: 81, acceptanceRate: 90, flags: [],                                              totalBookings: 13, totalRequests: 14, noShows: 0 },
  { id: "h8", firstName: "James",   lastName: "O'Connor", email: "james.oc@firm.com",  department: "Asset Management",   businessUnit: "UK & Ireland",    seniority: "Manager",   usageScore: 58, acceptanceRate: 62, flags: ["requires_review"],                             totalBookings: 6,  totalRequests: 10, noShows: 1 },
];

const HOSTS_BY_ID: Record<string, Host> = Object.fromEntries(HOSTS.map((h) => [h.id, h]));
export const hostById = (id: string | undefined): Host | undefined => (id ? HOSTS_BY_ID[id] : undefined);
export const hostName = (h: Host) => `${h.firstName} ${h.lastName}`;
export const hostInitials = (h: Host) => (h.firstName[0] + h.lastName[0]).toUpperCase();

// Default current-user host (used as fallback when no hostId is set on a record).
export const DEFAULT_HOST_ID = "h1";

// Deterministically pick a host for the i-th seed record so each host owns
// ~2-3 records — produces clear group sizes without overflowing.
export function seedHostId(index: number, eventOffset = 0): string {
  return HOSTS[(Math.floor(index / 2) + eventOffset) % HOSTS.length].id;
}
