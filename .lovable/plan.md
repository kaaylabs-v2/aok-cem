# CEM-7 + CEM-8: Audit Trail & Users & Permissions

Two new primary modules added to the existing CEM console, matching the current design system (sidebar, tables, drawers, badges, KPI cards, filters) used by Enquiries / Approvals / Reports.

## Scope

Frontend-only, mock-data driven (in line with how `src/data/*` powers Enquiries, Approvals, Requests, Guests today). No backend / Lovable Cloud changes.

## 1. Navigation

Update `src/components/AppSidebar.tsx` Workspace group order:

```text
Dashboard
Events
Inventory
Enquiries
Approvals
Users & Permissions   ← new
Audit Trail           ← new
Analytics
```

Add routes in `src/App.tsx`:
- `/audit` → `pages/AuditTrail.tsx`
- `/users` → `pages/Users.tsx`
- `/users/:id` → `pages/UserDetail.tsx`
- `/users/groups` → `pages/UserGroups.tsx`

## 2. Audit Trail module (CEM-7)

**Data**: new `src/data/audit.ts` with ~40 seeded entries spanning the existing event/booking IDs. Fields: `id, timestamp, bookingId, eventName, guestName, actionType, fieldChanged, previousValue, newValue, userId, userName, role, actingForId?, actingForName?, source, retentionDate, immutable: true`.

Action types: Guest Added, Guest Removed, Dietary Updated, Invite Resent, RSVP Changed, Bulk Upload, System Purge, Approval Change.

**Page** `pages/AuditTrail.tsx` (uses `AppShell`):
- Header: title "Guest List Audit Trail" + subtitle + actions (Export CSV, Export PDF, Saved Filters) — buttons wired with `toast()` stubs except CSV which generates real download.
- 6 `StatCard`s: Total Entries, Additions, Removals, Updates, System Actions, Delegated Actions.
- Filter bar: Booking, Event, User, Role, Action Type, Date Range, Tenant, Delegated Booker, Principal User + search input. Use shadcn `Select` + `Input` like `EnquiriesView`.
- Table (sticky header, same styling as `EventTable`): Timestamp, Booking, Event, Guest, Action, Field, Previous, New, User (stacked "Performed by / Acting for" when delegated), Role, Source, "View" button.
- Row click opens `AuditDetailDrawer` (right-side `Sheet`) showing Summary, Change Details, System Metadata, and "Audit Protected" lock badge.

**Booking-level tab**: `EventDrawer.tsx` already shows guests/audit via `AuditTrail` component — extend `src/components/AuditTrail.tsx` (or its consumer) to render delegated "acting for" lines when present, using the same data source.

## 3. Users & Permissions module (CEM-8)

**Data**: new `src/data/users.ts` with seed users, groups, permission capabilities, seniority levels, entitlements, SSO state.

```ts
type Seniority = "Executive"|"Managing Director"|"Director"|"VP"|"Associate"|"Analyst"|"Custom";
type ApprovalTier = "none"|"tier1"|"tier2"|"tier3"|"fallback"|"escalation";
interface Capability { key: string; label: string; section: string; }
interface User { id; firstName; lastName; email; department; position; seniority; groupId; capabilities: string[]; approvalTier; entitlements: { maxBookings; maxSpend; annual; monthly; usedBookings; usedSpend }; ssoEnabled; status: "active"|"pending"|"inactive"; lastLogin; }
interface UserGroup { id; name; description; permissions: string[]; userIds: string[]; }
```

Seed 12 users, 6 groups (VIP Users, Investment Banking, Sales, Research, Executive Leadership, Compliance Team).

**Pages**

`pages/Users.tsx`:
- Header + actions: Create User, Bulk Import, Create Group, Export Directory.
- 6 KPI cards: Active, Pending Invites, User Groups, Approvers, Deactivated, SSO Connected.
- Filters (Group, Department, Seniority, Active/Inactive, Approver, SSO) + search.
- Directory table: Name, Email, Department, Seniority, Group, Permissions (count badge), Approval Tier, Entitlement Usage (progress bar), Last Login, Status badge, Actions (View, Deactivate).
- Create User modal: `Dialog` with all fields + capability toggle matrix grouped by section (Inventory, Enquiries, Approvals, Reporting, Administration).
- Bulk Import modal: 4-step wizard (Download Template / Upload / Preview / Import) — UI only, mock validation summary.
- Deactivate confirmation `AlertDialog`.

`pages/UserGroups.tsx`: list groups with create/edit/delete + assign users/permissions.

`pages/UserDetail.tsx`: tabs (Profile, Permissions, Entitlements, Approvals, Audit History, Bookings, Enquiries) using existing `Tabs` component. Audit History tab pulls from `data/audit.ts` filtered by user.

**Reusable components** under `src/components/users/`:
- `PermissionMatrix.tsx` — capability toggle grid.
- `EntitlementEditor.tsx` — number inputs + progress bars + threshold warnings.
- `ApprovalConfig.tsx` — tier select + delegation picker.
- `SSOPanel.tsx` — read-only Azure AD status block.
- `CreateUserDialog.tsx`, `BulkImportDialog.tsx`, `DeactivateUserDialog.tsx`.

## 4. Design system compliance

- All colors via semantic tokens from `index.css` / `tailwind.config.ts`.
- KPI cards via existing `StatCard`.
- Tables match `EventTable` (sticky header, hover, `border-b`, muted headers).
- Drawers via existing `Sheet`.
- Modals via `Dialog` / `AlertDialog`.
- Badges via existing `Badge` variants; "Audit Protected" uses outline + lock icon.
- Timeline reuses pattern from current `AuditTrail.tsx`.
- Notifications via existing `toast()`.

## Out of scope

- Real backend / persistence (mock store only, like the rest of the app).
- Wiring Welcome / SSO emails (toast stubs only).
- Real CSV/PDF generation for audit — CSV uses a simple client-side blob; PDF shows a toast.

## File changes

New:
- `src/pages/AuditTrail.tsx`, `src/pages/Users.tsx`, `src/pages/UserGroups.tsx`, `src/pages/UserDetail.tsx`
- `src/data/audit.ts`, `src/data/users.ts`
- `src/components/AuditDetailDrawer.tsx`
- `src/components/users/*` (6 files above)

Edited:
- `src/App.tsx` (routes)
- `src/components/AppSidebar.tsx` (nav items + order)
- `src/components/AuditTrail.tsx` (delegated "acting for" rendering)
