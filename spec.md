# Game Injector Key Manager

## Current State

The application currently has:
- Admin authentication with username/password gate
- Key management system with create, block/unblock, and view functionality
- Keys have: id, key value, created timestamp, optional expiration, blocked status, and usage count
- Injector management system with create, delete, and redirect URL generation
- Injectors have: id, name, created timestamp, and optional redirect URL
- Keys and injectors are managed independently with no association between them

## Requested Changes (Diff)

### Add
- Association between keys and injectors (each key belongs to a specific injector)
- Injector selection dropdown in the Create Key dialog
- Injector name/identifier column in the Keys table
- Filter or grouping by injector in the keys view (optional enhancement)

### Modify
- Backend `createKey` API to accept an optional injector ID parameter
- Backend `LoginKey` interface to include optional injector ID field
- Frontend Create Key dialog to include injector selection
- Frontend Keys table to display which injector each key belongs to

### Remove
- None

## Implementation Plan

1. **Backend Changes**:
   - Update `LoginKey` data structure to include optional `injectorId` field
   - Modify `createKey` function to accept optional `injectorId: InjectorId | null` parameter
   - Update key storage to include injector association

2. **Frontend Changes**:
   - Update `CreateKeyDialog` component to:
     - Fetch list of available injectors
     - Add injector selection dropdown (with "No Injector" option)
     - Pass selected injector ID to `createKey` mutation
   - Update `KeysTable` component to:
     - Display injector name for each key (or "General" if no injector)
     - Add column for injector information
   - Update React Query hooks to handle new injector parameter

## UX Notes

- Injector selection should be optional (keys can be created without an injector, for general use)
- Display "General" or similar label for keys without an injector assignment
- Injector dropdown should show injector names for easy selection
- Consider showing injector count in stats or allowing filtering by injector in future iterations
