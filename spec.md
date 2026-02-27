# Game Injector Key Manager

## Current State
- Admin and reseller dashboards exist with full key management
- Add Injector modal has APK upload section and Login Redirect URL field
- Key creation allows "General / No Injector" option (no mandatory injector assignment)
- `verifyLogin` backend function does NOT check if a key belongs to the specific injector making the request
- Keys display actual values in table (from `key.key` field)
- Injectors table shows redirect URL and generated login URL columns
- Backend `createInjector` accepts `redirectUrl` as optional parameter
- `resellerCreateKey` uses frontend-generated key passed in request (backend uses `generateRandomKey()` but request.key is stored)

## Requested Changes (Diff)

### Add
- Injector-specific key validation: `verifyLogin` must check that the key's `injector` field matches the `injectorId` sent in the request; return descriptive error with injector name on mismatch
- New backend function `verifyLoginWithInjector` (or enhance `verifyLogin`) that validates injector binding
- Injector usage statistics on injector table: show total key count per injector
- Bulk key stats: admin dashboard stats cards show per-injector active key counts
- Key export feature: admin can export all keys for a specific injector as CSV
- Unique injector ID exposed in injectors table for API integration

### Modify
- `AddInjectorDialog`: Remove APK upload section entirely; remove Login Redirect URL field; only keep Injector Name field
- `createInjector` backend call: stop passing redirectUrl (or always pass null)
- `InjectorsTable`: Remove "Redirect URL" column; add "Injector ID" column; add "Total Keys" count column
- `CreateKeyDialog` (admin): Make injector selection MANDATORY (remove "General / No Injector" option); add validation that injector must be selected
- `CreateKeyDialogReseller`: Make injector selection MANDATORY; remove "General / No Injector" option
- Backend `verifyLogin`: Add injector mismatch check - if key has an injector assigned and request injectorId doesn't match, return error "This key is not valid for [InjectorName]"
- `ApiDocsSection`: Update error messages to include injector mismatch error with descriptive example
- `InjectorsSection`: Update description text to reflect simplified injector management

### Remove
- APK upload UI and all related state/handlers from `AddInjectorDialog`
- Login Redirect URL field from `AddInjectorDialog`
- "General / No Injector" option from both CreateKeyDialog and CreateKeyDialogReseller
- "Redirect URL" column from InjectorsTable
- "Generated Login URL" column from InjectorsTable (replaced by simpler Injector ID display)

## Implementation Plan
1. Update backend `verifyLogin` to validate injector binding with descriptive error message including injector name
2. Update `createInjector` backend function signature (redirectUrl becomes unused/optional, kept for compatibility)
3. Update `AddInjectorDialog`: strip APK upload + redirect URL, only name field remains
4. Update `InjectorsTable`: remove redirect URL column, add Injector ID column, add Total Keys count column
5. Update `InjectorsSection`: update description
6. Update `CreateKeyDialog` (admin): make injector mandatory, remove general option, add "select injector" validation
7. Update `CreateKeyDialogReseller`: make injector mandatory, remove general option
8. Add key export feature in admin KeysTable or InjectorsTable (CSV download for injector's keys)
9. Update `ApiDocsSection` error messages to include injector mismatch
10. Update `StatsCards` or add injector-specific stats in admin dashboard

## UX Notes
- Simplified Add Injector flow: just type a name and click Add
- Injector ID shown in table so admin can copy it for API integration
- Mandatory injector on key creation prevents orphaned/general keys going forward
- Export button on injectors table row for quick CSV download
- Error message on wrong injector: "This key is not valid for [InjectorName]" is clear and actionable
