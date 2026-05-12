export type ApprovalStatus =
  | "submitted"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "returned"
  | "auto_approved"
  | "expired";

export type RequestType = "Booking" | "Enquiry";
export type Seniority = "Coordinator" | "Manager" | "Director" | "VP" | "C-Level";
export type Audience = "business" | "personal";

export const SENIORITY_ORDER: Seniority[] = ["Coordinator", "Manager", "Director", "VP", "C-Level"];

export const APPROVAL_STATUS_LABEL: Record<ApprovalStatus, string> = {
  submitted: "Submitted",
  pending_approval: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
  returned: "Returned for Amendment",
  auto_approved: "Auto-Approved",
  expired: "Expired",
};

export const APPROVAL_STATUS_CHIP: Record<ApprovalStatus, string> = {
  submitted: "bg-[hsl(220_10%_92%)] text-[hsl(220_10%_35%)]",
  pending_approval: "bg-[hsl(45_95%_92%)] text-[hsl(35_85%_40%)]",
  approved: "bg-[hsl(140_55%_92%)] text-[hsl(140_55%_30%)]",
  rejected: "bg-[hsl(0_75%_94%)] text-[hsl(0_75%_45%)]",
  returned: "bg-[hsl(25_90%_94%)] text-[hsl(25_90%_40%)]",
  auto_approved: "bg-[hsl(180_60%_92%)] text-[hsl(180_60%_30%)]",
  expired: "bg-[hsl(220_10%_94%)] text-[hsl(220_10%_45%)]",
};

export interface ApprovalStep {
  approver: string;
  role: Seniority;
  status: "pending" | "approved" | "rejected" | "returned" | "skipped";
  actedAt?: string;
  comment?: string;
}

export interface AuditEntry {
  at: string;
  user: string;
  action: string;
  reason?: string;
}

export interface ApprovalRequest {
  id: string;
  ref: string; // APR-2001
  type: RequestType;
  eventName: string;
  eventType: string;
  requester: string;
  requesterRole: Seniority;
  audience: Audience;
  delegated?: { principal: string; principalRole: Seniority };
  bookingValue: number;
  approvalType: "Auto-approve" | "Single" | "Multi-step";
  status: ApprovalStatus;
  submittedAt: string;
  expiresAt: string;
  chain: ApprovalStep[];
  audit: AuditEntry[];
  notes?: string;
}

const iso = (offsetDays: number, h = 10) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
};

export const approvals: ApprovalRequest[] = [
  {
    id: "a1", ref: "APR-2001", type: "Booking",
    eventName: "Quarterly Leadership Forum", eventType: "Conference",
    requester: "Elena Rossi", requesterRole: "Manager", audience: "business",
    bookingValue: 48000, approvalType: "Multi-step", status: "pending_approval",
    submittedAt: iso(-2, 9), expiresAt: iso(3, 17),
    chain: [
      { approver: "David Park", role: "Director", status: "approved", actedAt: iso(-1, 14), comment: "Aligned with FY plan." },
      { approver: "Sarah Lin", role: "VP", status: "pending" },
      { approver: "Olivia Brand", role: "C-Level", status: "pending" },
    ],
    audit: [
      { at: iso(-2, 9), user: "Elena Rossi", action: "Submitted booking request" },
      { at: iso(-1, 14), user: "David Park", action: "Approved (Director)" },
    ],
    notes: "Hybrid streaming required for 320 guests.",
  },
  {
    id: "a2", ref: "APR-2002", type: "Enquiry",
    eventName: "AI in Finance Summit", eventType: "Conference",
    requester: "Marcus Chen", requesterRole: "Director", audience: "business",
    bookingValue: 125000, approvalType: "Multi-step", status: "pending_approval",
    submittedAt: iso(-1, 11), expiresAt: iso(4, 17),
    chain: [
      { approver: "Sarah Lin", role: "VP", status: "pending" },
      { approver: "Olivia Brand", role: "C-Level", status: "pending" },
    ],
    audit: [{ at: iso(-1, 11), user: "Marcus Chen", action: "Submitted enquiry" }],
  },
  {
    id: "a3", ref: "APR-2003", type: "Booking",
    eventName: "Product Design Workshop", eventType: "Workshop",
    requester: "Priya Raman", requesterRole: "Coordinator", audience: "business",
    bookingValue: 4200, approvalType: "Auto-approve", status: "auto_approved",
    submittedAt: iso(-5, 10), expiresAt: iso(-3, 17),
    chain: [{ approver: "System", role: "Coordinator", status: "skipped", comment: "Under auto-approve threshold." }],
    audit: [
      { at: iso(-5, 10), user: "Priya Raman", action: "Submitted booking request" },
      { at: iso(-5, 10), user: "System", action: "Auto-approved", reason: "Value below $5,000 threshold" },
    ],
  },
  {
    id: "a4", ref: "APR-2004", type: "Booking",
    eventName: "Founders Networking Night", eventType: "Networking",
    requester: "Tom Beckett", requesterRole: "Manager", audience: "business",
    bookingValue: 9500, approvalType: "Single", status: "approved",
    submittedAt: iso(-7, 9), expiresAt: iso(0, 17),
    chain: [{ approver: "David Park", role: "Director", status: "approved", actedAt: iso(-6, 11) }],
    audit: [
      { at: iso(-7, 9), user: "Tom Beckett", action: "Submitted" },
      { at: iso(-6, 11), user: "David Park", action: "Approved" },
    ],
  },
  {
    id: "a5", ref: "APR-2005", type: "Enquiry",
    eventName: "Annual Investor Gala", eventType: "Gala",
    requester: "Amelia Hart", requesterRole: "VP", audience: "business",
    bookingValue: 220000, approvalType: "Multi-step", status: "returned",
    submittedAt: iso(-4, 14), expiresAt: iso(2, 17),
    chain: [
      { approver: "Olivia Brand", role: "C-Level", status: "returned", actedAt: iso(-2, 16),
        comment: "Please confirm sponsor list and revised AV budget." },
    ],
    audit: [
      { at: iso(-4, 14), user: "Amelia Hart", action: "Submitted" },
      { at: iso(-2, 16), user: "Olivia Brand", action: "Returned for amendment", reason: "Sponsor list & AV budget required" },
    ],
  },
  {
    id: "a6", ref: "APR-2006", type: "Booking",
    eventName: "Cybersecurity Webinar", eventType: "Webinar",
    requester: "Yuki Tanaka", requesterRole: "Coordinator", audience: "business",
    bookingValue: 1800, approvalType: "Auto-approve", status: "auto_approved",
    submittedAt: iso(-3, 13), expiresAt: iso(-1, 17),
    chain: [{ approver: "System", role: "Coordinator", status: "skipped" }],
    audit: [
      { at: iso(-3, 13), user: "Yuki Tanaka", action: "Submitted" },
      { at: iso(-3, 13), user: "System", action: "Auto-approved" },
    ],
  },
  {
    id: "a7", ref: "APR-2007", type: "Booking",
    eventName: "Brand Strategy Masterclass", eventType: "Workshop",
    requester: "Marco Bianchi", requesterRole: "Manager", audience: "personal",
    bookingValue: 6800, approvalType: "Single", status: "rejected",
    submittedAt: iso(-10, 10), expiresAt: iso(-3, 17),
    chain: [{ approver: "David Park", role: "Director", status: "rejected", actedAt: iso(-9, 12),
      comment: "Personal use exceeds policy allowance." }],
    audit: [
      { at: iso(-10, 10), user: "Marco Bianchi", action: "Submitted" },
      { at: iso(-9, 12), user: "David Park", action: "Rejected", reason: "Personal use exceeds policy allowance" },
    ],
  },
  {
    id: "a8", ref: "APR-2008", type: "Enquiry",
    eventName: "Sustainability Roundtable", eventType: "Networking",
    requester: "Hiro Sato", requesterRole: "Director", audience: "business",
    delegated: { principal: "Olivia Brand", principalRole: "C-Level" },
    bookingValue: 14500, approvalType: "Multi-step", status: "pending_approval",
    submittedAt: iso(-1, 9), expiresAt: iso(5, 17),
    chain: [
      { approver: "Sarah Lin", role: "VP", status: "pending" },
      { approver: "Fallback: Mei Wong", role: "VP", status: "pending", comment: "Fallback if primary unavailable." },
    ],
    audit: [
      { at: iso(-1, 9), user: "Hiro Sato", action: "Submitted on behalf of Olivia Brand" },
    ],
  },
  {
    id: "a9", ref: "APR-2009", type: "Booking",
    eventName: "DevOps Bootcamp", eventType: "Workshop",
    requester: "Lina Petrova", requesterRole: "Coordinator", audience: "business",
    bookingValue: 7200, approvalType: "Single", status: "expired",
    submittedAt: iso(-12, 10), expiresAt: iso(-5, 17),
    chain: [{ approver: "David Park", role: "Director", status: "pending" }],
    audit: [
      { at: iso(-12, 10), user: "Lina Petrova", action: "Submitted" },
      { at: iso(-5, 17), user: "System", action: "Expired", reason: "No action within SLA" },
    ],
  },
  {
    id: "a10", ref: "APR-2010", type: "Booking",
    eventName: "Healthcare AI Panel", eventType: "Webinar",
    requester: "Aiden Cole", requesterRole: "Manager", audience: "business",
    bookingValue: 22000, approvalType: "Multi-step", status: "submitted",
    submittedAt: iso(0, 8), expiresAt: iso(7, 17),
    chain: [
      { approver: "David Park", role: "Director", status: "pending" },
      { approver: "Sarah Lin", role: "VP", status: "pending" },
    ],
    audit: [{ at: iso(0, 8), user: "Aiden Cole", action: "Submitted" }],
  },
];

/* ---------- Rules engine ---------- */

export type RuleConditionField = "value" | "eventType" | "seniority" | "audience" | "delegated";
export type RuleOperator = "lt" | "lte" | "gt" | "gte" | "eq";

export interface RuleCondition {
  field: RuleConditionField;
  op: RuleOperator;
  value: string | number | boolean;
}

export interface ApprovalRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: RuleCondition[];
  action: "Auto-approve" | "Single" | "Multi-step";
  approverChain: { role: Seniority; fallback?: string }[];
  expiryHours: number;
}

export const rules: ApprovalRule[] = [
  {
    id: "r1", name: "Auto-approve low-value bookings", enabled: true,
    conditions: [{ field: "value", op: "lt", value: 5000 }, { field: "audience", op: "eq", value: "business" }],
    action: "Auto-approve", approverChain: [], expiryHours: 0,
  },
  {
    id: "r2", name: "Manager bookings $5k–$25k", enabled: true,
    conditions: [{ field: "value", op: "lt", value: 25000 }, { field: "value", op: "gte", value: 5000 }],
    action: "Single", approverChain: [{ role: "Director", fallback: "Sarah Lin" }], expiryHours: 72,
  },
  {
    id: "r3", name: "High-value multi-step (>$25k)", enabled: true,
    conditions: [{ field: "value", op: "gte", value: 25000 }],
    action: "Multi-step",
    approverChain: [
      { role: "Director" },
      { role: "VP", fallback: "Mei Wong" },
      { role: "C-Level" },
    ],
    expiryHours: 120,
  },
  {
    id: "r4", name: "Personal bookings require Director sign-off", enabled: true,
    conditions: [{ field: "audience", op: "eq", value: "personal" }],
    action: "Single", approverChain: [{ role: "Director" }], expiryHours: 48,
  },
];
