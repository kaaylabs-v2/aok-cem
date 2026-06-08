# CEM-9 — Delegation Management

Extends the existing Users & Permissions module with a full Delegations system (PA ↔ Principal). Reuses ETX2 tokens, `StatCard`, table patterns from `EventTable`/`AuditTrail`, `Sheet` drawers, `Dialog`/`AlertDialog`, and existing `Badge` styles.

## Scope (Must Have, per updated stakeholder feedback)
- One PA → many Principals, and one Principal → many PAs
- No "Browse Only" scope; no automatic expiry
- Integrates with Approval Routing, Entitlements, Audit Trail, Reporting, Guest Mgmt, Permissions
- Persistent Principal Switcher in top nav for PAs
- "Acting on behalf of …" badge surfaced across booking/guest/enquiry/approval/audit views

## Data layer
**New `src/data/delegations.ts`**
- Types: `PermissionScope` (bookings/guests/enquiries/approvalVisibility capability sets), `DelegationStatus` (`active` | `suspended`), `DelegationRelationship` (id, paUserId, principalUserId, permissions, createdBy, createdAt, lastModifiedAt, status, activeBookings, approvalTierUsed, lastActionAt), `DelegationAuditEvent`
- Seed ~14 relationships covering: 1 PA → 3 principals (Sarah Jones), 1 principal → 3 PAs (James Richardson), plus mixed
- Helpers: `getPrincipalsForPA(paId)`, `getPAsForPrincipal(principalId)`, `getRelationship(paId, principalId)`, `summariseDelegations()` for KPIs

**Edit `src/data/audit.ts`**
- Append delegation event records (Created/Modified/Suspended/Removed/BookingOnBehalf/GuestOnBehalf/EnquiryOnBehalf) so existing Audit Trail page already lists them via current "Acting For" rendering

**Edit `src/data/users.ts`**
- Add `isDelegatedBooker?: boolean` and `principalIds?: string[]` markers used by switcher

## Acting-context (cross-cutting)
**New `src/context/ActingContext.tsx`**
- `ActingProvider` exposes `{ currentUser, actingAs, setActingAs, availablePrincipals }`
- Defaults `currentUser` to a seeded PA (Sarah Jones) so the switcher and badges demo without auth
- Wrap inside `App.tsx` above `BrowserRouter`

**New `src/components/delegations/PrincipalSwitcher.tsx`**
- Persistent control rendered in `TopBar`; shows "Currently Acting As: ▼ {Principal}" with `DropdownMenu`; "Self" option restores own context
- Hidden when current user has no principals

**New `src/components/delegations/ActingOnBehalfBadge.tsx`**
- Highly visible amber/primary `Badge` "Acting on behalf of {Principal}"; consumed where bookings/guests/enquiries/approvals/audit are surfaced (EventDrawer header, EnquiriesView header, ApprovalsView header, GuestList header, AuditTrail header banner)

**Edit `src/components/TopBar.tsx`** to mount `PrincipalSwitcher`

## Pages
**New `src/pages/Delegations.tsx`** (route `/users/delegations`)
- Sub-nav tab strip matching existing Users tabs (Users / Groups / Approval Rules / Entitlements / Audit Trail / Delegations) — implemented as a reusable `UsersTabs` strip extracted from `Users.tsx`
- Header: title "Delegation Relationships", subtitle, actions: Create Delegation, Bulk Assignment, Export Relationships (CSV via blob)
- 6 `StatCard` KPIs: Active Delegations, Delegated Bookers, Principals Covered, Multi-Principal Relationships, Multi-PA Relationships, Recently Modified
- Filter bar: PA, Principal, Department, Status, Permission Scope; Search input
- Sticky-header table columns per spec (Delegated Booker, Principal, Relationship Type [1:1 / 1:N / N:1], Permissions [pill summary], Active Bookings, Approval Tier Used, Created By, Last Modified, Status, Actions [View / Suspend / Remove])
- Row click opens `DelegationDetailDrawer`

**New `src/pages/DelegationDetail.tsx`** (route `/users/delegations/:id`)
- Principal Information card (name, department, position, seniority, approval tier, entitlements summary via existing `EntitlementSummary`)
- Assigned Delegated Bookers table for that principal (Name, Department, Permissions, Active Bookings, Last Action, Status) — reverse view
- Tabs: Overview · Permissions · Activity (timeline) · Audit

## Components
**`src/components/delegations/CreateDelegationDialog.tsx`**
- 3-step wizard inside `Dialog`:
  1. Select Delegated Booker (search, active users only)
  2. Select Principal(s) — multi-select with checkbox list
  3. Configure Permissions — capability matrix (Bookings: Browse Events / Create / Modify; Guests: Add/Edit/Remove/Send/Resend Invites; Enquiries: Create / Manage; Approval Visibility: View Status / Receive Updates). No Browse-Only level.
- Confirm appends to in-memory store + toast; audit event logged

**`src/components/delegations/BulkAssignmentDialog.tsx`**
- Pick one PA → multi-select principals → shared permission template → preview list → confirm

**`src/components/delegations/DelegationDetailDrawer.tsx`** (right-side `Sheet`)
- Relationship summary, Permissions matrix (read-only), Active Bookings list, Recent Activity, Audit Events (timeline reuse), Approval Routing info (shows "Routes via Principal: {Tier}"), Principal Entitlement Usage progress bars
- Footer actions: Suspend / Reactivate / Remove (via `AlertDialog`)

**`src/components/delegations/SuspendRemoveDialog.tsx`**
- `AlertDialog` confirmation; on confirm updates status + logs audit event + toast

**`src/components/delegations/MyDelegatedActivity.tsx`**
- Widget for Principal dashboard: lists actions performed on their behalf (most recent 5), with PA name and link to detail

## Integration touches
- `src/components/EventDrawer.tsx` — when `actingAs` set, show `ActingOnBehalfBadge` in header; "Book Tickets" submits attribute owner=principal in the confirmation toast
- `src/components/GuestList.tsx` — badge in header; new guest entries tagged `addedBy: PA, ownerPrincipalId`
- `src/components/EnquiriesView.tsx` — header badge
- `src/components/ApprovalsView.tsx` — header badge; note "Routed via Principal tier"
- `src/components/AuditTrail.tsx` — existing "Acting For" column already supports this; add filter chip "Delegated actions only"
- `src/components/users/DeactivateUserDialog.tsx` — on deactivation, if user is principal → cascade-suspend all their delegations + toast "Delegations suspended"; if PA → suspend their outgoing relationships
- `src/pages/Index.tsx` (Principal dashboard) — mount `MyDelegatedActivity` widget conditionally

## Routes & navigation
**`src/App.tsx`** — add `/users/delegations` and `/users/delegations/:id`; wrap with `ActingProvider`
**`src/components/AppSidebar.tsx`** — no change (Delegations is a tab inside Users & Permissions, not a sidebar entry)
**`src/pages/Users.tsx`, `UserGroups.tsx`, etc.** — replace ad-hoc tab strip with shared `UsersTabs` component that includes new "Delegations" tab

## Out of scope (mock-only)
- Real auth & session; PA identity is seeded
- Real notification delivery (toast stubs only)
- Real CSV/PDF generation beyond simple in-browser blob download
- Real backend persistence — module is fully client-side mock data

## File summary
- New: `src/data/delegations.ts`, `src/context/ActingContext.tsx`, `src/pages/Delegations.tsx`, `src/pages/DelegationDetail.tsx`, `src/components/delegations/{PrincipalSwitcher,ActingOnBehalfBadge,CreateDelegationDialog,BulkAssignmentDialog,DelegationDetailDrawer,SuspendRemoveDialog,MyDelegatedActivity}.tsx`, `src/components/users/UsersTabs.tsx`
- Edited: `src/App.tsx`, `src/components/TopBar.tsx`, `src/data/audit.ts`, `src/data/users.ts`, `src/pages/Users.tsx`, `src/pages/UserGroups.tsx`, `src/components/EventDrawer.tsx`, `src/components/GuestList.tsx`, `src/components/EnquiriesView.tsx`, `src/components/ApprovalsView.tsx`, `src/components/AuditTrail.tsx`, `src/components/users/DeactivateUserDialog.tsx`, `src/pages/Index.tsx`
