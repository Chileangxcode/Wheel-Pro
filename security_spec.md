# Security Specification for Lucky Wheel

## Data Invariants
1. A user document (`/users/{userId}`) can only be read and written by that user.
2. A preset document (`/users/{userId}/presets/{presetId}`) can only be read and written by the user who owns the parent `/users/{userId}` document.
3. Timestamps (`updatedAt`, `createdAt`) must be validated against `request.time`.
4. Values must have strict type and size constraints.

## The "Dirty Dozen" Payloads

1. **Identity Spoofing**: User A attempts to write to `/users/userB`.
2. **Identity Spoofing (Presets)**: User A attempts to write to `/users/userB/presets/preset1`.
3. **Invalid Data Type**: Attempting to set `spinDuration` as a string.
4. **Large Payload**: Attempting to save a name list with 10,000 extremely long names.
5. **Ghost Fields**: Attempting to add a field `role: 'admin'` to a user document.
6. **Immutable Field Tampering**: Attempting to change `createdAt` on a preset.
7. **Invalid ID**: Using a 1KB string as a `presetId`.
8. **Unauthenticated Read**: Attempting to read a user's presets without being signed in.
9. **Unverified Email**: Attempting to write if the email is not verified (if mandated).
10. **State Shortcutting**: (Not applicable here as there's no complex state machine, but we'll enforce schema consistency).
11. **Malicious Query**: Attempting to list all presets of all users.
12. **PII Leak**: Attempting to read `/users/{userId}` of another user to find their preferences.

## Test Runner (Draft)
```ts
// src/tests/firestore.rules.test.ts
// ... tests for the above payloads ...
```
