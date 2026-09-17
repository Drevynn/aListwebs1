# Security Specification

## Data Invariants
- `sites` must belong to the `user_id` of the current authenticated user (unless admin).
- `users` can only be read/written by the owner or admin.

## The "Dirty Dozen" Payloads
(Assuming sites collection)
1.  **Unauthorized Write**: Create site with `user_id` != `request.auth.uid`.
2.  **Ghost Field**: Create site with `isAdmin: true`.
3.  **Invalid Type**: `design_summary` is 1MB string.
4.  **Terminal State Shortcut**: Update `status` of completed site.
5.  **PII Isolation Breach**: Non-owner reads user profile.
6.  **ID Poisoning**: Create document with 1.5KB junk ID.
7.  **Role Spoofing**: Update `role` field on user profile.
8.  **Orphaned Site**: Site points to non-existent `user_id`.
9.  **Timestamp Spoofing**: `createdAt` set in future.
10. **Schema Incomplete**: Site without `status`.
11. **Immutable Field Update**: Change `user_id` on existing site.
12. **Query Bypass**: List all sites without filtering.

## Test Runner (firestore.rules.test.ts)
(To be implemented later)
