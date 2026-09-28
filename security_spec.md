# Security Specification & Red Team Audit

## 1. Core Data Invariants & Access Control (RBAC)

1. **Identity & Email Verification (Pillar 2)**:
   - Administrative roles and sensitive elevated operations strictly mandate `isEmailVerified()` (`request.auth.token.email_verified == true` or `provider == 'google.com'`).
   - Hardcoded admin accounts (`dev@alistwebs.com`, `admin@alistwebs.com`) cannot be spoofed by unverified email registrations.

2. **Self-Assigned Role Prevention & Privilege Escalation (Pillar 5)**:
   - Users may never set or update `role: 'admin'` on `/users/{userId}`.
   - Any attempt by non-admins to alter their `role` field on update is rejected (`!request.resource.data.diff(resource.data).affectedKeys().hasAny(['role'])`).

3. **Ownership Invariants (Pillar 8)**:
   - Owned collections (`sites`, `contacts`, `emails`, `mailboxes`, `mail_messages`, `cloud_connections`, `sync_configs`, `cms_content`, `site_documents`):
     - `create`: requires `request.resource.data.user_id == request.auth.uid`.
     - `update`: ownership cannot be transferred (`request.resource.data.user_id == resource.data.user_id`).
     - `read/delete`: only readable and deletable by document owner or verified platform admin.

4. **Product & Order Protection**:
   - `products`: Publicly viewable for e-commerce, but write operations are restricted strictly to `isAdmin()`.
   - `orders`: Write/delete operations restricted to `isAdmin()`. Creation requires a verified Stripe session ID payload.

5. **Active Interaction Collections (Pillar 7)**:
   - `cms_content`: Full CRUD scoped to the authoring user (`user_id`).
   - `design_partners`: Public founding cohort submissions allowed with valid contact fields; read/update/delete restricted to `isAdmin()`.
   - `portfolios`: Public read for artist portfolios; writes restricted to document owner (`request.auth.uid == portfolioId`).

6. **Structural Catch-All (Pillar 1)**:
   - Root rule `match /{document=**} { allow read, write: if false; }` prevents any access to undeclared collections or endpoints.

---

## 2. The "Dirty Dozen" Threat Matrix & Payloads

| # | Attack Vector | Payload / Operation | Expected Result | Enforced Rule Mechanism |
|---|---|---|---|---|
| 1 | **Email Spoofing (Privilege Escalation)** | Unverified user registers as `dev@alistwebs.com` with password and attempts write to `/admins` or `/users` | **DENIED** | `isEmailVerified()` check inside `isAdmin()` |
| 2 | **Role Elevation (Self-Promotion)** | User updates `/users/{uid}` with `{ role: 'admin' }` | **DENIED** | `!diff().affectedKeys().hasAny(['role'])` |
| 3 | **Unauthorized Site Creation** | User creates `/sites/s1` with `{ user_id: 'victim_123' }` | **DENIED** | `request.resource.data.user_id == request.auth.uid` |
| 4 | **Site Ownership Hijack** | User updates `/sites/s1` changing `user_id` to their own UID | **DENIED** | `request.resource.data.user_id == resource.data.user_id` |
| 5 | **Cross-User Data Harvest** | User queries `contacts` or `sites` without owner filter | **DENIED** | `resource.data.user_id == request.auth.uid` |
| 6 | **Store Catalog Tampering** | Authenticated regular user deletes or edits `/products/p1` | **DENIED** | `/products` write requires `isAdmin()` |
| 7 | **Order Manipulation** | Attacker deletes or overwrites `/orders/o1` | **DENIED** | `/orders` update/delete requires `isAdmin()` |
| 8 | **Null Resource Crash on Sync Config** | User creates `/sync_configs/sc1` | **PASSED (Bug Fixed)** | Separated `allow create` from `allow update/delete` |
| 9 | **CMS Content Permission Denial** | Author writes draft to `/cms_content/{id}` | **PASSED (Bug Fixed)** | Explicit rule block added for `/cms_content` |
| 10 | **Unauthenticated Subscriptions Leak** | Unauthenticated GET `/api/admin/subscriptions` | **401 UNAUTHORIZED (Bug Fixed)** | Server verifies JWT Bearer token & admin email |
| 11 | **Unvalidated Mail Dispatch** | POST `/api/send-mail` with empty recipient | **400 BAD REQUEST (Bug Fixed)** | Mandatory `targetRecipient` validation |
| 12 | **Ghost Collection Access** | Attacker probes `/arbitrary_collection/abc` | **DENIED** | Default catch-all `allow read, write: if false;` |

---

## 3. Verification & Deployment Status

- `firestore.rules`: Successfully deployed to Firebase project `alistwebs` (`ai-studio-alistwebs-c3b518e3-9304-4388-be6f-1e1cf20eb7b5`).
- `firebase-blueprint.json`: Synchronized with all application entities including `CMSContent`, `DesignPartner`, `Portfolio`, and `SiteDocument`.
- Backend endpoints: Authenticated and input-sanitized. Mailbox counters synchronized.
